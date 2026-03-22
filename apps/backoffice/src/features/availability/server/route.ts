import { Hono } from "hono";
import { requireApiKey } from "@/lib/middlewares";
import { AvailabilityService } from "@/lib/availability";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const CheckAvailabilitySchema = z.object({
  type: z.enum(['stage', 'bapteme']),
  itemId: z.string(),
  quantity: z.number().default(1),
});

const CheckAvailabilityBatchSchema = z.object({
  items: z
    .array(z.object({ type: z.enum(['stage', 'bapteme']), itemId: z.string() }))
    .min(1)
    .max(50),
});

const ReserveTemporarySchema = z.object({
  sessionId: z.string(),
  type: z.enum(['stage', 'bapteme']),
  itemId: z.string(),
  quantity: z.number().default(1),
});

const app = new Hono()
  // Check availability (POST — sends itemId in body, not suitable as query param)
  .post(
    "check",
    requireApiKey,
    zValidator("json", CheckAvailabilitySchema),
    async (c) => {
      try {
        const { type, itemId, quantity } = c.req.valid("json");

        const availability = await AvailabilityService.checkAvailability(
          type,
          itemId,
          quantity
        );

        return c.json({
          success: true,
          data: availability,
        });

      } catch (error) {
        console.error('Erreur vérification disponibilités:', error);
        return c.json({
          success: false,
          message: 'Erreur lors de la vérification des disponibilités',
          data: null,
        });
      }
    }
  )

  // Check availability for multiple items in one request
  .post(
    "check-batch",
    requireApiKey,
    zValidator("json", CheckAvailabilityBatchSchema),
    async (c) => {
      try {
        const { items } = c.req.valid("json");
        const data = await AvailabilityService.checkAvailabilityBatch(items);
        return c.json({ success: true, data });
      } catch (error) {
        console.error('Erreur vérification disponibilités batch:', error);
        return c.json({
          success: false,
          message: 'Erreur lors de la vérification des disponibilités',
          data: null,
        });
      }
    }
  )

  // Get availability for specific stage
  .get("stages/:id", requireApiKey, async (c) => {
    try {
      const stageId = c.req.param("id");

      const availability = await AvailabilityService.checkAvailability('stage', stageId);

      return c.json({
        success: true,
        data: {
          stageId,
          ...availability,
        },
      });

    } catch (error) {
      console.error('Erreur disponibilités stage:', error);
      return c.json({
        success: false,
        message: 'Erreur lors de la vérification des disponibilités du stage',
        data: null,
      });
    }
  })

  // Get availability for specific bapteme
  .get("baptemes/:id", requireApiKey, async (c) => {
    try {
      const baptemeId = c.req.param("id");

      const availability = await AvailabilityService.checkAvailability('bapteme', baptemeId);

      return c.json({
        success: true,
        data: {
          baptemeId,
          ...availability,
        },
      });

    } catch (error) {
      console.error('Erreur disponibilités baptême:', error);
      return c.json({
        success: false,
        message: 'Erreur lors de la vérification des disponibilités du baptême',
        data: null,
      });
    }
  })

  // Create temporary reservation
  .post(
    "reserve",
    requireApiKey,
    zValidator("json", ReserveTemporarySchema),
    async (c) => {
      try {
        const { sessionId, type, itemId, quantity } = c.req.valid("json");

        const reservation = await AvailabilityService.createTemporaryReservation(
          sessionId,
          type,
          itemId,
          quantity
        );

        return c.json({
          success: true,
          data: reservation,
        });

      } catch (error) {
        console.error('Erreur réservation temporaire:', error);
        return c.json({
          success: false,
          message: error instanceof Error ? error.message : 'Erreur lors de la réservation',
          data: null,
        });
      }
    }
  )

  // Release temporary reservation
  .delete(
    "release",
    requireApiKey,
    async (c) => {
      try {
        const sessionId = c.req.header("x-session-id");
        const type = c.req.query("type") as 'stage' | 'bapteme' | undefined;
        const itemId = c.req.query("itemId");

        if (!sessionId) {
          return c.json({
            success: false,
            message: "Session ID requis",
            data: null,
          });
        }

        await AvailabilityService.releaseTemporaryReservation(sessionId, type, itemId);

        return c.json({
          success: true,
          message: "Réservation temporaire libérée",
          data: null,
        });

      } catch (error) {
        console.error('Erreur libération réservation:', error);
        return c.json({
          success: false,
          message: 'Erreur lors de la libération de la réservation',
          data: null,
        });
      }
    }
  )

  // GET available months for a given year — query params: type, year, category?, stageType?
  .get("months", requireApiKey, async (c) => {
    try {
      const type = c.req.query("type") as 'stage' | 'bapteme' | undefined;
      const yearStr = c.req.query("year");
      const category = c.req.query("category");
      const stageType = c.req.query("stageType") as 'INITIATION' | 'PROGRESSION' | 'AUTONOMIE' | undefined;

      if (!type || (type !== 'stage' && type !== 'bapteme')) {
        return c.json({ success: false, message: "Paramètre 'type' invalide (stage|bapteme)", data: null }, 400);
      }

      if (!yearStr) {
        return c.json({ success: false, message: "Paramètre 'year' manquant", data: null }, 400);
      }

      const year = parseInt(yearStr, 10);
      if (isNaN(year)) {
        return c.json({ success: false, message: "Paramètre 'year' invalide", data: null }, 400);
      }

      const availableMonths = await AvailabilityService.getAvailableMonths(
        type,
        year,
        category,
        stageType
      );

      return c.json({
        success: true,
        data: { availableMonths, year, type, category, stageType },
      });

    } catch (error) {
      console.error('Erreur récupération mois disponibles:', error);
      return c.json({
        success: false,
        message: 'Erreur lors de la récupération des mois disponibles',
        data: null,
      });
    }
  })

  // GET available periods with counts — query params: type, category?, stageType?
  .get("periods", requireApiKey, async (c) => {
    try {
      const type = c.req.query("type") as 'stage' | 'bapteme' | undefined;
      const category = c.req.query("category");
      const stageType = c.req.query("stageType") as 'INITIATION' | 'PROGRESSION' | 'AUTONOMIE' | undefined;

      if (!type || (type !== 'stage' && type !== 'bapteme')) {
        return c.json({ success: false, message: "Paramètre 'type' invalide (stage|bapteme)", data: null }, 400);
      }

      const periods = await AvailabilityService.getAvailablePeriodsWithCounts(
        type,
        category,
        stageType
      );

      return c.json({
        success: true,
        data: periods,
      });

    } catch (error) {
      console.error('Erreur récupération périodes disponibles:', error);
      return c.json({
        success: false,
        message: 'Erreur lors de la récupération des périodes disponibles',
        data: null,
      });
    }
  });

export default app;
