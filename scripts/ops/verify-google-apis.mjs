#!/usr/bin/env node
/**
 * Verify Google Cloud / Analytics / Search Console API reachability.
 */
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
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv();

const keyFile =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(ROOT, "secrets", "ettajer-ops.json");

if (!fs.existsSync(keyFile)) {
  console.error("Missing service account key:", keyFile);
  console.error("Run: node scripts/ops/gcp-bootstrap.mjs");
  process.exit(1);
}

const auth = new GoogleAuth({
  keyFile,
  scopes: [
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/cloud-platform.read-only",
  ],
});

const client = await auth.getClient();
const projectId = await auth.getProjectId();
console.log("Auth OK");
console.log("Project:", projectId);
console.log(
  "Measurement ID:",
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "(not set)",
);

const token = await client.getAccessToken();
if (!token?.token) {
  console.error("Failed to get access token");
  process.exit(1);
}
console.log("Access token acquired");

const propertyId = process.env.GA4_PROPERTY_ID?.trim();
if (propertyId) {
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      metrics: [{ name: "sessions" }],
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    console.log("GA4:", res.status, body.error?.message || body);
  } else {
    console.log(
      "GA4 OK — sessions sample:",
      JSON.stringify(body.rows?.[0] ?? body),
    );
  }
} else {
  console.log("GA4 Data API: skipped (set GA4_PROPERTY_ID for reports)");
  console.log("GA4 tag: loads on site via NEXT_PUBLIC_GA_MEASUREMENT_ID");
}

const site = process.env.SEARCH_CONSOLE_SITE_URL || "https://www.ettajer.com/";
{
  const listRes = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
    headers: { Authorization: `Bearer ${token.token}` },
  });
  const listBody = await listRes.json();
  if (!listRes.ok) {
    console.log(
      "Search Console list:",
      listRes.status,
      listBody.error?.message || listBody,
    );
  } else {
    const sites = listBody.siteEntry || [];
    console.log(
      "Search Console sites:",
      sites.map((s) => `${s.siteUrl} (${s.permissionLevel})`).join(", ") ||
        "(none)",
    );
  }

  const siteRes = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}`,
    { headers: { Authorization: `Bearer ${token.token}` } },
  );
  const siteBody = await siteRes.json().catch(() => ({}));
  if (!siteRes.ok) {
    console.log(
      "Search Console site:",
      siteRes.status,
      siteBody.error?.message || JSON.stringify(siteBody).slice(0, 200),
    );
  } else {
    console.log(
      "Search Console site OK:",
      siteBody.siteUrl,
      siteBody.permissionLevel,
    );
  }
}

console.log("\nVerify complete.");
