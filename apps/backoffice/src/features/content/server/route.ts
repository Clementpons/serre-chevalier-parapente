import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { requireAdmin } from "@/lib/middlewares";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { TopBarSchema } from "../schemas";

const app = new Hono()
  // GET topbar content (accessible to everyone)
  .get("/topbar", async (c) => {
    try {
      const topbar = await prisma.topBar.findFirst();

      if (!topbar) {
        return c.json({
          success: true,
          message: "Aucun contenu TopBar trouvé",
          data: null,
        });
      }

      return c.json({ success: true, message: "", data: topbar });
    } catch (error) {
      console.error("Error fetching topbar:", error);
      return c.json(
        {
          success: false,
          message: "Erreur lors de la récupération du contenu de la TopBar",
          data: null,
        },
        500,
      );
    }
  })
  // UPDATE topbar content (admin only)
  .put(
    "/topbar",
    zValidator("json", TopBarSchema),
    requireAdmin,
    async (c) => {
      try {
        const data = c.req.valid("json");

        // We only want ONE topbar configuration, so we try to find the first one
        const existingTopBar = await prisma.topBar.findFirst();

        let topbar;
        if (existingTopBar) {
          topbar = await prisma.topBar.update({
            where: { id: existingTopBar.id },
            data,
          });
        } else {
          topbar = await prisma.topBar.create({
            data,
          });
        }

        return c.json({
          success: true,
          message: `Configuration de la TopBar mise à jour avec succès`,
          data: topbar,
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
        return c.json(
          {
            success: false,
            message: "Une erreur inattendue s'est produite.",
            data: null,
          },
          500,
        );
      }
    },
  );

export default app;
