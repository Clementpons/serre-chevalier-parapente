import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { requireAdmin, requireApiKey } from "@/lib/middlewares";
import prisma from "@/lib/prisma";
import {
  CreateGiftVoucherSchema,
  ValidateVoucherSchema,
  ReserveVoucherSchema,
  ReleaseVoucherSchema,
  GetVoucherPriceSchema,
  UpdateGiftVoucherSchema,
  LookupVoucherSchema,
} from "../schemas";
import { z } from "zod";

const app = new Hono()
  // GET all gift vouchers (admin only)
  .get("/", requireAdmin, async (c) => {
    try {

      const vouchers = await prisma.giftVoucher.findMany({
        include: {
          client: true,
          generatedFromOrderItem: {
            include: {
              order: true,
            },
          },
          usedInOrderItem: {
            include: {
              order: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return c.json({
        success: true,
        data: vouchers,
      });
    } catch (error) {
      console.error("Error fetching gift vouchers:", error);
      return c.json(
        {
          success: false,
          message: "Erreur lors de la récupération des bons cadeaux",
          data: null,
        },
        500
      );
    }
  })

  // GET single gift voucher by ID (admin only)
  .get("/:id", requireAdmin, async (c) => {
    try {
      const id = c.req.param("id");

      const voucher = await prisma.giftVoucher.findUnique({
        where: { id },
        include: {
          client: true,
          generatedFromOrderItem: {
            include: {
              order: true,
            },
          },
          usedInOrderItem: {
            include: {
              order: true,
              stage: true,
              bapteme: true,
            },
          },
        },
      });

      if (!voucher) {
        return c.json(
          {
            success: false,
            message: "Bon cadeau introuvable",
            data: null,
          },
          404
        );
      }

      return c.json({
        success: true,
        data: voucher,
      });
    } catch (error) {
      console.error("Error fetching gift voucher:", error);
      return c.json(
        {
          success: false,
          message: "Erreur lors de la récupération du bon cadeau",
          data: null,
        },
        500
      );
    }
  })

  // POST create gift voucher (admin only)
  .post(
    "/",
    requireAdmin,
    zValidator("json", CreateGiftVoucherSchema),
    async (c) => {
      try {
        const data = c.req.valid("json");

        // Générer un code unique
        const code = await generateUniqueVoucherCode();

        // Calculer la date d'expiration (1 an)
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        // Si pas de prix fourni (création admin), récupérer le prix depuis la BDD
        let purchasePrice = data.purchasePrice || 0;
        
        if (!purchasePrice) {
          if (data.productType === "STAGE" && data.stageCategory) {
            const stagePrice = await prisma.stageBasePrice.findUnique({
              where: { stageType: data.stageCategory },
            });
            purchasePrice = stagePrice?.price || 0;
          } else if (data.productType === "BAPTEME" && data.baptemeCategory) {
            const baptemePrice = await prisma.baptemeCategoryPrice.findUnique({
              where: { category: data.baptemeCategory },
            });
            purchasePrice = baptemePrice?.price || 0;
          }
        }

        const voucher = await prisma.giftVoucher.create({
          data: {
            code,
            productType: data.productType,
            stageCategory: data.stageCategory,
            baptemeCategory: data.baptemeCategory,
            purchasePrice,
            recipientName: data.recipientName,
            recipientEmail: data.recipientEmail,
            expiryDate,
          },
          include: {
            client: true,
          },
        });

        return c.json({
          success: true,
          message: "Bon cadeau créé avec succès",
          data: voucher,
        });
      } catch (error) {
        console.error("Error creating gift voucher:", error);
        return c.json(
          {
            success: false,
            message: "Erreur lors de la création du bon cadeau",
            data: null,
          },
          500
        );
      }
    }
  )

  // PATCH update gift voucher (admin only)
  .patch(
    "/:id",
    requireAdmin,
    zValidator("json", UpdateGiftVoucherSchema),
    async (c) => {
      try {
        const id = c.req.param("id");
        const data = c.req.valid("json");

        const voucher = await prisma.giftVoucher.update({
          where: { id },
          data,
          include: {
            client: true,
          },
        });

        return c.json({
          success: true,
          message: "Bon cadeau mis à jour",
          data: voucher,
        });
      } catch (error) {
        console.error("Error updating gift voucher:", error);
        return c.json(
          {
            success: false,
            message: "Erreur lors de la mise à jour du bon cadeau",
            data: null,
          },
          500
        );
      }
    }
  )

  // POST /lookup — code-only check, returns voucher metadata without requiring category (public)
  .post(
    "/lookup",
    requireApiKey,
    zValidator("json", LookupVoucherSchema),
    async (c) => {
      try {
        const { code } = c.req.valid("json");

        const voucher = await prisma.giftVoucher.findUnique({ where: { code } });

        if (!voucher) {
          return c.json({ success: false, message: "Code de bon cadeau invalide", data: null }, 404);
        }
        if (voucher.isUsed) {
          return c.json({ success: false, message: "Ce bon cadeau a déjà été utilisé", data: null }, 400);
        }
        if (new Date() > voucher.expiryDate) {
          return c.json({ success: false, message: "Ce bon cadeau a expiré", data: null }, 400);
        }
        if (voucher.reservedBySessionId) {
          return c.json({ success: false, message: "Ce bon cadeau est déjà en cours d'utilisation", data: null }, 409);
        }

        return c.json({
          success: true,
          message: "Bon cadeau valide",
          data: {
            code: voucher.code,
            productType: voucher.productType,
            stageCategory: voucher.stageCategory ?? null,
            baptemeCategory: voucher.baptemeCategory ?? null,
            recipientName: voucher.recipientName,
            expiryDate: voucher.expiryDate,
          },
        });
      } catch (error) {
        console.error("Error looking up voucher:", error);
        return c.json({ success: false, message: "Erreur lors de la vérification du bon cadeau", data: null }, 500);
      }
    }
  )

  // POST validate voucher code (public)
  .post(
    "/validate",
    requireApiKey,
    zValidator("json", ValidateVoucherSchema),
    async (c) => {
      try {
        const { code, productType, category } = c.req.valid("json");

        const voucher = await prisma.giftVoucher.findUnique({
          where: { code },
        });

        if (!voucher) {
          return c.json({
            success: false,
            message: "Code de bon cadeau invalide",
            data: { valid: false, reason: "Code invalide" },
          });
        }

        // Vérifier si le bon est déjà utilisé
        if (voucher.isUsed) {
          return c.json({
            success: false,
            message: "Ce bon cadeau a déjà été utilisé",
            data: { valid: false, reason: "Déjà utilisé" },
          });
        }

        // Vérifier si le bon est expiré
        if (new Date() > voucher.expiryDate) {
          return c.json({
            success: false,
            message: "Ce bon cadeau a expiré",
            data: { valid: false, reason: "Expiré" },
          });
        }

        // Vérifier si le bon est déjà réservé par une autre session
        if (voucher.reservedBySessionId) {
          return c.json({
            success: false,
            message: "Ce bon cadeau est déjà en cours d'utilisation",
            data: { valid: false, reason: "Déjà réservé" },
          });
        }

        // Vérifier que le type correspond
        if (voucher.productType !== productType) {
          return c.json({
            success: false,
            message: `Ce bon cadeau est valable uniquement pour un ${voucher.productType === "STAGE" ? "stage" : "baptême"}`,
            data: { valid: false, reason: "Type incompatible" },
          });
        }

        // Vérifier que la catégorie correspond
        const voucherCategory =
          voucher.productType === "STAGE"
            ? voucher.stageCategory
            : voucher.baptemeCategory;

        if (voucherCategory !== category) {
          return c.json({
            success: false,
            message: `Ce bon cadeau est valable uniquement pour la catégorie ${voucherCategory}`,
            data: { valid: false, reason: "Catégorie incompatible" },
          });
        }

        return c.json({
          success: true,
          message: "Bon cadeau valide",
          data: {
            valid: true,
            voucher: {
              code: voucher.code,
              productType: voucher.productType,
              category: voucherCategory,
              recipientName: voucher.recipientName,
              expiryDate: voucher.expiryDate,
            },
          },
        });
      } catch (error) {
        console.error("Error validating voucher:", error);
        return c.json(
          {
            success: false,
            message: "Erreur lors de la validation du bon cadeau",
            data: { valid: false, reason: "Erreur serveur" },
          },
          500
        );
      }
    }
  )

  // POST reserve voucher (when adding to cart)
  .post(
    "/reserve",
    requireApiKey,
    zValidator("json", ReserveVoucherSchema),
    async (c) => {
      try {
        const { code, sessionId } = c.req.valid("json");

        const voucher = await prisma.giftVoucher.findUnique({
          where: { code },
        });

        if (!voucher) {
          return c.json(
            {
              success: false,
              message: "Code de bon cadeau invalide",
              data: null,
            },
            404
          );
        }

        // Vérifier si déjà réservé par une autre session
        if (
          voucher.reservedBySessionId &&
          voucher.reservedBySessionId !== sessionId
        ) {
          return c.json(
            {
              success: false,
              message: "Ce bon cadeau est déjà en cours d'utilisation",
              data: null,
            },
            409
          );
        }

        // Réserver le bon
        const updatedVoucher = await prisma.giftVoucher.update({
          where: { code },
          data: {
            reservedBySessionId: sessionId,
            reservedAt: new Date(),
          },
        });

        return c.json({
          success: true,
          message: "Bon cadeau réservé",
          data: updatedVoucher,
        });
      } catch (error) {
        console.error("Error reserving voucher:", error);
        return c.json(
          {
            success: false,
            message: "Erreur lors de la réservation du bon cadeau",
            data: null,
          },
          500
        );
      }
    }
  )

  // POST release voucher (when removing from cart)
  .post(
    "/release",
    requireApiKey,
    zValidator("json", ReleaseVoucherSchema),
    async (c) => {
      try {
        const { code, sessionId } = c.req.valid("json");

        const voucher = await prisma.giftVoucher.findUnique({
          where: { code },
        });

        if (!voucher) {
          return c.json(
            {
              success: false,
              message: "Code de bon cadeau invalide",
              data: null,
            },
            404
          );
        }

        // Vérifier que c'est bien la session qui a réservé le bon
        if (voucher.reservedBySessionId !== sessionId) {
          return c.json(
            {
              success: false,
              message: "Vous n'avez pas réservé ce bon cadeau",
              data: null,
            },
            403
          );
        }

        // Libérer le bon
        const updatedVoucher = await prisma.giftVoucher.update({
          where: { code },
          data: {
            reservedBySessionId: null,
            reservedAt: null,
          },
        });

        return c.json({
          success: true,
          message: "Bon cadeau libéré",
          data: updatedVoucher,
        });
      } catch (error) {
        console.error("Error releasing voucher:", error);
        return c.json(
          {
            success: false,
            message: "Erreur lors de la libération du bon cadeau",
            data: null,
          },
          500
        );
      }
    }
  )

  // GET price for voucher type and category (public)
  .get(
    "/price/:productType/:category",
    requireApiKey,
    async (c) => {
      try {
        const productType = c.req.param("productType") as "STAGE" | "BAPTEME";
        const category = c.req.param("category");

        let price = 0;

        if (productType === "STAGE") {
          // Récupérer le prix du stage selon la catégorie
          const stagePrice = await prisma.stageBasePrice.findUnique({
            where: { stageType: category as any },
          });

          if (!stagePrice) {
            return c.json(
              {
                success: false,
                message: "Prix non trouvé pour cette catégorie de stage",
                data: null,
              },
              404
            );
          }

          price = stagePrice.price;
        } else if (productType === "BAPTEME") {
          // Récupérer le prix du baptême selon la catégorie
          const baptemePrice = await prisma.baptemeCategoryPrice.findUnique({
            where: { category: category as any },
          });

          if (!baptemePrice) {
            return c.json(
              {
                success: false,
                message: "Prix non trouvé pour cette catégorie de baptême",
                data: null,
              },
              404
            );
          }

          price = baptemePrice.price;
        } else {
          return c.json(
            {
              success: false,
              message: "Type de produit invalide",
              data: null,
            },
            400
          );
        }

        return c.json({
          success: true,
          data: {
            productType,
            category,
            price,
          },
        });
      } catch (error) {
        console.error("Error fetching voucher price:", error);
        return c.json(
          {
            success: false,
            message: "Erreur lors de la récupération du prix",
            data: null,
          },
          500
        );
      }
    }
  );

// Fonction pour générer un code unique de bon cadeau
async function generateUniqueVoucherCode(): Promise<string> {
  let code: string;
  let exists = true;

  do {
    const prefix = "GVSCP";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    code = `${prefix}-${timestamp}-${random}`;

    const existing = await prisma.giftVoucher.findUnique({
      where: { code },
    });
    exists = !!existing;
  } while (exists);

  return code;
}

export default app;