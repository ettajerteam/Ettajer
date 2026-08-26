/**
 * Smoke: Dr Sara V10 Platform Intelligence OS — sandbox only.
 * Run: npx tsx scripts/smoke-dr-sara-v10.ts
 * DO NOT deploy / push / mutate production commerce data.
 */
import fs from "fs";
import {
  getDrSaraSnapshot,
  snapshotToBriefing,
  toPlatformState,
  runDrSaraCycle,
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
  const a = runDrSaraCycle({ state });
  const b = runDrSaraCycle({ state });
  const withSandbox = runDrSaraCycle({
    state,
    runSandboxExecution: true,
  });
  const snapshot = await getDrSaraSnapshot();
  const briefing = snapshotToBriefing(snapshot);
  const os = a.intelligenceOS;

  const determinism =
    a.cycleId === b.cycleId &&
    JSON.stringify(a.intelligenceOS.trace) ===
      JSON.stringify(b.intelligenceOS.trace);

  console.log("========================================");
  console.log("DR SARA V10 PLATFORM INTELLIGENCE OS");
  console.log("========================================");
  console.log(`version: ${snapshot.metadata.version}`);
  console.log(`cycleId: ${os.cycleId}`);
  console.log(`status: ${os.status}`);
  console.log(
    `TOP_DECISION: ${snapshot.decision?.topDecision?.selectedAction.id ?? "none"}`
  );
  console.log(`bestStrategy: ${os.bestStrategy?.strategyId ?? "none"}`);
  console.log(
    `portfolio: ${os.portfolio.orderedIds.slice(0, 5).join(" → ") || "none"}`
  );
  console.log(`warnings: ${os.warnings.length}`);
  console.log(`opportunities: ${os.opportunities.length}`);
  console.log(`graph: nodes=${os.graph.nodeCount} edges=${os.graph.edgeCount}`);
  console.log(`autonomy: ${os.autonomy.mode} controlledAuto=${os.autonomy.controlledAutoEnabled}`);
  console.log(`governance: ${os.governance.decision}`);
  console.log(
    `learning: ${os.learning.confidenceAdjustment.reason}`
  );
  console.log(`trace: ${os.trace.map((t) => t.stage).join("→")}`);
  console.log(
    `sandbox: ${withSandbox.sandboxExecution?.status ?? "none"} mutation=${withSandbox.sandboxExecution?.productionMutation ?? "NONE"}`
  );
  console.log(`determinism: ${determinism ? "PASS" : "FAIL"}`);
  console.log(`autoExecute: ${snapshot.autonomy.autoExecute}`);
  console.log(`productionMutation: ${a.productionMutation}`);
  console.log(`LLM/ML: NONE`);
  console.log(`UI briefing score: ${briefing.pulse.score}`);
  console.log("========================================");

  if (snapshot.metadata.version !== "10.0.0") process.exit(1);
  if (a.productionMutation !== "NONE") process.exit(1);
  if (snapshot.autonomy.autoExecute !== false) process.exit(1);
  if (!determinism) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
