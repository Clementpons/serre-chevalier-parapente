import { Hono } from "hono";
import { requireAdmin } from "@/lib/middlewares";
import prisma from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { CreateAudienceSchema, UpdateAudienceSchema } from "../schemas";

import { resolveAudience } from "@/lib/audience-resolver";

const app = new Hono()
  // Get all audiences
  .get("/", requireAdmin, async (c) => {
    try {
      const result = await prisma.audience.findMany({
        include: {
          rules: true,
          contacts: true,
          _count: { select: { rules: true, contacts: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return c.json({ success: true, message: "", data: result });
    } catch {
      return c.json({ success: false, message: "Erreur serveur", data: null });
    }
  })

  // Search contacts (clients or stagiaires)
  .get("/contacts/search", requireAdmin, async (c) => {
    try {
      const q = c.req.query("q");
      if (!q || q.length < 2) return c.json({ success: true, data: [] });

      const clients = await prisma.client.findMany({
        where: {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      });

      const stagiaires = await prisma.stagiaire.findMany({
        where: {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      });

      // Format and deduplicate
      const resultsMap = new Map();
      [...clients, ...stagiaires].forEach((p) => {
        if (!p.phone) return;
        const name = `${p.firstName} ${p.lastName}`.trim();
        resultsMap.set(p.phone, { name, phone: p.phone, email: p.email });
      });

      return c.json({
        success: true,
        data: Array.from(resultsMap.values()).slice(0, 15),
      });
    } catch {
      return c.json({ success: false, data: [] });
    }
  })

  // Get audience by ID
  .get("/:id", requireAdmin, async (c) => {
    try {
      const id = c.req.param("id");
      const result = await prisma.audience.findUnique({
        where: { id },
        include: { rules: true, contacts: true },
      });
      if (!result)
        return c.json({
          success: false,
          message: "Audience introuvable",
          data: null,
        });
      return c.json({ success: true, message: "", data: result });
    } catch {
      return c.json({ success: false, message: "Erreur serveur", data: null });
    }
  })

  // Resolve audience → returns list of contacts
  .get("/:id/resolve", requireAdmin, async (c) => {
    try {
      const id = c.req.param("id");
      const audience = await prisma.audience.findUnique({
        where: { id },
        include: { rules: true, contacts: true },
      });
      if (!audience)
        return c.json({
          success: false,
          message: "Audience introuvable",
          data: null,
        });

      // On passera les contacts trouvés et on les combinera dans le resolver (ou ici directement)
      const dynamicContacts = await resolveAudience(audience.rules as any);

      // Combiner et dédupliquer par numéro de téléphone
      const allContactsMap = new Map();

      // Ajouter les dynamiques
      dynamicContacts.forEach((c) => allContactsMap.set(c.phone, c));

      // Ajouter les manuels (écrasera si le prénom est plus précis par ex)
      audience.contacts.forEach((c) =>
        allContactsMap.set(c.phone, { phone: c.phone, name: c.name }),
      );

      const finalContacts = Array.from(allContactsMap.values());

      return c.json({
        success: true,
        message: "",
        data: { contacts: finalContacts, count: finalContacts.length },
      });
    } catch (error) {
      console.error("Audience resolve error:", error);
      return c.json({
        success: false,
        message: "Erreur lors de la résolution",
        data: null,
      });
    }
  })

  // Create audience
  .post(
    "/",
    requireAdmin,
    zValidator("json", CreateAudienceSchema),
    async (c) => {
      const { name, description, rules } = c.req.valid("json");
      try {
        const result = await prisma.audience.create({
          data: {
            name,
            description,
            rules: c.req.valid("json").rules
              ? {
                  create: c.req.valid("json").rules.map((r) => ({
                    ruleType: r.ruleType,
                    stageType: r.stageType ?? null,
                    baptemeCategory: r.baptemeCategory ?? null,
                    minOrderAmount: r.minOrderAmount ?? null,
                    dateFrom: r.dateFrom ?? null,
                    dateTo: r.dateTo ?? null,
                  })),
                }
              : undefined,
            contacts: c.req.valid("json").contacts
              ? {
                  create: c.req.valid("json").contacts.map((cContact) => ({
                    phone: cContact.phone,
                    name: cContact.name ?? null,
                  })),
                }
              : undefined,
          },
          include: { rules: true, contacts: true },
        });
        return c.json({
          success: true,
          message: "Audience créée",
          data: result,
        });
      } catch {
        return c.json({
          success: false,
          message: "Erreur lors de la création",
          data: null,
        });
      }
    },
  )

  // Update audience (replace all rules)
  .put(
    "/:id",
    requireAdmin,
    zValidator("json", UpdateAudienceSchema),
    async (c) => {
      const id = c.req.param("id");
      const { name, description, rules } = c.req.valid("json");
      try {
        const result = await prisma.audience.update({
          where: { id },
          data: {
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(c.req.valid("json").rules && {
              rules: {
                deleteMany: {},
                create: c.req.valid("json").rules!.map((r) => ({
                  ruleType: r.ruleType,
                  stageType: r.stageType ?? null,
                  baptemeCategory: r.baptemeCategory ?? null,
                  minOrderAmount: r.minOrderAmount ?? null,
                  dateFrom: r.dateFrom ?? null,
                  dateTo: r.dateTo ?? null,
                })),
              },
            }),
            ...(c.req.valid("json").contacts && {
              contacts: {
                deleteMany: {},
                create: c.req.valid("json").contacts!.map((cContact) => ({
                  phone: cContact.phone,
                  name: cContact.name ?? null,
                })),
              },
            }),
          },
          include: { rules: true, contacts: true },
        });
        return c.json({
          success: true,
          message: "Audience mise à jour",
          data: result,
        });
      } catch {
        return c.json({
          success: false,
          message: "Erreur lors de la mise à jour",
          data: null,
        });
      }
    },
  )

  // Delete audience
  .delete("/:id", requireAdmin, async (c) => {
    const id = c.req.param("id");
    try {
      await prisma.audience.delete({ where: { id } });
      return c.json({
        success: true,
        message: "Audience supprimée",
        data: null,
      });
    } catch {
      return c.json({
        success: false,
        message: "Erreur lors de la suppression",
        data: null,
      });
    }
  });

export default app;
