#!/usr/bin/env node
/**
 * Pull Vercel environment variables into .env.local for local dev.
 * Next.js loads .env.local over .env — use this to point at production Supabase, etc.
 *
 * Prereqs:
 *   1. npx vercel login   (ettajerteam / team that owns www.ettajer.com)
 *   2. npx vercel link    (select the Ettajer production project)
 *
 * Usage:
 *   node scripts/pull-vercel-env.mjs
 *   node scripts/pull-vercel-env.mjs development
 *   node scripts/pull-vercel-env.mjs production
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const target = process.argv[2] || "development";
const outFile = path.join(ROOT, ".env.local");

console.log(`Pulling Vercel env (${target}) → ${path.basename(outFile)}`);

const childEnv = { ...process.env };
delete childEnv.VERCEL_TOKEN;

const result = spawnSync(
  "npx",
  ["vercel", "env", "pull", outFile, "--environment", target, "--yes"],
  {
    stdio: "inherit",
    cwd: ROOT,
    env: childEnv,
    shell: process.platform === "win32",
  },
);

if (result.status !== 0) {
  console.error("\nFailed. Run: npx vercel login && npx vercel link");
  process.exit(result.status ?? 1);
}

if (!fs.existsSync(outFile)) {
  console.error("vercel env pull did not create .env.local");
  process.exit(1);
}

console.log("\nDone. Restart `npm run dev` to load production env locally.");
console.log("Optional: npm run vercel:env:google  (Google OAuth for localhost login)");
