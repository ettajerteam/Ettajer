/**
 * Generate vercel.production.env for bulk import in Vercel Dashboard.
 * Dashboard → Project → Settings → Environment Variables → Import .env
 *
 * Usage: node scripts/generate-vercel-env-file.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const source = path.join(ROOT, ".env");
const output = path.join(ROOT, "vercel.production.env");

const KEYS = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "SUPPORT_EMAIL",
  "ADMIN_EMAILS",
];

function parseEnvFile(filePath) {
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

const env = parseEnvFile(source);
const lines = [
  "# Import this file in Vercel → Settings → Environment Variables → Import .env",
  "# Target: Production (and Preview if you want)",
  "",
  `NEXTAUTH_URL=https://www.ettajer.com`,
  `NEXT_PUBLIC_SITE_URL=https://www.ettajer.com`,
];

for (const key of KEYS) {
  const value = env[key]?.trim();
  if (value) lines.push(`${key}=${value}`);
}

fs.writeFileSync(output, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote ${output}`);
console.log("Upload this file in your teamettajer Vercel project dashboard.");
