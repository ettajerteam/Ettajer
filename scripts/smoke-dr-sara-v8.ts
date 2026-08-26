/**
 * Smoke: Dr Sara V8 Intervention Orchestration — local only.
 * Run: npx tsx scripts/smoke-dr-sara-v8.ts
 * DO NOT deploy / push / execute interventions.
 */
import fs from "fs";
import {
  getDrSaraSnapshot,
  snapshotToBriefing,
  buildDrSaraSnapshotFromState,
  toPlatformState,
} from "../lib/intelligence";
import { getPlatformOverview } from "../lib/admin/platform-stats";

function loadEnv(path: string) {
  if (!fs.existsSync(path)) return;
  for (const line of fs.readFileSync(path, "utf8").split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const k = line.slice(0, i);
    let v = line.slice(i + 1);
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

async function main() {
  loadEnv(".env.local");
  loadEnv(".env");
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }

  const overview = await getPlatformOverview();
  const state = toPlatformState(overview);
  const a = buildDrSaraSnapshotFromState(state);
  const b = buildDrSaraSnapshotFromState(state);
  const snapshot = await getDrSaraSnapshot();
  const briefing = snapshotToBriefing(snapshot);
  const iv = snapshot.intervention;

  const determinism =
    a.intervention?.idempotencyKey === b.intervention?.idempotencyKey &&
    JSON.stringify(a.intervention?.trace) ===
      JSON.stringify(b.intervention?.trace);

  console.log("========================================");
  console.log("DR SARA V8 INTERVENTION ORCHESTRATION");
  console.log("========================================");
  console.log(`version: ${snapshot.metadata.version}`);
  console.log(
    `TOP_DECISION: ${snapshot.decision?.topDecision?.selectedAction.id ?? "none"}`
  );
  console.log(`intervention: ${iv?.type ?? "none"}`);
  console.log(`status: ${iv?.status ?? "none"}`);
  console.log(`executionMode: ${iv?.executionMode ?? "none"}`);
  console.log(`safety: ${iv?.safetyLevel ?? "none"}`);
  console.log(`risk: ${iv?.overallRisk ?? "none"}`);
  console.log(`approval: ${iv?.approval ?? "none"}`);
  console.log(`blastRadius: ${iv?.blastRadius ?? "none"}`);
  console.log(`idempotencyKey: ${iv?.idempotencyKey ?? "none"}`);
  console.log(
    `measurement: ${iv?.measurement.primaryMetric} baseline=${JSON.stringify(iv?.measurement.baseline)} expected=${JSON.stringify(iv?.measurement.expectedAfter)}`
  );
  console.log(
    `rollback: possible=${iv?.rollback.possible} rev=${iv?.rollback.reversibility}`
  );
  console.log(`trace: ${iv?.trace.map((t) => t.stage).join("→")}`);
  console.log(`reviewHref: ${iv?.reviewHref}`);
  console.log(`determinism: ${determinism ? "PASS" : "FAIL"}`);
  console.log(`autoExecute: ${snapshot.autonomy.autoExecute}`);
  console.log(`production mutation: NONE`);
  console.log(`LLM/ML: NONE`);
  console.log(`UI briefing score: ${briefing.pulse.score}`);
  console.log("========================================");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
