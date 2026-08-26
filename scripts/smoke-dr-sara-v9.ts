/**
 * Smoke: Dr Sara V9 Controlled Execution — local sandbox only.
 * Run: npx tsx scripts/smoke-dr-sara-v9.ts
 * DO NOT deploy / push / mutate production commerce data.
 */
import fs from "fs";
import {
  getDrSaraSnapshot,
  snapshotToBriefing,
  buildDrSaraSnapshotFromState,
  toPlatformState,
  runGovernedExecution,
  resetExecutionEngine,
  adminActor,
  setKillSwitch,
} from "../lib/intelligence";
import { getPlatformOverview } from "../lib/admin/platform-stats";
import { planIntervention } from "../lib/intelligence/interventions/planner";
import { primaryStateFingerprint } from "../lib/intelligence/memory/fingerprints";

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

  resetExecutionEngine();

  const overview = await getPlatformOverview();
  const state = toPlatformState(overview);
  const snapA = buildDrSaraSnapshotFromState(state);
  const snapB = buildDrSaraSnapshotFromState(state);
  const snapshot = await getDrSaraSnapshot();
  const briefing = snapshotToBriefing(snapshot);

  const top = snapshot.decision?.topDecision;
  const plan =
    snapshot.intervention != null
      ? planIntervention({
          decisionId: top?.selectedAction.id ?? "REVIEW_PENDING_COD",
          decisionTitle: top?.selectedAction.title ?? "Review pending COD",
          decisionScore: top?.score ?? 0,
          decisionConfidence: top?.confidence ?? 0,
          decisionRoute: top?.selectedAction.route ?? "/admin/payments",
          whyThis: top?.whyThis ?? snapshot.intervention.rationale ?? [],
          state,
          stateFingerprint:
            snapshot.memory?.primaryFingerprint ?? primaryStateFingerprint(state),
          twinHash: snapshot.digitalTwin?.twinHash ?? "smoke-twin",
          dataQualityStatus: "OK",
          insufficientEvidence: false,
          expectedAfter: snapshot.intervention.measurement.expectedAfter,
          baselineOverride: snapshot.intervention.measurement.baseline,
          cycleId: "smoke-v9",
        })
      : planIntervention({
          decisionId: "REVIEW_PENDING_COD",
          decisionTitle: "Review pending COD",
          decisionScore: 1,
          decisionConfidence: 0.5,
          decisionRoute: "/admin/payments",
          whyThis: [],
          state,
          stateFingerprint: primaryStateFingerprint(state),
          twinHash: "smoke-twin",
          dataQualityStatus: "OK",
          insufficientEvidence: false,
          cycleId: "smoke-v9",
        });

  // DRY_RUN first (kill switch may stay DISABLED)
  const dry = runGovernedExecution({
    plan,
    decisionId: plan.type === "COD_VERIFICATION" ? "REVIEW_PENDING_COD" : plan.type,
    decisionTrace: ["SMOKE"],
    state,
    stateFingerprint:
      snapshot.memory?.primaryFingerprint ?? primaryStateFingerprint(state),
    twinHash: snapshot.digitalTwin?.twinHash ?? "smoke-twin",
    dataQualityStatus: "OK",
    insufficientEvidence: false,
    actor: adminActor("smoke-admin"),
    nowIso: state.now.toISOString(),
    mode: "DRY_RUN",
    enableKillSwitch: true,
    cycleId: "smoke-v9-dry",
  });

  resetExecutionEngine();
  setKillSwitch("ENABLED");

  const live = runGovernedExecution({
    plan,
    decisionId:
      snapshot.decision?.topDecision?.selectedAction.id ?? "REVIEW_PENDING_COD",
    decisionTrace: ["SMOKE"],
    state,
    stateFingerprint:
      snapshot.memory?.primaryFingerprint ?? primaryStateFingerprint(state),
    twinHash: snapshot.digitalTwin?.twinHash ?? "smoke-twin",
    dataQualityStatus: "OK",
    insufficientEvidence: false,
    actor: adminActor("smoke-admin"),
    nowIso: state.now.toISOString(),
    mode: "EXECUTE",
    enableKillSwitch: true,
    cycleId: "smoke-v9-exec",
  });

  const determinism =
    snapA.execution?.idempotency.key === snapB.execution?.idempotency.key &&
    snapA.intervention?.idempotencyKey === snapB.intervention?.idempotencyKey;

  console.log("========================================");
  console.log("DR SARA V9 CONTROLLED EXECUTION");
  console.log("========================================");
  console.log(`version: ${snapshot.metadata.version}`);
  console.log(
    `TOP_DECISION: ${snapshot.decision?.topDecision?.selectedAction.id ?? "none"}`
  );
  console.log(`intervention plan: ${snapshot.intervention?.type ?? "none"}`);
  console.log(`plan status: ${snapshot.intervention?.status ?? "none"}`);
  console.log(`execution slice: ${snapshot.execution?.status ?? "none"}`);
  console.log(`killSwitch(default snapshot): ${snapA.execution?.killSwitch}`);
  console.log(`DRY_RUN: ${dry.execution.status}`);
  console.log(
    `flow: READY_FOR_APPROVAL → ${dry.approval.lifecycle} → ${dry.execution.status}`
  );
  console.log(`EXECUTE (sandbox): ${live.execution.status}`);
  console.log(`approval lifecycle: ${live.approval.lifecycle}`);
  console.log(`governor: ${live.execution.governor.verdict}`);
  console.log(
    `verification: ${live.execution.verification?.verified ? "PASS" : "n/a"}`
  );
  console.log(
    `outcome success: ${live.execution.outcome?.success ?? "n/a"} rollback=${live.execution.outcome?.rollbackState}`
  );
  console.log(
    `audit: ${live.execution.auditTrace.map((t) => t.stage).join("→")}`
  );
  console.log(`productionMutation: ${live.execution.productionMutation}`);
  console.log(`determinism: ${determinism ? "PASS" : "FAIL"}`);
  console.log(`autoExecute: ${snapshot.autonomy.autoExecute}`);
  console.log(`LLM/ML: NONE`);
  console.log(`UI briefing score: ${briefing.pulse.score}`);
  console.log("========================================");

  if (live.execution.productionMutation !== "NONE") {
    console.error("FAIL: production mutation detected");
    process.exit(1);
  }
  if (snapshot.metadata.version !== "9.0.0") {
    console.error("FAIL: version not 9.0.0");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
