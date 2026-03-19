import { Hono } from "hono";
import { requireAdmin } from "@/lib/middlewares";
import prisma from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import {
  CreatePromoCodeSchema,
  UpdatePromoCodeSchema,
  ValidatePromoCodeSchema,
} from "../schemas";

const app = new Hono()
  //*------------------*//
  //ALL GET REQUESTS API
  //*------------------*//

  // Get all promo codes
  .get("/", requireAdmin, async (c) => {
    try {
      const result = await prisma.promoCode.findMany({
        include: {
          usages: {
            include: {
              order: {
                select: {
                  id: true,
                  orderNumber: true,
                  createdAt: true,
                  client: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: { usages: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return c.json({ success: true, message: "", data: result });
    } catch (error) {
      return c.json({
        success: false,
        message: "Erreur lors de la récupération des codes promo",
        data: null,
      });
    }
  })

  // Get promo code by ID (avec historique des utilisations)
  .get("/:id", requireAdmin, async (c) => {
    try {
      const id = c.req.param("id");
      const result = await prisma.promoCode.findUnique({
        where: { id },
        include: {
          usages: {
            include: {
              order: {
                select: {
                  id: true,
                  orderNumber: true,
                  createdAt: true,
                  totalAmount: true,
                  status: true,
                  client: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!result) {
        return c.json({
          success: false,
          message: "Code promo introuvable",
          data: null,
        });
      }

      return c.json({ success: true, message: "", data: result });
    } catch (error) {
      return c.json({
        success: false,
        message: "Erreur lors de la récupération du code promo",
        data: null,
      });
    }
  })

  //*------------------*//
  //POST REQUESTS API
  //*------------------*//

  // Create new promo code
  .post(
    "/",
    requireAdmin,
    zValidator("json", CreatePromoCodeSchema),
    async (c) => {
      const data = c.req.valid("json");

      try {
        // Vérification unicité du code
        const existing = await prisma.promoCode.findUnique({
          where: { code: data.code },
        });

        if (existing) {
          return c.json({
            success: false,
            message: "Ce code existe déjà",
            data: null,
          });
        }

        // Validation : PERCENTAGE nécessite un plafond recommandé
        if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
          return c.json({
            success: false,
            message: "Un pourcentage ne peut pas dépasser 100%",
            data: null,
          });
        }

        const result = await prisma.promoCode.create({ data });

        return c.json({
          success: true,
          message: `Code promo "${result.code}" créé avec succès`,
          data: result,
        });
      } catch (error) {
        return c.json({
          success: false,
          message: "Erreur lors de la création du code promo",
          data: null,
        });
      }
    },
  )

  // Validate promo code (depuis le front checkout — pas besoin d'auth admin)
  .post("/validate", zValidator("json", ValidatePromoCodeSchema), async (c) => {
    const { code, cartTotal, cartSubtotal, cartItems } = c.req.valid("json");

    try {
      const promoCode = await prisma.promoCode.findUnique({
        where: { code: code.toUpperCase() },
      });

      // Code inexistant
      if (!promoCode) {
        return c.json({ success: false, message: "Code promo invalide" }, 404);
      }

      // Code inactif
      if (!promoCode.isActive) {
        return c.json(
          { success: false, message: "Ce code promo n'est plus actif" },
          400,
        );
      }

      // Date d'expiration
      if (promoCode.expiryDate && new Date() > promoCode.expiryDate) {
        return c.json(
          { success: false, message: "Ce code promo a expiré" },
          400,
        );
      }

      // Nombre max d'utilisations
      if (
        promoCode.maxUses !== null &&
        promoCode.currentUses >= promoCode.maxUses
      ) {
        return c.json(
          {
            success: false,
            message: "Ce code promo a atteint sa limite d'utilisation",
          },
          400,
        );
      }

      // Vérification des types de produits applicables
      const restrictedTypes = promoCode.applicableProductTypes;
      if (restrictedTypes.length > 0 && cartItems && cartItems.length > 0) {
        const hasApplicableItem = cartItems.some((item) =>
          restrictedTypes.includes(item.type as any),
        );
        if (!hasApplicableItem) {
          const typeLabels: Record<string, string> = {
            STAGE: "stages",
            BAPTEME: "baptêmes",
            GIFT_VOUCHER: "bons cadeaux",
          };
          const labels = restrictedTypes.map((t) => typeLabels[t] ?? t).join(", ");
          return c.json(
            {
              success: false,
              message: `Ce code promo est réservé aux ${labels}`,
            },
            400,
          );
        }
      }

      // Montant applicable à la réduction
      // Les items couverts par bon cadeau sont toujours exclus (déjà gratuits)
      // Si le code est restreint à certains types, filtrer en plus par type
      let applicableTotal: number;
      if (cartItems && cartItems.length > 0) {
        applicableTotal = cartItems
          .filter((item) => !item.isGiftVoucherCovered)
          .filter((item) => restrictedTypes.length === 0 || restrictedTypes.includes(item.type as any))
          .reduce((sum, item) => sum + item.amount, 0);
      } else {
        applicableTotal = cartTotal;
      }

      // Montant minimum du panier — on vérifie sur le prix plein (cartSubtotal),
      // pas sur l'acompte (cartTotal), car un stage à 680€ peut n'avoir qu'un acompte de 150€
      const amountForMinCheck = cartSubtotal ?? cartTotal;
      if (promoCode.minCartAmount && amountForMinCheck < promoCode.minCartAmount) {
        return c.json(
          {
            success: false,
            message: `Montant minimum du panier requis : ${promoCode.minCartAmount.toFixed(2)}€`,
          },
          400,
        );
      }

      // Calcul du montant de réduction (sur la portion applicable)
      let discountAmount: number;

      if (promoCode.discountType === "FIXED") {
        discountAmount = Math.min(promoCode.discountValue, applicableTotal);
      } else {
        // PERCENTAGE
        const rawDiscount = (applicableTotal * promoCode.discountValue) / 100;
        discountAmount = promoCode.maxDiscountAmount
          ? Math.min(rawDiscount, promoCode.maxDiscountAmount)
          : rawDiscount;
        discountAmount = Math.min(discountAmount, applicableTotal);
      }

      // Arrondi à 2 décimales
      discountAmount = Math.round(discountAmount * 100) / 100;

      return c.json({
        success: true,
        data: {
          promoCode: {
            id: promoCode.id,
            code: promoCode.code,
            label: promoCode.label,
            discountType: promoCode.discountType,
            discountValue: promoCode.discountValue,
            maxDiscountAmount: promoCode.maxDiscountAmount,
            applicableProductTypes: promoCode.applicableProductTypes,
          },
          discountAmount,
          cartTotalAfterDiscount:
            Math.round((cartTotal - discountAmount) * 100) / 100,
        },
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          message: "Erreur lors de la validation du code promo",
        },
        500,
      );
    }
  })

  //*------------------*//
  //PUT REQUESTS API
  //*------------------*//

  // Update promo code
  .put(
    "/:id",
    requireAdmin,
    zValidator("json", UpdatePromoCodeSchema),
    async (c) => {
      const id = c.req.param("id");
      const updateData = c.req.valid("json");

      try {
        const existing = await prisma.promoCode.findUnique({ where: { id } });
        if (!existing) {
          return c.json({
            success: false,
            message: "Code promo introuvable",
            data: null,
          });
        }

        const result = await prisma.promoCode.update({
          where: { id },
          data: updateData,
        });

        return c.json({
          success: true,
          message: "Code promo mis à jour avec succès",
          data: result,
        });
      } catch (error) {
        return c.json({
          success: false,
          message: "Erreur lors de la mise à jour du code promo",
          data: null,
        });
      }
    },
  )

  //*------------------*//
  //DELETE REQUESTS API
  //*------------------*//

  // Delete promo code (seulement si pas encore utilisé)
  .delete("/:id", requireAdmin, async (c) => {
    const id = c.req.param("id");

    try {
      const existing = await prisma.promoCode.findUnique({
        where: { id },
        include: { _count: { select: { usages: true } } },
      });

      if (!existing) {
        return c.json({
          success: false,
          message: "Code promo introuvable",
          data: null,
        });
      }

      if (existing._count.usages > 0) {
        return c.json({
          success: false,
          message: `Impossible de supprimer un code déjà utilisé (${existing._count.usages} utilisation(s)). Désactivez-le à la place.`,
          data: null,
        });
      }

      await prisma.promoCode.delete({ where: { id } });

      return c.json({
        success: true,
        message: "Code promo supprimé avec succès",
        data: null,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: "Erreur lors de la suppression du code promo",
        data: null,
      });
    }
  });

export default app;
