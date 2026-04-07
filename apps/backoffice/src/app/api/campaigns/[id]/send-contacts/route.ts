import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendSms } from "@/lib/twilio";
import { normalizeMobileNumber } from "@/lib/phone-normalizer";
import { resolveAudience } from "@/lib/audience-resolver";
import { nanoid } from "nanoid";

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
  const body = await req.json();
  const targetPhones: string[] = body.phones ?? [];

  if (targetPhones.length === 0) {
    return NextResponse.json(
      { success: false, message: "Aucun numéro fourni" },
      { status: 400 },
    );
  }

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

  // Construire la liste complète des contacts pour récupérer les noms
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

  // Vérifier les déjà envoyés (protection anti-doublon)
  const alreadySentLogs = await prisma.smsCampaignLog.findMany({
    where: { campaignId: id, status: "SENT" },
    select: { recipientPhone: true },
  });
  const alreadySentPhones = new Set(alreadySentLogs.map((l) => l.recipientPhone));

  // Passer la campagne en SENDING si elle est encore DRAFT
  if (campaign.status === "DRAFT" || campaign.status === "SCHEDULED") {
    await prisma.smsCampaign.update({
      where: { id },
      data: { status: "SENDING" },
    });
  }

  const results: { phone: string; success: boolean; error?: string }[] = [];

  for (const rawPhone of targetPhones) {
    const normalization = normalizeMobileNumber(rawPhone);
    const normalizedPhone = normalization.formattedNumber ?? rawPhone;

    // Protection anti-doublon
    if (alreadySentPhones.has(normalizedPhone) || alreadySentPhones.has(rawPhone)) {
      results.push({ phone: normalizedPhone, success: false, error: "Déjà envoyé" });
      continue;
    }

    if (!normalization.isValid || !normalization.formattedNumber) {
      await prisma.smsCampaignLog.create({
        data: {
          campaignId: id,
          recipientPhone: rawPhone,
          recipientName: allContactsMap.get(rawPhone)?.name,
          status: "FAILED",
          errorMessage: normalization.error || "Numéro invalide",
        },
      });
      results.push({ phone: rawPhone, success: false, error: normalization.error || "Numéro invalide" });
      continue;
    }

    const contact = allContactsMap.get(rawPhone) ??
      allContactsMap.get(normalizedPhone) ??
      { phone: normalizedPhone };

    let messageContent = campaign.content;

    if (contact.name) {
      const [firstName, ...lastNameParts] = contact.name.split(" ");
      messageContent = messageContent.replace("{PRENOM}", firstName);
      messageContent = messageContent.replace("{NOM}", lastNameParts.join(" ") || firstName);
    } else {
      messageContent = messageContent.replace("{PRENOM}", "").replace("{NOM}", "");
    }

    if (campaign.generatePromoCode) {
      const uniqueCode = `S${nanoid(6).toUpperCase()}`;
      await prisma.promoCode.create({
        data: {
          code: uniqueCode,
          label: `Campagne: ${campaign.name}`,
          recipientNote: `Généré pour ${contact.name || normalizedPhone}`,
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

    try {
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

      results.push({
        phone: normalization.formattedNumber,
        success: twilioResult.success,
        error: twilioResult.error,
      });
    } catch (err: any) {
      results.push({ phone: normalizedPhone, success: false, error: err.message });
    }
  }

  return NextResponse.json({ success: true, data: { results } });
}
