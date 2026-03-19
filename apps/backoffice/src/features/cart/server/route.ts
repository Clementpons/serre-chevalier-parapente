import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { requireApiKey, requireCartSession } from "@/lib/middlewares";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { AvailabilityService } from "@/lib/availability";

// Schémas de validation
const AddToCartSchema = z
  .object({
    type: z.enum(["STAGE", "BAPTEME", "GIFT_VOUCHER"]),
    itemId: z.string().optional(),
    giftVoucherCode: z.string().optional(), // Pour UTILISATION d'un bon
    giftVoucherAmount: z.number().optional(), // Pour ACHAT d'un bon
    participantData: z.object({
      // Champs obligatoires pour STAGE/BAPTEME (mais optionnels pour GIFT_VOUCHER)
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      weight: z.number().optional(),
      height: z.number().optional(),
      birthDate: z.string().optional(),
      // Pour baptêmes
      selectedCategory: z.string().optional(),
      hasVideo: z.boolean().optional(),
      // Pour stages
      selectedStageType: z.string().optional(),
      // Pour cartes cadeaux
      recipientName: z.string().optional(),
      recipientEmail: z.string().optional(),
      personalMessage: z.string().optional(),
      deliveryDate: z.string().optional(),
      notifyRecipient: z.boolean().optional(),
      // Pour bons cadeaux (GIFT_VOUCHER)
      voucherProductType: z.string().optional(),
      voucherStageCategory: z.string().optional(),
      voucherBaptemeCategory: z.string().optional(),
      // Informations de l'acheteur pour les bons cadeaux
      buyerName: z.string().optional(),
      buyerEmail: z.string().email().optional(),
      // Pour utilisation d'un bon cadeau
      usedGiftVoucherCode: z.string().optional(),
    }),
    quantity: z.number().default(1),
  })
  .refine(
    (data) => {
      // Validation conditionnelle selon le type
      if (data.type === "STAGE" || data.type === "BAPTEME") {
        // Pour les réservations, ces champs sont requis
        if (
          !data.participantData.firstName ||
          !data.participantData.lastName ||
          !data.participantData.email ||
          !data.participantData.phone ||
          data.participantData.weight === undefined ||
          data.participantData.height === undefined
        ) {
          return false;
        }
      }

      if (data.type === "GIFT_VOUCHER") {
        // Pour l'achat de bons cadeaux, seuls ces champs sont requis
        if (
          !data.participantData.voucherProductType ||
          !data.participantData.buyerName ||
          !data.participantData.buyerEmail ||
          data.participantData.notifyRecipient === undefined
        ) {
          return false;
        }

        // Si on veut notifier le bénéficiaire, son email est requis
        if (
          data.participantData.notifyRecipient &&
          !data.participantData.recipientEmail
        ) {
          return false;
        }
      }

      return true;
    },
    {
      message: "Champs requis manquants selon le type de produit",
      path: ["participantData"],
    },
  );

const UpdateCartItemSchema = z.object({
  quantity: z.number().optional(),
  participantData: z
    .object({
      // Pour BAPTEME et STAGE
      firstName: z.string().min(1, "Prénom requis").optional(),
      lastName: z.string().min(1, "Nom requis").optional(),
      email: z.string().email("Email invalide").optional(),
      phone: z.string().min(10, "Téléphone invalide").optional(),
      weight: z
        .number()
        .min(20, "Poids minimum: 20kg")
        .max(120, "Poids maximum: 120kg")
        .optional(),
      height: z
        .number()
        .min(120, "Taille minimum: 120cm")
        .max(220, "Taille maximum: 220cm")
        .optional(),
      birthDate: z.string().optional(),
      selectedCategory: z.string().optional(),
      hasVideo: z.boolean().optional(),
      selectedStageType: z.string().optional(),
      // Pour bons cadeaux
      recipientName: z.string().optional(),
      recipientEmail: z
        .string()
        .email("Email bénéficiaire invalide")
        .optional(),
      notifyRecipient: z.boolean().optional(),
      personalMessage: z.string().optional(),
    })
    .optional(),
});

