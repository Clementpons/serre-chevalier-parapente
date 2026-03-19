#!/usr/bin/env tsx
/**
 * Migration script: old Supabase DB → new DB
 *
 * Usage:
 *   # Dry run (no writes, only counts rows):
 *   pnpm migrate:from-old --dry-run
 *
 *   # Real migration:
 *   pnpm migrate:from-old
 *
 * Required env vars (in apps/backoffice/.env.migration):
 *   OLD_DATABASE_URL=postgresql://...   (old Supabase DB – READ ONLY)
 *   DATABASE_URL=postgresql://...       (new DB – Prisma writes here)
 *   DIRECT_URL=postgresql://...         (new DB direct URL for Prisma)
 *   TEMP_PASSWORD=...                   (temp password for migrated users, default: ChangeMe2026!)
 *
 * What is migrated:
 *   Users, Stages, Baptemes, StageMoniteurs, BaptemeMoniteurs,
 *   BaptemeCategoryPrices, VideoOptionPrices, BaptemeDepositPrices, StageBasePrices,
 *   TopBars, SmsCampaigns, Audiences, AudienceRules, AudienceContacts,
 *   PromoCodes, Clients, Stagiaires, GiftVouchers, Orders, StageBookings,
 *   BaptemeBookings, OrderItems, PromoCodeUsages, Payments, PaymentAllocations,
 *   ProcessedWebhookEvents, SmsCampaignLogs
 *
 * What is NOT migrated (transient / irrelevant):
 *   CartSessions, CartItems, TemporaryReservations
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env.migration from apps/backoffice root (one level up from prisma/)
config({ path: resolve(__dirname, "../.env.migration") });

import { Pool } from "pg";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

// ─── Config ──────────────────────────────────────────────────────────────────

const isDryRun = process.argv.includes("--dry-run");
const TEMP_PASSWORD = process.env.TEMP_PASSWORD ?? "ChangeMe2026!";
const BCRYPT_ROUNDS = 10;

if (!process.env.OLD_DATABASE_URL) {
  console.error("❌  OLD_DATABASE_URL manquant dans .env.migration");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("❌  DATABASE_URL manquant dans .env.migration");
  process.exit(1);
}

const log = (msg: string) => console.log(msg);
const dryLog = (msg: string) => isDryRun && console.log(`  [DRY-RUN] ${msg}`);

// ─── Connections ─────────────────────────────────────────────────────────────

const oldDb = new Pool({
  connectionString: process.env.OLD_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
});

const prisma = new PrismaClient({
  log: [],
});

// Mapping ancienUserId → nouvelUserId (quand un user est skipé pour conflit email)
// Utilisé pour résoudre les FK dans StageMoniteur / BaptemeMoniteur
const userIdMap = new Map<string, string>();

// ─── Helper ───────────────────────────────────────────────────────────────────

async function query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const res = await oldDb.query(sql, params);
  return res.rows as T[];
}

/**
 * Parse a PostgreSQL array literal string like "{HIVER,AVENTURE}" into a JS array.
 * If the value is already an array, returns it as-is.
 */
function parsePgArray(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value !== "string") return [];
  // Strip surrounding braces, split on comma, filter empty strings
  return value
    .replace(/^\{/, "")
    .replace(/\}$/, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function fmt(n: number) {
  return `${n}`.padStart(5);
}

// ─── Step 1 – Users (→ better-auth user + account) ───────────────────────────

interface OldUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: "ADMIN" | "MONITEUR" | "CUSTOMER";
  createdAt: Date;
  updatedAt: Date;
}

async function migrateUsers() {
  const users = await query<OldUser>(
    `SELECT id, email, name, "avatarUrl", role, "createdAt", "updatedAt" FROM "User"`
  );
  log(`\n👤 Users : ${fmt(users.length)} trouvés`);

  if (isDryRun) {
    dryLog(`Créerait ${users.length} user(s) + ${users.length} account(s)`);
    return;
  }

  const tempPasswordHash = await bcrypt.hash(TEMP_PASSWORD, BCRYPT_ROUNDS);
  let created = 0;
  let skipped = 0;

  for (const u of users) {
    const exists = await prisma.user.findFirst({
      where: { OR: [{ id: u.id }, { email: u.email }] },
    });
    if (exists) {
      // Si les IDs diffèrent, enregistrer le mapping pour les FK des moniteurs
      if (exists.id !== u.id) {
        userIdMap.set(u.id, exists.id);
      }
      skipped++;
      continue;
    }

    await prisma.user.create({
      data: {
        id: u.id,
        email: u.email,
        name: u.name,
        emailVerified: true,
        avatarUrl: u.avatarUrl || null,
        role: u.role,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      },
    });

    // Create better-auth credential account
    await prisma.account.create({
      data: {
        id: randomUUID(),
        accountId: u.email,
        providerId: "credential",
        userId: u.id,
        password: tempPasswordHash,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      },
    });

    created++;
  }

  log(`   ✅  ${created} créé(s), ${skipped} déjà présent(s)`);
  log(
    `   ⚠️   Mot de passe temporaire: "${TEMP_PASSWORD}" — à changer après connexion`
  );
}

// ─── Step 2 – SmsCampaigns ────────────────────────────────────────────────────

