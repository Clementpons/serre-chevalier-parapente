import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { requireAdmin } from "@/lib/middlewares";
import prisma from "@/lib/prisma";
import { CreateByAdminReservationStageSchema } from "../schemas";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const app = new Hono().post(
  "",
  zValidator("json", CreateByAdminReservationStageSchema),
  requireAdmin,
  async (c) => {
    try {
      const { customerId, stageId, type } = c.req.valid("json");

      const result = await prisma.stageBooking.create({
        data: {
          stagiaireId: customerId,
          stageId: stageId,
          type: type,
        },
      });
      return c.json({
        success: true,
        message: `Nouvelle réservation de stage créée pour le client avec l'ID ${customerId}.`,
        data: result,
      });
    } catch (error) {
      //Erreur provenant de la validation des données
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
      // Erreur provenant de Prisma/Supabase
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Gestion des erreurs spécifiques de Prisma/Supabase
        switch (error.code) {
          case "P2002":
            return c.json({
              success: false,
              message: "Une entrée avec ces valeurs existe déjà.",
              data: null,
            });
          case "P2003":
            return c.json({
              success: false,
              message: "Clé étrangère introuvable.",
              data: null,
            });
          case "P2025":
            return c.json({
              success: false,
              message: "Enregistrement introuvable.",
              data: null,
            });
          default:
            return c.json({
              success: false,
              message: `Erreur Prisma/Supabase: ${error.message}`,
              data: null,
            });
        }
      }
      // Erreur inattendue
      return c.json({
        success: false,
        message: "Une erreur inattendue s'est produite.",
        data: null,
      });
    }
  }
);

export default app;
