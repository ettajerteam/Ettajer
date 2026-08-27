/**
 * planIntervention — map TOP_DECISION → structured InterventionPlan (no execution).
 */
import type { PlatformState } from "@/lib/intelligence/engine-types";
import {
  decisionToInterventionType,
  getInterventionDef,
} from "@/lib/intelligence/interventions/registry";
import {
  evaluatePrerequisites,
  prerequisitesPassed,
} from "@/lib/intelligence/interventions/prerequisites";
import {
  calculateBlastRadius,
  evaluateSafety,
} from "@/lib/intelligence/interventions/safety";
import { evaluateRisk } from "@/lib/intelligence/interventions/risk";
import { evaluateApproval } from "@/lib/intelligence/interventions/approval";
import { buildRollbackPlan } from "@/lib/intelligence/interventions/rollback";
import {
  baselineFromState,
  buildMeasurementPlan,
} from "@/lib/intelligence/interventions/measurement-plan";
import {
  buildExecutionPlan,
  buildIdempotencyKey,
} from "@/lib/intelligence/interventions/execution-plan";
import {
  detectConflicts,
  detectDuplicate,
  type ActiveInterventionRef,
} from "@/lib/intelligence/interventions/conflicts-v8";
import type {
  ExecutionMode,
  InterventionPlan,
  InterventionStatus,
  InterventionTraceStage,
} from "@/lib/intelligence/interventions/types";

export function planIntervention(input: {
  decisionId: string;
  decisionTitle: string;
  decisionScore: number;
  decisionConfidence: number;
  decisionRoute: string;
  whyThis: string[];
  state: PlatformState;
  stateFingerprint: string;
  twinHash: string;
  dataQualityStatus: "OK" | "DEGRADED" | "INSUFFICIENT";
  insufficientEvidence: boolean;
  historicalReliability?: string;
  expectedAfter?: Record<string, [number, number]>;
  baselineOverride?: Record<string, number>;
  activeInterventions?: ActiveInterventionRef[];
  activeConflictTypes?: string[];
  cycleId: string;
}): InterventionPlan {
  const trace: InterventionTraceStage[] = [];
  const type = decisionToInterventionType(input.decisionId);
  const def = getInterventionDef(type)!;

  trace.push({
    stage: "DECISION",
    detail: `${input.decisionId} score=${input.decisionScore} conf=${input.decisionConfidence}`,
  });
  trace.push({
    stage: "INTERVENTION_SELECTED",
    detail: `${type} — ${def.objective}`,
  });

  const prerequisites = evaluatePrerequisites({ type, state: input.state });
  const prereqOk = prerequisitesPassed(prerequisites);
  trace.push({
    stage: "PREREQUISITES",
    detail: prerequisites
      .map((p) => `${p.prerequisiteId}:${p.status}`)
      .join("|"),
  });

  const targetCount = targetCountFor(type, input.state);
  const blast = calculateBlastRadius({
    def,
    state: input.state,
    targetCount,
  });

  const conflicts = detectConflicts({
    type,
    activeTypes: input.activeConflictTypes,
  });

  const idempotencyKey = buildIdempotencyKey({
    interventionType: type,
    stateFingerprint: input.stateFingerprint,
    decisionId: input.decisionId,
    targetCount,
  });

  const dup = detectDuplicate({
    type,
    idempotencyKey,
    active: input.activeInterventions ?? [],
  });

  const safety = evaluateSafety({
    def,
    state: input.state,
    dataQualityStatus: input.dataQualityStatus,
    insufficientEvidence: input.insufficientEvidence,
    prerequisitesOk: prereqOk,
    blast,
    conflicts,
    isDuplicate: dup.isDuplicate,
    historicalReliability: input.historicalReliability ?? "INSUFFICIENT",
  });
  trace.push({
    stage: "SAFETY",
    detail: `${safety.level} checks=${safety.checks.length}`,
  });

  const risk = evaluateRisk({
    def,
    blast,
    safetyLevel: safety.level,
  });
  trace.push({
    stage: "RISK",
    detail: `overall=${risk.overallRisk}`,
  });

  const approval = evaluateApproval({
    def,
    safetyLevel: safety.level,
    risk,
    blast,
  });
  trace.push({
    stage: "APPROVAL",
    detail: `${approval.level} humanRequired=${approval.humanRequired}`,
  });

  const execution = buildExecutionPlan({
    def,
    idempotencyKey,
    approvalLevel: approval.level,
    targetLabel: `${targetCount} target(s)`,
  });
  trace.push({
    stage: "EXECUTION_PLAN",
    detail: `steps=${execution.steps.length} key=${idempotencyKey}`,
  });

  const rollback = buildRollbackPlan(def);
  trace.push({
    stage: "ROLLBACK",
    detail: `possible=${rollback.possible} reversibility=${rollback.reversibility}`,
  });

  const baseline =
    input.baselineOverride ?? baselineFromState(def, input.state);
  const expectedAfter = input.expectedAfter ?? {};
  const measurement = buildMeasurementPlan({
    def,
    state: input.state,
    baseline,
    expectedAfter,
  });
  trace.push({
    stage: "MEASUREMENT",
    detail: `primary=${measurement.primaryMetric} window=${measurement.measurementWindow}`,
  });

  const status = resolveStatus({
    safetyLevel: safety.level,
    approvalLevel: approval.level,
    prereqOk,
    isDuplicate: dup.isDuplicate,
    duplicateReason: dup.reason,
    type,
  });

  const executionMode: ExecutionMode =
    status === "BLOCKED" ||
    status === "DUPLICATE" ||
    status === "ALREADY_IN_PROGRESS"
      ? "RECOMMENDATION_ONLY"
      : status === "READY_FOR_APPROVAL" || status === "EXECUTION_READY"
        ? "READY_FOR_APPROVAL"
        : "RECOMMENDATION_ONLY";

  const interventionId = `plan_${idempotencyKey}`;

  return {
    interventionId,
    type,
    target: {
      label: targetLabel(type, input.state, targetCount),
      count: targetCount,
      route: def.route,
    },
    objective: def.objective,
    priority: Math.round(input.decisionScore),
    rationale: [
      ...input.whyThis.slice(0, 4),
      `Mapped from TOP_DECISION ${input.decisionId}.`,
      `Twin fingerprint=${input.stateFingerprint}; twinHash=${input.twinHash}.`,
    ],
    prerequisites,
    safetyChecks: safety.checks,
    safetyLevel: safety.level,
    blastRadius: blast,
    risk,
    approval,
    execution,
    rollback,
    measurement,
    status,
    executionMode,
    conflicts,
    duplicateOf: dup.duplicateOf,
    trace,
    reviewHref: input.decisionRoute || def.route,
  };
}

