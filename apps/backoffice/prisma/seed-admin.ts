/**
 * seed-admin.ts
 *
 * Creates the first ADMIN user directly via better-auth server API.
 * Does NOT require the Next.js server to be running.
 *
 * Usage (run once after first migration):
 *   cd apps/backoffice
 *   pnpm seed:admin
 */

// Load .env.local BEFORE importing any modules that use env vars
import { config } from "dotenv";
config({ path: ".env.local" });

import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question: string): Promise<string> =>
  new Promise((resolve) => rl.question(question, resolve));

async function main() {
  // Dynamic imports so env vars are already set when modules initialize
  const { auth } = await import("../src/lib/auth");
  const { default: prisma } = await import("../src/lib/prisma");

  console.log("\n🪂 Serre Chevalier Parapente — Admin Setup\n");

  const name = await ask("Full name: ");
  const email = await ask("Email: ");
  const password = await ask("Password (min 8 chars): ");

  rl.close();

  // 1. Create account via better-auth server API (no HTTP server needed)
  const result = await auth.api.signUpEmail({
    body: { name, email, password },
  });

  if (!result || !result.user) {
    console.error("❌ Sign-up failed");
    process.exit(1);
  }

  // 2. Promote to ADMIN in Prisma
  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });

  console.log(`\n✅ Admin created: ${user.name} (${user.email})`);
  console.log("   You can now log in at http://localhost:3001\n");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
