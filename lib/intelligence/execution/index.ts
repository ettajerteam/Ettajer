/**
 * Dr Sara V9 — Controlled Execution & Governance
 */
export type * from "@/lib/intelligence/execution/types";
export { EXECUTION_CONFIG, BLAST_RANK } from "@/lib/intelligence/execution/config";
export {
  stableHash,
  buildApprovalId,
  buildExecutionId,
  buildExecutionIdempotencyKey,
} from "@/lib/intelligence/execution/idempotency";
export {
  getKillSwitch,
  setKillSwitch,
  resetKillSwitch,
  isExecutionAllowedByKillSwitch,
} from "@/lib/intelligence/execution/kill-switch";
export {
  EXECUTION_REGISTRY,
  getExecutionDef,
  getHandler,
  permissionForType,
} from "@/lib/intelligence/execution/registry";
export {
  actorHasPermission,
  evaluateAuthorization,
  adminActor,
} from "@/lib/intelligence/execution/authorization";
export {
  requestApproval,
  approve,
  reject,
  cancel,
  getApproval,
  listApprovals,
  resetApprovals,
  markApprovalLifecycle,
  refreshExpiry,
} from "@/lib/intelligence/execution/approval";
export { recheckPreconditions } from "@/lib/intelligence/execution/preconditions";
export {
  runGovernor,
  mapVerdictToStatus,
} from "@/lib/intelligence/execution/governor";
export { runSandboxTransaction } from "@/lib/intelligence/execution/transaction";
export { describeRollback } from "@/lib/intelligence/execution/rollback";
export {
  verifyExecution,
  metricsFromState,
} from "@/lib/intelligence/execution/verification";
export { auditStep, TRACE_STAGES } from "@/lib/intelligence/execution/audit";
export {
  buildExecutionOutcome,
  toOutcomeMemoryRecord,
} from "@/lib/intelligence/execution/outcome";
export {
  executeIntervention,
  resetExecutions,
  getExecutionByKey,
  listExecutions,
} from "@/lib/intelligence/execution/executor";
export {
  runGovernedExecution,
  buildSnapshotExecutionSlice,
  resetExecutionEngine,
} from "@/lib/intelligence/execution/engine";
