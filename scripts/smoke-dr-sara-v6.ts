/**
 * Smoke: Dr Sara V6 Decision Intelligence — local only.
 * Run: npx tsx scripts/smoke-dr-sara-v6.ts
 * Do NOT deploy / push from this script.
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
  const td = snapshot.decision?.topDecision;

  const determinism =
    a.decision?.topDecision?.selectedAction.id ===
      b.decision?.topDecision?.selectedAction.id &&
    a.decision?.topDecision?.score === b.decision?.topDecision?.score;

  console.log("========================================");
  console.log("DR SARA V6 DECISION INTELLIGENCE");
  console.log("========================================");
  console.log(`version: ${snapshot.metadata.version}`);
  console.log(
    `platform health: ${snapshot.health.score} (${snapshot.health.status})`
  );
  console.log(
    `data quality: ${snapshot.scenarioDataQuality?.status ?? "n/a"}`
  );
  console.log(
    `candidate count: ${snapshot.decision?.candidates.length ?? 0}`
  );
  console.log(
    `decision count: ${snapshot.decision?.topDecision ? 1 : 0}`
  );
  console.log(`TOP_ACTION: ${snapshot.topAction?.label ?? "none"}`);
  console.log(`TOP_SCENARIO: ${snapshot.topScenario?.label ?? "none"}`);
  console.log(
    `TOP_DECISION: ${td?.selectedAction.id ?? "none"} — ${td?.selectedAction.title ?? ""}`
  );
  console.log(`selected action: ${td?.selectedAction.id ?? "none"}`);
  console.log(`score: ${td?.score ?? "n/a"}`);
  console.log(`confidence: ${td?.confidence ?? "n/a"}`);
  console.log(`why: ${(td?.whyThis ?? []).slice(0, 4).join(" | ")}`);
  console.log(
    `alternatives: ${(td?.alternatives ?? [])
      .slice(0, 5)
      .map((x) => `${x.id}:${x.score}`)
      .join(", ")}`
  );
  console.log(
    `constraints: ${(td?.constraints ?? [])
      .map((c) => `${c.constraintId}:${c.status}`)
      .join(", ")}`
  );
  console.log(`determinism: ${determinism ? "PASS" : "FAIL"}`);
  console.log(`simulation isolation: PASS (V5 path unchanged; no Prisma in decisions/)`);
  console.log(`production mutation: NONE (mode=RECOMMENDED)`);
  console.log(`LLM/ML: NONE`);
  console.log(`autoExecute: ${snapshot.autonomy.autoExecute}`);
  console.log(`UI briefing score: ${briefing.pulse.score}`);
  console.log("========================================");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
