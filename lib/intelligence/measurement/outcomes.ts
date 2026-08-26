/**
 * Baseline → expected → observed measurement + effectiveness (deterministic).
 */
import { INTELLIGENCE_SCORING_CONFIG as C } from "@/lib/intelligence/config/scoring";
import type { IntelligenceOutcomeRecord } from "@/lib/intelligence/memory/types";

export type MetricDirection = "lower_is_better" | "higher_is_better";

export type MeasurementInput = {
  interventionId: string;
  metric: string;
  direction: MetricDirection;
  baseline: number;
  expected: number;
  observed: number;
  sufficientData: boolean;
  measuredAt: Date;
};

export type MeasurementResult = {
  absoluteDelta: number;
  relativeDelta: number;
  classification: IntelligenceOutcomeRecord["classification"];
  impactRealized: number;
  impactMissed: number;
  expectedVsActual: string;
  evidence: string[];
};

export function measureAgainstExpectation(
  input: MeasurementInput
): MeasurementResult {
  if (!input.sufficientData) {
    return {
      absoluteDelta: 0,
      relativeDelta: 0,
      classification: "INCONCLUSIVE",
      impactRealized: 0,
      impactMissed: 0,
      expectedVsActual: "Insufficient data to measure outcome.",
      evidence: ["sufficientData=false"],
    };
  }

  const absoluteDelta = input.observed - input.baseline;
  const relativeDelta =
    input.baseline === 0
      ? input.observed === 0
        ? 0
        : 100
      : Math.round((absoluteDelta / Math.abs(input.baseline)) * 1000) / 10;

  const expectedMove =
    input.direction === "lower_is_better"
      ? input.baseline - input.expected
      : input.expected - input.baseline;
  const observedMove =
    input.direction === "lower_is_better"
      ? input.baseline - input.observed
      : input.observed - input.baseline;

  const impactRealized =
    expectedMove <= 0
      ? observedMove > 0
        ? 1
        : 0
      : Math.max(0, Math.min(1, observedMove / expectedMove));
  const impactMissed = Math.max(0, 1 - impactRealized);

  let classification: IntelligenceOutcomeRecord["classification"] = "NO_EFFECT";
  if (observedMove <= 0 && expectedMove > 0) {
    classification = observedMove < 0 ? "FAILED" : "NO_EFFECT";
  } else if (impactRealized >= 1) {
    classification = "SUCCESS";
  } else if (impactRealized >= C.outcome.partialOfExpectedRatio) {
    classification = "PARTIAL";
  } else if (observedMove > 0) {
    classification = "PARTIAL";
  } else {
    classification = "NO_EFFECT";
  }

  const expectedVsActual =
    input.direction === "lower_is_better"
      ? `Expected reduction: ${Math.max(0, expectedMove)}. Observed reduction: ${Math.max(0, observedMove)}.`
      : `Expected increase: ${Math.max(0, expectedMove)}. Observed increase: ${Math.max(0, observedMove)}.`;

  return {
    absoluteDelta,
    relativeDelta,
    classification,
    impactRealized: Math.round(impactRealized * 1000) / 1000,
    impactMissed: Math.round(impactMissed * 1000) / 1000,
    expectedVsActual,
    evidence: [
      `${input.metric}: baseline=${input.baseline}`,
      `${input.metric}: expected=${input.expected}`,
      `${input.metric}: observed=${input.observed}`,
      `impactRealized=${impactRealized}`,
    ],
  };
}

export function buildOutcomeRecord(
  input: MeasurementInput,
  result: MeasurementResult
): IntelligenceOutcomeRecord {
  return {
    outcomeId: `out-${input.interventionId}-${input.measuredAt.getTime()}`,
    interventionId: input.interventionId,
    measuredAt: input.measuredAt,
    absoluteDelta: { [input.metric]: result.absoluteDelta },
    relativeDelta: { [input.metric]: result.relativeDelta },
    classification: result.classification,
    impactRealized: result.impactRealized,
    impactMissed: result.impactMissed,
    expectedVsActual: result.expectedVsActual,
    evidence: result.evidence,
  };
}

/** Expected target for common intervention types */
export function expectedTargetFor(
  type: string,
  baseline: Record<string, number>
): Record<string, number> {
  if (type === "COD_VERIFICATION") {
    const base = baseline.pendingRealOrders ?? 0;
    return {
      pendingRealOrders: Math.max(
        0,
        Math.round(base * (1 - C.outcome.expectedCodClearanceRatio))
      ),
    };
  }
  if (type === "DNS_DIAGNOSIS") {
    return { domainFailing: 0 };
  }
  if (type === "SUPPORT_ESCALATION") {
    return { openSupport: 0 };
  }
  if (
    type === "FIRST_SALE_ASSIST" ||
    type === "DOMAIN_SETUP_ASSIST" ||
    type === "ACTIVATION_OUTREACH"
  ) {
    return { realOrders: (baseline.realOrders ?? 0) + 1 };
  }
  return { ...baseline };
}

export function effectivenessScore(input: {
  expectedImpact: number;
  observedImpact: number;
  confidence: number;
  timeToResultHours: number | null;
  reversibility: number;
  actionability: number;
  historicalSuccessRate: number | null;
}): { score: number; formula: string; components: Record<string, number> } {
  const hist = input.historicalSuccessRate ?? C.decisionV4.historicalEffectivenessDefault;
  const speed =
    input.timeToResultHours == null
      ? 0.5
      : Math.max(0.2, Math.min(1, 1 - input.timeToResultHours / 48));
  const realized = Math.max(0, Math.min(1, input.observedImpact));
  const score =
    Math.round(
      (realized * 0.35 +
        input.expectedImpact * 0.1 +
        input.confidence * 0.15 +
        speed * 0.1 +
        input.reversibility * 0.1 +
        input.actionability * 0.1 +
        hist * 0.1) *
        1000
    ) / 1000;
  return {
    score,
    formula:
      "0.35×observed + 0.10×expected + 0.15×confidence + 0.10×speed + 0.10×rev + 0.10×act + 0.10×historical",
    components: {
      observedImpact: realized,
      expectedImpact: input.expectedImpact,
      confidence: input.confidence,
      speed,
      reversibility: input.reversibility,
      actionability: input.actionability,
      historicalSuccessRate: hist,
    },
  };
}
