/**
 * Immutable execution audit trace builder.
 */
import type { AuditTraceStep } from "@/lib/intelligence/execution/types";

export function auditStep(input: {
  stage: string;
  timestamp: string;
  stateFingerprint: string;
  actor: string;
  result: string;
  reason: string;
  identifiers?: Record<string, string>;
}): AuditTraceStep {
  return {
    stage: input.stage,
    timestamp: input.timestamp,
    stateFingerprint: input.stateFingerprint,
    actor: input.actor,
    result: input.result,
    reason: input.reason,
    identifiers: input.identifiers ?? {},
  };
}

export const TRACE_STAGES = [
  "OBSERVE",
  "DECISION",
  "SCENARIO",
  "PLAN",
  "APPROVAL_REQUEST",
  "APPROVAL",
  "PRECONDITION_CHECK",
  "GOVERNOR_CHECK",
  "EXECUTION",
  "VERIFICATION",
  "MEASUREMENT",
  "OUTCOME",
] as const;
