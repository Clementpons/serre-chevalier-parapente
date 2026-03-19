import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { requireAdmin, requireApiKey, requireCartSession } from "@/lib/middlewares";
import prisma from "@/lib/prisma";
import {
  CreateOrderSchema,
  UpdateOrderStatusSchema,
  CreatePaymentIntentSchema,
  ConfirmPaymentSchema,
} from "../schemas";
import { generateOrderNumber, createPaymentIntent } from "@/lib/stripe";
import {
  getBaptemePrice,
  finalizeOrder,
  allocatePaymentToOrderItems,
} from "@/lib/order-processing";
import { z } from "zod";

const app = new Hono()
  // CREATE order from cart
  .post(
    "/",
    requireApiKey,
    zValidator("json", CreateOrderSchema),
    requireCartSession,
    async (c) => {
      try {
        let { customerEmail, customerData, promoCodeId } = c.req.valid("json");
        const cartSession = c.get("cartSession") as any;

        // Récupérer les items du panier
        const cartItems = await prisma.cartItem.findMany({
          where: {
            cartSessionId: cartSession.id,
          },
          include: {
            stage: true,
            bapteme: true,
          },
        });

        if (cartItems.length === 0) {
          return c.json({
            success: false,
            message: "Votre panier est vide",
            data: null,
          });
        }

        // Récupérer le prix de l'option vidéo depuis la BDD
        const videoOptionRecord = await prisma.videoOptionPrice.findFirst({
          orderBy: { createdAt: "desc" },
        });
        const VIDEO_PRICE = videoOptionRecord?.price ?? 25;

        // ─── Étape 1 : Pré-calcul des prix par article ──────────────────
        // On calcule une seule fois les prix (évite les appels async répétés).
        type ItemPriceInfo = {
          unitPrice: number;
          fullPrice: number;          // totalPrice (quantity × unitPrice)
          depositAmt: number | null;  // acompte brut (pré-promo)
          remainingAmt: number | null; // solde brut (pré-promo)
          isFullyPaid: boolean;
          isGiftVoucherCovered: boolean;
        };
        const itemPriceMap = new Map<string, ItemPriceInfo>();
        let subtotal = 0;
        let depositTotal = 0;

        for (const item of cartItems) {
          const pd = item.participantData as any;
          const isGVC = !!pd?.usedGiftVoucherCode;
          let info: ItemPriceInfo;

          if (item.type === "STAGE" && item.stage) {
            const fullPrice = item.stage.price * item.quantity;
            subtotal += fullPrice;
            if (isGVC) {
              info = { unitPrice: item.stage.price, fullPrice, depositAmt: 0, remainingAmt: 0, isFullyPaid: true, isGiftVoucherCovered: true };
            } else {
              const dep = item.stage.acomptePrice * item.quantity;
              const rem = (item.stage.price - item.stage.acomptePrice) * item.quantity;
              depositTotal += dep;
              info = { unitPrice: item.stage.price, fullPrice, depositAmt: dep, remainingAmt: rem, isFullyPaid: false, isGiftVoucherCovered: false };
            }
          } else if (item.type === "BAPTEME" && item.bapteme) {
            const basePrice = await getBaptemePrice((pd as any).selectedCategory);
            const videoPrice = (pd as any).hasVideo ? VIDEO_PRICE : 0;
            const unitP = basePrice + videoPrice;
            const fullPrice = unitP * item.quantity;
            subtotal += fullPrice;
            if (isGVC) {
              info = { unitPrice: unitP, fullPrice, depositAmt: 0, remainingAmt: 0, isFullyPaid: true, isGiftVoucherCovered: true };
            } else {
              const dep = (item.bapteme.acomptePrice + videoPrice) * item.quantity;
              const rem = (basePrice - item.bapteme.acomptePrice) * item.quantity;
              depositTotal += dep;
              info = { unitPrice: unitP, fullPrice, depositAmt: dep, remainingAmt: rem, isFullyPaid: false, isGiftVoucherCovered: false };
            }
          } else if (item.type === "GIFT_VOUCHER") {
            const amount = item.giftVoucherAmount || 0;
            subtotal += amount;
            depositTotal += amount;
            info = { unitPrice: amount, fullPrice: amount, depositAmt: null, remainingAmt: null, isFullyPaid: true, isGiftVoucherCovered: false };
          } else {
            info = { unitPrice: 0, fullPrice: 0, depositAmt: null, remainingAmt: null, isFullyPaid: false, isGiftVoucherCovered: false };
          }
          itemPriceMap.set(item.id, info);
        }

        // ─── Étape 2 : Validation du code promo ──────────────────────────
        let promoDiscount = 0;
        let validatedPromoCode: any = null;

        if (promoCodeId) {
          const promoCode = await prisma.promoCode.findUnique({ where: { id: promoCodeId } });

          if (
            promoCode &&
            promoCode.isActive &&
            (!promoCode.expiryDate || promoCode.expiryDate > new Date()) &&
            (!promoCode.maxUses || promoCode.currentUses < promoCode.maxUses) &&
            (!promoCode.minCartAmount || subtotal >= promoCode.minCartAmount)
          ) {
            // Sous-total applicable = prix pleins des articles concernés (hors bon cadeau)
            let applicableSubtotal = subtotal;
            if (promoCode.applicableProductTypes.length > 0) {
              applicableSubtotal = 0;
              for (const item of cartItems) {
                if (!promoCode.applicableProductTypes.includes(item.type as any)) continue;
                const info = itemPriceMap.get(item.id);
                if (info && !info.isGiftVoucherCovered) applicableSubtotal += info.fullPrice;
              }
            } else {
              // Tous types : exclure les articles couverts par bon cadeau
              applicableSubtotal = 0;
              for (const item of cartItems) {
                const info = itemPriceMap.get(item.id);
                if (info && !info.isGiftVoucherCovered) applicableSubtotal += info.fullPrice;
              }
            }

            if (promoCode.discountType === "FIXED") {
              promoDiscount = Math.min(promoCode.discountValue, applicableSubtotal);
            } else {
              promoDiscount = applicableSubtotal * (promoCode.discountValue / 100);
              if (promoCode.maxDiscountAmount) {
                promoDiscount = Math.min(promoDiscount, promoCode.maxDiscountAmount);
              }
            }
            // Cap : la réduction ne peut pas dépasser le total des acomptes
            promoDiscount = Math.min(promoDiscount, depositTotal);
            promoDiscount = Math.round(promoDiscount * 100) / 100;
            validatedPromoCode = promoCode;
          }
        }

        // ─── Étape 3 : Répartition proportionnelle de la promo par article ─
        // Algorithme : floor sur chaque article, le dernier article applicable absorbe le reste.
        // La réduction s'impute en priorité sur l'acompte ; si promoShare > acompte (cas extrême),
        // l'excédent réduit le solde.
        const itemPromoShares = new Map<string, number>();

        if (promoDiscount > 0 && validatedPromoCode) {
          // Trier par fullPrice ASC : le moins cher en dernier absorbe l'arrondi.
          // Ordre identique côté frontend pour que les montants affichés correspondent.
          const applicableItems = cartItems
            .filter((item) => {
              const info = itemPriceMap.get(item.id);
              if (!info || info.isGiftVoucherCovered) return false;
              if (validatedPromoCode.applicableProductTypes.length > 0) {
                return validatedPromoCode.applicableProductTypes.includes(item.type);
              }
              return true;
            })
            .sort((a, b) => (itemPriceMap.get(b.id)?.fullPrice ?? 0) - (itemPriceMap.get(a.id)?.fullPrice ?? 0));

          const applicableTotal = applicableItems.reduce(
            (sum, item) => sum + (itemPriceMap.get(item.id)?.fullPrice ?? 0),
            0,
          );

          if (applicableTotal > 0) {
            let assigned = 0;
            for (let i = 0; i < applicableItems.length; i++) {
              const item = applicableItems[i];
              const isLast = i === applicableItems.length - 1;
              if (isLast) {
                itemPromoShares.set(item.id, Math.max(0, promoDiscount - assigned));
              } else {
                const itemPrice = itemPriceMap.get(item.id)!.fullPrice;
                const share = Math.floor(promoDiscount * itemPrice / applicableTotal);
                itemPromoShares.set(item.id, share);
                assigned += share;
              }
            }
          }
        }

        const totalAmount = subtotal;
        const depositAmount = Math.max(0, depositTotal - promoDiscount); // = Σ effectiveDepositAmount

        // ─── Créer ou récupérer le client (checkout à 0€) ────────────────
        let client = null;
        if (depositAmount <= 0 && customerEmail && customerData) {
          client = await prisma.client.findUnique({ where: { email: customerEmail } });
          if (!client) {
            client = await prisma.client.create({
              data: {
                email: customerEmail,
                firstName: customerData.firstName || "",
                lastName: customerData.lastName || "",
                phone: customerData.phone || "",
                address: customerData.address || "",
                postalCode: customerData.postalCode || "",
                city: customerData.city || "",
                country: customerData.country || "France",
              },
            });
          }
        }

        // ─── Créer la commande ────────────────────────────────────────────
        const orderNumber = generateOrderNumber();

        const order = await prisma.order.create({
          data: {
            orderNumber,
            status: depositAmount <= 0 ? "PAID" : "PENDING",
            subtotal,
            discountAmount: promoDiscount, // réduction totale (promo)
            promoDiscountAmount: promoDiscount,
            promoCodeId: validatedPromoCode?.id ?? null,
            totalAmount,
            clientId: client?.id,
            orderItems: {
              // Synchrone : tous les prix sont pré-calculés dans itemPriceMap
              create: cartItems.map((item) => {
                const prices = itemPriceMap.get(item.id)!;
                const promoShare = itemPromoShares.get(item.id) ?? 0;

                // La promo s'impute en priorité sur l'acompte
                const effectiveDepositAmt = prices.depositAmt !== null
                  ? Math.max(0, prices.depositAmt - promoShare)
                  : null;
                // Si promoShare > acompte (rare), l'excédent réduit le solde
                const promoExcess = prices.depositAmt !== null
                  ? Math.max(0, promoShare - prices.depositAmt)
                  : 0;
                const effectiveRemainingAmt = prices.remainingAmt !== null
                  ? Math.max(0, prices.remainingAmt - promoExcess)
                  : null;

                return {
                  type: item.type,
                  quantity: item.quantity,
                  unitPrice: prices.unitPrice,
                  totalPrice: prices.fullPrice,
                  depositAmount: prices.depositAmt,
                  remainingAmount: prices.remainingAmt,
                  isFullyPaid: prices.isFullyPaid,
                  discountAmount: promoShare,          // part promo de cet article
                  effectiveDepositAmount: effectiveDepositAmt,   // acompte réel post-promo
                  effectiveRemainingAmount: effectiveRemainingAmt, // solde réel post-promo
                  stageId: item.stageId,
                  baptemeId: item.baptemeId,
                  giftVoucherAmount: item.giftVoucherAmount,
                  participantData: item.participantData as any,
                };
              }),
            },
          },
          include: { orderItems: true },
        });

        // Enregistrer l'utilisation du code promo si applicable
        if (validatedPromoCode) {
          await Promise.all([
            prisma.promoCodeUsage.create({
              data: {
                promoCodeId: validatedPromoCode.id,
                orderId: order.id,
                discountApplied: promoDiscount,
              },
            }),
            prisma.promoCode.update({
              where: { id: validatedPromoCode.id },
              data: { currentUses: { increment: 1 } },
            }),
          ]);
        }

        // Calculer les détails des paiements restants par stage ET baptême
        const remainingPayments = [
          // Stages
          ...cartItems
            .filter((item) => item.type === "STAGE" && item.stage)
            .map((item) => ({
              type: "STAGE" as const,
              itemId: item.stage!.id,
              itemDate: item.stage!.startDate,
              remainingAmount:
                (item.stage!.price - item.stage!.acomptePrice) * item.quantity,
              dueDate: item.stage!.startDate, // À payer avant le début du stage
            })),
          // Baptêmes
          ...(await Promise.all(
            cartItems
              .filter((item) => item.type === "BAPTEME" && item.bapteme)
              .map(async (item) => {
                const participantData = item.participantData as any;
                const basePrice = await getBaptemePrice(
                  participantData.selectedCategory,
                );
                const videoPrice = participantData.hasVideo ? VIDEO_PRICE : 0;
                const remaining = basePrice - item.bapteme!.acomptePrice; // Reste du baptême seulement (vidéo déjà payée)
                return {
                  type: "BAPTEME" as const,
                  itemId: item.bapteme!.id,
                  itemDate: item.bapteme!.date,
                  remainingAmount: remaining * item.quantity,
                  dueDate: item.bapteme!.date, // À payer le jour du baptême
                };
              }),
          )),
        ];

        const totalRemainingAmount = remainingPayments.reduce(
          (sum, payment) => sum + payment.remainingAmount,
          0,
        );

        // LOGIQUE CONDITIONNELLE SELON LE MONTANT À PAYER
        if (depositAmount === 0) {
          // ========================================
          // CAS 1 : COMMANDE GRATUITE (100% couverte par bon cadeau)
          // ========================================
          console.log(
            `[ORDER-CREATE] 🎁 Free order detected (depositAmount = 0€) for order ${order.orderNumber}`,
          );

          // Créer un Payment de type GIFT_VOUCHER pour traçabilité (ne compte pas dans le CA)
          const totalPaidByVouchers = order.orderItems.reduce(
            (sum: number, item: any) => {
              if (item.participantData?.usedGiftVoucherCode) {
                return sum + (item.totalPrice || 0);
              }
              return sum;
            },
            0,
          );

          const payment = await prisma.payment.create({
            data: {
              orderId: order.id,
              paymentType: "GIFT_VOUCHER",
              status: "SUCCEEDED",
              amount: totalPaidByVouchers, // Montant réel couvert par les bons
              currency: "eur",
            },
          });

          console.log(
            `[ORDER-CREATE] ✓ GIFT_VOUCHER payment created: ${payment.id} (${payment.amount}€)`,
          );

          // Allouer le paiement aux orderItems
          await allocatePaymentToOrderItems(payment, order.orderItems);

          // Recharger la commande avec toutes les relations pour finalizeOrder
          const fullOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: {
              orderItems: {
                include: {
                  stage: true,
                  bapteme: true,
                },
              },
              client: true,
            },
          });

          if (!fullOrder) {
            throw new Error("Order not found after creation");
          }

          // Finaliser la commande (réservations + emails + panier)
          await finalizeOrder(fullOrder, cartSession.sessionId);

          console.log(
            `[ORDER-CREATE] ✅ Free order ${order.orderNumber} finalized successfully`,
          );

          return c.json({
            success: true,
            message: "Commande créée avec succès (paiement par bon cadeau)",
            data: {
              order: {
                id: order.id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                subtotal: order.subtotal,
                discountAmount: order.discountAmount,
                depositAmount: 0, // Rien à payer
                remainingAmount: totalRemainingAmount,
                customerEmail: customerEmail,
                status: order.status,
                createdAt: order.createdAt,
              },
              paymentIntent: null, // Pas de PaymentIntent Stripe
              requiresPayment: false,
              remainingPayments: remainingPayments,
            },
          });
        } else {
          // ========================================
          // CAS 2 : COMMANDE PAYANTE (Stripe)
          // ========================================
          console.log(
            `[ORDER-CREATE] 💳 Paid order detected (depositAmount = ${depositAmount}€) for order ${order.orderNumber}`,
          );

          // Créer le Payment Intent Stripe pour le montant de l'acompte
          const paymentIntent = await createPaymentIntent({
            id: order.id,
            orderNumber: order.orderNumber,
            totalAmount: depositAmount, // Utiliser le montant de l'acompte
            sessionId: cartSession.sessionId, // Pour vider le panier
            customerEmail: customerEmail, // Pour créer le client
            customerData: customerData, // Données complètes du client
          });

          // Enregistrer le paiement (montant de l'acompte)
          await prisma.payment.create({
            data: {
              orderId: order.id,
              paymentType: "STRIPE",
              stripePaymentIntentId: paymentIntent.id,
              status: "PENDING",
              amount: depositAmount, // Montant de l'acompte
              currency: "eur",
            },
          });

          // NE PAS vider le panier ici - il sera vidé lors de la confirmation du paiement via webhook
          // Le panier reste disponible si l'utilisateur ferme la page et revient plus tard

          console.log(
            `[ORDER-CREATE] ✓ Stripe payment created: ${paymentIntent.id}`,
          );

          return c.json({
            success: true,
            message: "Commande créée avec succès",
            data: {
              order: {
                id: order.id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount, // Montant total de la commande
                subtotal: order.subtotal, // Sous-total avant réductions
                discountAmount: order.discountAmount, // Montant des réductions (cartes cadeaux)
                depositAmount: depositAmount, // Montant à payer AUJOURD'HUI
                remainingAmount: totalRemainingAmount, // Montant restant à payer plus tard
                customerEmail: customerEmail,
                status: order.status,
                createdAt: order.createdAt,
              },
              paymentIntent: {
                id: paymentIntent.id,
                clientSecret: paymentIntent.client_secret,
                amount: paymentIntent.amount, // Montant en centimes
              },
              requiresPayment: true,
              remainingPayments: remainingPayments, // Détails des paiements restants par stage
            },
          });
        }
      } catch (error) {
        console.error("Erreur création commande:", error);
        return c.json(
          {
            success: false,
            message:
              error instanceof Error
                ? error.message
                : "Erreur lors de la création de la commande",
            data: null,
          },
          500,
        );
      }
    },
  )

  // SEARCH orders (admin only) — MUST be before /:id to avoid route shadowing
  .get("search", requireAdmin, async (c) => {
    try {
      const query = c.req.query("q") || "";

      if (!query || query.length < 2) {
        return c.json({
          success: true,
          data: [],
        });
      }

      const orders = await prisma.order.findMany({
        where: {
          OR: [
            {
              orderNumber: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              client: {
                OR: [
                  {
                    firstName: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                  {
                    lastName: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                  {
                    email: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            },
          ],
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          orderItems: {
            select: {
              id: true,
              type: true,
              quantity: true,
              totalPrice: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      });

      return c.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      console.error("Erreur recherche commandes:", error);
      return c.json({
        success: false,
        message: "Erreur lors de la recherche des commandes",
        data: null,
      });
    }
  })

  // GET order details (admin) — full details with client, items, payments, allocations
  .get("/:id/details", requireAdmin, async (c) => {
    try {
      const orderId = c.req.param("id");

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          client: true,
          promoCode: true,
          orderItems: {
            include: {
              stage: true,
              bapteme: true,
              usedGiftVoucher: true,
              generatedGiftVoucher: true,
              stageBooking: { include: { stagiaire: true } },
              baptemeBooking: { include: { stagiaire: true } },
              paymentAllocations: {
                include: {
                  payment: { include: { recordedByUser: true } },
                },
                orderBy: { createdAt: "asc" },
              } as any,
            },
          },
          payments: {
            include: { recordedByUser: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!order) {
        return c.json({ success: false, message: "Commande introuvable", data: null }, 404);
      }

      return c.json({ success: true, data: order });
    } catch (error) {
      console.error("Erreur récupération détails commande:", error);
      return c.json({ success: false, message: "Erreur lors de la récupération", data: null }, 500);
    }
  })

  // GET order by ID
  .get("/:id", requireApiKey, async (c) => {
    try {
      const orderId = c.req.param("id");

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          orderItems: {
            include: {
              stage: true,
              bapteme: true,
              stageBooking: {
                include: {
                  stagiaire: true,
                },
              },
              baptemeBooking: {
                include: {
                  stagiaire: true,
                },
              },
            },
          },
          payments: true,
        },
      });

      if (!order) {
        return c.json({
          success: false,
          message: "Commande introuvable",
          data: null,
        });
      }

      return c.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error("Erreur récupération commande:", error);
      return c.json({
        success: false,
        message: "Erreur lors de la récupération de la commande",
        data: null,
      });
    }
  })

  // UPDATE order status (admin only)
  .patch(
    "/:id/status",
    requireAdmin,
    zValidator("json", UpdateOrderStatusSchema),
    async (c) => {
      try {
        const orderId = c.req.param("id");
        const { status } = c.req.valid("json");

        const order = await prisma.order.update({
          where: { id: orderId },
          data: { status },
          include: {
            orderItems: true,
            payments: true,
          },
        });

        return c.json({
          success: true,
          message: `Commande ${order.orderNumber} mise à jour`,
          data: order,
        });
      } catch (error) {
        console.error("Erreur mise à jour commande:", error);
        return c.json({
          success: false,
          message: "Erreur lors de la mise à jour de la commande",
          data: null,
        });
      }
    },
  )

  // GET all orders (admin only)
  .get("/", requireAdmin, async (c) => {
    try {
      // Calculate the cutoff time (6 hours ago)
      const sixHoursAgo = new Date();
      sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

      const orders = await prisma.order.findMany({
        where: {
          OR: [
            // Include all non-PENDING orders
            {
              status: {
                not: "PENDING",
              },
            },
            // Include PENDING orders updated within the last 6 hours
            {
              AND: [
                {
                  status: "PENDING",
                },
                {
                  updatedAt: {
                    gte: sixHoursAgo,
                  },
                },
              ],
            },
          ],
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          orderItems: {
            select: {
              id: true,
              type: true,
              quantity: true,
              totalPrice: true,
            },
          },
          payments: {
            select: {
              id: true,
              status: true,
              amount: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return c.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      console.error("Erreur récupération commandes:", error);
      return c.json({
        success: false,
        message: "Erreur lors de la récupération des commandes",
        data: null,
      });
    }
  })

  // DELETE ghost orders (admin only) — remove PENDING orders with no payment older than 24h
  .delete("/ghost", requireAdmin, async (c) => {
    try {
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - 24);

      // Find ghost orders: PENDING, no succeeded payment, older than 24h
      const ghostOrders = await prisma.order.findMany({
        where: {
          status: "PENDING",
          createdAt: { lt: cutoff },
          payments: {
            none: { status: "SUCCEEDED" },
          },
        },
        select: { id: true, orderNumber: true },
      });

      if (ghostOrders.length === 0) {
        return c.json({ success: true, message: "Aucune commande fantôme à supprimer", data: { deleted: 0 } });
      }

      const ids = ghostOrders.map((o) => o.id);

      await prisma.order.deleteMany({ where: { id: { in: ids } } });

      console.log(`[GHOST-CLEANUP] Deleted ${ids.length} ghost orders: ${ids.join(", ")}`);

      return c.json({
        success: true,
        message: `${ids.length} commande(s) fantôme(s) supprimée(s)`,
        data: { deleted: ids.length, orderNumbers: ghostOrders.map((o) => o.orderNumber) },
      });
    } catch (error) {
      console.error("Erreur nettoyage commandes fantômes:", error);
      return c.json({ success: false, message: "Erreur lors du nettoyage", data: null }, 500);
    }
  })

  // CONFIRM final payment for an OrderItem (admin only)
  .post(
    "/items/:orderItemId/finalize",
    requireAdmin,
    zValidator(
      "json",
      z.object({
        note: z.string().optional(),
      }),
    ),
    async (c) => {
      const orderItemId = c.req.param("orderItemId");
      const { note } = c.req.valid("json");

      if (!orderItemId) {
        return c.json({
          success: false,
          message: "ID de l'article requis",
          data: null,
        });
      }

      try {
        // 1. Récupérer l'OrderItem
        const orderItem = await prisma.orderItem.findUnique({
          where: { id: orderItemId },
          include: {
            order: {
              include: {
                orderItems: true,
              },
            },
          },
        });

        if (!orderItem) {
          return c.json({
            success: false,
            message: "Article de commande introuvable",
            data: null,
          });
        }

        // 2. Vérifier que c'est un stage ou un baptême
        if (orderItem.type !== "STAGE" && orderItem.type !== "BAPTEME") {
          return c.json({
            success: false,
            message:
              "Seuls les stages et baptêmes nécessitent un paiement final",
            data: null,
          });
        }

        // 3. Vérifier qu'il n'est pas déjà entièrement payé
        if (orderItem.isFullyPaid) {
          return c.json({
            success: false,
            message: "Cet article est déjà entièrement payé",
            data: null,
          });
        }

        // 4. Mettre à jour l'OrderItem
        const updatedOrderItem = await prisma.orderItem.update({
          where: { id: orderItemId },
          data: {
            isFullyPaid: true,
            finalPaymentDate: new Date(),
            finalPaymentNote: note,
            remainingAmount: 0,
          },
        });

        // 5. Vérifier si tous les items de la commande sont entièrement payés
        const allItemsFullyPaid = orderItem.order.orderItems.every(
          (item) => item.id === orderItemId || item.isFullyPaid,
        );

        // 6. Mettre à jour le statut de la commande si nécessaire
        if (allItemsFullyPaid) {
          await prisma.order.update({
            where: { id: orderItem.orderId },
            data: { status: "FULLY_PAID" },
          });
        }

        return c.json({
          success: true,
          message: `Paiement final confirmé. ${allItemsFullyPaid ? "Commande entièrement payée." : "Il reste des articles à payer."}`,
          data: {
            orderItem: updatedOrderItem,
            orderFullyPaid: allItemsFullyPaid,
          },
        });
      } catch (error) {
        console.error("Erreur confirmation paiement final:", error);
        return c.json({
          success: false,
          message: "Erreur lors de la confirmation du paiement final",
          data: null,
        });
      }
    },
  );

export default app;
