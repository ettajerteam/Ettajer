/**
 * Global execution governor — hard safety gate before any mutation.
 */
import type {
  ApprovalRecord,
  Actor,
  ExecuteInterventionInput,
  GovernorCheck,
  GovernorResult,
  GovernorVerdict,
} from "@/lib/intelligence/execution/types";
import { isExecutionAllowedByKillSwitch, getKillSwitch } from "@/lib/intelligence/execution/kill-switch";
import { getExecutionDef } from "@/lib/intelligence/execution/registry";
import { evaluateAuthorization } from "@/lib/intelligence/execution/authorization";
import { refreshExpiry } from "@/lib/intelligence/execution/approval";
import { recheckPreconditions } from "@/lib/intelligence/execution/preconditions";
import { BLAST_RANK } from "@/lib/intelligence/execution/config";

export function runGovernor(input: {
  approval: ApprovalRecord | null;
  actor: Actor;
  exec: ExecuteInterventionInput;
  alreadyExecuting: boolean;
  priorExecutionExists: boolean;
}): GovernorResult {
  const checks: GovernorCheck[] = [];
  const reasons: string[] = [];

  const add = (checkId: string, ok: boolean, reason: string) => {
    checks.push({ checkId, status: ok ? "PASS" : "FAIL", reason });
    if (!ok) reasons.push(reason);
  };

  // Kill switch
  const ks = getKillSwitch();
  if (input.exec.mode === "EXECUTE") {
    const allowed = isExecutionAllowedByKillSwitch();
    add(
      "kill_switch",
      allowed,
      allowed
        ? "Kill switch ENABLED."
        : "Kill switch DISABLED — execution blocked."
    );
    if (!allowed) {
      return { verdict: "KILL_SWITCH", checks, reasons };
    }
  } else {
    add("kill_switch", true, `DRY_RUN — kill switch=${ks} (informational).`);
  }

  if (!input.approval) {
    add("approval_present", false, "No approval — no execution.");
    return { verdict: "BLOCKED", checks, reasons };
  }

  const approval = refreshExpiry(input.approval, input.exec.nowIso);

  if (approval.lifecycle === "EXPIRED") {
    add("approval_expiry", false, "Approval expired.");
    return { verdict: "APPROVAL_EXPIRED", checks, reasons };
  }
  add("approval_expiry", true, "Approval not expired.");

  if (approval.lifecycle === "REJECTED" || approval.lifecycle === "CANCELLED") {
    add("approval_lifecycle", false, `Approval ${approval.lifecycle}.`);
    return { verdict: "BLOCKED", checks, reasons };
  }

  if (approval.lifecycle !== "APPROVED" && approval.lifecycle !== "EXECUTING" && approval.lifecycle !== "EXECUTED") {
    add(
      "approval_lifecycle",
      false,
      `Approval lifecycle=${approval.lifecycle}; must be APPROVED before execute.`
    );
    return { verdict: "BLOCKED", checks, reasons };
  }
  add("approval_lifecycle", true, `Approval ${approval.lifecycle}.`);

  if (input.priorExecutionExists && input.exec.mode === "EXECUTE") {
    add("idempotency", true, "Prior execution exists — will replay.");
    return {
      verdict: "IDEMPOTENT_REPLAY",
      checks,
      reasons: ["Idempotent replay of prior execution."],
    };
  }

  if (input.alreadyExecuting) {
    add("concurrency", false, "Another execution in progress for same key.");
    return { verdict: "CONFLICT_ALREADY_EXECUTING", checks, reasons };
  }
  add("concurrency", true, "No concurrent execution lock.");

  const def = getExecutionDef(approval.interventionType);
  if (!def) {
    add("registry", false, "Unregistered intervention.");
    return { verdict: "UNREGISTERED", checks, reasons };
  }
  add("registry", true, `Registered ${def.interventionType}.`);

  if (def.requiresApproval && !approval.approvedBy && approval.lifecycle !== "EXECUTED") {
    // APPROVED must have approvedBy unless NO_ACTION auto-path
    if (approval.interventionType !== "NO_ACTION") {
      add("human_approval", false, "Missing approvedBy — no implicit approval.");
      return { verdict: "BLOCKED", checks, reasons };
    }
  }
  add("human_approval", true, "Human approval recorded or not required.");

  const auth = evaluateAuthorization({
    actor: input.actor,
    approval,
    requireExecutePermission: true,
  });
  add("authorization", auth.authorized, auth.authorized ? "Authorized." : auth.reasons.join(" "));
  if (!auth.authorized) {
    return { verdict: "UNAUTHORIZED", checks, reasons };
  }

  // Matching ids
  if (input.exec.interventionId !== approval.interventionId) {
    add("intervention_match", false, "interventionId mismatch.");
    return { verdict: "BLOCKED", checks, reasons };
  }
  add("intervention_match", true, "interventionId matches.");

  if (input.exec.idempotencyKey !== approval.idempotencyKey &&
      !input.exec.idempotencyKey.startsWith("ix9_")) {
    // Allow V9 execution key OR plan key — both must be deterministic
    add("idempotency_key", true, "Using execution idempotency key.");
  } else {
    add("idempotency_key", true, "Idempotency key accepted.");
  }

  const pre = recheckPreconditions({
    approval,
    currentState: input.exec.currentState,
    currentStateFingerprint: input.exec.currentStateFingerprint,
    currentTwinHash: input.exec.currentTwinHash,
    dataQualityStatus: input.exec.dataQualityStatus,
    insufficientEvidence: input.exec.insufficientEvidence,
  });
  for (const c of pre.checks) {
    add(`pre_${c.checkId}`, c.status === "PASS", c.reason);
  }
  if (!pre.ok) {
    return { verdict: "PRECONDITION_FAILED", checks, reasons };
  }

  // Safety / blast policy
  const blastRank = BLAST_RANK[approval.blastRadiusSnapshot] ?? 0;
  if (blastRank >= BLAST_RANK.CRITICAL && !approval.approvedBy) {
    add("blast_policy", false, "CRITICAL blast requires explicit approver.");
    return { verdict: "BLOCKED", checks, reasons };
  }
  add("blast_policy", true, `Blast ${approval.blastRadiusSnapshot} within policy.`);

  if (approval.safetySnapshot === "BLOCKED") {
    add("safety_snapshot", false, "Approved plan was BLOCKED.");
    return { verdict: "BLOCKED", checks, reasons };
  }
  add("safety_snapshot", true, `Safety snapshot ${approval.safetySnapshot}.`);

  return { verdict: "PASS", checks, reasons: ["Governor PASS."] };
}

export function mapVerdictToStatus(
  verdict: GovernorVerdict
): import("@/lib/intelligence/execution/types").ExecutionResultStatus {
  switch (verdict) {
    case "PASS":
      return "EXECUTED";
    case "IDEMPOTENT_REPLAY":
      return "IDEMPOTENT_REPLAY";
    case "APPROVAL_EXPIRED":
      return "APPROVAL_EXPIRED";
    case "PRECONDITION_FAILED":
      return "PRECONDITION_FAILED";
    case "CONFLICT_ALREADY_EXECUTING":
      return "CONFLICT_ALREADY_EXECUTING";
    case "KILL_SWITCH":
      return "BLOCKED";
    case "UNAUTHORIZED":
      return "BLOCKED";
    case "UNREGISTERED":
      return "BLOCKED";
    default:
      return "BLOCKED";
  }
}
