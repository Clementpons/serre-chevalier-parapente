/**
 * seed-mock.ts
 *
 * Populates the database with realistic mock data for development and testing.
 * Safe to run multiple times — clears existing data first (except User/Session/Account).
 *
 * Usage:
 *   cd apps/backoffice
 *   npx tsx prisma/seed-mock.ts
 *
 * IMPORTANT: Requires a running DB and .env.local with DATABASE_URL.
 * Run AFTER seed-admin.ts to have at least one ADMIN user.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { default: prisma } = await import("../src/lib/prisma");

  console.log("\n🌱 Serre Chevalier Parapente — Mock Data Seed\n");

  // ─── 0. Clean existing non-auth data ───────────────────────────────────────
  console.log("🗑  Cleaning existing data...");
  await prisma.promoCodeUsage.deleteMany();
  await prisma.stagePromotionHistory.deleteMany();
  await prisma.paymentAllocation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.smsCampaignLog.deleteMany();
  await prisma.smsCampaign.deleteMany();
  await prisma.audienceContact.deleteMany();
  await prisma.audienceRule.deleteMany();
  await prisma.audience.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.temporaryReservation.deleteMany();
  await prisma.stageBooking.deleteMany();
  await prisma.baptemeBooking.deleteMany();
  await prisma.stageMoniteur.deleteMany();
  await prisma.baptemeMoniteur.deleteMany();
  await prisma.stage.deleteMany();
  await prisma.bapteme.deleteMany();
  await prisma.giftVoucher.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.client.deleteMany();
  await prisma.stagiaire.deleteMany();
  await prisma.baptemeCategoryPrice.deleteMany();
  await prisma.videoOptionPrice.deleteMany();
  await prisma.stageBasePrice.deleteMany();
  await prisma.baptemeDepositPrice.deleteMany();
  await prisma.topBar.deleteMany();
  console.log("   Done.\n");

  // ─── 1. Fetch moniteur users ────────────────────────────────────────────────
  const moniteurs = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "MONITEUR"] } },
  });

  if (moniteurs.length === 0) {
    console.error("❌  No ADMIN/MONITEUR users found. Run seed-admin.ts first.");
    process.exit(1);
  }

  const moniteurIds = moniteurs.map((m) => m.id);
  console.log(`✅  Found ${moniteurs.length} moniteur(s): ${moniteurs.map((m) => m.name).join(", ")}\n`);

  // ─── 2. Pricing ─────────────────────────────────────────────────────────────
  console.log("💰  Seeding pricing...");

  await prisma.stageBasePrice.createMany({
    data: [
      { stageType: "INITIATION", price: 680 },
      { stageType: "PROGRESSION", price: 680 },
      { stageType: "AUTONOMIE", price: 1200 },
    ],
  });

  await prisma.baptemeCategoryPrice.createMany({
    data: [
      { category: "AVENTURE", price: 120 },
      { category: "DUREE", price: 150 },
      { category: "LONGUE_DUREE", price: 180 },
      { category: "ENFANT", price: 95 },
      { category: "HIVER", price: 140 },
    ],
  });

  await prisma.videoOptionPrice.create({ data: { price: 45 } });
  await prisma.baptemeDepositPrice.create({ data: { price: 40 } });

  console.log("   ✓ Pricing done\n");

  // ─── 3. TopBar content ───────────────────────────────────────────────────────
  await prisma.topBar.create({
    data: {
      title: "🌤 Saison 2026 ouverte ! Réservez vos stages et baptêmes maintenant",
      ctaTitle: "Réserver",
      ctaLink: "/reserver",
      isActive: true,
    },
  });
  console.log("   ✓ TopBar created\n");

  // ─── 4. Stages ───────────────────────────────────────────────────────────────
  console.log("🏔  Seeding stages...");

  const now = new Date("2026-03-16");

  const stagesData = [
    // Initiation
    { startDate: new Date("2026-04-06"), duration: 5, places: 6, price: 680, acomptePrice: 150, type: "INITIATION" as const },
    { startDate: new Date("2026-04-20"), duration: 5, places: 6, price: 680, acomptePrice: 150, type: "INITIATION" as const },
    { startDate: new Date("2026-05-04"), duration: 5, places: 6, price: 680, acomptePrice: 150, type: "INITIATION" as const },
    { startDate: new Date("2026-05-18"), duration: 5, places: 6, price: 650, acomptePrice: 150, type: "INITIATION" as const, promotionOriginalPrice: 680, promotionEndDate: new Date("2026-05-10"), promotionReason: "Promo printemps" },
    { startDate: new Date("2026-06-01"), duration: 5, places: 8, price: 680, acomptePrice: 150, type: "INITIATION" as const },
    { startDate: new Date("2026-06-15"), duration: 5, places: 8, price: 680, acomptePrice: 150, type: "INITIATION" as const },
    { startDate: new Date("2026-07-06"), duration: 5, places: 8, price: 730, acomptePrice: 180, type: "INITIATION" as const },
    { startDate: new Date("2026-07-20"), duration: 5, places: 8, price: 730, acomptePrice: 180, type: "INITIATION" as const },
    { startDate: new Date("2026-08-03"), duration: 5, places: 8, price: 730, acomptePrice: 180, type: "INITIATION" as const },
    // Progression
    { startDate: new Date("2026-04-13"), duration: 5, places: 6, price: 680, acomptePrice: 150, type: "PROGRESSION" as const },
    { startDate: new Date("2026-05-11"), duration: 5, places: 6, price: 680, acomptePrice: 150, type: "PROGRESSION" as const },
    { startDate: new Date("2026-06-08"), duration: 5, places: 6, price: 680, acomptePrice: 150, type: "PROGRESSION" as const },
    { startDate: new Date("2026-07-13"), duration: 5, places: 8, price: 730, acomptePrice: 180, type: "PROGRESSION" as const },
    { startDate: new Date("2026-08-10"), duration: 5, places: 8, price: 730, acomptePrice: 180, type: "PROGRESSION" as const },
    // Autonomie (DOUBLE = initiation + progression combined)
    { startDate: new Date("2026-04-06"), duration: 10, places: 4, price: 1200, acomptePrice: 250, type: "DOUBLE" as const },
    { startDate: new Date("2026-06-01"), duration: 10, places: 4, price: 1200, acomptePrice: 250, type: "DOUBLE" as const },
    { startDate: new Date("2026-07-06"), duration: 10, places: 4, price: 1350, acomptePrice: 300, type: "DOUBLE" as const },
  ];

  const createdStages = await Promise.all(
    stagesData.map((s) =>
      prisma.stage.create({
        data: {
          ...s,
          moniteurs: {
            create: [{ moniteurId: moniteurIds[0] }],
          },
        },
      })
    )
  );

  console.log(`   ✓ ${createdStages.length} stages created\n`);

  // ─── 5. Baptêmes ─────────────────────────────────────────────────────────────
  console.log("🪂  Seeding baptêmes...");

  const baptemeDates = [
    "2026-04-05", "2026-04-12", "2026-04-19", "2026-04-26",
    "2026-05-03", "2026-05-10", "2026-05-17", "2026-05-24",
    "2026-06-07", "2026-06-14", "2026-06-21", "2026-06-28",
    "2026-07-05", "2026-07-12", "2026-07-19", "2026-07-26",
    "2026-08-02", "2026-08-09", "2026-08-16", "2026-08-23",
  ];

  const createdBaptemes = await Promise.all(
    baptemeDates.map((dateStr, i) => {
      const date = new Date(dateStr);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const categories: ("AVENTURE" | "DUREE" | "LONGUE_DUREE" | "ENFANT" | "HIVER")[] =
        i % 3 === 0
          ? ["AVENTURE", "DUREE", "LONGUE_DUREE", "ENFANT"]
          : i % 3 === 1
          ? ["AVENTURE", "DUREE", "HIVER"]
          : ["AVENTURE", "DUREE", "LONGUE_DUREE"];

      return prisma.bapteme.create({
        data: {
          date,
          duration: 120,
          places: isWeekend ? 8 : 6,
          categories,
          acomptePrice: 40,
          moniteurs: {
            create: [{ moniteurId: moniteurIds[0] }],
          },
        },
      });
    })
  );

  console.log(`   ✓ ${createdBaptemes.length} baptêmes created\n`);

  // ─── 6. Clients ──────────────────────────────────────────────────────────────
  console.log("👤  Seeding clients...");

  const clientsData = [
    { email: "alice.martin@email.fr", firstName: "Alice", lastName: "Martin", phone: "06 12 34 56 78", address: "12 Rue des Lilas", postalCode: "75011", city: "Paris", country: "France" },
    { email: "bob.dupont@gmail.com", firstName: "Bob", lastName: "Dupont", phone: "07 23 45 67 89", address: "8 Avenue du Général de Gaulle", postalCode: "69001", city: "Lyon", country: "France" },
    { email: "claire.leblanc@outlook.fr", firstName: "Claire", lastName: "Leblanc", phone: "06 34 56 78 90", address: "3 Rue Molière", postalCode: "13001", city: "Marseille", country: "France" },
    { email: "david.garcia@email.fr", firstName: "David", lastName: "Garcia", phone: "06 45 67 89 01", address: "15 Rue de la Paix", postalCode: "06000", city: "Nice", country: "France" },
    { email: "emma.rousseau@gmail.com", firstName: "Emma", lastName: "Rousseau", phone: "07 56 78 90 12", address: "22 Boulevard Victor Hugo", postalCode: "31000", city: "Toulouse", country: "France" },
    { email: "florent.bernard@email.fr", firstName: "Florent", lastName: "Bernard", phone: "06 67 89 01 23", address: "5 Place Bellecour", postalCode: "69002", city: "Lyon", country: "France" },
    { email: "gabriel.petit@hotmail.fr", firstName: "Gabriel", lastName: "Petit", phone: "06 78 90 12 34", address: "47 Rue de Bretagne", postalCode: "75003", city: "Paris", country: "France" },
    { email: "hugo.roux@gmail.com", firstName: "Hugo", lastName: "Roux", phone: "07 89 01 23 45", address: "9 Rue du Faubourg Saint-Honoré", postalCode: "75008", city: "Paris", country: "France" },
  ];

  const createdClients = await Promise.all(
    clientsData.map((c) => prisma.client.create({ data: c }))
  );

  console.log(`   ✓ ${createdClients.length} clients created\n`);

  // ─── 7. Stagiaires ────────────────────────────────────────────────────────────
  console.log("🎓  Seeding stagiaires...");

  const stagiairesData = [
    { email: "alice.martin@email.fr", firstName: "Alice", lastName: "Martin", phone: "06 12 34 56 78", weight: 58, height: 165, birthDate: new Date("1992-04-15") },
    { email: "bob.dupont@gmail.com", firstName: "Bob", lastName: "Dupont", phone: "07 23 45 67 89", weight: 75, height: 178, birthDate: new Date("1988-11-22") },
    { email: "claire.leblanc@outlook.fr", firstName: "Claire", lastName: "Leblanc", phone: "06 34 56 78 90", weight: 62, height: 168, birthDate: new Date("1995-07-03") },
    { email: "david.garcia@email.fr", firstName: "David", lastName: "Garcia", phone: "06 45 67 89 01", weight: 80, height: 180, birthDate: new Date("1984-02-28") },
    { email: "emma.rousseau@gmail.com", firstName: "Emma", lastName: "Rousseau", phone: "07 56 78 90 12", weight: 55, height: 162, birthDate: new Date("1999-09-12") },
    { email: "sophie.moreau@email.fr", firstName: "Sophie", lastName: "Moreau", phone: "06 91 23 45 67", weight: 60, height: 166, birthDate: new Date("1990-06-18") },
    { email: "thomas.girard@gmail.com", firstName: "Thomas", lastName: "Girard", phone: "07 02 34 56 78", weight: 72, height: 175, birthDate: new Date("1986-12-05") },
    { email: "lucie.fournier@hotmail.fr", firstName: "Lucie", lastName: "Fournier", phone: "06 13 45 67 89", weight: 57, height: 163, birthDate: new Date("1997-03-25") },
    { email: "marc.simon@email.fr", firstName: "Marc", lastName: "Simon", phone: "07 24 56 78 90", weight: 85, height: 182, birthDate: new Date("1981-08-14") },
    { email: "isabelle.durand@gmail.com", firstName: "Isabelle", lastName: "Durand", phone: "06 35 67 89 01", weight: 63, height: 169, birthDate: new Date("1993-01-30") },
  ];

  const createdStagiaires = await Promise.all(
    stagiairesData.map((s) => prisma.stagiaire.create({ data: s }))
  );

  console.log(`   ✓ ${createdStagiaires.length} stagiaires created\n`);

  // ─── 8. Gift Vouchers ────────────────────────────────────────────────────────
  console.log("🎁  Seeding gift vouchers...");

  const expiryDateValid = new Date("2027-03-01");
  const expiryDateExpired = new Date("2025-06-15");

  await prisma.giftVoucher.createMany({
    data: [
      {
        code: "GVSCP-TEST0001-STAG",
        productType: "STAGE",
        stageCategory: "INITIATION",
        purchasePrice: 680,
        recipientName: "Marie Dupont",
        recipientEmail: "marie.dupont@email.fr",
        expiryDate: expiryDateValid,
        isUsed: false,
      },
      {
        code: "GVSCP-TEST0002-BAPT",
        productType: "BAPTEME",
        baptemeCategory: "AVENTURE",
        purchasePrice: 120,
        recipientName: "Pierre Martin",
        recipientEmail: "pierre.martin@gmail.com",
        expiryDate: expiryDateValid,
        isUsed: false,
      },
      {
        code: "GVSCP-TEST0003-USED",
        productType: "BAPTEME",
        baptemeCategory: "DUREE",
        purchasePrice: 150,
        recipientName: "Julie Bernard",
        recipientEmail: "julie.bernard@email.fr",
        expiryDate: expiryDateValid,
        isUsed: true,
      },
      {
        code: "GVSCP-TEST0004-EXPR",
        productType: "STAGE",
        stageCategory: "PROGRESSION",
        purchasePrice: 680,
        recipientName: "Lucas Petit",
        recipientEmail: "lucas.petit@gmail.com",
        expiryDate: expiryDateExpired,
        isUsed: false,
      },
      {
        code: "GVSCP-TEST0005-PROG",
        productType: "STAGE",
        stageCategory: "PROGRESSION",
        purchasePrice: 680,
        recipientName: "Camille Robert",
        recipientEmail: "camille.robert@hotmail.fr",
        expiryDate: expiryDateValid,
        isUsed: false,
      },
      {
        code: "GVSCP-TEST0006-ENFANT",
        productType: "BAPTEME",
        baptemeCategory: "ENFANT",
        purchasePrice: 95,
        recipientName: "Tom Lefevre",
        recipientEmail: "famille.lefevre@email.fr",
        expiryDate: expiryDateValid,
        isUsed: false,
      },
    ],
  });

  console.log("   ✓ 6 gift vouchers created\n");
  console.log("   📋 Codes for testing:");
  console.log("   GVSCP-TEST0001-STAG → Stage Initiation (valid)");
  console.log("   GVSCP-TEST0002-BAPT → Baptême Aventure (valid)");
  console.log("   GVSCP-TEST0003-USED → Baptême Durée (already used ✗)");
  console.log("   GVSCP-TEST0004-EXPR → Stage Progression (expired ✗)");
  console.log("   GVSCP-TEST0005-PROG → Stage Progression (valid)");
  console.log("   GVSCP-TEST0006-ENFANT → Baptême Enfant (valid)\n");

  // ─── 9. Promo Codes ──────────────────────────────────────────────────────────
  console.log("🏷  Seeding promo codes...");

  await prisma.promoCode.createMany({
    data: [
      {
        code: "PROMO10",
        label: "Réduction 10% — toute l'année",
        discountType: "PERCENTAGE",
        discountValue: 10,
        maxDiscountAmount: 80,
        isActive: true,
      },
      {
        code: "ETE2026",
        label: "Promo été 2026 — -50€",
        discountType: "FIXED",
        discountValue: 50,
        minCartAmount: 300,
        expiryDate: new Date("2026-08-31"),
        isActive: true,
      },
      {
        code: "BIENVENUE",
        label: "Bienvenue — -20€ dès 100€",
        discountType: "FIXED",
        discountValue: 20,
        minCartAmount: 100,
        maxUses: 50,
        currentUses: 12,
        isActive: true,
      },
      {
        code: "EXPIREDTEST",
        label: "Code expiré (test)",
        discountType: "PERCENTAGE",
        discountValue: 15,
        expiryDate: new Date("2025-12-31"),
        isActive: false,
      },
    ],
  });

  console.log("   ✓ 4 promo codes created\n");
  console.log("   📋 Codes for testing:");
  console.log("   PROMO10     → -10% (max 80€)");
  console.log("   ETE2026     → -50€ (min panier 300€, expire 31/08/2026)");
  console.log("   BIENVENUE   → -20€ (min panier 100€, max 50 utilisations)");
  console.log("   EXPIREDTEST → expiré, désactivé ✗\n");

  // ─── 10. Mock orders with confirmed bookings ──────────────────────────────────
  console.log("📦  Seeding mock orders with reservations...");

  const clientAlice  = createdClients[0]; // alice.martin@email.fr
  const clientBob    = createdClients[1]; // bob.dupont@gmail.com
  const stagiaireThomas = createdStagiaires[6]; // thomas.girard@gmail.com
  const stagiaireBob    = createdStagiaires[1]; // bob.dupont@gmail.com
  const stageInitiation1 = createdStages[0]; // 06 Apr 2026, 680€, acompte 150€
  const bapteme1         = createdBaptemes[0]; // 05 Apr 2026, AVENTURE|DUREE…, acompte 40€

  // --- Order 1 : Stage Initiation — Alice (payeur) pour Thomas (stagiaire) ---
  const stageBookingMock = await prisma.stageBooking.create({
    data: {
      type: "INITIATION",
      stageId: stageInitiation1.id,
      stagiaireId: stagiaireThomas.id,
      shortCode: "SCP-TEST01",
    },
  });

  const order1 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-MOCK01",
      status: "PAID",
      subtotal: 680,
      discountAmount: 0,
      promoDiscountAmount: 0,
      totalAmount: 680,
      clientId: clientAlice.id,
      orderItems: {
        create: [
          {
            type: "STAGE",
            quantity: 1,
            unitPrice: 680,
            totalPrice: 680,
            depositAmount: 150,
            remainingAmount: 530,
            effectiveDepositAmount: 150,
            effectiveRemainingAmount: 530,
            isFullyPaid: false,
            stageId: stageInitiation1.id,
            stageBookingId: stageBookingMock.id,
            participantData: {
              firstName: "Thomas",
              lastName: "Girard",
              email: "thomas.girard@gmail.com",
              phone: "0702345678",
              weight: 72,
              height: 175,
              selectedStageType: "INITIATION",
            },
          },
        ],
      },
    },
    include: { orderItems: true },
  });

  const payment1 = await prisma.payment.create({
    data: {
      orderId: order1.id,
      paymentType: "STRIPE",
      stripePaymentIntentId: "pi_mock_stage_test_01",
      status: "SUCCEEDED",
      amount: 150,
      currency: "eur",
    },
  });

  await prisma.paymentAllocation.create({
    data: {
      paymentId: payment1.id,
      orderItemId: order1.orderItems[0].id,
      allocatedAmount: 150,
    },
  });

  // --- Order 2 : Baptême Aventure — Bob (payeur + stagiaire) ---
  const baptemeBookingMock = await prisma.baptemeBooking.create({
    data: {
      baptemeId: bapteme1.id,
      stagiaireId: stagiaireBob.id,
      category: "AVENTURE",
      hasVideo: false,
      shortCode: "SCP-TEST02",
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-MOCK02",
      status: "PAID",
      subtotal: 120,
      discountAmount: 0,
      promoDiscountAmount: 0,
      totalAmount: 120,
      clientId: clientBob.id,
      orderItems: {
        create: [
          {
            type: "BAPTEME",
            quantity: 1,
            unitPrice: 120,
            totalPrice: 120,
            depositAmount: 40,
            remainingAmount: 80,
            effectiveDepositAmount: 40,
            effectiveRemainingAmount: 80,
            isFullyPaid: false,
            baptemeId: bapteme1.id,
            baptemeBookingId: baptemeBookingMock.id,
            participantData: {
              firstName: "Bob",
              lastName: "Dupont",
              email: "bob.dupont@gmail.com",
              phone: "0723456789",
              weight: 75,
              height: 178,
              selectedCategory: "AVENTURE",
              hasVideo: false,
            },
          },
        ],
      },
    },
    include: { orderItems: true },
  });

  const payment2 = await prisma.payment.create({
    data: {
      orderId: order2.id,
      paymentType: "STRIPE",
      stripePaymentIntentId: "pi_mock_bapteme_test_02",
      status: "SUCCEEDED",
      amount: 40,
      currency: "eur",
    },
  });

  await prisma.paymentAllocation.create({
    data: {
      paymentId: payment2.id,
      orderItemId: order2.orderItems[0].id,
      allocatedAmount: 40,
    },
  });

  console.log("   ✓ 2 mock orders with bookings created");
  console.log("   ORD-2026-MOCK01 → Stage Initiation, acompte 150€, solde 530€ (Alice → Thomas)");
  console.log("   ORD-2026-MOCK02 → Baptême Aventure, acompte 40€, solde 80€ (Bob)\n");

  // ─── 11. Ghost order (PENDING, 48h old) ──────────────────────────────────────
  console.log("👻  Seeding ghost order (for cleanup test)...");

  const fortyEightHoursAgo = new Date();
  fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

  await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-GHOST1",
      status: "PENDING",
      subtotal: 680,
      discountAmount: 0,
      promoDiscountAmount: 0,
      totalAmount: 680,
      createdAt: fortyEightHoursAgo,
      updatedAt: fortyEightHoursAgo,
      orderItems: {
        create: [
          {
            type: "STAGE",
            quantity: 1,
            unitPrice: 680,
            totalPrice: 680,
            depositAmount: 150,
            remainingAmount: 530,
            isFullyPaid: false,
            stageId: createdStages[2].id,
            participantData: {
              firstName: "Fantôme",
              lastName: "Test",
              email: "ghost.order@test.fr",
            },
          },
        ],
      },
    },
  });

  console.log("   ✓ Ghost order ORD-2026-GHOST1 created (48h old, PENDING, no payment)\n");

  // ─── 12. Audiences & Campaign SMS ────────────────────────────────────────────
  console.log("📢  Seeding audiences and SMS campaign...");

  const audience1 = await prisma.audience.create({
    data: {
      name: "Anciens stagiaires — Initiation",
      description: "Clients ayant participé à un stage Initiation",
      rules: {
        create: [{ ruleType: "STAGIAIRE_STAGE", stageType: "INITIATION" }],
      },
    },
  });

  await prisma.audience.create({
    data: {
      name: "Contacts manuels — Test",
      description: "Audience avec contacts saisis manuellement pour tester",
      contacts: {
        create: [
          { phone: "+33612345678", name: "Marie Dupont" },
          { phone: "+33698765432", name: "Pierre Martin" },
          { phone: "+33623456789", name: "Camille Robert" },
        ],
      },
    },
  });

  await prisma.smsCampaign.create({
    data: {
      name: "Promotion Été 2026 — Stages",
      content:
        "Bonjour ! Réservez votre stage parapente été 2026 avec -50€ (code ETE2026). Infos et réservations : serreche-parapente.fr",
      status: "DRAFT",
      audiences: { connect: [{ id: audience1.id }] },
    },
  });

  console.log("   ✓ 2 audiences created");
  console.log("   ✓ 1 draft SMS campaign created\n");

  // ─── 13. Summary ─────────────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════════");
  console.log("✅  Mock data seed completed!\n");
  console.log("📊  Summary:");
  console.log(`   • ${stagesData.length} stages (avril → août 2026)`);
  console.log(`   • ${baptemeDates.length} baptêmes (avril → août 2026)`);
  console.log(`   • ${clientsData.length} clients`);
  console.log(`   • ${stagiairesData.length} stagiaires`);
  console.log("   • 6 gift vouchers (dont 1 utilisé, 1 expiré)");
  console.log("   • 4 codes promo (dont 1 inactif)");
  console.log("   • 2 commandes payées avec réservations (MOCK01, MOCK02)");
  console.log("   • 1 commande fantôme (GHOST1, 48h, PENDING, aucun paiement)");
  console.log("   • 2 audiences + 1 campagne SMS DRAFT");
  console.log("   • Pricing: stages, baptêmes, vidéo, acompte");
  console.log("   • TopBar activée\n");
  console.log("🔑  Test accounts (run seed-admin.ts to create admin first)");
  console.log("═══════════════════════════════════════════════════════\n");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
