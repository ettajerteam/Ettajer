/**
 * Deterministic decision reliability from measured history.
 */
import { MEMORY_THRESHOLDS as T } from "@/lib/intelligence/memory/config";
import type {
  OutcomeMemoryRecord,
  ReliabilityAssessment,
  ReliabilityBand,
  SuccessRateSummary,
} from "@/lib/intelligence/memory/v7-types";

export function assessReliability(input: {
  summary: SuccessRateSummary;
  outcomes?: OutcomeMemoryRecord[];
}): ReliabilityAssessment {
  const { summary } = input;
  const outcomes = (input.outcomes ?? []).filter(
    (o) => o.decisionType === summary.decisionType
  );

  if (
    summary.sampleQuality === "INSUFFICIENT" ||
    summary.evidenceStrength === "INSUFFICIENT"
  ) {
    return {
      decisionType: summary.decisionType,
      band: "INSUFFICIENT",
      successRate: null,
      sampleSize: summary.totalMeasured,
      predictionAccuracyGoodShare: null,
      evidenceStrength: "INSUFFICIENT",
      note: "INSUFFICIENT EVIDENCE — sample below minimum threshold; do not treat rate as reliable.",
    };
  }

  const good = outcomes.filter(
    (o) => o.accuracy === "ACCURATE" || o.accuracy === "ACCEPTABLE"
  ).length;
  const measuredAcc = outcomes.filter((o) => o.accuracy !== "NOT_MEASURED");
  const predictionAccuracyGoodShare =
    measuredAcc.length > 0
      ? Math.round((good / measuredAcc.length) * 100) / 100
      : null;

  let band: ReliabilityBand = "LOW";
  const rate = summary.successRate ?? 0;
  if (rate >= T.successRateHigh && summary.totalMeasured >= T.minSampleForStrong) {
    band = "HIGH";
  } else if (rate >= T.successRateMedium) {
    band = "MEDIUM";
  } else {
    band = "LOW";
  }

  // Prediction accuracy can downgrade band
  if (
    predictionAccuracyGoodShare != null &&
    predictionAccuracyGoodShare < 0.4 &&
    band === "HIGH"
  ) {
    band = "MEDIUM";
  }

  return {
    decisionType: summary.decisionType,
    band,
    successRate: summary.successRate,
    sampleSize: summary.totalMeasured,
    predictionAccuracyGoodShare,
    evidenceStrength: summary.evidenceStrength,
    note: `Reliability ${band} from ${summary.totalMeasured} measured outcomes (successRate=${summary.successRate}).`,
  };
}

export function reliabilityForType(
  assessments: ReliabilityAssessment[],
  decisionType: string
): ReliabilityAssessment {
  return (
    assessments.find((a) => a.decisionType === decisionType) ?? {
      decisionType,
      band: "INSUFFICIENT",
      successRate: null,
      sampleSize: 0,
      predictionAccuracyGoodShare: null,
      evidenceStrength: "INSUFFICIENT",
      note: "No historical outcomes for this decision type.",
    }
  );
}
