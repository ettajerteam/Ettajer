#!/usr/bin/env node
/**
 * Set GA4_PROPERTY_ID in .env (local). Then sync with: npm run vercel:env
 * Usage: node scripts/ops/set-ga4-property.mjs 123456789
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const envPath = path.join(ROOT, ".env");
const id = (process.argv[2] || "").trim();

if (!/^\d{6,12}$/.test(id)) {
  console.error("Usage: node scripts/ops/set-ga4-property.mjs <numeric-property-id>");
  console.error("Find it in GA Admin → Property settings (not the Stream ID).");
  process.exit(1);
}

if (!fs.existsSync(envPath)) {
  console.error("Missing .env");
  process.exit(1);
}

let env = fs.readFileSync(envPath, "utf8");
if (/^GA4_PROPERTY_ID=/m.test(env)) {
  env = env.replace(/^GA4_PROPERTY_ID=.*$/m, `GA4_PROPERTY_ID=${id}`);
} else {
  env = env.trimEnd() + `\nGA4_PROPERTY_ID=${id}\n`;
}
fs.writeFileSync(envPath, env);
console.log(`✓ GA4_PROPERTY_ID=${id} written to .env`);
console.log("Next: npm run vercel:env && npm run gcp:verify");
