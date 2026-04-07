import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendSms } from "@/lib/twilio";
import { normalizeMobileNumber } from "@/lib/phone-normalizer";
import { resolveAudience } from "@/lib/audience-resolver";
import { nanoid } from "nanoid";

// Nécessaire pour les grosses campagnes — sans ça Vercel coupe la fonction
// après ~60s (défaut Pro), bloquant l'envoi en cours.
export const maxDuration = 300;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const campaign = await prisma.smsCampaign.findUnique({
    where: { id },
    include: {
      audiences: { include: { rules: true, contacts: true } },
    },
  });

  if (!campaign) {
    return NextResponse.json(
      { success: false, message: "Campagne introuvable" },
      { status: 404 },
    );
  }

  if (campaign.status === "COMPLETED") {
    return NextResponse.json(
      { success: false, message: "Cette campagne a déjà été complètement envoyée" },
      { status: 400 },
    );
  }

  // Charger les numéros déjà envoyés avec succès pour cette campagne
  // (utile si la campagne a été interrompue et qu'on relance)
  const alreadySentLogs = await prisma.smsCampaignLog.findMany({
    where: { campaignId: id, status: "SENT" },
    select: { recipientPhone: true },
  });
  const alreadySentPhones = new Set(alreadySentLogs.map((l) => l.recipientPhone));

  // Résoudre tous les contacts des audiences
  const allContactsMap = new Map<string, { phone: string; name?: string }>();
  for (const audience of campaign.audiences) {
    const dynamicContacts = await resolveAudience(audience.rules as any);
    dynamicContacts.forEach((c) =>
      allContactsMap.set(c.phone, { phone: c.phone, name: c.name }),
    );
    audience.contacts.forEach((c) =>
      allContactsMap.set(c.phone, { phone: c.phone, name: c.name ?? undefined }),
    );
  }

  const allContacts = Array.from(allContactsMap.values());

  // Exclure les contacts déjà traités avec succès
  const pendingContacts = allContacts.filter((c) => {
    const norm = normalizeMobileNumber(c.phone);
    const normalized = norm.formattedNumber ?? c.phone;
    return !alreadySentPhones.has(normalized) && !alreadySentPhones.has(c.phone);
  });

  if (pendingContacts.length === 0) {
    await prisma.smsCampaign.update({
      where: { id },
      data: { status: "COMPLETED", sentAt: new Date() },
    });
    return NextResponse.json({
      success: true,
      message: "Tous les contacts ont déjà reçu le SMS.",
      data: { sentCount: 0, skippedCount: alreadySentPhones.size, failedCount: 0, total: allContacts.length },
    });
  }

  await prisma.smsCampaign.update({
    where: { id },
    data: { status: "SENDING" },
  });

  let sentCount = 0;
  let failedCount = 0;
  const skippedCount = alreadySentPhones.size;

  for (const contact of pendingContacts) {
    try {
      const normalization = normalizeMobileNumber(contact.phone);
      if (!normalization.isValid || !normalization.formattedNumber) {
        await prisma.smsCampaignLog.create({
          data: {
            campaignId: id,
            recipientPhone: contact.phone,
            recipientName: contact.name,
            status: "FAILED",
            errorMessage: normalization.error || "Numéro de mobile invalide",
          },
        });
        failedCount++;
        continue;
      }

      let messageContent = campaign.content;

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

      if (campaign.generatePromoCode) {
        const uniqueCode = `S${nanoid(6).toUpperCase()}`;
        await prisma.promoCode.create({
          data: {
            code: uniqueCode,
            label: `Campagne: ${campaign.name}`,
            recipientNote: `Généré pour ${contact.name || contact.phone}`,
            discountType: campaign.promoDiscountType || "FIXED",
            discountValue: campaign.promoDiscountValue || 0,
            maxDiscountAmount: campaign.promoMaxDiscountAmount,
            minCartAmount: campaign.promoMinCartAmount,
            maxUses: 1,
            expiryDate: campaign.promoExpiryDate,
            campaignId: campaign.id,
          },
        });
        messageContent = messageContent.replace("{PROMO_CODE}", uniqueCode);
      }

      const twilioResult = await sendSms({
        to: normalization.formattedNumber,
        body: messageContent,
      });

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
    } catch (err: any) {
      console.error("Error sending SMS to", contact.phone, err);
      failedCount++;
    }
  }

  await prisma.smsCampaign.update({
    where: { id },
    data: { status: "COMPLETED", sentAt: new Date() },
  });

  console.log(
    `[campaign/${id}] Terminé — envoyés: ${sentCount}, ignorés (déjà reçu): ${skippedCount}, échecs: ${failedCount}`,
  );

  return NextResponse.json({
    success: true,
    message: `Campagne envoyée : ${sentCount} SMS envoyés, ${skippedCount} ignorés (déjà reçus), ${failedCount} échecs.`,
    data: { sentCount, skippedCount, failedCount, total: allContacts.length },
  });
}
