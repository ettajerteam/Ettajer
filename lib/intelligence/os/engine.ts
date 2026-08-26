/**
 * V10 engine — runDrSaraCycle orchestrates V1–V9 + optional V9 sandbox execute.
 */
import type { PlatformState } from "@/lib/intelligence/engine-types";
import type { DrSaraSnapshot } from "@/lib/intelligence/engine-types";
import type { IntelligenceMemory } from "@/lib/intelligence/memory/types";
import type {
  DecisionMemoryRecord,
  OutcomeMemoryRecord,
} from "@/lib/intelligence/memory/v7-types";
import type { DecisionMemoryEntry } from "@/lib/intelligence/stability/decision";
import { buildDrSaraSnapshotFromState } from "@/lib/intelligence/snapshot";
import {
  runGovernedExecution,
  resetExecutionEngine,
  adminActor,
} from "@/lib/intelligence/execution/engine";
import { planIntervention } from "@/lib/intelligence/interventions/planner";
import { primaryStateFingerprint } from "@/lib/intelligence/memory/fingerprints";
import type { ExecutionRecord } from "@/lib/intelligence/execution/types";

export {
  composeIntelligenceOS,
  toSnapshotIntelligenceOS,
} from "@/lib/intelligence/os/compose";
export { buildCycleId } from "@/lib/intelligence/os/cycle-id";
export { OS_CONFIG } from "@/lib/intelligence/os/config";

export type RunDrSaraCycleInput = {
  state: PlatformState;
  memory?: IntelligenceMemory;
  decisionHistory?: DecisionMemoryEntry[];
  v7DecisionHistory?: DecisionMemoryRecord[];
  v7OutcomeHistory?: OutcomeMemoryRecord[];
  /** When true, run V9 sandbox EXECUTE after approval (still productionMutation=NONE) */
  runSandboxExecution?: boolean;
};

export type RunDrSaraCycleResult = {
  snapshot: DrSaraSnapshot;
  cycleId: string;
  intelligenceOS: NonNullable<DrSaraSnapshot["intelligenceOS"]>;
  sandboxExecution: ExecutionRecord | null;
  productionMutation: "NONE";
  autoExecute: false;
};

/**
 * Full intelligence cycle. Snapshot build already runs V1–V9;
 * V10 fields are composed inside the snapshot. Optional sandbox path
 * invokes V9 governed execution without production mutation.
 */
export function runDrSaraCycle(
  input: RunDrSaraCycleInput
): RunDrSaraCycleResult {
  const snapshot = buildDrSaraSnapshotFromState(input.state, {
    memory: input.memory,
    decisionHistory: input.decisionHistory,
    v7DecisionHistory: input.v7DecisionHistory,
    v7OutcomeHistory: input.v7OutcomeHistory,
  });

  const intelligenceOS = snapshot.intelligenceOS;
  if (!intelligenceOS) {
    throw new Error("V10 intelligenceOS missing from snapshot");
  }

  let sandboxExecution: ExecutionRecord | null = null;
  if (input.runSandboxExecution && snapshot.intervention) {
    resetExecutionEngine();
    const fp =
      snapshot.memory?.primaryFingerprint ??
      primaryStateFingerprint(input.state);
    const twinHash = snapshot.digitalTwin?.twinHash ?? "cycle-twin";
    const plan = planIntervention({
      decisionId:
        snapshot.decision?.topDecision?.selectedAction.id ??
        "REVIEW_PENDING_COD",
      decisionTitle:
        snapshot.decision?.topDecision?.selectedAction.title ??
        "Review pending COD",
      decisionScore: snapshot.decision?.topDecision?.score ?? 0,
      decisionConfidence: snapshot.decision?.topDecision?.confidence ?? 0.5,
      decisionRoute:
        snapshot.decision?.topDecision?.selectedAction.route ?? "/admin/sara",
      whyThis: snapshot.decision?.topDecision?.whyThis ?? [],
      state: input.state,
      stateFingerprint: fp,
      twinHash,
      dataQualityStatus: snapshot.dataQualityV2?.insufficientEvidence
        ? "INSUFFICIENT"
        : "OK",
      insufficientEvidence: Boolean(
        snapshot.dataQualityV2?.insufficientEvidence
      ),
      expectedAfter: snapshot.intervention.measurement.expectedAfter,
      baselineOverride: snapshot.intervention.measurement.baseline,
      cycleId: intelligenceOS.cycleId,
    });

    const { execution } = runGovernedExecution({
      plan,
      decisionId: plan.type === "NO_ACTION" ? "NO_ACTION" : (snapshot.decision?.topDecision?.selectedAction.id ?? "REVIEW_PENDING_COD"),
      decisionTrace: ["V10_CYCLE"],
      state: input.state,
      stateFingerprint: fp,
      twinHash,
      dataQualityStatus: "OK",
      insufficientEvidence: false,
      actor: adminActor("v10-cycle"),
      nowIso: input.state.now.toISOString(),
      mode: "EXECUTE",
      enableKillSwitch: true,
      cycleId: intelligenceOS.cycleId,
    });
    sandboxExecution = execution;
  }

  return {
    snapshot,
    cycleId: intelligenceOS.cycleId,
    intelligenceOS,
    sandboxExecution,
    productionMutation: "NONE",
    autoExecute: false,
  };
}