const app = new Hono()
  // GET cart items
  .get("items", requireApiKey, requireCartSession, async (c) => {
    try {
      const cartSession = c.get("cartSession");
      const now = new Date();

      // Récupérer tous les items du panier
      const allCartItems = await prisma.cartItem.findMany({
        where: {
          cartSessionId: cartSession.id,
        },
        include: {
          stage: true,
          bapteme: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Identifier et supprimer les items expirés
      const expiredItemIds: string[] = [];
      const validItems = allCartItems.filter((item) => {
        // Vérifier si l'item a une date d'expiration et si elle est dépassée
        if (
          (item.type === "STAGE" || item.type === "BAPTEME") &&
          item.expiresAt
        ) {
          const isExpired = new Date(item.expiresAt) <= now;
          if (isExpired) {
            expiredItemIds.push(item.id);
            return false; // Exclure cet item
          }
        }
        return true; // Garder cet item
      });

      // Supprimer les items expirés de la base de données
      if (expiredItemIds.length > 0) {
        await prisma.cartItem.deleteMany({
          where: {
            id: { in: expiredItemIds },
          },
        });
      }

      // Calculer le total avec les items valides uniquement
      let totalAmount = 0;
      for (const item of validItems) {
        if (item.type === "STAGE" && item.stage) {
          // Vérifier si c'est une utilisation de bon cadeau
          const participantData = item.participantData as any;
          if (participantData?.usedGiftVoucherCode) {
            // Réservation avec bon cadeau = gratuit
            totalAmount += 0;
          } else {
            // Réservation normale: on paie l'acompte
            totalAmount += item.stage.acomptePrice * item.quantity;
          }
        } else if (item.type === "BAPTEME" && item.bapteme) {
          // Vérifier si c'est une utilisation de bon cadeau
          const participantData = item.participantData as any;
          if (participantData?.usedGiftVoucherCode) {
            // Réservation avec bon cadeau = gratuit
            totalAmount += 0;
          } else {
            // Réservation normale: on paie l'acompte
            const acomptePrice = item.bapteme.acomptePrice;
            totalAmount += acomptePrice * item.quantity;
          }
        } else if (item.type === "GIFT_VOUCHER") {
          // Achat de bon cadeau
          totalAmount += item.giftVoucherAmount || 0;
        }
      }

      return c.json({
        success: true,
        data: {
          items: validItems,
          totalAmount,
          itemCount: validItems.length,
        },
      });
    } catch (error) {
      console.error("Erreur récupération panier:", error);
      return c.json({
        success: false,
        message: "Erreur lors de la récupération du panier",
        data: null,
      });
    }
  })

  // ADD item to cart
  .post(
    "items",
    requireApiKey,
    zValidator("json", AddToCartSchema),
    requireCartSession,
    async (c) => {
      try {
        const {
          type,
          itemId,
          giftVoucherCode,
          giftVoucherAmount,
          participantData,
          quantity,
        } = c.req.valid("json");
        const cartSession = c.get("cartSession");

        // Validation selon le type
        if (type === "GIFT_VOUCHER") {
          // ACHAT d'un bon cadeau
          if (!giftVoucherAmount) {
            return c.json({
              success: false,
              message: "Montant du bon cadeau requis",
              data: null,
            });
          }

          if (!participantData.voucherProductType) {
            return c.json({
              success: false,
              message: "Type de produit requis pour l'achat d'un bon cadeau",
              data: null,
            });
          }

          // recipientName est requis, recipientEmail seulement si notifyRecipient est true
          if (!participantData.recipientName) {
            return c.json({
              success: false,
              message: "Le nom du bénéficiaire est requis",
              data: null,
            });
          }

          if (
            participantData.notifyRecipient &&
            !participantData.recipientEmail
          ) {
            return c.json({
              success: false,
              message:
                "L'email du bénéficiaire est requis pour l'envoi automatique",
              data: null,
            });
          }

          // Validation des informations de l'acheteur (pour les emails)
          if (!participantData.buyerName || !participantData.buyerEmail) {
            return c.json({
              success: false,
              message:
                "Informations de l'acheteur requises pour l'envoi des emails",
              data: null,
            });
          }

          // Pas de vérification de disponibilité pour l'achat de bons
          // Pas de réservation temporaire
        } else {
          // STAGE ou BAPTEME (avec ou sans bon cadeau)
          if (!itemId) {
            return c.json({
              success: false,
              message: "ID de l'activité requis",
              data: null,
            });
          }

          // Si utilisation d'un bon cadeau
          if (participantData.usedGiftVoucherCode) {
            const voucherCode = participantData.usedGiftVoucherCode;

            // Vérifier que le bon existe et est valide
            const voucher = await prisma.giftVoucher.findUnique({
              where: { code: voucherCode },
            });

            if (!voucher) {
              return c.json({
                success: false,
                message: "Code de bon cadeau invalide",
                data: null,
              });
            }

            if (voucher.isUsed) {
              return c.json({
                success: false,
                message: "Ce bon cadeau a déjà été utilisé",
                data: null,
              });
            }

            if (new Date() > voucher.expiryDate) {
              return c.json({
                success: false,
                message: "Ce bon cadeau a expiré",
                data: null,
              });
            }

            if (
              voucher.reservedBySessionId &&
              voucher.reservedBySessionId !== cartSession.sessionId
            ) {
              return c.json({
                success: false,
                message: "Ce bon cadeau est déjà en cours d'utilisation",
                data: null,
              });
            }

            // Vérifier que le type correspond
            if (
              (type === "STAGE" && voucher.productType !== "STAGE") ||
              (type === "BAPTEME" && voucher.productType !== "BAPTEME")
            ) {
              return c.json({
                success: false,
                message: `Ce bon cadeau est valable uniquement pour un ${voucher.productType === "STAGE" ? "stage" : "baptême"}`,
                data: null,
              });
            }

            // Vérifier la catégorie
            if (type === "STAGE") {
              const selectedStageType = participantData.selectedStageType;
              if (selectedStageType !== voucher.stageCategory) {
                return c.json({
                  success: false,
                  message: `Ce bon cadeau est valable uniquement pour un stage ${voucher.stageCategory}`,
                  data: null,
                });
              }
            } else if (type === "BAPTEME") {
              const selectedCategory = participantData.selectedCategory;
              if (selectedCategory !== voucher.baptemeCategory) {
                return c.json({
                  success: false,
                  message: `Ce bon cadeau est valable uniquement pour un baptême ${voucher.baptemeCategory}`,
                  data: null,
                });
              }
            }

            // Réserver le bon
            await prisma.giftVoucher.update({
              where: { code: voucherCode },
              data: {
                reservedBySessionId: cartSession.sessionId,
                reservedAt: new Date(),
              },
            });
          }

          // Vérifier les disponibilités
          const availability = await AvailabilityService.checkAvailability(
            type.toLowerCase() as "stage" | "bapteme",
            itemId,
            quantity,
          );

          if (!availability.available) {
            return c.json({
              success: false,
              message: availability.reason || "Places non disponibles",
              data: null,
            });
          }

          // Créer une réservation temporaire
          await AvailabilityService.createTemporaryReservation(
            cartSession.sessionId,
            type.toLowerCase() as "stage" | "bapteme",
            itemId,
            quantity,
          );
        }

        // Calculer l'expiration pour STAGE et BAPTEME (1 heure)
        const now = new Date();
        const expiresAt =
          type === "STAGE" || type === "BAPTEME"
            ? new Date(now.getTime() + 60 * 60 * 1000) // +1 heure
            : null; // Pas d'expiration pour GIFT_VOUCHER

        // Déterminer les IDs selon le type
        let stageId = null;
        let baptemeId = null;

        if (type === "STAGE") {
          stageId = itemId;
        } else if (type === "BAPTEME") {
          baptemeId = itemId;
        }

        // Créer l'item dans le panier
        const cartItem = await prisma.cartItem.create({
          data: {
            type,
            quantity,
            stageId,
            baptemeId,
            giftVoucherAmount:
              type === "GIFT_VOUCHER" ? giftVoucherAmount : null,
            participantData,
            cartSessionId: cartSession.id,
            expiresAt,
            isExpired: false,
          },
          include: {
            stage: true,
            bapteme: true,
          },
        });

        return c.json({
          success: true,
          message: "Article ajouté au panier",
          data: cartItem,
        });
      } catch (error) {
        console.error("Erreur ajout panier:", error);
        return c.json({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Erreur lors de l'ajout au panier",
          data: null,
        });
      }
    },
  )

  // UPDATE cart item
  .put(
    "items/:id",
    requireApiKey,
    zValidator("json", UpdateCartItemSchema),
    requireCartSession,
    async (c) => {
      try {
        const itemId = c.req.param("id");
        const updateData = c.req.valid("json");
        const cartSession = c.get("cartSession");

        // Vérifier que l'item appartient à cette session
        const existingItem = await prisma.cartItem.findFirst({
          where: {
            id: itemId,
            cartSessionId: cartSession.id,
          },
        });

        if (!existingItem) {
          return c.json({
            success: false,
            message: "Article introuvable dans votre panier",
            data: null,
          });
        }

        // Mettre à jour l'item
        const updatedItem = await prisma.cartItem.update({
          where: { id: itemId },
          data: updateData,
          include: {
            stage: true,
            bapteme: true,
          },
        });

        return c.json({
          success: true,
          message: "Article mis à jour",
          data: updatedItem,
        });
      } catch (error) {
        console.error("Erreur mise à jour panier:", error);
        return c.json({
          success: false,
          message: "Erreur lors de la mise à jour",
          data: null,
        });
      }
    },
  )

  // PATCH cart item (with price recalculation)
  .patch(
    "items/:id",
    requireApiKey,
    zValidator("json", UpdateCartItemSchema),
    requireCartSession,
    async (c) => {
      try {
        const itemId = c.req.param("id");
        const updateData = c.req.valid("json");
        const cartSession = c.get("cartSession");

        // Vérifier que l'item appartient à cette session
        const existingItem = await prisma.cartItem.findFirst({
          where: {
            id: itemId,
            cartSessionId: cartSession.id,
          },
          include: {
            stage: true,
            bapteme: true,
          },
        });

        if (!existingItem) {
          return c.json(
            {
              success: false,
              message: "Article introuvable dans votre panier",
              data: null,
            },
            404,
          );
        }

        // Validation stricte des données participant si fournies
        if (updateData.participantData) {
          const { weight, height, email, phone, recipientName } =
            updateData.participantData;

          // Validation pour BAPTEME/STAGE
          if (
            existingItem.type === "BAPTEME" ||
            existingItem.type === "STAGE"
          ) {
            // Validation poids (si fourni)
            if (weight !== undefined && (weight < 20 || weight > 120)) {
              return c.json(
                {
                  success: false,
                  message: "Le poids doit être entre 20 et 120 kg",
                  data: null,
                },
                400,
              );
            }

            // Validation taille (si fournie)
            if (height !== undefined && (height < 120 || height > 220)) {
              return c.json(
                {
                  success: false,
                  message: "La taille doit être entre 120 et 220 cm",
                  data: null,
                },
                400,
              );
            }

            // Validation email (si fourni)
            if (email !== undefined) {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(email)) {
                return c.json(
                  {
                    success: false,
                    message: "Format d'email invalide",
                    data: null,
                  },
                  400,
                );
              }
            }

            // Validation téléphone (si fourni)
            if (phone !== undefined) {
              const phoneRegex =
                /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
              if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
                return c.json(
                  {
                    success: false,
                    message: "Format de téléphone invalide",
                    data: null,
                  },
                  400,
                );
              }
            }
          }

          // (aucune validation spécifique pour GIFT_VOUCHER ici)
        }

        // Préparer les données de mise à jour
        const dataToUpdate: any = {};

        if (updateData.quantity !== undefined) {
          dataToUpdate.quantity = updateData.quantity;
        }

        if (updateData.participantData) {
          // Fusionner les anciennes données avec les nouvelles
          const oldParticipantData = existingItem.participantData as any;
          const newParticipantData = {
            ...oldParticipantData,
            ...updateData.participantData,
          };

          dataToUpdate.participantData = newParticipantData;
        }

        // Mettre à jour l'item
        const updatedItem = await prisma.cartItem.update({
          where: { id: itemId },
          data: dataToUpdate,
          include: {
            stage: true,
            bapteme: true,
          },
        });

        // Recalculer le total du panier
        const allCartItems = await prisma.cartItem.findMany({
          where: {
            cartSessionId: cartSession.id,
          },
          include: {
            stage: true,
            bapteme: true,
          },
        });

        let totalAmount = 0;
        for (const item of allCartItems) {
          if (item.type === "STAGE" && item.stage) {
            const participantData = item.participantData as any;
            if (participantData?.usedGiftVoucherCode) {
              totalAmount += 0; // Gratuit avec bon cadeau
            } else {
              totalAmount += item.stage.acomptePrice * item.quantity;
            }
          } else if (item.type === "BAPTEME" && item.bapteme) {
            const participantData = item.participantData as any;
            if (participantData?.usedGiftVoucherCode) {
              totalAmount += 0; // Gratuit avec bon cadeau
            } else {
              const acomptePrice = item.bapteme.acomptePrice;
              totalAmount += acomptePrice * item.quantity;
            }
          } else if (item.type === "GIFT_VOUCHER") {
            // Achat de bon cadeau
            totalAmount += item.giftVoucherAmount || 0;
          }
        }

        return c.json({
          success: true,
          message: "Article mis à jour avec succès",
          data: {
            item: updatedItem,
            cart: {
              id: cartSession.id,
              items: allCartItems,
              totalAmount,
              itemCount: allCartItems.length,
            },
          },
        });
      } catch (error) {
        console.error("[CART UPDATE ERROR]", error);
        return c.json(
          {
            success: false,
            message:
              error instanceof Error
                ? error.message
                : "Erreur lors de la mise à jour",
            data: null,
          },
          500,
        );
      }
    },
  )

  // REMOVE item from cart
  .delete(
    "items/:id",
    requireApiKey,
    requireCartSession,
    async (c) => {
      try {
        const itemId = c.req.param("id");
        const cartSession = c.get("cartSession");

        // Vérifier que l'item appartient à cette session
        const existingItem = await prisma.cartItem.findFirst({
          where: {
            id: itemId,
            cartSessionId: cartSession.id,
          },
        });

        if (!existingItem) {
          return c.json({
            success: false,
            message: "Article introuvable dans votre panier",
            data: null,
          });
        }

        // Libérer la réservation temporaire si applicable
        if (existingItem.type === "STAGE" && existingItem.stageId) {
          await AvailabilityService.releaseTemporaryReservation(
            cartSession.sessionId,
            "stage",
            existingItem.stageId,
          );
        } else if (existingItem.type === "BAPTEME" && existingItem.baptemeId) {
          await AvailabilityService.releaseTemporaryReservation(
            cartSession.sessionId,
            "bapteme",
            existingItem.baptemeId,
          );
        }

        // Libérer le bon cadeau si utilisé dans une réservation STAGE/BAPTEME
        const participantData = existingItem.participantData as any;
        if (
          (existingItem.type === "STAGE" || existingItem.type === "BAPTEME") &&
          participantData?.usedGiftVoucherCode
        ) {
          await prisma.giftVoucher.updateMany({
            where: {
              code: participantData.usedGiftVoucherCode,
              reservedBySessionId: cartSession.sessionId,
            },
            data: {
              reservedBySessionId: null,
              reservedAt: null,
            },
          });
        }

        // Supprimer l'item
        await prisma.cartItem.delete({
          where: { id: itemId },
        });

        return c.json({
          success: true,
          message: "Article supprimé du panier",
          data: null,
        });
      } catch (error) {
        console.error("Erreur suppression panier:", error);
        return c.json({
          success: false,
          message: "Erreur lors de la suppression",
          data: null,
        });
      }
    },
  )

  // CLEAR cart
  .delete("items", requireApiKey, requireCartSession, async (c) => {
    try {
      const cartSession = c.get("cartSession");

      // Libérer toutes les réservations temporaires
      await AvailabilityService.releaseTemporaryReservation(
        cartSession.sessionId,
      );

      // Supprimer tous les items
      await prisma.cartItem.deleteMany({
        where: {
          cartSessionId: cartSession.id,
        },
      });

      return c.json({
        success: true,
        message: "Panier vidé",
        data: null,
      });
    } catch (error) {
      console.error("Erreur vidage panier:", error);
      return c.json({
        success: false,
        message: "Erreur lors du vidage du panier",
        data: null,
      });
    }
  });

export default app;
