#!/usr/bin/env tsx
/**
 * reset-db-keep-essentials.ts
 *
 * Vide la base de données de développement en conservant :
 *   - Les utilisateurs (User + Account + Session)
 *   - Les tarifs (BaptemeCategoryPrice, VideoOptionPrice, BaptemeDepositPrice, StageBasePrice)
 *   - Le bandeau d'info (TopBar)
 *
 * Supprime tout le reste : stages, baptêmes, réservations, commandes,
 * paiements, clients, stagiaires, bons cadeaux, codes promo, SMS, panier…
 *
 * ⛔  PROTECTION : refuse de s'exécuter si DATABASE_URL pointe vers Supabase
 *     (domaine *.supabase.co) pour éviter d'effacer la prod par erreur.
 *
 * Usage :
 *   cd apps/backoffice
 *   pnpm db:reset
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: [] });

// ─── Safety guard ────────────────────────────────────────────────────────────

function assertNotProduction() {
  const url = process.env.DATABASE_URL ?? "";
  if (url.includes("supabase.co")) {
    console.error(`
❌  REFUS D'EXÉCUTION

   DATABASE_URL pointe vers Supabase (*.supabase.co).
   Ce script est réservé à la base de développement locale.

   Si vous souhaitez vraiment réinitialiser une BDD Supabase,
   faites-le manuellement depuis le dashboard Supabase.
`);
    process.exit(1);
  }
}

// ─── Reset ───────────────────────────────────────────────────────────────────

async function main() {
  assertNotProduction();

  console.log("🗑️  Réinitialisation de la BDD de développement…\n");

  // On utilise TRUNCATE … CASCADE pour vider plusieurs tables d'un coup
  // dans le bon ordre (les FK sont gérées par CASCADE).
  // On liste explicitement chaque table pour ne PAS toucher aux essentiels.
  await prisma.$transaction([

    // Données transactionnelles (du plus dépendant vers le moins)
    prisma.smsCampaignLog.deleteMany(),
    prisma.paymentAllocation.deleteMany(),
    prisma.promoCodeUsage.deleteMany(),
    prisma.processedWebhookEvent.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),

    // Réservations
    prisma.stageBooking.deleteMany(),
    prisma.baptemeBooking.deleteMany(),

    // Bons cadeaux
    prisma.giftVoucher.deleteMany(),

    // Participants & clients
    prisma.stagiaire.deleteMany(),
    prisma.client.deleteMany(),

    // Panier & réservations temporaires
    prisma.cartItem.deleteMany(),
    prisma.cartSession.deleteMany(),
    prisma.temporaryReservation.deleteMany(),

    // Moniteurs ↔ activités
    prisma.stageMoniteur.deleteMany(),
    prisma.baptemeMoniteur.deleteMany(),

    // Activités
    prisma.stagePromotionHistory.deleteMany(),
    prisma.stage.deleteMany(),
    prisma.bapteme.deleteMany(),

    // Marketing SMS
    prisma.audienceContact.deleteMany(),
    prisma.audienceRule.deleteMany(),
    prisma.audience.deleteMany(),
    prisma.smsCampaign.deleteMany(),

    // Codes promo
    prisma.promoCode.deleteMany(),

    // ─── Essentiels conservés ───────────────────────────────────────────────
    // User, Account, Session, Verification → conservés
    // BaptemeCategoryPrice, VideoOptionPrice, BaptemeDepositPrice → conservés
    // StageBasePrice → conservé
    // TopBar → conservé
  ]);

  // Comptes de vérification
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.stage.count(),
    prisma.bapteme.count(),
    prisma.client.count(),
    prisma.order.count(),
    prisma.payment.count(),
    prisma.baptemeCategoryPrice.count(),
    prisma.stageBasePrice.count(),
  ]);

  const [users, stages, baptemes, clients, orders, payments, bCatPrices, sBP] = counts;

  console.log("✅  Réinitialisation terminée\n");
  console.log("📊  État de la BDD :");
  console.log(`   Conservés  : ${users} user(s) · ${bCatPrices} prix baptême · ${sBP} prix stage`);
  console.log(`   Vidés      : stages=${stages} · baptêmes=${baptemes} · clients=${clients} · commandes=${orders} · paiements=${payments}`);
  console.log("\n💡  Vous pouvez relancer pnpm seed:mock pour injecter des données de test.");
}

main()
  .catch((e) => {
    console.error("❌  Erreur :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
