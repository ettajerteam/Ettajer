/**
 * Approval lifecycle — bound to exact plan state fingerprint / twinHash.
 * In-memory store only — no Prisma.
 */
import type { InterventionPlan } from "@/lib/intelligence/interventions/types";
import type {
  Actor,
  ApprovalLifecycle,
  ApprovalRecord,
} from "@/lib/intelligence/execution/types";
import { buildApprovalId } from "@/lib/intelligence/execution/idempotency";
import { EXECUTION_CONFIG } from "@/lib/intelligence/execution/config";
import { evaluateAuthorization } from "@/lib/intelligence/execution/authorization";
import { getExecutionDef } from "@/lib/intelligence/execution/registry";

const approvals = new Map<string, ApprovalRecord>();

export function resetApprovals(): void {
  approvals.clear();
}

export function getApproval(approvalId: string): ApprovalRecord | null {
  return approvals.get(approvalId) ?? null;
}

export function listApprovals(): ApprovalRecord[] {
  return [...approvals.values()].sort((a, b) =>
    a.approvalId.localeCompare(b.approvalId)
  );
}

function isExpired(rec: ApprovalRecord, nowIso: string): boolean {
  return nowIso > rec.expiresAt;
}

export function refreshExpiry(
  rec: ApprovalRecord,
  nowIso: string
): ApprovalRecord {
  if (
    (rec.lifecycle === "APPROVED" || rec.lifecycle === "READY_FOR_APPROVAL") &&
    isExpired(rec, nowIso)
  ) {
    const next = { ...rec, lifecycle: "EXPIRED" as ApprovalLifecycle };
    approvals.set(rec.approvalId, next);
    return next;
  }
  return rec;
}

export function requestApproval(input: {
  plan: InterventionPlan;
  decisionId: string;
  decisionTrace: string[];
  stateFingerprint: string;
  twinHash: string;
  actor: Actor;
  nowIso: string;
  ttlMs?: number;
}): { approval: ApprovalRecord; created: boolean } {
  const def = getExecutionDef(input.plan.type);
  if (!def) {
    const blocked: ApprovalRecord = {
      approvalId: buildApprovalId({
        decisionId: input.decisionId,
        interventionId: input.plan.interventionId,
        stateFingerprint: input.stateFingerprint,
        twinHash: input.twinHash,
      }),
      decisionId: input.decisionId,
      interventionId: input.plan.interventionId,
      interventionType: input.plan.type,
      lifecycle: "BLOCKED",
      requestedAt: input.nowIso,
      approvedAt: null,
      approvedBy: null,
      rejectedAt: null,
      rejectedBy: null,
      expiresAt: input.nowIso,
      stateFingerprint: input.stateFingerprint,
      twinHash: input.twinHash,
      decisionTrace: input.decisionTrace,
      riskSnapshot: input.plan.risk.overallRisk,
      blastRadiusSnapshot: input.plan.blastRadius.level,
      safetySnapshot: input.plan.safetyLevel,
      idempotencyKey: input.plan.execution.idempotencyKey,
      planSnapshot: input.plan,
      reasons: ["Unregistered intervention — cannot request approval."],
    };
    approvals.set(blocked.approvalId, blocked);
    return { approval: blocked, created: true };
  }

  if (input.plan.status === "BLOCKED" || input.plan.safetyLevel === "BLOCKED") {
    const blockedId = buildApprovalId({
      decisionId: input.decisionId,
      interventionId: input.plan.interventionId,
      stateFingerprint: input.stateFingerprint,
      twinHash: input.twinHash,
    });
    const blocked: ApprovalRecord = {
      approvalId: blockedId,
      decisionId: input.decisionId,
      interventionId: input.plan.interventionId,
      interventionType: input.plan.type,
      lifecycle: "BLOCKED",
      requestedAt: input.nowIso,
      approvedAt: null,
      approvedBy: null,
      rejectedAt: null,
      rejectedBy: null,
      expiresAt: input.nowIso,
      stateFingerprint: input.stateFingerprint,
      twinHash: input.twinHash,
      decisionTrace: input.decisionTrace,
      riskSnapshot: input.plan.risk.overallRisk,
      blastRadiusSnapshot: input.plan.blastRadius.level,
      safetySnapshot: input.plan.safetyLevel,
      idempotencyKey: input.plan.execution.idempotencyKey,
      planSnapshot: input.plan,
      reasons: ["Plan is BLOCKED — approval request refused."],
    };
    approvals.set(blockedId, blocked);
    return { approval: blocked, created: true };
  }

  const approvalId = buildApprovalId({
    decisionId: input.decisionId,
    interventionId: input.plan.interventionId,
    stateFingerprint: input.stateFingerprint,
    twinHash: input.twinHash,
  });

  const existing = approvals.get(approvalId);
  if (existing) {
    return { approval: refreshExpiry(existing, input.nowIso), created: false };
  }

  const ttl = input.ttlMs ?? EXECUTION_CONFIG.approvalTtlMs;
  const expiresAt = new Date(
    new Date(input.nowIso).getTime() + ttl
  ).toISOString();

  const auth = evaluateAuthorization({
    actor: input.actor,
    approval: {
      approvalId,
      decisionId: input.decisionId,
      interventionId: input.plan.interventionId,
      interventionType: input.plan.type,
      lifecycle: "READY_FOR_APPROVAL",
      requestedAt: input.nowIso,
      approvedAt: null,
      approvedBy: null,
      rejectedAt: null,
      rejectedBy: null,
      expiresAt,
      stateFingerprint: input.stateFingerprint,
      twinHash: input.twinHash,
      decisionTrace: input.decisionTrace,
      riskSnapshot: input.plan.risk.overallRisk,
      blastRadiusSnapshot: input.plan.blastRadius.level,
      safetySnapshot: input.plan.safetyLevel,
      idempotencyKey: input.plan.execution.idempotencyKey,
      planSnapshot: input.plan,
      reasons: [],
    },
    requireExecutePermission: false,
  });

  const lifecycle: ApprovalLifecycle =
    !def.requiresApproval
      ? "APPROVED"
      : auth.authorized
        ? "READY_FOR_APPROVAL"
        : "BLOCKED";

  const record: ApprovalRecord = {
    approvalId,
    decisionId: input.decisionId,
    interventionId: input.plan.interventionId,
    interventionType: input.plan.type,
    lifecycle,
    requestedAt: input.nowIso,
    approvedAt: lifecycle === "APPROVED" ? input.nowIso : null,
    approvedBy: lifecycle === "APPROVED" ? input.actor.actorId : null,
    rejectedAt: null,
    rejectedBy: null,
    expiresAt,
    stateFingerprint: input.stateFingerprint,
    twinHash: input.twinHash,
    decisionTrace: input.decisionTrace,
    riskSnapshot: input.plan.risk.overallRisk,
    blastRadiusSnapshot: input.plan.blastRadius.level,
    safetySnapshot: input.plan.safetyLevel,
    idempotencyKey: input.plan.execution.idempotencyKey,
    planSnapshot: input.plan,
    reasons:
      lifecycle === "BLOCKED"
        ? auth.reasons
        : ["Approval requested; human confirmation required."],
  };
  approvals.set(approvalId, record);
  return { approval: record, created: true };
}

