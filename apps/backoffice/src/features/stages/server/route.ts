import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { requireAdmin, requireApiKey, requireAuth } from "@/lib/middlewares";
import prisma from "@/lib/prisma";
import {
  CreateStageSchema,
  DeleteStageSchema,
  UpdateStageSchema,
  ApplyStagePromotionSchema,
} from "../schemas";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { Prisma, StageType } from "@prisma/client";

const app = new Hono()
  // GET /stages — list all stages
  .get("/", requireApiKey, async (c) => {
    const moniteurId = c.req.query("moniteurId");
    const date = c.req.query("date");
    const from = c.req.query("from");
    const to = c.req.query("to");
    const types = c.req.query("types");

    const where: Prisma.StageWhereInput = {};
    if (moniteurId) where.moniteurs = { some: { moniteurId } };

    // Single-date filter (legacy) vs date-range filter
    if (date) {
      where.startDate = new Date(date);
    } else if (from || to) {
      // Buffer of 31 days before `from` so long stages (e.g. AUTONOMIE 14j)
      // that start before the month but overlap it are still included.
      const gte = from
        ? new Date(new Date(from).getTime() - 31 * 24 * 60 * 60 * 1000)
        : undefined;
      const lte = to ? new Date(to) : undefined;
      where.startDate = { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) };
    }

    // Type filter (comma-separated: "INITIATION,PROGRESSION,DOUBLE")
    if (types) {
      const typeList = types.split(",").map((t) => t.trim()).filter(Boolean);
      if (typeList.length > 0) where.type = { in: typeList as StageType[] };
    }

    try {
      const now = new Date();

      // 1. Récupérer les stages avec le comptage des bookings (plus léger que de tout charger)
      const stages = await prisma.stage.findMany({
        where,
        select: {
          id: true,
          startDate: true,
          type: true,
          price: true,
          acomptePrice: true, // Requis pour le backoffice (détails)
          duration: true,
          places: true,
          promotionOriginalPrice: true,
          promotionEndDate: true,
          _count: {
            select: { bookings: true }, // Requis pour la logique de places restantes
          },
          moniteurs: {
            select: {
              moniteur: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      // 2. Récupérer tous les CartItems pertinents en une seule requête groupée
      // On ne compte que ceux qui ne sont pas expirés
      const cartItemsCounts = await prisma.cartItem.groupBy({
        by: ["stageId"],
        where: {
          type: "STAGE",
          stageId: { in: stages.map((s) => s.id) },
          expiresAt: { gt: now },
          isExpired: false,
        },
        _count: {
          _all: true,
        },
      });

      // Créer une map pour accès rapide : stageId -> count
      const temporaryReservationsMap = new Map<string, number>();
      cartItemsCounts.forEach((item) => {
        if (item.stageId) {
          temporaryReservationsMap.set(item.stageId, item._count._all);
        }
      });

      // 3. Assembler les données en mémoire
      const enrichedStages = stages.map((stage) => {
        const confirmedBookings = stage._count.bookings;
        const temporaryReservations =
          temporaryReservationsMap.get(stage.id) || 0;

        const availablePlaces =
          stage.places - confirmedBookings - temporaryReservations;

        // On nettoie l'objet pour le retour (retrait de _count si non désiré, ou garde tel quel)
        // Ici on garde la structure attendue par le front
        const { _count, ...stageData } = stage;

        return {
          ...stageData,
          availablePlaces: Math.max(0, availablePlaces),
          confirmedBookings,
          temporaryReservations,
        };
      });

      return c.json({ success: true, message: "", data: enrichedStages });
    } catch (error) {
      console.error("Error in getAll stages:", error);
      return c.json({
        success: false,
        message: "Erreur lors de la récupération des stages",
        data: null,
      });
    }
  })
  // GET /stages/:id — get one stage by id
  .get("/:id", requireAuth, async (c) => {
    try {
      const id = c.req.param("id");
      if (!id) {
        return c.json({
          success: false,
          message: "ID is required",
          data: null,
        });
      }
      const result = await prisma.stage.findUnique({
        where: { id },
        include: {
          bookings: {
            include: {
              stagiaire: true,
            },
          },
          moniteurs: {
            include: {
              moniteur: true,
            },
          },
        },
      });
      return c.json({ success: true, message: "", data: result });
    } catch (error) {
      return c.json({
        success: false,
        message: "Error fetching stage",
        data: null,
      });
    }
  })
  // POST /stages — create a stage
  .post(
    "/",
    zValidator("json", CreateStageSchema),
    requireAdmin,
    async (c) => {
      try {
        const {
          startDate,
          duration,
          places,
          moniteurIds,
          price,
          acomptePrice,
          type,
        } = c.req.valid("json");
        const startDateObj = new Date(startDate);

        const result = await prisma.stage.create({
          data: {
            startDate: startDateObj,
            duration,
            places,
            price,
            acomptePrice,
            type,
            moniteurs: {
              create: moniteurIds.map((moniteurId) => ({
                moniteurId,
              })),
            },
          },
        });

        revalidateTag("min-prices-stages");

        return c.json({
          success: true,
          message: `Stage ${type} du ${result.startDate.toLocaleDateString()} créé.`,
          data: result,
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
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          switch (error.code) {
            case "P2002":
              return c.json({
                success: false,
                message: "Un stage avec ces valeurs existe déjà.",
                data: null,
              });
            case "P2003":
              return c.json({
                success: false,
                message: "Moniteur introuvable.",
                data: null,
              });
            default:
              return c.json({
                success: false,
                message: `Erreur Prisma: ${error.message}`,
                data: null,
              });
          }
        }
        return c.json({
          success: false,
          message: "Une erreur inattendue s'est produite.",
          data: null,
        });
      }
    },
  )
  // PUT /stages/:id — update a stage
  .put(
    "/:id",
    zValidator("json", UpdateStageSchema),
    requireAdmin,
    async (c) => {
      try {
        const id = c.req.param("id");
        const {
          startDate,
          duration,
          places,
          moniteurIds,
          price,
          acomptePrice,
          type,
        } = c.req.valid("json");
        const startDateObj = new Date(startDate);

        const previousData = await prisma.stage.findUnique({
          where: { id },
          include: { bookings: true },
        });

        if (!previousData) {
          return c.json({
            success: false,
            message: "Aucun stage trouvé avec cet ID.",
            data: null,
          });
        }
        if (previousData.bookings.length > places) {
          return c.json({
            success: false,
            message:
              "Impossible de réduire le nombre de places, elles sont toutes occupées.",
            data: null,
          });
        }

        const result = await prisma.stage.update({
          where: { id },
          data: {
            startDate: startDateObj,
            duration,
            places,
            price,
            acomptePrice,
            type,
            moniteurs: {
              deleteMany: {},
              create: moniteurIds.map((moniteurId) => ({
                moniteurId,
              })),
            },
          },
        });

        revalidateTag("min-prices-stages");

        return c.json({
          success: true,
          message: `Stage ${result.type} du ${result.startDate.toLocaleDateString()} mis à jour.`,
          data: result,
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
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          switch (error.code) {
          }
        }
        return c.json({
          success: false,
          message: "Une erreur inattendue s'est produite.",
          data: null,
        });
      }
    },
  )
  // PATCH /stages/:id/promote — apply a promotion to a stage
  .patch(
    "/:id/promote",
    requireAdmin,
    zValidator("json", ApplyStagePromotionSchema),
    async (c) => {
      try {
        const id = c.req.param("id");
        const { newPrice, endDate, reason } = c.req.valid("json");
        const userId = c.get("userId") as string | undefined;

        const stage = await prisma.stage.findUnique({ where: { id } });
        if (!stage) {
          return c.json({ success: false, message: "Stage introuvable", data: null });
        }

        const originalPrice = stage.promotionOriginalPrice ?? stage.price;
        const discountPercent = Math.round(((originalPrice - newPrice) / originalPrice) * 10000) / 100;

        const [result] = await Promise.all([
          prisma.stage.update({
            where: { id },
            data: {
              price: newPrice,
              promotionOriginalPrice: originalPrice,
              promotionEndDate: endDate ? new Date(endDate) : null,
              promotionReason: reason ?? null,
            },
          }),
          prisma.stagePromotionHistory.create({
            data: {
              stageId: id,
              originalPrice,
              promotedPrice: newPrice,
              discountPercent,
              reason: reason ?? null,
              endDate: endDate ? new Date(endDate) : null,
              appliedBy: userId ?? null,
            },
          }),
        ]);

        revalidateTag("min-prices-stages");

        return c.json({
          success: true,
          message: `Promotion de -${discountPercent}% appliquée au stage (${newPrice}€ au lieu de ${originalPrice}€)`,
          data: result,
        });
      } catch (error) {
        console.error("Erreur application promotion:", error);
        return c.json({ success: false, message: "Erreur lors de l'application de la promotion", data: null });
      }
    },
  )
  // DELETE /stages/:id/promote — cancel promotion on a stage
  .delete(
    "/:id/promote",
    requireAdmin,
    async (c) => {
      try {
        const id = c.req.param("id");

        const stage = await prisma.stage.findUnique({ where: { id } });
        if (!stage) {
          return c.json({ success: false, message: "Stage introuvable", data: null });
        }
        if (!stage.promotionOriginalPrice) {
          return c.json({ success: false, message: "Ce stage n'est pas en promotion", data: null });
        }

        const result = await prisma.stage.update({
          where: { id },
          data: {
            price: stage.promotionOriginalPrice,
            promotionOriginalPrice: null,
            promotionEndDate: null,
            promotionReason: null,
          },
        });

        revalidateTag("min-prices-stages");

        return c.json({
          success: true,
          message: `Promotion annulée, prix restauré à ${stage.promotionOriginalPrice}€`,
          data: result,
        });
      } catch (error) {
        console.error("Erreur annulation promotion:", error);
        return c.json({ success: false, message: "Erreur lors de l'annulation de la promotion", data: null });
      }
    },
  )
  // DELETE /stages/:id — delete a stage
  .delete(
    "/:id",
    requireAdmin,
    async (c) => {
      try {
        const id = c.req.param("id");

        const stageToDelete = await prisma.stage.findUnique({
          where: { id },
          include: { bookings: true },
        });
        if (!stageToDelete) {
          return c.json({
            success: false,
            message: "Aucun stage trouvé avec cet ID.",
            data: null,
          });
        }
        if (stageToDelete.bookings.length > 0) {
          return c.json({
            success: false,
            message:
              "Ce stage ne peut pas être supprimé car il contient des réservations.",
            data: null,
          });
        }

        const result = await prisma.stage.delete({
          where: { id },
        });

        revalidateTag("min-prices-stages");

        return c.json({
          success: true,
          message: `Stage ${result.type} du ${result.startDate.toLocaleDateString()} supprimé.`,
          data: result,
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
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          switch (error.code) {
          }
        }
        return c.json({
          success: false,
          message: "Une erreur inattendue s'est produite.",
          data: null,
        });
      }
    },
  );

export default app;
