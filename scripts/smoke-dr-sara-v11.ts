/**
 * Smoke: Dr Sara V11 Experience — presentation layer only.
 * Run: npx tsx scripts/smoke-dr-sara-v11.ts
 * DO NOT deploy / push / mutate production commerce data.
 */
import fs from "fs";
import {
  getDrSaraSnapshot,
  snapshotToBriefing,
  buildDrSaraSnapshotFromState,
  toPlatformState,
} from "../lib/intelligence";
import {
  buildSaraExperienceViewModel,
  EXPERIENCE_VERSION,
} from "../lib/intelligence/presentation";
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

  const snapshot = await getDrSaraSnapshot();
  const briefing = snapshotToBriefing(snapshot);
  const vm = buildSaraExperienceViewModel(snapshot);
  const vm2 = buildSaraExperienceViewModel(snapshot);

  const overview = await getPlatformOverview();
  const state = toPlatformState(overview);
  const fromState = buildDrSaraSnapshotFromState(state);
  const vmState = buildSaraExperienceViewModel(fromState);

  const determinism = JSON.stringify(vm) === JSON.stringify(vm2);

  console.log("========================================");
  console.log("DR SARA V11 EXPERIENCE VALIDATION");
  console.log("========================================");
  console.log(`experienceVersion: ${EXPERIENCE_VERSION}`);
  console.log(`engineVersion: ${snapshot.metadata.version}`);
  console.log(`cycleId: ${vm.cycleId ?? "none"}`);
  console.log(`NOW: ${vm.now.headline}`);
  console.log(`TOP_DECISION: ${vm.preserved.topDecision ?? "none"}`);
  console.log(`TOP_SCENARIO: ${vm.preserved.topScenario ?? "none"}`);
  console.log(`TOP_ACTION: ${vm.preserved.topAction ?? "none"}`);
  console.log(`whyChain steps: ${vm.whyChain.length}`);
  console.log(`platformMap nodes: ${vm.platformMap.nodes.length}`);
  console.log(`scenarioLab rows: ${vm.scenarioLab.length}`);
  console.log(`riskField items: ${vm.riskField.length}`);
  console.log(`opportunities: ${vm.opportunities.length}`);
  console.log(`autoExecute: ${vm.autoExecute}`);
  console.log(`productionMutation: ${vm.productionMutation}`);
  console.log(`executionDisabled: ${vm.execution.productionExecutionDisabled}`);
  console.log(`sandboxReady: ${vm.execution.sandboxReady}`);
  console.log(`determinism: ${determinism ? "PASS" : "FAIL"}`);
  console.log(`UI briefing score: ${briefing.pulse.score}`);
  console.log(`LLM/ML: NONE`);
  console.log("========================================");

  if (vm.version !== "11.0.0") process.exit(1);
  if (snapshot.metadata.version !== "10.0.0") process.exit(1);
  if (vm.autoExecute !== false) process.exit(1);
  if (vm.productionMutation !== "NONE") process.exit(1);
  if (!determinism) process.exit(1);
  if (!vmState.now.headline) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
