/**
 * Script de test pour l'email de rappel de stage.
 *
 * Usage :
 *   pnpm tsx src/scripts/test-stage-reminder.ts <bookingId> <email>
 *
 * Exemples :
 *   pnpm tsx src/scripts/test-stage-reminder.ts clx123abc mon@email.com
 *   pnpm tsx src/scripts/test-stage-reminder.ts SCP-X3K9  mon@email.com   (shortCode)
 */

import "dotenv/config";
import prisma from "@/lib/prisma";
import { sendStageReminderEmail } from "@/lib/resend";

const [, , bookingRef, targetEmail] = process.argv;

if (!bookingRef || !targetEmail) {
  console.error(
    "Usage : pnpm tsx src/scripts/test-stage-reminder.ts <bookingId|shortCode> <email>",
  );
  process.exit(1);
}

async function main() {
  // Accepte un cuid (id) ou un shortCode (ex: SCP-X3K9)
  const booking = await prisma.stageBooking.findFirst({
    where: {
      OR: [{ id: bookingRef }, { shortCode: bookingRef }],
    },
    include: {
      stagiaire: true,
      stage: true,
      orderItem: {
        include: { order: true },
      },
    },
  });

  if (!booking) {
    console.error(`❌ Aucune réservation trouvée pour : "${bookingRef}"`);
    process.exit(1);
  }

  const { stagiaire, stage, orderItem } = booking;

  const daysUntilStart = Math.ceil(
    (stage.startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  // Pour le test on force J-7 ou J-1 selon la date réelle, sinon on utilise 7
  const daysLabel: 1 | 7 =
    daysUntilStart <= 1 ? 1 : 7;

  const remainingAmount =
    orderItem?.effectiveRemainingAmount ??
    orderItem?.remainingAmount ??
    undefined;

  console.log("📋 Réservation trouvée :");
  console.log(`   Stagiaire  : ${stagiaire.firstName} ${stagiaire.lastName}`);
  console.log(`   Email réel : ${stagiaire.email}`);
  console.log(`   Stage      : ${stage.type} — ${stage.startDate.toLocaleDateString("fr-FR")}`);
  console.log(`   Solde      : ${remainingAmount != null ? `${remainingAmount} €` : "aucun"}`);
  console.log(`   shortCode  : ${booking.shortCode ?? "—"}`);
  console.log("");
  console.log(`📨 Envoi du mail de test à : ${targetEmail}`);
  console.log(`   (simulé comme J-${daysLabel})`);
  console.log("");

  await sendStageReminderEmail({
    firstName: stagiaire.firstName,
    lastName: stagiaire.lastName,
    email: targetEmail, // on redirige vers l'email de test
    stageType: stage.type,
    startDate: stage.startDate.toISOString(),
    daysUntilStart: daysLabel,
    bookingShortCode: booking.shortCode,
    remainingAmount: remainingAmount ?? undefined,
  });

  console.log("✅ Email envoyé avec succès !");
}

main()
  .catch((err) => {
    console.error("❌ Erreur :", err.message ?? err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
