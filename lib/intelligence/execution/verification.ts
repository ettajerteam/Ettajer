/**
 * Post-execution verification — execution success ≠ business success.
 */
import type { PlatformState } from "@/lib/intelligence/engine-types";
import type { InterventionPlan } from "@/lib/intelligence/interventions/types";
import type { VerificationResult } from "@/lib/intelligence/execution/types";
import { compareOutcome } from "@/lib/intelligence/memory/outcome-history";

export function verifyExecution(input: {
  plan: InterventionPlan;
  before: PlatformState;
  after: PlatformState;
}): VerificationResult {
  const observed = metricsFromState(input.after);
  const beforeMetrics = metricsFromState(input.before);
  const expected = {
    ...input.plan.measurement.expectedAfter,
  } as Record<string, number | [number, number]>;

  const invariants: VerificationResult["invariants"] = [];

  if (input.plan.type === "COD_VERIFICATION") {
    const ok = observed.pendingCOD <= beforeMetrics.pendingCOD;
    invariants.push({
      id: "pending_cod_non_increase",
      status: ok ? "PASS" : "FAIL",
      detail: `pendingCOD ${beforeMetrics.pendingCOD} → ${observed.pendingCOD}`,
    });
  }

  if (input.plan.type === "SUPPORT_ESCALATION") {
    const ok = observed.supportBacklog <= beforeMetrics.supportBacklog;
    invariants.push({
      id: "support_non_increase",
      status: ok ? "PASS" : "FAIL",
      detail: `support ${beforeMetrics.supportBacklog} → ${observed.supportBacklog}`,
    });
  }

  // Generic: no unexpected increase on primary metric when expected is a range lower than baseline
  const primary = input.plan.measurement.primaryMetric;
  if (primary && primary in observed && primary in beforeMetrics) {
    const exp = expected[primary];
    if (Array.isArray(exp)) {
      const improved = observed[primary]! <= beforeMetrics[primary]!;
      invariants.push({
        id: "primary_direction",
        status: improved || observed[primary]! === beforeMetrics[primary]! ? "PASS" : "FAIL",
        detail: `${primary} ${beforeMetrics[primary]} → ${observed[primary]} expected ${JSON.stringify(exp)}`,
      });
    }
  }

  const cmp = compareOutcome({
    predicted: expected,
    observed,
    sufficientData: Object.keys(observed).length > 0,
  });

  const invariantOk = invariants.every((i) => i.status === "PASS");
  const businessSuccess =
    invariantOk &&
    (cmp.status === "SUCCESS" ||
      cmp.status === "PARTIAL" ||
      (cmp.status === "UNKNOWN" && invariantOk));

  return {
    verified: invariantOk,
    businessSuccess,
    invariants,
    observed,
    expected,
    note: cmp.explanation,
  };
}

export function metricsFromState(state: PlatformState): Record<string, number> {
  return {
    pendingCOD: state.pendingRealOrders,
    pendingGMV: state.pendingRealGmv,
    supportBacklog: state.openSupport,
    domainFailures: state.domainFailing,
    firstSalePool: state.firstSaleCount,
    emptyStores: state.hotEmptyCount,
    totalStores: state.totalStores,
    top2SharePct: state.top2SharePct,
  };
}