function targetCountFor(type: string, state: PlatformState): number {
  switch (type) {
    case "COD_VERIFICATION":
      return state.pendingRealOrders;
    case "DNS_DIAGNOSIS":
      return state.domainFailing;
    case "SUPPORT_ESCALATION":
      return state.openSupport;
    case "FIRST_SALE_ASSISTANCE":
      return state.firstSaleCount;
    case "ACTIVATION_OUTREACH":
      return Math.max(state.hotEmptyCount, state.loggedInEmpty7d);
    case "MERCHANT_ONBOARDING":
      return 100;
    case "REVENUE_CONCENTRATION_REVIEW":
      return Math.max(2, state.concentration.length);
    default:
      return 0;
  }
}

function targetLabel(
  type: string,
  state: PlatformState,
  count: number
): string {
  switch (type) {
    case "COD_VERIFICATION":
      return `${count} pending COD orders (GMV ${state.pendingRealGmv})`;
    case "DNS_DIAGNOSIS":
      return `${count} failing domains`;
    case "SUPPORT_ESCALATION":
      return `${count} open support threads`;
    case "FIRST_SALE_ASSISTANCE":
      return `${count} first-sale merchants`;
    case "ACTIVATION_OUTREACH":
      return `${count} empty/active stores`;
    case "MERCHANT_ONBOARDING":
      return `onboarding cohort up to ${count}`;
    case "REVENUE_CONCENTRATION_REVIEW":
      return `top merchants (share ${state.top2SharePct}%)`;
    default:
      return "none";
  }
}

function resolveStatus(input: {
  safetyLevel: string;
  approvalLevel: string;
  prereqOk: boolean;
  isDuplicate: boolean;
  duplicateReason: string | null;
  type: string;
}): InterventionStatus {
  if (input.isDuplicate) {
    return input.duplicateReason === "ALREADY_IN_PROGRESS"
      ? "ALREADY_IN_PROGRESS"
      : "DUPLICATE";
  }
  if (!input.prereqOk || input.safetyLevel === "BLOCKED") return "BLOCKED";
  if (input.approvalLevel === "BLOCKED") return "BLOCKED";
  if (input.type === "NO_ACTION") return "PROPOSED";
  if (
    input.approvalLevel === "REQUIRED" ||
    input.approvalLevel === "RECOMMENDED"
  ) {
    return "READY_FOR_APPROVAL";
  }
  return "EXECUTION_READY";
}
