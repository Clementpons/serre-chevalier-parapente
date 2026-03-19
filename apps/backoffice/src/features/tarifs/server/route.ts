import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { requireAdmin } from "@/lib/middlewares";
import prisma from "@/lib/prisma";
import { z } from "zod";
import {
  UpdateTarifSchema,
  UpdateVideoOptionPriceSchema,
  UpdateStageBasePriceSchema,
  UpdateBaptemeDepositPriceSchema,
} from "../schemas";
import { BaptemeCategory, StageType } from "@prisma/client";
import { unstable_cache, revalidateTag } from "next/cache";


// Cache tags
export const CACHE_TAGS = {
  STAGES: "min-prices-stages",
  BAPTEMES: "min-prices-baptemes",
};

// Validations
const MinPriceQuerySchema = z.object({
  type: z.enum(["STAGE", "BAPTEME"]),
  subType: z.string().optional(),
});

// Cached Data Fetchers
const getMinStagePrice = unstable_cache(
  async (stageType?: StageType) => {
    const now = new Date();
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    const where: any = {
      startDate: { gt: now, lte: endOfYear },
    };

    if (stageType) {
      where.type = stageType;
    }

    const minPriceStage = await prisma.stage.findFirst({
      where,
      orderBy: { price: "asc" },
      select: { price: true },
    });

    return minPriceStage?.price ?? null;
  },
  ["get-min-stage-price"],
  {
    tags: [CACHE_TAGS.STAGES],
    revalidate: 86400, // 24h
  },
);

const getMinBaptemePrice = unstable_cache(
  async (category?: BaptemeCategory) => {
    if (category) {
      const cp = await prisma.baptemeCategoryPrice.findUnique({
        where: { category },
        select: { price: true },
      });
      return cp?.price ?? null;
    }

    // Sans catégorie : prix le plus bas toutes catégories confondues
    const cp = await prisma.baptemeCategoryPrice.findFirst({
      orderBy: { price: "asc" },
      select: { price: true },
    });
    return cp?.price ?? null;
  },
  ["get-min-bapteme-price"],
  {
    tags: [CACHE_TAGS.BAPTEMES],
    revalidate: 86400, // 24h
  },
);

