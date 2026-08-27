/**
 * V9 Controlled Execution engine — human-gated, sandbox-only mutations.
 */
import type { InterventionPlan } from "@/lib/intelligence/interventions/types";
import type { PlatformState } from "@/lib/intelligence/engine-types";
import type {
  Actor,
  ApprovalRecord,
  ExecutionRecord,
  ExecuteInterventionInput,
  SnapshotExecutionSlice,
} from "@/lib/intelligence/execution/types";
import {
  requestApproval,
  approve,
  reject,
  getApproval,
  resetApprovals,
} from "@/lib/intelligence/execution/approval";
import {
  executeIntervention,
  resetExecutions,
  getExecutionByKey,
} from "@/lib/intelligence/execution/executor";
import {
  getKillSwitch,
  setKillSwitch,
  resetKillSwitch,
} from "@/lib/intelligence/execution/kill-switch";
import { buildExecutionIdempotencyKey } from "@/lib/intelligence/execution/idempotency";
import { getExecutionDef } from "@/lib/intelligence/execution/registry";
import { EXECUTION_CONFIG } from "@/lib/intelligence/execution/config";
import { auditStep } from "@/lib/intelligence/execution/audit";
import { toOutcomeMemoryRecord } from "@/lib/intelligence/execution/outcome";

export {
  requestApproval,
  approve,
  reject,
  getApproval,
  resetApprovals,
} from "@/lib/intelligence/execution/approval";
export {
  executeIntervention,
  resetExecutions,
  listExecutions,
  getExecutionByKey,
} from "@/lib/intelligence/execution/executor";
export {
  getKillSwitch,
  setKillSwitch,
  resetKillSwitch,
  isExecutionAllowedByKillSwitch,
} from "@/lib/intelligence/execution/kill-switch";
export {
  EXECUTION_REGISTRY,
  getExecutionDef,
} from "@/lib/intelligence/execution/registry";
export { adminActor } from "@/lib/intelligence/execution/authorization";
export { toOutcomeMemoryRecord } from "@/lib/intelligence/execution/outcome";
export { buildExecutionIdempotencyKey } from "@/lib/intelligence/execution/idempotency";

export function resetExecutionEngine(): void {
  resetApprovals();
  resetExecutions();
  resetKillSwitch();
}

/**
 * Full governed path for tests/smoke:
 * READY_FOR_APPROVAL → APPROVED → DRY_RUN|EXECUTE → outcome
 */
export function runGovernedExecution(input: {
  plan: InterventionPlan;
  decisionId: string;
  decisionTrace: string[];
  state: PlatformState;
  stateFingerprint: string;
  twinHash: string;
  dataQualityStatus: "OK" | "DEGRADED" | "INSUFFICIENT";
  insufficientEvidence: boolean;
  actor: Actor;
  nowIso: string;
  mode: "DRY_RUN" | "EXECUTE";
  enableKillSwitch?: boolean;
  cycleId: string;
  /** Skip approve step (adversarial) */
  skipApprove?: boolean;
}): {
  approval: ApprovalRecord;
  execution: ExecutionRecord;
  outcomeMemory: ReturnType<typeof toOutcomeMemoryRecord> | null;
} {
  if (input.enableKillSwitch) {
    setKillSwitch("ENABLED");
  }

  const { approval } = requestApproval({
    plan: input.plan,
    decisionId: input.decisionId,
    decisionTrace: input.decisionTrace,
    stateFingerprint: input.stateFingerprint,
    twinHash: input.twinHash,
    actor: input.actor,
    nowIso: input.nowIso,
  });

  let active = approval;
  if (!input.skipApprove && approval.lifecycle === "READY_FOR_APPROVAL") {
    active = approve({
      approvalId: approval.approvalId,
      actor: input.actor,
      nowIso: input.nowIso,
    });
  }

  const idempotencyKey = buildExecutionIdempotencyKey({
    decisionId: input.decisionId,
    interventionType: input.plan.type,
    targetCount: input.plan.target.count,
    stateFingerprint: input.stateFingerprint,
    approvalId: active.approvalId,
  });

  // Prefer plan key alignment for governor matching — store both via approval.idempotencyKey
  // Execution uses plan's key for duplicate protection with V8
  const execKey = input.plan.execution.idempotencyKey || idempotencyKey;

  const execution = executeIntervention({
    interventionId: input.plan.interventionId,
    approvalId: active.approvalId,
    idempotencyKey: execKey,
    mode: input.mode,
    actor: input.actor,
    currentState: input.state,
    currentStateFingerprint: input.stateFingerprint,
    currentTwinHash: input.twinHash,
    dataQualityStatus: input.dataQualityStatus,
    insufficientEvidence: input.insufficientEvidence,
    nowIso: input.nowIso,
    cycleId: input.cycleId,
  });

  const outcomeMemory =
    execution.outcome != null
      ? toOutcomeMemoryRecord(execution.outcome, input.stateFingerprint)
      : null;

  return { approval: getApproval(active.approvalId) ?? active, execution, outcomeMemory };
}

