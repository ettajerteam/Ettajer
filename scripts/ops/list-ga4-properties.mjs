#!/usr/bin/env node
/** List GA4 accounts/properties accessible to the ops service account */
import fs from "node:fs";
import path from "node:path";
import { GoogleAuth } from "google-auth-library";

const ROOT = path.resolve(import.meta.dirname, "../..");

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    const k = t.slice(0, i);
    let v = t.slice(i + 1);
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv();

const keyFile =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(ROOT, "secrets", "ettajer-ops.json");

const auth = new GoogleAuth({
  keyFile,
  scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
});

const client = await auth.getClient();
const { token } = await client.getAccessToken();

const accountRes = await fetch(
  "https://analyticsadmin.googleapis.com/v1beta/accounts",
  { headers: { Authorization: `Bearer ${token}` } },
);
const accounts = await accountRes.json();
console.log("Accounts:", JSON.stringify(accounts, null, 2));

if (accounts.accounts?.length) {
  for (const account of accounts.accounts) {
    const propRes = await fetch(
      `https://analyticsadmin.googleapis.com/v1beta/properties?filter=parent:${account.name}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const props = await propRes.json();
    console.log(`Properties under ${account.displayName}:`, JSON.stringify(props, null, 2));
  }
}
