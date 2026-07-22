/**
 * Sync .env variables to the linked Vercel project.
 * Usage:
 *   1. vercel login   (as the account that owns www.ettajer.com)
 *   2. vercel link    (select the ettajer production project)
 *   3. node scripts/sync-vercel-env.mjs production
 *
 * Optional overrides for production:
 *   node scripts/sync-vercel-env.mjs production --url https://www.ettajer.com
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const ENV_FILE = path.join(ROOT, ".env");

const KEYS = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "NEXT_PUBLIC_SITE_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "SUPPORT_EMAIL",
  "ADMIN_EMAILS",
  "NEXT_PUBLIC_GA_MEASUREMENT_ID",
  "GA4_PROPERTY_ID",
  "SEARCH_CONSOLE_SITE_URL",
  "ETTAJER_LAUNCH_TARGET",
  "UPLOADTHING_TOKEN",
  "UPLOADTHING_APP_ID",
  "VERCEL_TOKEN",
  "VERCEL_PROJECT_ID",
  "VERCEL_TEAM_ID",
];

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Missing ${filePath}`);
    process.exit(1);
  }

  const vars = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function runVercelEnvAdd(key, value, target) {
  const result = spawnSync(
    "vercel",
    ["env", "add", key, target, "--force", "--yes"],
    {
      input: value,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      shell: process.platform === "win32",
    },
  );

  if (result.status !== 0) {
    console.error(`Failed ${key}:`, result.stderr || result.stdout);
    return false;
  }

  console.log(`✓ ${key}`);
  return true;
}

const args = process.argv.slice(2);
const target = args[0] || "production";
const urlFlagIndex = args.indexOf("--url");
const siteUrlOverride = urlFlagIndex >= 0 ? args[urlFlagIndex + 1] : null;

const env = parseEnvFile(ENV_FILE);

if (target === "production") {
  env.NEXTAUTH_URL = siteUrlOverride || "https://www.ettajer.com";
  env.NEXT_PUBLIC_SITE_URL = siteUrlOverride || "https://www.ettajer.com";
}

let ok = 0;
let fail = 0;

for (const key of KEYS) {
  const value = env[key]?.trim();
  if (!value) {
    console.log(`- skip ${key} (empty in .env)`);
    continue;
  }
  if (runVercelEnvAdd(key, value, target)) ok += 1;
  else fail += 1;
}

console.log(`\nDone: ${ok} synced, ${fail} failed, target=${target}`);
if (fail > 0) process.exit(1);
console.log("\nRedeploy production after syncing:");
console.log("  vercel deploy --prod --yes");
