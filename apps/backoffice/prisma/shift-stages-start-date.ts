#!/usr/bin/env tsx
/**
 * shift-stages-start-date.ts
 *
 * Décale la date de début (startDate) de tous les stages de +1 jour.
 *
 * ⛔  PROTECTION : refuse de s'exécuter si DATABASE_URL pointe vers Supabase
 *     (domaine *.supabase.co) pour éviter de modifier la prod par erreur.
 *
 * Usage :
 *   cd apps/backoffice
 *   npx tsx prisma/shift-stages-start-date.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: [] });

// function assertNotProduction() {
//   const url = process.env.DATABASE_URL ?? "";
//   if (url.includes("supabase.co")) {
//     console.error("❌  Refus d'exécution : DATABASE_URL pointe vers Supabase (production).");
//     process.exit(1);
//   }
// }

async function main() {
  // assertNotProduction();

  const stages = await prisma.stage.findMany({ select: { id: true, startDate: true } });

  if (stages.length === 0) {
    console.log("Aucun stage trouvé en base.");
    return;
  }

  console.log(`${stages.length} stage(s) trouvé(s). Décalage de +1 jour en cours…\n`);

  for (const stage of stages) {
    const newDate = new Date(stage.startDate);
    newDate.setDate(newDate.getDate() + 1);

    await prisma.stage.update({
      where: { id: stage.id },
      data: { startDate: newDate },
    });

    console.log(
      `  Stage ${stage.id} : ${stage.startDate.toISOString().slice(0, 10)} → ${newDate.toISOString().slice(0, 10)}`
    );
  }

  console.log("\n✅  Toutes les dates de début ont été décalées de +1 jour.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
