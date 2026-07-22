#!/usr/bin/env node
/**
 * Launch day ops runbook.
 *
 * Default: print launch status, dry-run waiting founder count, then smoke prod.
 *
 *   node scripts/ops/launch-day.mjs
 *   npm run launch:day
 *
 *   node scripts/ops/launch-day.mjs --activate   # bulk-activate waiting founders
 *   node scripts/ops/launch-day.mjs --force      # bypass launch date (activation only)
 *   node scripts/ops/launch-day.mjs --skip-smoke
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

const activate = process.argv.includes("--activate");
const force = process.argv.includes("--force");
const skipSmoke = process.argv.includes("--skip-smoke");

function getLaunchTarget() {
  const raw = process.env.ETTAJER_LAUNCH_TARGET?.trim();
  if (raw) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date("2026-07-23T00:00:00.000+01:00");
}

function runNode(relativeScript, args = []) {
  const scriptPath = path.join(root, relativeScript);
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${relativeScript} exited with code ${code}`));
    });
  });
}

const target = getLaunchTarget();
const now = new Date();
const isLaunched = now.getTime() >= target.getTime();

console.log("=== Ettajer launch-day runbook ===\n");
console.log("Launch target:", target.toISOString());
console.log("Now:          ", now.toISOString());
console.log("isLaunched:   ", isLaunched);
if (force) console.log("Note: --force will bypass launch date in activation step.");
if (activate) console.log("Mode: --activate (will update waiting founders to active)");
else console.log("Mode: dry-run (pass --activate to apply founder activation)");

const activateArgs = [];
if (activate) activateArgs.push("--activate");
if (force) activateArgs.push("--force");

try {
  console.log("\n--- Waiting founders ---\n");
  await runNode("scripts/activate-founders-at-launch.mjs", activateArgs);

  if (!skipSmoke) {
    console.log("\n--- Production smoke ---\n");
    await runNode("scripts/ops/smoke-prod.mjs");
  } else {
    console.log("\n(skipped smoke: --skip-smoke)");
  }

  console.log("\nLAUNCH_DAY_OK");
} catch (error) {
  console.error("\nLAUNCH_DAY_FAIL:", error.message || error);
  process.exit(1);
}
