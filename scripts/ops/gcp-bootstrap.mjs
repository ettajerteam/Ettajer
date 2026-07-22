#!/usr/bin/env node
/**
 * Ettajer Google Cloud bootstrap (run after: gcloud auth login)
 *
 * Creates / selects project, enables APIs, creates ops service account,
 * downloads key to secrets/ettajer-ops.json
 *
 * Usage:
 *   node scripts/ops/gcp-bootstrap.mjs
 *   node scripts/ops/gcp-bootstrap.mjs --project ettajer-prod-XXXX
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const SECRETS = path.join(ROOT, "secrets");
const KEY_FILE = path.join(SECRETS, "ettajer-ops.json");
const GCLOUD =
  process.env.GCLOUD_BIN ||
  (process.platform === "win32"
    ? path.join(
        process.env.LOCALAPPDATA || "",
        "Google",
        "Cloud SDK",
        "google-cloud-sdk",
        "bin",
        "gcloud.cmd",
      )
    : "gcloud");

const APIS = [
  "analyticsdata.googleapis.com",
  "analyticsadmin.googleapis.com",
  "searchconsole.googleapis.com",
  "oauth2.googleapis.com",
  "iam.googleapis.com",
  "cloudresourcemanager.googleapis.com",
  "serviceusage.googleapis.com",
];

function run(args, opts = {}) {
  const isWin = process.platform === "win32";
  const result = spawnSync(GCLOUD, args, {
    encoding: "utf8",
    shell: false,
    windowsHide: true,
    cwd: ROOT,
    ...opts,
  });
  // Fallback for Windows path-with-spaces via cmd
  if (result.error && isWin) {
    const quoted = `"${GCLOUD}" ${args.map((a) => (/\s/.test(a) ? `"${a}"` : a)).join(" ")}`;
    const fallback = spawnSync(quoted, {
      encoding: "utf8",
      shell: true,
      windowsHide: true,
      cwd: ROOT,
      ...opts,
    });
    if (opts.allowFail) return fallback;
    if (fallback.status !== 0) {
      console.error(fallback.stderr || fallback.stdout || fallback.error);
      process.exit(fallback.status ?? 1);
    }
    return fallback;
  }
  if (opts.allowFail) return result;
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout || result.error);
    process.exit(result.status ?? 1);
  }
  return result;
}

function out(args) {
  const r = run(args, { stdio: ["ignore", "pipe", "pipe"] });
  return (r.stdout || "").trim();
}

fs.mkdirSync(SECRETS, { recursive: true });

const args = process.argv.slice(2);
const projectFlag = args.indexOf("--project");
let projectId =
  projectFlag >= 0
    ? args[projectFlag + 1]
    : process.env.GCP_PROJECT_ID || null;

console.log("=== Ettajer GCP bootstrap ===\n");

const account = out(["config", "get-value", "account"]);
if (!account || account === "(unset)") {
  console.error("Not logged in. Run: gcloud auth login");
  process.exit(1);
}
console.log("Account:", account);

if (!projectId) {
  const suggested = `ettajer-${Date.now().toString(36).slice(-6)}`;
  projectId = suggested;
  console.log("Creating project:", projectId);
  const created = run(
    ["projects", "create", projectId, "--name=Ettajer", "--quiet"],
    { allowFail: true, stdio: "inherit" },
  );
  if (created.status !== 0) {
    console.error(
      "\nProject create failed (billing / permissions). Pass an existing project:\n  node scripts/ops/gcp-bootstrap.mjs --project YOUR_PROJECT_ID",
    );
    process.exit(1);
  }
} else {
  console.log("Using project:", projectId);
}

run(["config", "set", "project", projectId], { stdio: "inherit" });

console.log("\nEnabling APIs…");
for (const api of APIS) {
  console.log(" -", api);
  run(["services", "enable", api, "--project", projectId], {
    stdio: "inherit",
    allowFail: true,
  });
}

const saId = "ettajer-ops";
const saEmail = `${saId}@${projectId}.iam.gserviceaccount.com`;
console.log("\nService account:", saEmail);

const saList = out([
  "iam",
  "service-accounts",
  "list",
  `--project=${projectId}`,
  "--format=value(email)",
]);
if (!saList.split(/\r?\n/).includes(saEmail)) {
  run(
    [
      "iam",
      "service-accounts",
      "create",
      saId,
      `--project=${projectId}`,
      "--display-name=Ettajer Cursor Ops",
      "--description=Platform ops for Analytics, Search Console, automation",
    ],
    { stdio: "inherit" },
  );
} else {
  console.log("Service account already exists");
}

// Roles needed for APIs (fine-tune later in console)
const roles = [
  "roles/serviceusage.serviceUsageConsumer",
  "roles/viewer",
];
for (const role of roles) {
  run(
    [
      "projects",
      "add-iam-policy-binding",
      projectId,
      `--member=serviceAccount:${saEmail}`,
      `--role=${role}`,
      "--quiet",
    ],
    { allowFail: true, stdio: "inherit" },
  );
}

if (fs.existsSync(KEY_FILE)) {
  console.log("\nKey already exists at secrets/ettajer-ops.json (keeping it)");
} else {
  console.log("\nCreating key → secrets/ettajer-ops.json");
  run(
    [
      "iam",
      "service-accounts",
      "keys",
      "create",
      KEY_FILE,
      `--iam-account=${saEmail}`,
      `--project=${projectId}`,
    ],
    { stdio: "inherit" },
  );
}

const envSnippet = path.join(SECRETS, "gcp.env.snippet");
fs.writeFileSync(
  envSnippet,
  [
    `# Add to .env (do not commit)`,
    `GCP_PROJECT_ID=${projectId}`,
    `GOOGLE_APPLICATION_CREDENTIALS=./secrets/ettajer-ops.json`,
    `ETTAJER_OPS_SA=${saEmail}`,
    "",
  ].join("\n"),
  "utf8",
);

console.log(`
============================================================
GCP bootstrap complete

Project:  ${projectId}
Ops SA:   ${saEmail}
Key:      secrets/ettajer-ops.json
Snippet:  secrets/gcp.env.snippet

MANUAL STEPS (you do once in Google UI — can't be 100% CLI):

1) Google Analytics (GA4)
   - analytics.google.com → create property "Ettajer Platform"
   - Admin → Property Access → add ${saEmail} as Viewer
   - Copy Measurement ID (G-XXXX) → .env as NEXT_PUBLIC_GA_MEASUREMENT_ID
   - Copy Property ID (numeric) → .env as GA4_PROPERTY_ID

2) Search Console
   - search.google.com/search-console → add https://www.ettajer.com
   - Settings → Users → add ${saEmail} as Full
   - Verify domain (DNS TXT or HTML)

3) OAuth redirect (for Continue with Google signup)
   - console.cloud.google.com → APIs → Credentials → OAuth client
   - Add: https://www.ettajer.com/api/auth/callback/google
   - Add: http://localhost:3000/api/auth/callback/google

Then run:
  node scripts/ops/append-gcp-env.mjs
  node scripts/ops/verify-google-apis.mjs
============================================================
`);
