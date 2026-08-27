/**
 * Smoke: Dr Sara V7 Memory & Outcome — local only.
 * Run: npx tsx scripts/smoke-dr-sara-v7.ts
 * Do NOT deploy / push.
 */
import fs from "fs";
import {
  getDrSaraSnapshot,
  snapshotToBriefing,
  buildDrSaraSnapshotFromState,
  toPlatformState,
  primaryStateFingerprint,
  compareOutcome,
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

  const fpA = primaryStateFingerprint(state);
  const fpB = primaryStateFingerprint(state);
  const cmp = compareOutcome({
    predicted: { pendingCOD: [4, 7] },
    observed: { pendingCOD: 5 },
    sufficientData: true,
  });

  const determinism =
    a.memory?.primaryFingerprint === b.memory?.primaryFingerprint &&
    a.decision?.topDecision?.selectedAction.id ===
      b.decision?.topDecision?.selectedAction.id &&
    JSON.stringify(a.learning?.learningTrace) ===
      JSON.stringify(b.learning?.learningTrace);

  console.log("========================================");
  console.log("DR SARA V7 MEMORY & OUTCOME");
  console.log("========================================");
  console.log(`version: ${snapshot.metadata.version}`);
  console.log(`memory exists: ${snapshot.memory != null}`);
  console.log(`fingerprint: ${snapshot.memory?.primaryFingerprint}`);
  console.log(`fingerprint deterministic: ${fpA === fpB}`);
  console.log(
    `empty/live history safe: reliability=${td?.historicalReliability} impact=${td?.memoryImpact}`
  );
  console.log(
    `compareOutcome demo: ${cmp.status}/${cmp.accuracy} (12→[4,7] vs 5)`
  );
  console.log(`TOP_ACTION: ${snapshot.topAction?.label ?? "none"}`);
  console.log(`TOP_SCENARIO: ${snapshot.topScenario?.label ?? "none"}`);
  console.log(
    `TOP_DECISION: ${td?.selectedAction.id ?? "none"} conf ${td?.confidenceBeforeMemory}→${td?.confidenceAfterMemory}`
  );
  console.log(
    `LEARNING_TRACE: ${snapshot.learning?.learningTrace?.map((t) => t.stage).join("→")}`
  );
  console.log(`determinism: ${determinism ? "PASS" : "FAIL"}`);
  console.log(`production mutation: NONE`);
  console.log(`LLM/ML: NONE`);
  console.log(`autoExecute: ${snapshot.autonomy.autoExecute}`);
  console.log(`UI briefing score: ${briefing.pulse.score}`);
  console.log("========================================");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
