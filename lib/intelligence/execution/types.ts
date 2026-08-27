/**
 * Dr Sara V9 — Controlled Execution & Governance types.
 * Human-gated execution over V8 plans. No LLM/ML. No arbitrary mutations.
 */

import type {
  BlastRadiusLevel,
  OverallRiskLevel,
  OrchestratedInterventionType,
  SafetyLevel,
  InterventionPlan,
} from "@/lib/intelligence/interventions/types";

export type KillSwitchState = "ENABLED" | "DISABLED";

export type ExecutionModeV9 = "DRY_RUN" | "EXECUTE";

export type ApprovalLifecycle =
  | "DRAFT"
  | "READY_FOR_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED"
  | "EXECUTING"
  | "EXECUTED"
  | "FAILED"
  | "ROLLED_BACK"
  | "BLOCKED";

export type GovernorVerdict =
  | "PASS"
  | "BLOCKED"
  | "PRECONDITION_FAILED"
  | "APPROVAL_EXPIRED"
  | "CONFLICT_ALREADY_EXECUTING"
  | "IDEMPOTENT_REPLAY"
  | "KILL_SWITCH"
  | "UNAUTHORIZED"
  | "UNREGISTERED";

export type ExecutionResultStatus =
  | "DRY_RUN_OK"
  | "EXECUTED"
  | "FAILED"
  | "ROLLED_BACK"
  | "PARTIAL_FAILURE"
  | "BLOCKED"
  | "PRECONDITION_FAILED"
  | "APPROVAL_EXPIRED"
  | "CONFLICT_ALREADY_EXECUTING"
  | "IDEMPOTENT_REPLAY";

export type Permission =
  | "intervention:cod_verify"
  | "intervention:dns_diagnose"
  | "intervention:support_escalate"
  | "intervention:merchant_onboard"
  | "intervention:first_sale"
  | "intervention:activation"
  | "intervention:concentration_review"
  | "intervention:noop"
  | "intervention:approve"
  | "intervention:execute";

export type Actor = {
  actorId: string;
  role: "admin" | "operator" | "viewer" | "system";
  permissions: Permission[];
};

export type ApprovalRecord = {
  approvalId: string;
  decisionId: string;
  interventionId: string;
  interventionType: OrchestratedInterventionType;
  lifecycle: ApprovalLifecycle;
  requestedAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  rejectedAt: string | null;
  rejectedBy: string | null;
  expiresAt: string;
  stateFingerprint: string;
  twinHash: string;
  decisionTrace: string[];
  riskSnapshot: OverallRiskLevel;
  blastRadiusSnapshot: BlastRadiusLevel;
  safetySnapshot: SafetyLevel;
  idempotencyKey: string;
  planSnapshot: InterventionPlan;
  reasons: string[];
};

export type ExecutionRegistryDef = {
  interventionType: OrchestratedInterventionType;
  allowedActions: string[];
  requiredPermission: Permission;
  safetyLevel: SafetyLevel;
  maxBlastRadius: BlastRadiusLevel;
  requiresApproval: boolean;
  reversible: boolean;
  rollbackStrategy: string;
  idempotencyStrategy: string;
  measurementStrategy: string;
  verificationStrategy: string;
  /** Handlers never touch Prisma — sandbox state only */
  productionMutationAllowed: false;
};

export type PreconditionCheck = {
  checkId: string;
  status: "PASS" | "FAIL";
  reason: string;
  before?: string | number;
  after?: string | number;
};

export type GovernorCheck = {
  checkId: string;
  status: "PASS" | "FAIL";
  reason: string;
};

export type GovernorResult = {
  verdict: GovernorVerdict;
  checks: GovernorCheck[];
  reasons: string[];
};

export type SandboxMutation = {
  opId: string;
  metric: string;
  before: number;
  after: number;
  reversible: boolean;
};

export type TransactionResult = {
  committed: boolean;
  rolledBack: boolean;
  partialFailure: boolean;
  mutations: SandboxMutation[];
  reason: string;
};

export type VerificationResult = {
  verified: boolean;
  businessSuccess: boolean;
  invariants: { id: string; status: "PASS" | "FAIL"; detail: string }[];
  observed: Record<string, number>;
  expected: Record<string, number | [number, number]>;
  note: string;
};

export type ExecutionOutcome = {
  executionId: string;
  decisionId: string;
  interventionId: string;
  interventionType: OrchestratedInterventionType;
  beforeState: Record<string, number>;
  afterState: Record<string, number>;
  expectedOutcome: Record<string, number | [number, number]>;
  observedOutcome: Record<string, number>;
  predictionError: Record<string, number>;
  success: boolean;
  failureReason: string | null;
  rollbackState: "NONE" | "APPLIED" | "IMPOSSIBLE" | "NOT_NEEDED";
  measuredAt: string;
  mode: ExecutionModeV9;
  productionMutation: "NONE";
};

export type AuditTraceStep = {
  stage: string;
  timestamp: string;
  stateFingerprint: string;
  actor: string;
  result: string;
  reason: string;
  identifiers: Record<string, string>;
};

export type ExecutionRecord = {
  executionId: string;
  approvalId: string;
  interventionId: string;
  interventionType: OrchestratedInterventionType;
  decisionId: string;
  idempotencyKey: string;
  mode: ExecutionModeV9;
  status: ExecutionResultStatus;
  governor: GovernorResult;
  preconditions: PreconditionCheck[];
  transaction: TransactionResult | null;
  verification: VerificationResult | null;
  outcome: ExecutionOutcome | null;
  auditTrace: AuditTraceStep[];
  productionMutation: "NONE";
  startedAt: string;
  finishedAt: string;
};

export type ExecuteInterventionInput = {
  interventionId: string;
  approvalId: string;
  idempotencyKey: string;
  mode: ExecutionModeV9;
  actor: Actor;
  /** Current platform facts — re-read before execute */
  currentState: import("@/lib/intelligence/engine-types").PlatformState;
  currentStateFingerprint: string;
  currentTwinHash: string;
  dataQualityStatus: "OK" | "DEGRADED" | "INSUFFICIENT";
  insufficientEvidence: boolean;
  /** Deterministic clock for expiry / audit (ISO) */
  nowIso: string;
  cycleId: string;
};

export type SnapshotExecutionSlice = {
  status: ApprovalLifecycle | "IDLE" | "READY_FOR_GOVERNANCE";
  killSwitch: KillSwitchState;
  autoExecute: false;
  approval: {
    approvalId: string | null;
    lifecycle: ApprovalLifecycle | null;
    requiresApproval: boolean;
    expiresAt: string | null;
  } | null;
  authorization: { authorized: boolean; reasons: string[] };
  governor: { verdict: string; reasons: string[] };
  idempotency: { key: string | null };
  verification: { note: string };
  outcome: {
    success: boolean | null;
    productionMutation: "NONE";
  } | null;
  executionTrace: AuditTraceStep[];
  modeDefault: "DRY_RUN";
  note: string;
};
