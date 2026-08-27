/**
 * Deterministic authorization for V9 execution.
 */
import type { Actor, Permission } from "@/lib/intelligence/execution/types";
import type { ApprovalRecord } from "@/lib/intelligence/execution/types";
import { getExecutionDef } from "@/lib/intelligence/execution/registry";

export function actorHasPermission(
  actor: Actor,
  permission: Permission
): boolean {
  if (actor.role === "viewer") return false;
  return actor.permissions.includes(permission);
}

export function evaluateAuthorization(input: {
  actor: Actor;
  approval: ApprovalRecord | null;
  requireExecutePermission?: boolean;
}): { authorized: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!input.approval) {
    reasons.push("No approval record.");
    return { authorized: false, reasons };
  }
  const def = getExecutionDef(input.approval.interventionType);
  if (!def) {
    reasons.push("Intervention not registered for execution.");
    return { authorized: false, reasons };
  }
  if (input.actor.role === "viewer") {
    reasons.push("Viewer role cannot execute.");
    return { authorized: false, reasons };
  }
  if (!actorHasPermission(input.actor, def.requiredPermission)) {
    reasons.push(`Missing permission ${def.requiredPermission}.`);
  }
  if (
    input.requireExecutePermission !== false &&
    !actorHasPermission(input.actor, "intervention:execute")
  ) {
    reasons.push("Missing permission intervention:execute.");
  }
  if (
    input.approval.lifecycle === "APPROVED" ||
    input.approval.lifecycle === "EXECUTING" ||
    input.approval.lifecycle === "EXECUTED"
  ) {
    // ok for auth check of approval presence
  } else if (input.approval.lifecycle === "READY_FOR_APPROVAL") {
    if (!actorHasPermission(input.actor, "intervention:approve")) {
      reasons.push("Missing permission intervention:approve.");
    }
  }
  return { authorized: reasons.length === 0, reasons };
}

export function adminActor(actorId = "admin-1"): Actor {
  return {
    actorId,
    role: "admin",
    permissions: [
      "intervention:cod_verify",
      "intervention:dns_diagnose",
      "intervention:support_escalate",
      "intervention:merchant_onboard",
      "intervention:first_sale",
      "intervention:activation",
      "intervention:concentration_review",
      "intervention:noop",
      "intervention:approve",
      "intervention:execute",
    ],
  };
}