export function approve(input: {
  approvalId: string;
  actor: Actor;
  nowIso: string;
}): ApprovalRecord {
  const rec = approvals.get(input.approvalId);
  if (!rec) {
    throw new Error(`Unknown approvalId ${input.approvalId}`);
  }
  const current = refreshExpiry(rec, input.nowIso);
  if (current.lifecycle === "EXPIRED") return current;
  if (current.lifecycle === "REJECTED" || current.lifecycle === "CANCELLED") {
    return current;
  }
  if (current.lifecycle === "EXECUTED" || current.lifecycle === "EXECUTING") {
    return current;
  }
  const auth = evaluateAuthorization({
    actor: input.actor,
    approval: { ...current, lifecycle: "READY_FOR_APPROVAL" },
    requireExecutePermission: false,
  });
  if (!auth.authorized) {
    const blocked = {
      ...current,
      lifecycle: "BLOCKED" as const,
      reasons: auth.reasons,
    };
    approvals.set(current.approvalId, blocked);
    return blocked;
  }
  const next: ApprovalRecord = {
    ...current,
    lifecycle: "APPROVED",
    approvedAt: input.nowIso,
    approvedBy: input.actor.actorId,
    reasons: ["Human approved."],
  };
  approvals.set(next.approvalId, next);
  return next;
}

export function reject(input: {
  approvalId: string;
  actor: Actor;
  nowIso: string;
  reason: string;
}): ApprovalRecord {
  const rec = approvals.get(input.approvalId);
  if (!rec) throw new Error(`Unknown approvalId ${input.approvalId}`);
  const next: ApprovalRecord = {
    ...rec,
    lifecycle: "REJECTED",
    rejectedAt: input.nowIso,
    rejectedBy: input.actor.actorId,
    reasons: [input.reason],
  };
  approvals.set(next.approvalId, next);
  return next;
}

export function cancel(input: {
  approvalId: string;
  actor: Actor;
  nowIso: string;
}): ApprovalRecord {
  const rec = approvals.get(input.approvalId);
  if (!rec) throw new Error(`Unknown approvalId ${input.approvalId}`);
  const next: ApprovalRecord = {
    ...rec,
    lifecycle: "CANCELLED",
    reasons: [`Cancelled by ${input.actor.actorId} at ${input.nowIso}`],
  };
  approvals.set(next.approvalId, next);
  return next;
}

export function markApprovalLifecycle(
  approvalId: string,
  lifecycle: ApprovalLifecycle,
  extra?: Partial<ApprovalRecord>
): ApprovalRecord {
  const rec = approvals.get(approvalId);
  if (!rec) throw new Error(`Unknown approvalId ${approvalId}`);
  const next = { ...rec, ...extra, lifecycle };
  approvals.set(approvalId, next);
  return next;
}