/**
 * Snapshot projection — never executes. Describes governance readiness.
 */
export function buildSnapshotExecutionSlice(input: {
  plan: InterventionPlan | null;
  stateFingerprint: string;
  cycleId: string;
  nowIso: string;
}): SnapshotExecutionSlice {
  const ks = getKillSwitch();
  if (!input.plan) {
    return {
      status: "IDLE",
      killSwitch: ks,
      autoExecute: false,
      approval: null,
      authorization: { authorized: false, reasons: ["No intervention plan."] },
      governor: { verdict: "IDLE", reasons: ["No plan."] },
      idempotency: { key: null },
      verification: { note: "No execution in snapshot build." },
      outcome: { success: null, productionMutation: "NONE" },
      executionTrace: [],
      modeDefault: "DRY_RUN",
      note: EXECUTION_CONFIG.snapshotNote,
    };
  }

  const def = getExecutionDef(input.plan.type);
  const requiresApproval = def?.requiresApproval ?? true;

  return {
    status:
      input.plan.status === "READY_FOR_APPROVAL" ||
      input.plan.status === "EXECUTION_READY"
        ? "READY_FOR_GOVERNANCE"
        : input.plan.status === "BLOCKED"
          ? "BLOCKED"
          : "READY_FOR_APPROVAL",
    killSwitch: ks,
    autoExecute: false,
    approval: {
      approvalId: null,
      lifecycle: "READY_FOR_APPROVAL",
      requiresApproval,
      expiresAt: null,
    },
    authorization: {
      authorized: false,
      reasons: [
        "Snapshot does not authorize execution.",
        "Human approval + executeIntervention required.",
      ],
    },
    governor: {
      verdict: "AWAITING_APPROVAL",
      reasons: [
        `Plan status=${input.plan.status}`,
        `killSwitch=${ks}`,
        "autoExecute=false",
      ],
    },
    idempotency: { key: input.plan.execution.idempotencyKey },
    verification: {
      note: "Verification runs only after governed executeIntervention.",
    },
    outcome: { success: null, productionMutation: "NONE" },
    executionTrace: [
      auditStep({
        stage: "PLAN",
        timestamp: input.nowIso,
        stateFingerprint: input.stateFingerprint,
        actor: "system",
        result: input.plan.type,
        reason: input.plan.status,
        identifiers: {
          interventionId: input.plan.interventionId,
          cycleId: input.cycleId,
        },
      }),
      auditStep({
        stage: "APPROVAL_REQUEST",
        timestamp: input.nowIso,
        stateFingerprint: input.stateFingerprint,
        actor: "system",
        result: "READY_FOR_APPROVAL",
        reason: "Snapshot surfaces plan for human governance — does not approve.",
        identifiers: {},
      }),
    ],
    modeDefault: "DRY_RUN",
    note: EXECUTION_CONFIG.snapshotNote,
  };
}

export type { ExecuteInterventionInput, ExecutionRecord, ApprovalRecord };
