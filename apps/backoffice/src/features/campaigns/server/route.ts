import { Hono } from "hono";
import { requireAdmin } from "@/lib/middlewares";
import prisma from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { CreateCampaignSchema, UpdateCampaignSchema } from "../schemas";
import { sendSms } from "@/lib/twilio";
import { normalizeMobileNumber } from "@/lib/phone-normalizer";
import { nanoid } from "nanoid";

import { resolveAudience } from "@/lib/audience-resolver";

const app = new Hono()
  // Liste toutes les campagnes
  .get("/", requireAdmin, async (c) => {
    try {
      const data = await prisma.smsCampaign.findMany({
        include: {
          audiences: true,
          promoCodes: true,
          _count: { select: { logs: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return c.json({ success: true, message: "", data });
    } catch {
      return c.json({ success: false, message: "Erreur serveur", data: null });
    }
  })

  // Détails d'une campagne
  .get("/:id", requireAdmin, async (c) => {
    try {
      const id = c.req.param("id");
      const data = await prisma.smsCampaign.findUnique({
        where: { id },
        include: {
          audiences: true,
          promoCodes: true,
          logs: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!data)
        return c.json({ success: false, message: "Introuvable", data: null });
      return c.json({ success: true, message: "", data: data });
    } catch {
      return c.json({ success: false, message: "Erreur serveur", data: null });
    }
  })

  // Résoudre les contacts d'une campagne (aggrégation de toutes ses audiences)
  .get("/:id/resolve", requireAdmin, async (c) => {
    try {
      const id = c.req.param("id");
      const campaign = await prisma.smsCampaign.findUnique({
        where: { id },
        include: {
          audiences: {
            include: { rules: true, contacts: true },
          },
        },
      });

      if (!campaign) {
        return c.json({
          success: false,
          message: "Campagne introuvable",
          data: null,
        });
      }

      const allContactsMap = new Map();

      for (const audience of campaign.audiences) {
        // 1. Résoudre les règles dynamiques
        const dynamicContacts = await resolveAudience(audience.rules as any);
        dynamicContacts.forEach((contact) =>
          allContactsMap.set(contact.phone, contact),
        );

        // 2. Ajouter les contacts manuels
        audience.contacts.forEach((contact) =>
          allContactsMap.set(contact.phone, {
            phone: contact.phone,
            name: contact.name,
          }),
        );
      }

      const finalContacts = Array.from(allContactsMap.values());

      return c.json({
        success: true,
        message: "",
        data: {
          contacts: finalContacts,
          count: finalContacts.length,
        },
      });
    } catch (error) {
      console.error("Campaign resolve error:", error);
      return c.json({
        success: false,
        message: "Erreur lors de la résolution des contacts",
        data: null,
      });
    }
  })

  // Création / Planification
  .post(
    "/",
    requireAdmin,
    zValidator("json", CreateCampaignSchema),
    async (c) => {
      const body = c.req.valid("json");
      try {
        // 2. Création de la campagne (sans générer de code promo pour le moment, c'est fait à l'envoi)
        const campaign = await prisma.smsCampaign.create({
          data: {
            name: body.name,
            audiences: {
              connect: body.audienceIds.map((id) => ({ id })),
            },
            content: body.content,
            scheduledAt: body.scheduledAt,
            status: body.scheduledAt ? "SCHEDULED" : "DRAFT",
            // Paramètres de promo à conserver pour l'envoi "SENDING"
            generatePromoCode: body.generatePromoCode ?? false,
            promoDiscountType: body.promoDiscountType,
            promoDiscountValue: body.promoDiscountValue,
            promoMaxDiscountAmount: body.promoMaxDiscountAmount,
            promoMinCartAmount: body.promoMinCartAmount,
            promoMaxUses: body.promoMaxUses,
            promoExpiryDate: body.promoExpiryDate,
          },
        });

        return c.json({
          success: true,
          message: "Campagne enregistrée",
          data: campaign,
        });
      } catch (error: any) {
        console.error(error);
        return c.json({
          success: false,
          message: "Erreur lors de la création",
          data: null,
        });
      }
    },
  )

  // Mise à jour (Seulement si DRAFT ou SCHEDULED)
  .put(
    "/:id",
    requireAdmin,
    zValidator("json", UpdateCampaignSchema),
    async (c) => {
      const id = c.req.param("id");
      const body = c.req.valid("json");

      try {
        const existing = await prisma.smsCampaign.findUnique({
          where: { id },
        });

        if (!existing) {
          return c.json({
            success: false,
            message: "Campagne introuvable",
            data: null,
          });
        }

        if (existing.status !== "DRAFT" && existing.status !== "SCHEDULED") {
          return c.json({
            success: false,
            message:
              "Seules les campagnes en brouillon ou planifiées peuvent être modifiées",
            data: null,
          });
        }

        const campaign = await prisma.smsCampaign.update({
          where: { id },
          data: {
            name: body.name,
            content: body.content,
            scheduledAt: body.scheduledAt,
            status: body.scheduledAt ? "SCHEDULED" : "DRAFT",
            // Audiences
            ...(body.audienceIds && {
              audiences: {
                set: body.audienceIds.map((id) => ({ id })),
              },
            }),
            // Promo fields
            generatePromoCode: body.generatePromoCode,
            promoDiscountType: body.promoDiscountType,
            promoDiscountValue: body.promoDiscountValue,
            promoMaxDiscountAmount: body.promoMaxDiscountAmount,
            promoMinCartAmount: body.promoMinCartAmount,
            promoMaxUses: body.promoMaxUses,
            promoExpiryDate: body.promoExpiryDate,
          },
        });

        return c.json({
          success: true,
          message: "Campagne mise à jour",
          data: campaign,
        });
      } catch (error: any) {
        console.error(error);
        return c.json({
          success: false,
          message: "Erreur lors de la mise à jour",
          data: null,
        });
      }
    },
  )

  // Envoi d'une campagne "DRAFT"
  .post("/:id/send", requireAdmin, async (c) => {
    const id = c.req.param("id");

    try {
      const campaign = await prisma.smsCampaign.findUnique({
        where: { id },
        include: {
          audiences: {
            include: { rules: true, contacts: true },
          },
        },
      });

      if (!campaign) {
        return c.json({
          success: false,
          message: "Campagne introuvable",
          data: null,
        });
      }

      if (campaign.status === "COMPLETED" || campaign.status === "SENDING") {
        return c.json({
          success: false,
          message: "Cette campagne a déjà été envoyée ou est en cours d'envoi",
          data: null,
        });
      }

      // 1. Résoudre tous les contacts de toutes les audiences
      const allContactsMap = new Map();
      for (const audience of campaign.audiences) {
        const dynamicContacts = await resolveAudience(audience.rules as any);
        dynamicContacts.forEach((contact) =>
          allContactsMap.set(contact.phone, {
            phone: contact.phone,
            name: contact.name,
          }),
        );
        audience.contacts.forEach((contact) =>
          allContactsMap.set(contact.phone, {
            phone: contact.phone,
            name: contact.name,
          }),
        );
      }

      const finalContacts = Array.from(allContactsMap.values());

      if (finalContacts.length === 0) {
        return c.json({
          success: false,
          message: "Aucun contact cible trouvé pour cette campagne",
          data: null,
        });
      }

      // 2. Marquer comme en cours d'envoi
      await prisma.smsCampaign.update({
        where: { id },
        data: { status: "SENDING" },
      });

      // 3. Boucle d'envoi (On pourrait faire du batching/queueing, mais ici on traite en direct pour la simplicité)
      let sentCount = 0;
      let failedCount = 0;

      // On lance le traitement en "arrière-plan" pour ne pas faire de timeout sur la requête HTTP
      // Note: Dans une vraie appli scalable on utiliserait Redis/BullMQ
      (async () => {
        for (const contact of finalContacts) {
          try {
            // Normalisation du téléphone
            const normalization = normalizeMobileNumber(contact.phone);
            if (!normalization.isValid || !normalization.formattedNumber) {
              await prisma.smsCampaignLog.create({
                data: {
                  campaignId: id,
                  recipientPhone: contact.phone,
                  recipientName: contact.name,
                  status: "FAILED",
                  errorMessage:
                    normalization.error || "Numéro de mobile invalide",
                },
              });
              failedCount++;
              continue;
            }

            let messageContent = campaign.content;
            let generatedPromoCodeId: string | undefined;

            // Remplacement des variables de base
            if (contact.name) {
              const [firstName, ...lastNameParts] = contact.name.split(" ");
              messageContent = messageContent.replace("{PRENOM}", firstName);
              messageContent = messageContent.replace(
                "{NOM}",
                lastNameParts.join(" ") || firstName,
              );
            } else {
              messageContent = messageContent.replace("{PRENOM}", "");
              messageContent = messageContent.replace("{NOM}", "");
            }

            // Gestion du code Promo Unique
            if (campaign.generatePromoCode) {
              const uniqueCode = `S${nanoid(6).toUpperCase()}`;
              const promo = await prisma.promoCode.create({
                data: {
                  code: uniqueCode,
                  label: `Campagne: ${campaign.name}`,
                  recipientNote: `Généré pour ${contact.name || contact.phone}`,
                  discountType: campaign.promoDiscountType || "FIXED",
                  discountValue: campaign.promoDiscountValue || 0,
                  maxDiscountAmount: campaign.promoMaxDiscountAmount,
                  minCartAmount: campaign.promoMinCartAmount,
                  maxUses: 1, // Unique par personne
                  expiryDate: campaign.promoExpiryDate,
                  campaignId: campaign.id,
                },
              });
              generatedPromoCodeId = promo.id;
              messageContent = messageContent.replace(
                "{PROMO_CODE}",
                uniqueCode,
              );
            }

            // Envoi Twilio
            const twilioResult = await sendSms({
              to: normalization.formattedNumber,
              body: messageContent,
            });

            // Logging
            await prisma.smsCampaignLog.create({
              data: {
                campaignId: id,
                recipientPhone: normalization.formattedNumber,
                recipientName: contact.name,
                messageSid: twilioResult.messageSid,
                status: twilioResult.success ? "SENT" : "FAILED",
                errorMessage: twilioResult.error,
                sentAt: twilioResult.success ? new Date() : null,
              },
            });

            if (twilioResult.success) sentCount++;
            else failedCount++;
          } catch (itemError: any) {
            console.error("Error processing campaign item:", itemError);
            failedCount++;
          }
        }

        // 4. Finalisation du statut
        await prisma.smsCampaign.update({
          where: { id },
          data: {
            status: "COMPLETED",
            sentAt: new Date(),
          },
        });
      })();

      return c.json({
        success: true,
        message: `L'envoi de ${finalContacts.length} SMS a débuté en arrière-plan.`,
        data: { contactCount: finalContacts.length },
      });
    } catch (error: any) {
      console.error(error);
      return c.json({
        success: false,
        message: "Erreur lors du lancement de l'envoi",
        data: null,
      });
    }
  })

  // Supprimer
  .delete("/:id", requireAdmin, async (c) => {
    try {
      await prisma.smsCampaign.delete({ where: { id: c.req.param("id") } });
      return c.json({ success: true, message: "Supprimée" });
    } catch {
      return c.json({ success: false, message: "Erreur serveur" });
    }
  });

export default app;
