/**
 * Smoke: Dr Sara Design V2 Experience — presentation only.
 * Run: npx tsx scripts/smoke-dr-sara-design-v2.ts
 * DO NOT deploy / push / mutate production.
 */
import fs from "fs";
import {
  getDrSaraSnapshot,
  snapshotToBriefing,
} from "../lib/intelligence";
import {
  buildSaraExperienceViewModel,
  EXPERIENCE_VERSION,
  DESIGN_VERSION,
} from "../lib/intelligence/presentation";

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
  const determinism = JSON.stringify(vm) === JSON.stringify(vm2);

  console.log("========================================");
  console.log("DR SARA DESIGN V2 EXPERIENCE VALIDATION");
  console.log("========================================");
  console.log(`experienceVersion: ${EXPERIENCE_VERSION}`);
  console.log(`designVersion: ${DESIGN_VERSION}`);
  console.log(`engineVersion: ${snapshot.metadata.version}`);
  console.log(`arrival: ${vm.arrival.greeting}, ${vm.arrival.operatorName}`);
  console.log(`attention: ${vm.arrival.attentionCount}`);
  console.log(`NOW: ${vm.now.headline}`);
  console.log(`domain: ${vm.now.domain}`);
  console.log(`relatedPath: ${vm.now.relatedPath.join(" → ")}`);
  console.log(`map nodes: ${vm.platformMap.nodes.length}`);
  console.log(`map emphasis: ${vm.platformMap.nodes.filter((n) => n.emphasis).map((n) => n.id).join(",")}`);
  console.log(`opportunities positioned: ${vm.opportunities.length}`);
  console.log(`risks positioned: ${vm.riskField.length}`);
  console.log(`agents: ${vm.agentNetwork.modules.map((m) => `${m.id}:${m.status}`).join(" | ")}`);
  console.log(`cta: ${vm.now.cta}`);
  console.log(`autoExecute: ${vm.autoExecute}`);
  console.log(`productionMutation: ${vm.productionMutation}`);
  console.log(`determinism: ${determinism ? "PASS" : "FAIL"}`);
  console.log(`UI briefing score: ${briefing.pulse.score}`);
  console.log(`LLM/ML: NONE`);
  console.log("========================================");

  if (!String(vm.designVersion).startsWith("2.") && vm.designVersion !== "3.0.0") {
    process.exit(1);
  }
  if (snapshot.metadata.version !== "10.0.0") process.exit(1);
  if (vm.autoExecute !== false) process.exit(1);
  if (vm.productionMutation !== "NONE") process.exit(1);
  if (!determinism) process.exit(1);
  if (vm.now.cta !== "Review decision") process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
