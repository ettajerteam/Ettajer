/**
 * Conflict + duplicate detection for intervention orchestration.
 */
import type { OrchestratedInterventionType } from "@/lib/intelligence/interventions/types";

const CONFLICTS: Record<string, string[]> = {
  DNS_DIAGNOSIS: ["DOMAIN_DISCONNECT"],
  MERCHANT_ONBOARDING: ["MERCHANT_SUSPENSION"],
  ACTIVATION_OUTREACH: ["DORMANCY_CLASSIFICATION"],
  FIRST_SALE_ASSISTANCE: ["DORMANCY_CLASSIFICATION"],
};

export function detectConflicts(input: {
  type: OrchestratedInterventionType;
  activeTypes?: string[];
}): string[] {
  const active = input.activeTypes ?? [];
  const forbidden = CONFLICTS[input.type] ?? [];
  return forbidden
    .filter((f) => active.includes(f))
    .map((f) => `${input.type} conflicts with active ${f}`);
}

export type ActiveInterventionRef = {
  interventionId: string;
  type: string;
  status: string;
  idempotencyKey: string;
};

export function detectDuplicate(input: {
  type: string;
  idempotencyKey: string;
  active: ActiveInterventionRef[];
}): { isDuplicate: boolean; duplicateOf: string | null; reason: string | null } {
  const hit = input.active.find(
    (a) =>
      (a.type === input.type || a.idempotencyKey === input.idempotencyKey) &&
      [
        "PROPOSED",
        "READY_FOR_APPROVAL",
        "APPROVED",
        "EXECUTION_READY",
        "EXECUTED",
      ].includes(a.status)
  );
  if (!hit) {
    return { isDuplicate: false, duplicateOf: null, reason: null };
  }
  return {
    isDuplicate: true,
    duplicateOf: hit.interventionId,
    reason:
      hit.status === "EXECUTED" || hit.status === "APPROVED"
        ? "ALREADY_IN_PROGRESS"
        : "DUPLICATE",
  };
}