interface OldSmsCampaign {
  id: string;
  name: string;
  content: string;
  status: string;
  scheduledAt: Date | null;
  sentAt: Date | null;
  generatePromoCode: boolean;
  promoDiscountType: string | null;
  promoDiscountValue: number | null;
  promoMaxDiscountAmount: number | null;
  promoMinCartAmount: number | null;
  promoMaxUses: number | null;
  promoExpiryDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

async function migrateSmsCampaigns() {
  const rows = await query<OldSmsCampaign>(`SELECT * FROM "SmsCampaign"`);
  log(`\n📱 SmsCampaigns : ${fmt(rows.length)} trouvées`);

  if (isDryRun) {
    dryLog(`Créerait ${rows.length} campagne(s)`);
    return;
  }

  let created = 0;
  let skipped = 0;

  for (const r of rows) {
    const exists = await prisma.smsCampaign.findUnique({ where: { id: r.id } });
    if (exists) { skipped++; continue; }

    await prisma.smsCampaign.create({
      data: {
        id: r.id,
        name: r.name,
        content: r.content,
        status: r.status as never,
        scheduledAt: r.scheduledAt,
        sentAt: r.sentAt,
        generatePromoCode: r.generatePromoCode,
        promoDiscountType: r.promoDiscountType as never ?? null,
        promoDiscountValue: r.promoDiscountValue,
        promoMaxDiscountAmount: r.promoMaxDiscountAmount,
        promoMinCartAmount: r.promoMinCartAmount,
        promoMaxUses: r.promoMaxUses,
        promoExpiryDate: r.promoExpiryDate,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      },
    });
    created++;
  }

  log(`   ✅  ${created} créée(s), ${skipped} déjà présente(s)`);
}

// ─── Step 3 – Audiences ───────────────────────────────────────────────────────

async function migrateAudiences() {
  const rows = await query<{
    id: string; name: string; description: string | null;
    createdAt: Date; updatedAt: Date;
  }>(`SELECT id, name, description, "createdAt", "updatedAt" FROM "Audience"`);
  log(`\n🎯 Audiences : ${fmt(rows.length)} trouvées`);

  if (isDryRun) { dryLog(`Créerait ${rows.length} audience(s)`); return; }

  let created = 0; let skipped = 0;
  for (const r of rows) {
    const exists = await prisma.audience.findUnique({ where: { id: r.id } });
    if (exists) { skipped++; continue; }
    await prisma.audience.create({
      data: { id: r.id, name: r.name, description: r.description, createdAt: r.createdAt, updatedAt: r.updatedAt },
    });
    created++;
  }
  log(`   ✅  ${created} créée(s), ${skipped} déjà présente(s)`);
}

// ─── Step 4 – AudienceRules ───────────────────────────────────────────────────

async function migrateAudienceRules() {
  const rows = await query<{
    id: string; audienceId: string; ruleType: string;
    stageType: string | null; baptemeCategory: string | null;
    minOrderAmount: number | null; dateFrom: Date | null; dateTo: Date | null;
    createdAt: Date;
  }>(`SELECT * FROM "AudienceRule"`);
  log(`\n📋 AudienceRules : ${fmt(rows.length)} trouvées`);

  if (isDryRun) { dryLog(`Créerait ${rows.length} règle(s)`); return; }

  let created = 0; let skipped = 0;
  for (const r of rows) {
    const exists = await prisma.audienceRule.findUnique({ where: { id: r.id } });
    if (exists) { skipped++; continue; }
    await prisma.audienceRule.create({
      data: {
        id: r.id, audienceId: r.audienceId, ruleType: r.ruleType as never,
        stageType: r.stageType as never ?? null,
        baptemeCategory: r.baptemeCategory as never ?? null,
        minOrderAmount: r.minOrderAmount,
        dateFrom: r.dateFrom, dateTo: r.dateTo,
        createdAt: r.createdAt,
      },
    });
    created++;
  }
  log(`   ✅  ${created} créée(s), ${skipped} déjà présente(s)`);
}

// ─── Step 5 – AudienceContacts ────────────────────────────────────────────────

async function migrateAudienceContacts() {
  const rows = await query<{
    id: string; audienceId: string; phone: string; name: string | null; createdAt: Date;
  }>(`SELECT * FROM "AudienceContact"`);
  log(`\n📞 AudienceContacts : ${fmt(rows.length)} trouvés`);

  if (isDryRun) { dryLog(`Créerait ${rows.length} contact(s)`); return; }

  let created = 0; let skipped = 0;
  for (const r of rows) {
    const exists = await prisma.audienceContact.findUnique({ where: { id: r.id } });
    if (exists) { skipped++; continue; }
    await prisma.audienceContact.create({
      data: { id: r.id, audienceId: r.audienceId, phone: r.phone, name: r.name, createdAt: r.createdAt },
    });
    created++;
  }
  log(`   ✅  ${created} créé(s), ${skipped} déjà présent(s)`);
}

// ─── Step 6 – SmsCampaign ↔ Audience join ────────────────────────────────────

async function migrateCampaignAudienceJoin() {
  // Prisma generates an implicit join table "_AudienceToSmsCampaign" (A=audienceId, B=campaignId)
  const rows = await query<{ A: string; B: string }>(
    `SELECT "A", "B" FROM "_AudienceToSmsCampaign"`
  );
  log(`\n🔗 Campaign-Audience joins : ${fmt(rows.length)} trouvés`);

  if (isDryRun) { dryLog(`Connecterait ${rows.length} relation(s)`); return; }

  let created = 0; let skipped = 0;
  for (const r of rows) {
    try {
      await prisma.audience.update({
        where: { id: r.A },
        data: { campaigns: { connect: { id: r.B } } },
      });
      created++;
    } catch {
      skipped++;
    }
  }
  log(`   ✅  ${created} créé(s), ${skipped} ignoré(s)`);
}

// ─── Step 7 – PromoCodes ─────────────────────────────────────────────────────

async function migratePromoCodes() {
  const rows = await query<{
    id: string; code: string; label: string | null; recipientNote: string | null;
    discountType: string; discountValue: number; maxDiscountAmount: number | null;
    minCartAmount: number | null; maxUses: number | null; currentUses: number;
    expiryDate: Date | null; isActive: boolean; campaignId: string | null;
    createdAt: Date; updatedAt: Date;
  }>(`SELECT * FROM "PromoCode"`);
  log(`\n🎟️  PromoCodes : ${fmt(rows.length)} trouvés`);

  if (isDryRun) { dryLog(`Créerait ${rows.length} code(s)`); return; }

  let created = 0; let skipped = 0;
  for (const r of rows) {
    const exists = await prisma.promoCode.findUnique({ where: { id: r.id } });
    if (exists) { skipped++; continue; }
    await prisma.promoCode.create({
      data: {
        id: r.id, code: r.code, label: r.label, recipientNote: r.recipientNote,
        discountType: r.discountType as never, discountValue: r.discountValue,
        maxDiscountAmount: r.maxDiscountAmount, minCartAmount: r.minCartAmount,
        maxUses: r.maxUses, currentUses: r.currentUses,
        expiryDate: r.expiryDate, isActive: r.isActive,
        applicableProductTypes: [],
        campaignId: r.campaignId,
        createdAt: r.createdAt, updatedAt: r.updatedAt,
      },
    });
    created++;
  }
  log(`   ✅  ${created} créé(s), ${skipped} déjà présent(s)`);
}

// ─── Step 8 – Pricing tables ─────────────────────────────────────────────────

async function migratePricing() {
  // BaptemeCategoryPrice
  {
    const rows = await query<{
      id: string; category: string; price: number; createdAt: Date; updatedAt: Date;
    }>(`SELECT * FROM "BaptemeCategoryPrice"`);
    log(`\n💶 BaptemeCategoryPrices : ${fmt(rows.length)} trouvés`);
    if (!isDryRun) {
      let created = 0;
      for (const r of rows) {
        // Upsert sur category (clé métier unique) — l'id de la seed peut différer
        await prisma.baptemeCategoryPrice.upsert({
          where: { category: r.category as never },
          create: { id: r.id, category: r.category as never, price: r.price, createdAt: r.createdAt, updatedAt: r.updatedAt },
          update: { price: r.price, updatedAt: r.updatedAt },
        });
        created++;
      }
      log(`   ✅  ${created} traité(s)`);
    } else { dryLog(`Traiterait ${rows.length}`); }
  }

  // VideoOptionPrice — pas de clé unique métier → upsert sur id, sinon skip
  {
    const rows = await query<{
      id: string; price: number; createdAt: Date; updatedAt: Date;
    }>(`SELECT * FROM "VideoOptionPrice"`);
    log(`\n🎥 VideoOptionPrices : ${fmt(rows.length)} trouvés`);
    if (!isDryRun) {
      for (const r of rows) {
        const existing = await prisma.videoOptionPrice.findFirst();
        if (existing) {
          await prisma.videoOptionPrice.update({ where: { id: existing.id }, data: { price: r.price } });
        } else {
          await prisma.videoOptionPrice.create({
            data: { id: r.id, price: r.price, createdAt: r.createdAt, updatedAt: r.updatedAt },
          });
        }
      }
      log(`   ✅  ${rows.length} traité(s)`);
    } else { dryLog(`Traiterait ${rows.length}`); }
  }

  // BaptemeDepositPrice — même logique (singleton)
  {
    const rows = await query<{
      id: string; price: number; createdAt: Date; updatedAt: Date;
    }>(`SELECT * FROM "BaptemeDepositPrice"`);
    log(`\n💰 BaptemeDepositPrices : ${fmt(rows.length)} trouvés`);
    if (!isDryRun) {
      for (const r of rows) {
        const existing = await prisma.baptemeDepositPrice.findFirst();
        if (existing) {
          await prisma.baptemeDepositPrice.update({ where: { id: existing.id }, data: { price: r.price } });
        } else {
          await prisma.baptemeDepositPrice.create({
            data: { id: r.id, price: r.price, createdAt: r.createdAt, updatedAt: r.updatedAt },
          });
        }
      }
      log(`   ✅  ${rows.length} traité(s)`);
    } else { dryLog(`Traiterait ${rows.length}`); }
  }

  // StageBasePrice — upsert sur stageType (clé métier unique)
  {
    const rows = await query<{
      id: string; stageType: string; price: number; createdAt: Date; updatedAt: Date;
    }>(`SELECT * FROM "StageBasePrice"`);
    log(`\n🏔️  StageBasePrices : ${fmt(rows.length)} trouvés`);
    if (!isDryRun) {
      for (const r of rows) {
        await prisma.stageBasePrice.upsert({
          where: { stageType: r.stageType as never },
          create: { id: r.id, stageType: r.stageType as never, price: r.price, createdAt: r.createdAt, updatedAt: r.updatedAt },
          update: { price: r.price, updatedAt: r.updatedAt },
        });
      }
      log(`   ✅  ${rows.length} traité(s)`);
    } else { dryLog(`Traiterait ${rows.length}`); }
  }
}

// ─── Step 9 – TopBars ────────────────────────────────────────────────────────

async function migrateTopBars() {
  const rows = await query<{
    id: string; isActive: boolean; title: string; secondaryText: string | null;
    ctaTitle: string | null; ctaLink: string | null; ctaIsFull: boolean;
    ctaIsExternal: boolean; createdAt: Date; updatedAt: Date;
  }>(`SELECT * FROM "TopBar"`);
  log(`\n📣 TopBars : ${fmt(rows.length)} trouvés`);

  if (isDryRun) { dryLog(`Créerait ${rows.length}`); return; }

  let created = 0;
  for (const r of rows) {
    await prisma.topBar.upsert({
      where: { id: r.id },
      create: {
        id: r.id, isActive: r.isActive, title: r.title,
        secondaryText: r.secondaryText, ctaTitle: r.ctaTitle, ctaLink: r.ctaLink,
        ctaIsFull: r.ctaIsFull, ctaIsExternal: r.ctaIsExternal,
        createdAt: r.createdAt, updatedAt: r.updatedAt,
      },
      update: {},
    });
    created++;
  }
  log(`   ✅  ${created} traité(s)`);
}

// ─── Step 10 – Stages ────────────────────────────────────────────────────────

async function migrateStages() {
  // Note: old schema has "allTimeHighPrice" — we drop it; new schema has promotionOriginalPrice (nullable)
  const rows = await query<{
    id: string; startDate: Date; duration: number; places: number;
    price: number; acomptePrice: number; type: string;
    createdAt: Date; updatedAt: Date;
    // allTimeHighPrice exists in old but is dropped
  }>(
    `SELECT id, "startDate", duration, places, price, "acomptePrice", type, "createdAt", "updatedAt" FROM "Stage"`
  );
  log(`\n⛰️  Stages : ${fmt(rows.length)} trouvés`);

  if (isDryRun) { dryLog(`Créerait ${rows.length} stage(s)`); return; }

  let created = 0; let skipped = 0;
  for (const r of rows) {
    const exists = await prisma.stage.findUnique({ where: { id: r.id } });
    if (exists) { skipped++; continue; }
    await prisma.stage.create({
      data: {
        id: r.id, startDate: r.startDate, duration: r.duration,
        places: r.places, price: r.price, acomptePrice: r.acomptePrice,
        type: r.type as never,
        // promotionOriginalPrice, promotionEndDate, promotionReason → null (new fields)
        createdAt: r.createdAt, updatedAt: r.updatedAt,
      },
    });
    created++;
  }
  log(`   ✅  ${created} créé(s), ${skipped} déjà présent(s)`);
  log(`   ℹ️   allTimeHighPrice supprimé (non présent dans le nouveau schéma)`);
}

// ─── Step 11 – Baptemes ──────────────────────────────────────────────────────

async function migrateBaptemes() {
  // Old schema had date @unique — new schema doesn't (just data, no constraint issue in migration)
  const rows = await query<{
    id: string; date: Date; duration: number; places: number;
    categories: string[]; acomptePrice: number; createdAt: Date; updatedAt: Date;
  }>(`SELECT id, date, duration, places, categories, "acomptePrice", "createdAt", "updatedAt" FROM "Bapteme"`);
  log(`\n🪂 Baptemes : ${fmt(rows.length)} trouvés`);

  if (isDryRun) { dryLog(`Créerait ${rows.length} baptême(s)`); return; }

  let created = 0; let skipped = 0;
  for (const r of rows) {
    const exists = await prisma.bapteme.findUnique({ where: { id: r.id } });
    if (exists) { skipped++; continue; }
    await prisma.bapteme.create({
      data: {
        id: r.id, date: r.date, duration: r.duration,
        places: r.places,
        categories: { set: parsePgArray(r.categories) as never[] },
        acomptePrice: r.acomptePrice,
        createdAt: r.createdAt, updatedAt: r.updatedAt,
      },
    });
    created++;
  }
  log(`   ✅  ${created} créé(s), ${skipped} déjà présent(s)`);
}

// ─── Step 12 – StageMoniteurs ────────────────────────────────────────────────

async function migrateStageMoniteurs() {
  const rows = await query<{
    id: string; stageId: string; moniteurId: string; createdAt: Date;
  }>(`SELECT id, "stageId", "moniteurId", "createdAt" FROM "StageMoniteur"`);
  log(`\n🧑‍✈️  StageMoniteurs : ${fmt(rows.length)} trouvés`);

  if (isDryRun) { dryLog(`Créerait ${rows.length}`); return; }

  let created = 0; let skipped = 0;
  for (const r of rows) {
    const exists = await prisma.stageMoniteur.findUnique({ where: { id: r.id } });
    if (exists) { skipped++; continue; }
    try {
      const resolvedMoniteurId = userIdMap.get(r.moniteurId) ?? r.moniteurId;
      await prisma.stageMoniteur.create({
        data: { id: r.id, stageId: r.stageId, moniteurId: resolvedMoniteurId, createdAt: r.createdAt },
      });
      created++;
    } catch (e) {
      console.warn(`   ⚠️  StageMoniteur ${r.id} ignoré: ${(e as Error).message}`);
    }
  }
  log(`   ✅  ${created} créé(s), ${skipped} déjà présent(s)`);
}

// ─── Step 13 – BaptemeMoniteurs ──────────────────────────────────────────────

async function migrateBaptemeMoniteurs() {
  const rows = await query<{
    id: string; baptemeId: string; moniteurId: string; createdAt: Date;
  }>(`SELECT id, "baptemeId", "moniteurId", "createdAt" FROM "BaptemeMoniteur"`);
  log(`\n🧑‍✈️  BaptemeMoniteurs : ${fmt(rows.length)} trouvés`);

  if (isDryRun) { dryLog(`Créerait ${rows.length}`); return; }

  let created = 0; let skipped = 0;
  for (const r of rows) {
    const exists = await prisma.baptemeMoniteur.findUnique({ where: { id: r.id } });
    if (exists) { skipped++; continue; }
    try {
      const resolvedMoniteurId = userIdMap.get(r.moniteurId) ?? r.moniteurId;
      await prisma.baptemeMoniteur.create({
        data: { id: r.id, baptemeId: r.baptemeId, moniteurId: resolvedMoniteurId, createdAt: r.createdAt },
      });
      created++;
    } catch (e) {
      console.warn(`   ⚠️  BaptemeMoniteur ${r.id} ignoré: ${(e as Error).message}`);
    }
  }
  log(`   ✅  ${created} créé(s), ${skipped} déjà présent(s)`);
}

// ─── Step 14 – Clients ───────────────────────────────────────────────────────

async function migrateClients() {
  // Old schema: email String? @unique (nullable) — new: email String @unique (required)
  const rows = await query<{
    id: string; firstName: string; lastName: string; email: string | null;
    phone: string; address: string; postalCode: string; city: string; country: string;
    createdAt: Date; updatedAt: Date;
  }>(`SELECT * FROM "Client"`);
  log(`\n🧑 Clients : ${fmt(rows.length)} trouvés`);

  const nullEmailCount = rows.filter((r) => !r.email).length;
  if (nullEmailCount > 0) {
    log(`   ⚠️  ${nullEmailCount} client(s) sans email → email de remplacement généré (MIGRATION_NO_EMAIL_<id>@migration.local)`);
  }

  if (isDryRun) { dryLog(`Créerait ${rows.length} client(s)`); return; }

  let created = 0; let skipped = 0;
  for (const r of rows) {
    const exists = await prisma.client.findUnique({ where: { id: r.id } });
    if (exists) { skipped++; continue; }

    // Handle nullable email — use placeholder if missing
    const email = r.email ?? `MIGRATION_NO_EMAIL_${r.id}@migration.local`;

    await prisma.client.create({
      data: {
        id: r.id, firstName: r.firstName, lastName: r.lastName,
        email, phone: r.phone, address: r.address,
        postalCode: r.postalCode, city: r.city, country: r.country,
        // rgpdConsentAt / rgpdConsentIp → null (new fields, not in old schema)
        createdAt: r.createdAt, updatedAt: r.updatedAt,
      },
    });
    created++;
  }
  log(`   ✅  ${created} créé(s), ${skipped} déjà présent(s)`);
}

// ─── Step 15 – Stagiaires ────────────────────────────────────────────────────

async function migrateStagiaires() {
  const rows = await query<{
    id: string; firstName: string; lastName: string; email: string;
    phone: string; birthDate: Date | null; weight: number; height: number;
    createdAt: Date; updatedAt: Date;
  }>(`SELECT * FROM "Stagiaire"`);
  log(`\n🎒 Stagiaires : ${fmt(rows.length)} trouvés`);

  if (isDryRun) { dryLog(`Créerait ${rows.length}`); return; }

  let created = 0; let skipped = 0;
  for (const r of rows) {
    const exists = await prisma.stagiaire.findUnique({ where: { id: r.id } });
    if (exists) { skipped++; continue; }
    await prisma.stagiaire.create({
      data: {
        id: r.id, firstName: r.firstName, lastName: r.lastName,
        email: r.email, phone: r.phone, birthDate: r.birthDate,
        weight: r.weight, height: r.height,
        // rgpdConsentAt / rgpdConsentIp → null (new fields)
        createdAt: r.createdAt, updatedAt: r.updatedAt,
      },
    });
    created++;
  }
  log(`   ✅  ${created} créé(s), ${skipped} déjà présent(s)`);
}

// ─── Step 16 – GiftVouchers ──────────────────────────────────────────────────

async function migrateGiftVouchers() {
  const rows = await query<{
    id: string; code: string; productType: string; stageCategory: string | null;
    baptemeCategory: string | null; purchasePrice: number; isUsed: boolean;
    usedAt: Date | null; recipientName: string; recipientEmail: string;
    clientId: string | null; expiryDate: Date; reservedBySessionId: string | null;
    reservedAt: Date | null; createdAt: Date; updatedAt: Date;
  }>(`SELECT * FROM "GiftVoucher"`);
  log(`\n🎁 GiftVouchers : ${fmt(rows.length)} trouvés`);

  if (isDryRun) { dryLog(`Créerait ${rows.length}`); return; }

  let created = 0; let skipped = 0;
  for (const r of rows) {
    const exists = await prisma.giftVoucher.findUnique({ where: { id: r.id } });
    if (exists) { skipped++; continue; }
    await prisma.giftVoucher.create({
      data: {
        id: r.id, code: r.code,
        productType: r.productType as never,
        stageCategory: r.stageCategory as never ?? null,
        baptemeCategory: r.baptemeCategory as never ?? null,
        purchasePrice: r.purchasePrice, isUsed: r.isUsed, usedAt: r.usedAt,
        recipientName: r.recipientName, recipientEmail: r.recipientEmail,
        clientId: r.clientId, expiryDate: r.expiryDate,
        reservedBySessionId: r.reservedBySessionId,
        reservedAt: r.reservedAt,
        createdAt: r.createdAt, updatedAt: r.updatedAt,
      },
    });
    created++;
  }
  log(`   ✅  ${created} créé(s), ${skipped} déjà présent(s)`);
}

// ─── Step 17 – Orders ────────────────────────────────────────────────────────

async function migrateOrders() {
  const rows = await query<{
    id: string; orderNumber: string; status: string;
    subtotal: number; discountAmount: number; totalAmount: number;
    promoCodeId: string | null; promoDiscountAmount: number;
    clientId: string | null; createdAt: Date; updatedAt: Date;
  }>(`SELECT * FROM "Order"`);
  log(`\n📦 Orders : ${fmt(rows.length)} trouvées`);

  if (isDryRun) { dryLog(`Créerait ${rows.length}`); return; }

  let created = 0; let skipped = 0;
  for (const r of rows) {
    const exists = await prisma.order.findUnique({ where: { id: r.id } });
    if (exists) { skipped++; continue; }
    await prisma.order.create({
      data: {
        id: r.id, orderNumber: r.orderNumber, status: r.status as never,
        subtotal: r.subtotal, discountAmount: r.discountAmount, totalAmount: r.totalAmount,
        promoCodeId: r.promoCodeId, promoDiscountAmount: r.promoDiscountAmount,
        clientId: r.clientId,
        createdAt: r.createdAt, updatedAt: r.updatedAt,
      },
    });
    created++;
  }
  log(`   ✅  ${created} créée(s), ${skipped} déjà présente(s)`);
}

// ─── Step 18 – StageBookings ─────────────────────────────────────────────────

async function migrateStageBookings() {
  // Old schema has no shortCode — new schema has shortCode String? @unique
  const rows = await query<{
    id: string; type: string; stageId: string; stagiaireId: string;
    createdAt: Date; updatedAt: Date;
  }>(`SELECT id, type, "stageId", "stagiaireId", "createdAt", "updatedAt" FROM "StageBooking"`);
  log(`\n📅 StageBookings : ${fmt(rows.length)} trouvés`);

  if (isDryRun) { dryLog(`Créerait ${rows.length}`); return; }

  let created = 0; let skipped = 0;
  for (const r of rows) {
    const exists = await prisma.stageBooking.findUnique({ where: { id: r.id } });
    if (exists) { skipped++; continue; }
    await prisma.stageBooking.create({
      data: {
        id: r.id, type: r.type as never,
        stageId: r.stageId, stagiaireId: r.stagiaireId,
        // shortCode → null (new field, not in old data)
        createdAt: r.createdAt, updatedAt: r.updatedAt,
      },
    });
    created++;
  }
  log(`   ✅  ${created} créé(s), ${skipped} déjà présent(s)`);
}

// ─── Step 19 – BaptemeBookings ───────────────────────────────────────────────

async function migrateBaptemeBookings() {
  const rows = await query<{
    id: string; baptemeId: string; stagiaireId: string;
    category: string; hasVideo: boolean; createdAt: Date; updatedAt: Date;
  }>(`SELECT id, "baptemeId", "stagiaireId", category, "hasVideo", "createdAt", "updatedAt" FROM "BaptemeBooking"`);
  log(`\n🪂 BaptemeBookings : ${fmt(rows.length)} trouvés`);

  if (isDryRun) { dryLog(`Créerait ${rows.length}`); return; }

  let created = 0; let skipped = 0;
  for (const r of rows) {
    const exists = await prisma.baptemeBooking.findUnique({ where: { id: r.id } });
    if (exists) { skipped++; continue; }
    await prisma.baptemeBooking.create({
      data: {
        id: r.id, baptemeId: r.baptemeId, stagiaireId: r.stagiaireId,
        category: r.category as never, hasVideo: r.hasVideo,
        // shortCode → null (new field)
        createdAt: r.createdAt, updatedAt: r.updatedAt,
      },
    });
    created++;
  }
  log(`   ✅  ${created} créé(s), ${skipped} déjà présent(s)`);
}

// ─── Step 20 – OrderItems ────────────────────────────────────────────────────

async function migrateOrderItems() {
  const rows = await query<{
    id: string; orderId: string; type: string; quantity: number;
    unitPrice: number; totalPrice: number;
    stageId: string | null; baptemeId: string | null;
    giftVoucherAmount: number | null;
    generatedGiftVoucherId: string | null; usedGiftVoucherId: string | null;
    participantData: unknown;
    depositAmount: number | null; remainingAmount: number | null;
    isFullyPaid: boolean; finalPaymentDate: Date | null; finalPaymentNote: string | null;
    discountAmount: number; effectiveDepositAmount: number | null;
    effectiveRemainingAmount: number | null;
    stageBookingId: string | null; baptemeBookingId: string | null;
    createdAt: Date;
  }>(`SELECT * FROM "OrderItem"`);
  log(`\n🛒 OrderItems : ${fmt(rows.length)} trouvés`);

  if (isDryRun) { dryLog(`Créerait ${rows.length}`); return; }

  let created = 0; let skipped = 0;
  for (const r of rows) {
    const exists = await prisma.orderItem.findUnique({ where: { id: r.id } });
    if (exists) { skipped++; continue; }
    await prisma.orderItem.create({
      data: {
        id: r.id, orderId: r.orderId, type: r.type as never,
        quantity: r.quantity, unitPrice: r.unitPrice, totalPrice: r.totalPrice,
        stageId: r.stageId, baptemeId: r.baptemeId,
        giftVoucherAmount: r.giftVoucherAmount,
        generatedGiftVoucherId: r.generatedGiftVoucherId,
        usedGiftVoucherId: r.usedGiftVoucherId,
        participantData: r.participantData as never,
        depositAmount: r.depositAmount, remainingAmount: r.remainingAmount,
        isFullyPaid: r.isFullyPaid,
        finalPaymentDate: r.finalPaymentDate, finalPaymentNote: r.finalPaymentNote,
        discountAmount: r.discountAmount,
        effectiveDepositAmount: r.effectiveDepositAmount,
        effectiveRemainingAmount: r.effectiveRemainingAmount,
        stageBookingId: r.stageBookingId, baptemeBookingId: r.baptemeBookingId,
        createdAt: r.createdAt,
      },
    });
    created++;
  }
  log(`   ✅  ${created} créé(s), ${skipped} déjà présent(s)`);
}

// ─── Step 21 – PromoCodeUsages ───────────────────────────────────────────────

async function migratePromoCodeUsages() {
  const rows = await query<{
    id: string; promoCodeId: string; orderId: string;
    discountApplied: number; createdAt: Date;
  }>(`SELECT * FROM "PromoCodeUsage"`);
  log(`\n🎫 PromoCodeUsages : ${fmt(rows.length)} trouvés`);

  if (isDryRun) { dryLog(`Créerait ${rows.length}`); return; }

  let created = 0; let skipped = 0;
  for (const r of rows) {
    const exists = await prisma.promoCodeUsage.findUnique({ where: { id: r.id } });
    if (exists) { skipped++; continue; }
    await prisma.promoCodeUsage.create({
      data: {
        id: r.id, promoCodeId: r.promoCodeId, orderId: r.orderId,
        discountApplied: r.discountApplied, createdAt: r.createdAt,
      },
    });
    created++;
  }
  log(`   ✅  ${created} créé(s), ${skipped} déjà présent(s)`);
}

// ─── Step 22 – Payments ──────────────────────────────────────────────────────

async function migratePayments() {
  const rows = await query<{
    id: string; orderId: string; paymentType: string;
    stripePaymentIntentId: string | null; status: string;
    amount: number; currency: string; stripeMetadata: unknown;
    isManual: boolean; manualPaymentMethod: string | null;
    manualPaymentNote: string | null; recordedBy: string | null;
    createdAt: Date; updatedAt: Date;
  }>(`SELECT * FROM "Payment"`);
  log(`\n💳 Payments : ${fmt(rows.length)} trouvés`);

  if (isDryRun) { dryLog(`Créerait ${rows.length}`); return; }

  let created = 0; let skipped = 0;
  for (const r of rows) {
    const exists = await prisma.payment.findUnique({ where: { id: r.id } });
    if (exists) { skipped++; continue; }
    await prisma.payment.create({
      data: {
        id: r.id, orderId: r.orderId,
        paymentType: r.paymentType as never,
        stripePaymentIntentId: r.stripePaymentIntentId,
        status: r.status as never, amount: r.amount, currency: r.currency,
        stripeMetadata: r.stripeMetadata as never ?? undefined,
        isManual: r.isManual,
        manualPaymentMethod: r.manualPaymentMethod as never ?? null,
        manualPaymentNote: r.manualPaymentNote,
        recordedBy: r.recordedBy,
        createdAt: r.createdAt, updatedAt: r.updatedAt,
      },
    });
    created++;
  }
  log(`   ✅  ${created} créé(s), ${skipped} déjà présent(s)`);
}

// ─── Step 23 – PaymentAllocations ────────────────────────────────────────────

async function migratePaymentAllocations() {
  const rows = await query<{
    id: string; paymentId: string; orderItemId: string;
    allocatedAmount: number; createdAt: Date;
  }>(`SELECT * FROM "PaymentAllocation"`);
  log(`\n🔀 PaymentAllocations : ${fmt(rows.length)} trouvées`);

  if (isDryRun) { dryLog(`Créerait ${rows.length}`); return; }

  let created = 0; let skipped = 0;
  for (const r of rows) {
    const exists = await prisma.paymentAllocation.findUnique({ where: { id: r.id } });
    if (exists) { skipped++; continue; }
    await prisma.paymentAllocation.create({
      data: {
        id: r.id, paymentId: r.paymentId, orderItemId: r.orderItemId,
        allocatedAmount: r.allocatedAmount, createdAt: r.createdAt,
      },
    });
    created++;
  }
  log(`   ✅  ${created} créée(s), ${skipped} déjà présente(s)`);
}

// ─── Step 24 – ProcessedWebhookEvents ────────────────────────────────────────

async function migrateProcessedWebhookEvents() {
  const rows = await query<{
    id: string; stripeEventId: string; eventType: string; processedAt: Date;
  }>(`SELECT * FROM "ProcessedWebhookEvent"`);
  log(`\n🔔 ProcessedWebhookEvents : ${fmt(rows.length)} trouvés`);

  if (isDryRun) { dryLog(`Créerait ${rows.length}`); return; }

  let created = 0; let skipped = 0;
  for (const r of rows) {
    const exists = await prisma.processedWebhookEvent.findUnique({ where: { id: r.id } });
    if (exists) { skipped++; continue; }
    await prisma.processedWebhookEvent.create({
      data: {
        id: r.id, stripeEventId: r.stripeEventId, eventType: r.eventType,
        // orderId → null (new field not in old schema)
        processedAt: r.processedAt,
      },
    });
    created++;
  }
  log(`   ✅  ${created} créé(s), ${skipped} déjà présent(s)`);
}

// ─── Step 25 – SmsCampaignLogs ───────────────────────────────────────────────

async function migrateSmsCampaignLogs() {
  const rows = await query<{
    id: string; campaignId: string; recipientPhone: string; recipientName: string | null;
    messageSid: string | null; status: string; errorMessage: string | null;
    sentAt: Date | null; createdAt: Date; updatedAt: Date;
  }>(`SELECT * FROM "SmsCampaignLog"`);
  log(`\n📨 SmsCampaignLogs : ${fmt(rows.length)} trouvés`);

  if (isDryRun) { dryLog(`Créerait ${rows.length}`); return; }

  let created = 0; let skipped = 0;
  for (const r of rows) {
    const exists = await prisma.smsCampaignLog.findUnique({ where: { id: r.id } });
    if (exists) { skipped++; continue; }
    await prisma.smsCampaignLog.create({
      data: {
        id: r.id, campaignId: r.campaignId,
        recipientPhone: r.recipientPhone, recipientName: r.recipientName,
        messageSid: r.messageSid, status: r.status as never,
        errorMessage: r.errorMessage, sentAt: r.sentAt,
        createdAt: r.createdAt, updatedAt: r.updatedAt,
      },
    });
    created++;
  }
  log(`   ✅  ${created} créé(s), ${skipped} déjà présent(s)`);
}

// ─── Verification ─────────────────────────────────────────────────────────────

async function verifyMigration() {
  log(`\n${"─".repeat(60)}`);
  log(`📊 VÉRIFICATION FINALE`);
  log(`${"─".repeat(60)}`);

  const tables = [
    { label: "Users",                 old: `SELECT COUNT(*) FROM "User"`,                    new: () => prisma.user.count() },
    { label: "Stages",                old: `SELECT COUNT(*) FROM "Stage"`,                   new: () => prisma.stage.count() },
    { label: "Baptemes",              old: `SELECT COUNT(*) FROM "Bapteme"`,                  new: () => prisma.bapteme.count() },
    { label: "StageMoniteurs",        old: `SELECT COUNT(*) FROM "StageMoniteur"`,            new: () => prisma.stageMoniteur.count() },
    { label: "BaptemeMoniteurs",      old: `SELECT COUNT(*) FROM "BaptemeMoniteur"`,          new: () => prisma.baptemeMoniteur.count() },
    { label: "Clients",               old: `SELECT COUNT(*) FROM "Client"`,                  new: () => prisma.client.count() },
    { label: "Stagiaires",            old: `SELECT COUNT(*) FROM "Stagiaire"`,               new: () => prisma.stagiaire.count() },
    { label: "GiftVouchers",          old: `SELECT COUNT(*) FROM "GiftVoucher"`,             new: () => prisma.giftVoucher.count() },
    { label: "Orders",                old: `SELECT COUNT(*) FROM "Order"`,                   new: () => prisma.order.count() },
    { label: "OrderItems",            old: `SELECT COUNT(*) FROM "OrderItem"`,               new: () => prisma.orderItem.count() },
    { label: "StageBookings",         old: `SELECT COUNT(*) FROM "StageBooking"`,            new: () => prisma.stageBooking.count() },
    { label: "BaptemeBookings",       old: `SELECT COUNT(*) FROM "BaptemeBooking"`,          new: () => prisma.baptemeBooking.count() },
    { label: "Payments",              old: `SELECT COUNT(*) FROM "Payment"`,                 new: () => prisma.payment.count() },
    { label: "PaymentAllocations",    old: `SELECT COUNT(*) FROM "PaymentAllocation"`,       new: () => prisma.paymentAllocation.count() },
    { label: "PromoCodes",            old: `SELECT COUNT(*) FROM "PromoCode"`,               new: () => prisma.promoCode.count() },
    { label: "PromoCodeUsages",       old: `SELECT COUNT(*) FROM "PromoCodeUsage"`,          new: () => prisma.promoCodeUsage.count() },
    { label: "ProcessedWebhooks",     old: `SELECT COUNT(*) FROM "ProcessedWebhookEvent"`,  new: () => prisma.processedWebhookEvent.count() },
    { label: "SmsCampaigns",          old: `SELECT COUNT(*) FROM "SmsCampaign"`,             new: () => prisma.smsCampaign.count() },
    { label: "SmsCampaignLogs",       old: `SELECT COUNT(*) FROM "SmsCampaignLog"`,          new: () => prisma.smsCampaignLog.count() },
    { label: "Audiences",             old: `SELECT COUNT(*) FROM "Audience"`,                new: () => prisma.audience.count() },
    { label: "AudienceRules",         old: `SELECT COUNT(*) FROM "AudienceRule"`,            new: () => prisma.audienceRule.count() },
    { label: "AudienceContacts",      old: `SELECT COUNT(*) FROM "AudienceContact"`,         new: () => prisma.audienceContact.count() },
  ] as const;

  let allMatch = true;
  for (const t of tables) {
    const oldRes = await oldDb.query(t.old);
    const oldCount = parseInt(oldRes.rows[0].count, 10);
    const newCount = await t.new();
    const match = oldCount === newCount;
    if (!match) allMatch = false;
    const icon = match ? "✅" : "❌";
    log(`  ${icon}  ${t.label.padEnd(22)} old=${String(oldCount).padStart(5)}  new=${String(newCount).padStart(5)}${match ? "" : "  ← ÉCART !"}`);
  }

  log(`${"─".repeat(60)}`);
  if (allMatch) {
    log(`🎉 Migration complète — tous les comptes correspondent !`);
  } else {
    log(`⚠️  Certains comptes ne correspondent pas. Vérifier les logs ci-dessus.`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const mode = isDryRun ? "DRY-RUN (aucune écriture)" : "MIGRATION RÉELLE";
  log(`\n${"═".repeat(60)}`);
  log(`🚀 Migration ancienne BDD → nouvelle BDD`);
  log(`   Mode : ${mode}`);
  log(`   Heure : ${new Date().toLocaleString("fr-FR")}`);
  if (!isDryRun) {
    log(`   ⚠️   Les utilisateurs migrés auront le mot de passe temporaire : "${TEMP_PASSWORD}"`);
    log(`   ⚠️   Chaque utilisateur doit le changer après sa première connexion`);
  }
  log(`${"═".repeat(60)}`);

  // Test old DB connection
  try {
    await oldDb.query("SELECT 1");
    log(`\n✅ Connexion à l'ancienne BDD OK`);
  } catch (e) {
    console.error(`❌ Impossible de se connecter à l'ancienne BDD : ${(e as Error).message}`);
    process.exit(1);
  }

  // Test new DB connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    log(`✅ Connexion à la nouvelle BDD OK`);
  } catch (e) {
    console.error(`❌ Impossible de se connecter à la nouvelle BDD : ${(e as Error).message}`);
    process.exit(1);
  }

  const start = Date.now();

  await migrateUsers();
  await migrateSmsCampaigns();
  await migrateAudiences();
  await migrateAudienceRules();
  await migrateAudienceContacts();
  await migrateCampaignAudienceJoin();
  await migratePromoCodes();
  await migratePricing();
  await migrateTopBars();
  await migrateStages();
  await migrateBaptemes();
  await migrateStageMoniteurs();
  await migrateBaptemeMoniteurs();
  await migrateClients();
  await migrateStagiaires();
  await migrateGiftVouchers();
  await migrateOrders();
  await migrateStageBookings();
  await migrateBaptemeBookings();
  await migrateOrderItems();
  await migratePromoCodeUsages();
  await migratePayments();
  await migratePaymentAllocations();
  await migrateProcessedWebhookEvents();
  await migrateSmsCampaignLogs();

  if (!isDryRun) {
    await verifyMigration();
  } else {
    log(`\n⏭️  Vérification ignorée (mode dry-run)`);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  log(`\n⏱️  Terminé en ${elapsed}s\n`);

  await oldDb.end();
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Erreur fatale :", e);
  process.exit(1);
});
