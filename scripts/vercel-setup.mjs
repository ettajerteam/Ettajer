/**
 * Full Vercel setup for www.ettajer.com:
 * - verify CLI auth
 * - sync all env vars
 * - deploy production
 *
 * Prereq (pick one):
 *   A) vercel login  (browser — use ettajerteam@gmail.com / teamettajer account)
 *   B) Set VERCEL_TOKEN in .env from https://vercel.com/account/tokens
 *
 * Then link once:
 *   vercel link --project <your-ettajer-project-name>
 *
 * Usage:
 *   node scripts/vercel-setup.mjs
 *   node scripts/vercel-setup.mjs --scope teamettajer --project ettajer-qvez
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    cwd: ROOT,
    ...opts,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function runCapture(cmd, args) {
  return spawnSync(cmd, args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    cwd: ROOT,
  });
}

const args = process.argv.slice(2);
const scopeIdx = args.indexOf("--scope");
const projectIdx = args.indexOf("--project");
const scope = scopeIdx >= 0 ? args[scopeIdx + 1] : null;
const project = projectIdx >= 0 ? args[projectIdx + 1] : null;

console.log("=== Ettajer Vercel setup ===\n");

const who = runCapture("vercel", ["whoami"]);
if (who.status !== 0) {
  console.error("Not logged in. Run: vercel login");
  console.error("Sign in with the account that owns www.ettajer.com (teamettajer).");
  process.exit(1);
}
console.log("Logged in as:", who.stdout.trim());

if (!fs.existsSync(path.join(ROOT, ".vercel", "project.json"))) {
  if (!project) {
    console.error("\nProject not linked. Run one of:");
    console.error("  vercel link");
    console.error("  node scripts/vercel-setup.mjs --scope teamettajer --project YOUR_PROJECT_NAME");
    process.exit(1);
  }
  const linkArgs = ["link", "--yes", "--project", project];
  if (scope) linkArgs.push("--scope", scope);
  console.log("\nLinking project...");
  run("vercel", linkArgs);
}

console.log("\nSyncing environment variables...");
run("node", ["scripts/sync-vercel-env.mjs", "production", "--url", "https://www.ettajer.com"]);

console.log("\nDeploying production...");
run("vercel", ["deploy", "--prod", "--yes"]);

console.log("\nDone. Test: https://www.ettajer.com/api/auth/session");
