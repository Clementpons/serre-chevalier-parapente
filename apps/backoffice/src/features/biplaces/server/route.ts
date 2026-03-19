import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { requireAuth, requireMonitor, requireSessionOrApiKey } from "@/lib/middlewares";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import {
  CreateBaptemeSchema,
  UpdateBaptemeSchema,
  DeleteBaptemeSchema,
} from "../schemas";

const app = new Hono()
  // GET /baptemes — list all baptemes
  .get("/", requireSessionOrApiKey, async (c) => {
    const moniteurId = c.req.query("moniteurId");
    const date = c.req.query("date");
    const where: any = {};
    if (moniteurId) where.moniteurId = moniteurId;
    if (date) where.date = new Date(date);

    try {
      const now = new Date();

      const baptemes = await prisma.bapteme.findMany({
        where,
        select: {
          id: true,
          date: true,
          duration: true,
          places: true,
          categories: true,
          acomptePrice: true,
          _count: {
            select: { bookings: true },
          },
          moniteurs: {
            select: {
              moniteur: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  avatarUrl: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      // Optimisation: Récupérer tous les comptes en une seule requête
      const baptemeIds = baptemes.map((b) => b.id);

      const allTemporaryReservations = await prisma.cartItem.groupBy({
        by: ["baptemeId"],
        where: {
          type: "BAPTEME",
          baptemeId: { in: baptemeIds },
          expiresAt: { gt: now },
          isExpired: false,
        },
        _count: {
          id: true,
        },
      });

      // Créer une map pour un accès rapide
      const tempReservationsMap = new Map(
        allTemporaryReservations
          .filter((item) => item.baptemeId !== null)
          .map((item) => [item.baptemeId!, item._count.id]),
      );

      // Enrichir chaque baptême
      const enrichedBaptemes = baptemes.map((bapteme) => {
        const confirmedBookings = bapteme._count.bookings;
        const temporaryReservations = tempReservationsMap.get(bapteme.id) || 0;

        const availablePlaces =
          bapteme.places - confirmedBookings - temporaryReservations;

        return {
          ...bapteme,
          availablePlaces: Math.max(0, availablePlaces),
          confirmedBookings,
          temporaryReservations,
        };
      });

      return c.json({ success: true, message: "", data: enrichedBaptemes });
    } catch (error) {
      console.error("Erreur API /biplaces/getAll:", error);
      if (error instanceof Error) {
        console.error("Stack trace:", error.stack);
      }
      return c.json({
        success: false,
        message: "Erreur lors de la récupération des créneaux",
        data: null,
      });
    }
  })
  // GET /baptemes/:id — get one bapteme by id
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
      const result = await prisma.bapteme.findUnique({
        where: { id },
        include: {
          bookings: { include: { stagiaire: true } },
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
        message: "Erreur lors de la récupération du créneau",
        data: null,
      });
    }
  })
  // POST /baptemes — create a bapteme
  .post(
    "/",
    zValidator("json", CreateBaptemeSchema),
    requireMonitor,
    async (c) => {
      try {
        const {
          date,
          duration,
          places,
          moniteurIds,
          categories,
          acomptePrice,
        } = c.req.valid("json");
        const role = c.get("role");
        const userId = c.get("userId");

        // Role-based checks
        if (role === "MONITEUR") {
          // Monitor can only create for themselves
          if (moniteurIds.length !== 1 || moniteurIds[0] !== userId) {
            return c.json(
              {
                success: false,
                message:
                  "Un moniteur ne peut créer de créneau que pour lui-même.",
                data: null,
              },
              403,
            );
          }
          // Monitor cannot change default deposit price (need to get it first or rely on client-side + extra check if possible)
          // For now, let's assume if it doesn't match a default value it's rejected, or better, we fetch it here.
          const defaultDeposit = await prisma.baptemeDepositPrice.findFirst();
          if (defaultDeposit && acomptePrice !== defaultDeposit.price) {
            return c.json(
              {
                success: false,
                message:
                  "Un moniteur ne peut pas modifier le montant de l'acompte.",
                data: null,
              },
              403,
            );
          }
        }

        const dateObj = new Date(date);

        const result = await prisma.bapteme.create({
          data: {
            date: dateObj,
            duration,
            places,
            categories,
            acomptePrice,
            moniteurs: {
              create: moniteurIds.map((moniteurId) => ({
                moniteurId,
              })),
            },
          },
        });

        revalidateTag("min-prices-baptemes");

        return c.json({
          success: true,
          message: `Créneau du ${result.date.toISOString()} créé.`,
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
                message: "Un créneau avec cette date existe déjà.",
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
  // PUT /baptemes/:id — update a bapteme
  .put(
    "/:id",
    zValidator("json", UpdateBaptemeSchema),
    requireMonitor,
    async (c) => {
      try {
        const id = c.req.param("id");
        const {
          date,
          duration,
          places,
          moniteurIds,
          categories,
          acomptePrice,
        } = c.req.valid("json");
        const role = c.get("role");
        const userId = c.get("userId");

        const newDateObj = new Date(date);

        const previousData = await prisma.bapteme.findUnique({
          where: { id },
          include: { bookings: true, moniteurs: true },
        });

        if (!previousData) {
          return c.json({
            success: false,
            message: "Aucun créneau trouvé pour cette date.",
            data: null,
          });
        }

        // Role-based checks
        if (role === "MONITEUR") {
          // Monitor must be one of the assigned monitors to edit
          const isAssigned = previousData.moniteurs.some(
            (m) => m.moniteurId === userId,
          );
          if (!isAssigned) {
            return c.json(
              {
                success: false,
                message:
                  "Vous ne pouvez modifier que les créneaux où vous êtes assigné.",
                data: null,
              },
              403,
            );
          }

          // Monitor cannot change default deposit price
          const defaultDeposit = await prisma.baptemeDepositPrice.findFirst();
          if (defaultDeposit && acomptePrice !== defaultDeposit.price) {
            return c.json(
              {
                success: false,
                message:
                  "Un moniteur ne peut pas modifier le montant de l'acompte.",
                data: null,
              },
              403,
            );
          }

          // Monitor can change duration/places but must remain assigned
          if (!moniteurIds.includes(userId)) {
            return c.json(
              {
                success: false,
                message: "Vous devez rester assigné à ce créneau.",
                data: null,
              },
              403,
            );
          }
        }

        if (previousData.bookings.length > places) {
          return c.json({
            success: false,
            message:
              "Impossible de réduire le nombre de places, elles sont toutes occupées.",
            data: null,
          });
        }

        const result = await prisma.bapteme.update({
          where: { id },
          data: {
            date: newDateObj,
            duration,
            places,
            categories,
            acomptePrice,
            moniteurs: {
              deleteMany: {},
              create: moniteurIds.map((moniteurId) => ({
                moniteurId,
              })),
            },
          },
        });

        revalidateTag("min-prices-baptemes");

        return c.json({
          success: true,
          message: `Créneau du ${result.date.toISOString()} mis à jour.`,
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
  // DELETE /baptemes/:id — delete a bapteme
  .delete(
    "/:id",
    requireMonitor,
    async (c) => {
      try {
        const id = c.req.param("id");
        const role = c.get("role");
        const userId = c.get("userId");

        const baptemeToDelete = await prisma.bapteme.findUnique({
          where: { id },
          include: { bookings: true, moniteurs: true },
        });
        if (!baptemeToDelete) {
          return c.json({
            success: false,
            message: "Aucun créneau trouvé pour cette date.",
            data: null,
          });
        }

        // Role-based checks
        if (role === "MONITEUR") {
          // Monitor must be assigned to delete
          const isAssigned = baptemeToDelete.moniteurs.some(
            (m) => m.moniteurId === userId,
          );
          if (!isAssigned) {
            return c.json(
              {
                success: false,
                message:
                  "Vous ne pouvez supprimer que les créneaux où vous êtes assigné.",
                data: null,
              },
              403,
            );
          }
        }

        if (baptemeToDelete.bookings.length > 0) {
          return c.json({
            success: false,
            message:
              "Ce créneau ne peut pas être supprimé car il contient des réservations.",
            data: null,
          });
        }

        const result = await prisma.bapteme.delete({
          where: { id },
        });

        revalidateTag("min-prices-baptemes");

        return c.json({
          success: true,
          message: `Créneau du ${result.date.toISOString()} supprimé.`,
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