const app = new Hono()
  // GET /tarifs/all — consolidated endpoint: all pricing data in one call (public)
  .get("/all", async (c) => {
    try {
      const [baptemeCategories, videoOption, stagePrices, deposit] = await Promise.all([
        prisma.baptemeCategoryPrice.findMany({ orderBy: { category: "asc" } }),
        prisma.videoOptionPrice.findFirst({ orderBy: { createdAt: "desc" } }),
        prisma.stageBasePrice.findMany({ orderBy: { stageType: "asc" } }),
        prisma.baptemeDepositPrice.findFirst({ orderBy: { createdAt: "desc" } }),
      ]);

      return c.json({
        success: true,
        data: {
          baptemeCategories,
          videoOption,
          stagePrices,
          deposit,
        },
      });
    } catch (error) {
      console.error("Erreur récupération tarifs consolidés:", error);
      return c.json({ success: false, message: "Erreur lors de la récupération des tarifs", data: null }, 500);
    }
  })
  // GET all tarifs (accessible to authenticated users)
  .get("/", async (c) => {
    try {
      const tarifs = await prisma.baptemeCategoryPrice.findMany({
        orderBy: {
          category: "asc",
        },
      });
      return c.json({ success: true, message: "", data: tarifs });
    } catch (error) {
      return c.json({
        success: false,
        message: "Erreur lors de la récupération des tarifs",
        data: null,
      });
    }
  })
  // GET tarif by category (accessible to authenticated users)
  .get("/by-category/:category", async (c) => {
    try {
      const category = c.req.param("category") as BaptemeCategory;

      if (!Object.values(BaptemeCategory).includes(category)) {
        return c.json({
          success: false,
          message: "Catégorie invalide",
          data: null,
        });
      }

      const tarif = await prisma.baptemeCategoryPrice.findUnique({
        where: {
          category,
        },
      });

      if (!tarif) {
        return c.json({
          success: false,
          message: "Tarif non trouvé pour cette catégorie",
          data: null,
        });
      }

      return c.json({ success: true, message: "", data: tarif });
    } catch (error) {
      return c.json({
        success: false,
        message: "Erreur lors de la récupération du tarif",
        data: null,
      });
    }
  })
  // UPDATE tarif (admin only)
  .put(
    "/",
    zValidator("json", UpdateTarifSchema),
    requireAdmin,
    async (c) => {
      try {
        const { category, price } = c.req.valid("json");

        const tarif = await prisma.baptemeCategoryPrice.upsert({
          where: {
            category,
          },
          update: {
            price,
          },
          create: {
            category,
            price,
          },
        });

        revalidateTag(CACHE_TAGS.BAPTEMES);

        return c.json({
          success: true,
          message: `Tarif pour ${category} mis à jour avec succès`,
          data: tarif,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const zodErrors = error.errors.map((e) => e.message);
          return c.json({
            success: false,
            message:
              zodErrors.length > 0
                ? zodErrors[0]
                : "Erreur dans la validation des données",
            data: null,
          });
        }
        return c.json({
          success: false,
          message: "Une erreur inattendue s'est produite.",
          data: null,
        });
      }
    },
  )
  // GET video option price (accessible to authenticated users)
  .get("/video-option", async (c) => {
    try {
      const videoPrice = await prisma.videoOptionPrice.findFirst({
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!videoPrice) {
        return c.json({
          success: false,
          message: "Prix de l'option vidéo non trouvé",
          data: null,
        });
      }

      return c.json({ success: true, message: "", data: videoPrice });
    } catch (error) {
      return c.json({
        success: false,
        message: "Erreur lors de la récupération du prix de l'option vidéo",
        data: null,
      });
    }
  })
  // UPDATE video option price (admin only)
  .put(
    "/video-option",
    zValidator("json", UpdateVideoOptionPriceSchema),
    requireAdmin,
    async (c) => {
      try {
        const { price } = c.req.valid("json");

        // Get the existing video price or create a new one
        const existingPrice = await prisma.videoOptionPrice.findFirst();

        const videoPrice = existingPrice
          ? await prisma.videoOptionPrice.update({
              where: { id: existingPrice.id },
              data: { price },
            })
          : await prisma.videoOptionPrice.create({
              data: { price },
            });

        return c.json({
          success: true,
          message: "Prix de l'option vidéo mis à jour avec succès",
          data: videoPrice,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const zodErrors = error.errors.map((e) => e.message);
          return c.json({
            success: false,
            message:
              zodErrors.length > 0
                ? zodErrors[0]
                : "Erreur dans la validation des données",
            data: null,
          });
        }
        return c.json({
          success: false,
          message: "Une erreur inattendue s'est produite.",
          data: null,
        });
      }
    },
  )
  // GET all stage base prices (accessible to authenticated users)
  .get("/stages/base", async (c) => {
    try {
      const stagePrices = await prisma.stageBasePrice.findMany({
        orderBy: {
          stageType: "asc",
        },
      });
      return c.json({ success: true, message: "", data: stagePrices });
    } catch (error) {
      return c.json({
        success: false,
        message: "Erreur lors de la récupération des prix de base des stages",
        data: null,
      });
    }
  })
  // GET stage base price by type (accessible to authenticated users)
  .get("/stages/base/:stageType", async (c) => {
    try {
      const stageType = c.req.param("stageType") as StageType;

      if (!Object.values(StageType).includes(stageType)) {
        return c.json({
          success: false,
          message: "Type de stage invalide",
          data: null,
        });
      }

      const stagePrice = await prisma.stageBasePrice.findUnique({
        where: {
          stageType,
        },
      });

      if (!stagePrice) {
        return c.json({
          success: false,
          message: "Prix de base non trouvé pour ce type de stage",
          data: null,
        });
      }

      return c.json({ success: true, message: "", data: stagePrice });
    } catch (error) {
      return c.json({
        success: false,
        message: "Erreur lors de la récupération du prix de base du stage",
        data: null,
      });
    }
  })
  // UPDATE stage base price (admin only)
  .put(
    "/stages/base",
    zValidator("json", UpdateStageBasePriceSchema),
    requireAdmin,
    async (c) => {
      try {
        const { stageType, price } = c.req.valid("json");

        const stagePrice = await prisma.stageBasePrice.upsert({
          where: {
            stageType,
          },
          update: {
            price,
          },
          create: {
            stageType,
            price,
          },
        });

        return c.json({
          success: true,
          message: `Prix de base pour ${stageType} mis à jour avec succès`,
          data: stagePrice,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const zodErrors = error.errors.map((e) => e.message);
          return c.json({
            success: false,
            message:
              zodErrors.length > 0
                ? zodErrors[0]
                : "Erreur dans la validation des données",
            data: null,
          });
        }
        return c.json({
          success: false,
          message: "Une erreur inattendue s'est produite.",
          data: null,
        });
      }
    },
  )
  // GET bapteme deposit price (accessible to authenticated users)
  .get("/baptemes/deposit", async (c) => {
    try {
      const depositPrice = await prisma.baptemeDepositPrice.findFirst({
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!depositPrice) {
        return c.json({
          success: false,
          message: "Prix de l'acompte des baptêmes non trouvé",
          data: null,
        });
      }

      return c.json({ success: true, message: "", data: depositPrice });
    } catch (error) {
      return c.json({
        success: false,
        message:
          "Erreur lors de la récupération du prix de l'acompte des baptêmes",
        data: null,
      });
    }
  })
  // UPDATE bapteme deposit price (admin only)
  .put(
    "/baptemes/deposit",
    zValidator("json", UpdateBaptemeDepositPriceSchema),
    requireAdmin,
    async (c) => {
      try {
        const { price } = c.req.valid("json");

        // Get the existing deposit price or create a new one
        const existingPrice = await prisma.baptemeDepositPrice.findFirst();

        const depositPrice = existingPrice
          ? await prisma.baptemeDepositPrice.update({
              where: { id: existingPrice.id },
              data: { price },
            })
          : await prisma.baptemeDepositPrice.create({
              data: { price },
            });

        return c.json({
          success: true,
          message: "Prix de l'acompte des baptêmes mis à jour avec succès",
          data: depositPrice,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const zodErrors = error.errors.map((e) => e.message);
          return c.json({
            success: false,
            message:
              zodErrors.length > 0
                ? zodErrors[0]
                : "Erreur dans la validation des données",
            data: null,
          });
        }
        return c.json({
          success: false,
          message: "Une erreur inattendue s'est produite.",
          data: null,
        });
      }
    },
  )
  .get("min", zValidator("query", MinPriceQuerySchema), async (c) => {
    const { type, subType } = c.req.valid("query");

    try {
      let minPrice: number | null = null;

      if (type === "STAGE") {
        // Validation du subType pour Stage
        let stageType: StageType | undefined;
        if (subType) {
          if (Object.values(StageType).includes(subType as StageType)) {
            stageType = subType as StageType;
          } else {
            return c.json(
              {
                success: false,
                message: "Invalid stage subType",
                data: null,
              },
              400,
            );
          }
        }
        minPrice = await getMinStagePrice(stageType);
      } else if (type === "BAPTEME") {
        // Validation du subType pour Bapteme
        let category: BaptemeCategory | undefined;
        if (subType) {
          if (
            Object.values(BaptemeCategory).includes(subType as BaptemeCategory)
          ) {
            category = subType as BaptemeCategory;
          } else {
            return c.json(
              {
                success: false,
                message: "Invalid bapteme subType",
                data: null,
              },
              400,
            );
          }
        }
        minPrice = await getMinBaptemePrice(category);
      }

      return c.json({
        success: true,
        message:
          minPrice !== null ? "Prix minimum trouvé" : "Aucun tarif trouvé",
        data: {
          minPrice,
          currency: "EUR",
        },
      });
    } catch (error) {
      console.error("Error calculating min price:", error);
      return c.json(
        {
          success: false,
          message: "Erreur lors du calcul du prix minimum",
          data: null,
        },
        500,
      );
    }
  });

export default app;
