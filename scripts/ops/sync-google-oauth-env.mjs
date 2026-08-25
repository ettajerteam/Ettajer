#!/usr/bin/env node
/**
 * Copy Google OAuth web client credentials into .env for local login/signup.
 * Source: secrets/youtube-oauth.json (same OAuth client as production).
 *
 * Usage: node scripts/ops/sync-google-oauth-env.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const oauthPath = path.join(ROOT, "secrets", "youtube-oauth.json");
const envPath = path.join(ROOT, ".env");

if (!fs.existsSync(oauthPath)) {
  console.error(
    "Missing secrets/youtube-oauth.json — copy secrets/youtube-oauth.json.example and paste your Google OAuth web client credentials.",
  );
  process.exit(1);
}

const oauth = JSON.parse(fs.readFileSync(oauthPath, "utf8"));
const clientId = String(oauth.client_id || "").trim();
const clientSecret = String(oauth.client_secret || "").trim();

if (!clientId || !clientSecret) {
  console.error("secrets/youtube-oauth.json must include client_id and client_secret");
  process.exit(1);
}

let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

function upsert(key, value) {
  const re = new RegExp(`^${key}=.*$`, "m");
  const line = `${key}="${value}"`;
  if (re.test(env)) env = env.replace(re, line);
  else env = `${env.trimEnd()}\n${line}\n`;
}

upsert("GOOGLE_CLIENT_ID", clientId);
upsert("GOOGLE_CLIENT_SECRET", clientSecret);
if (!env.endsWith("\n")) env += "\n";
fs.writeFileSync(envPath, env);
console.log("Updated .env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET");
console.log("Restart `npm run dev` so Continue with Google appears on /login.");
