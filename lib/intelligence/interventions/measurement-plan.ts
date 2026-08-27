/**
 * Measurement plan from V5 scenario expectedAfter when available.
 */
import type { MeasurementPlan } from "@/lib/intelligence/interventions/types";
import type { RegistryInterventionDef } from "@/lib/intelligence/interventions/types";
import type { PlatformState } from "@/lib/intelligence/engine-types";

export function buildMeasurementPlan(input: {
  def: RegistryInterventionDef;
  state: PlatformState;
  baseline: Record<string, number>;
  expectedAfter: Record<string, [number, number]>;
}): MeasurementPlan {
  const { def, baseline, expectedAfter } = input;
  const primary =
    def.measurementMetrics[0] ??
    (Object.keys(baseline)[0] ?? "none");

  const hasExpectation = Object.keys(expectedAfter).length > 0;

  return {
    primaryMetric: primary,
    secondaryMetrics: def.measurementMetrics.slice(1),
    measurementWindow: "7d",
    baseline,
    expectedAfter,
    successCriteria: hasExpectation
      ? `Observed ${primary} within expectedAfter range (SIMULATED plan range).`
      : "INSUFFICIENT EVIDENCE for numeric success band — qualitative improvement only.",
    failureCriteria: hasExpectation
      ? `No improvement or regression vs baseline for ${primary}.`
      : "Unable to score failure without expected range.",
    partialCriteria: hasExpectation
      ? `Improvement vs baseline but outside expectedAfter range.`
      : "Partial not scored without expected range.",
  };
}

export function baselineFromState(
  def: RegistryInterventionDef,
  state: PlatformState
): Record<string, number> {
  switch (def.type) {
    case "COD_VERIFICATION":
      return {
        pendingCOD: state.pendingRealOrders,
        pendingGMV: state.pendingRealGmv,
      };
    case "DNS_DIAGNOSIS":
      return { domainFailures: state.domainFailing };
    case "SUPPORT_ESCALATION":
      return { supportBacklog: state.openSupport };
    case "FIRST_SALE_ASSISTANCE":
      return { firstSalePool: state.firstSaleCount };
    case "ACTIVATION_OUTREACH":
      return {
        emptyStores: Math.max(state.hotEmptyCount, state.loggedInEmpty7d),
      };
    case "MERCHANT_ONBOARDING":
      return { totalStores: state.totalStores };
    case "REVENUE_CONCENTRATION_REVIEW":
      return { top2SharePct: state.top2SharePct };
    default:
      return {};
  }
}
