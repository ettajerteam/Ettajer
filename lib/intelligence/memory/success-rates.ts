/**
 * Deterministic success rates by decision type.
 */
import { MEMORY_THRESHOLDS as T } from "@/lib/intelligence/memory/config";
import type { OutcomeMemoryRecord } from "@/lib/intelligence/memory/v7-types";
import type { SuccessRateSummary } from "@/lib/intelligence/memory/v7-types";
import type { RulePerformance } from "@/lib/intelligence/memory/types";

export function computeSuccessRates(
  outcomes: OutcomeMemoryRecord[]
): SuccessRateSummary[] {
  const byType = new Map<string, OutcomeMemoryRecord[]>();
  for (const o of outcomes) {
    const list = byType.get(o.decisionType) ?? [];
    list.push(o);
    byType.set(o.decisionType, list);
  }
  const out: SuccessRateSummary[] = [];
  for (const [decisionType, list] of [...byType.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    out.push(summarizeType(decisionType, list));
  }
  return out;
}

function summarizeType(
  decisionType: string,
  list: OutcomeMemoryRecord[]
): SuccessRateSummary {
  const measured = list.filter(
    (o) =>
      o.status === "SUCCESS" ||
      o.status === "PARTIAL" ||
      o.status === "FAILED"
  );
  const successCount = measured.filter((o) => o.status === "SUCCESS").length;
  const partialCount = measured.filter((o) => o.status === "PARTIAL").length;
  const failureCount = measured.filter((o) => o.status === "FAILED").length;
  const unknownCount = list.length - measured.length;
  const totalMeasured = measured.length;
  const sampleQuality =
    totalMeasured >= T.minSampleForReliability ? "SUFFICIENT" : "INSUFFICIENT";

  let successRate: number | null = null;
  let failureRate: number | null = null;
  if (totalMeasured >= T.minSampleForReliability) {
    successRate =
      Math.round((successCount / totalMeasured) * 100) / 100;
    failureRate =
      Math.round((failureCount / totalMeasured) * 100) / 100;
  }

  let evidenceStrength: SuccessRateSummary["evidenceStrength"] = "INSUFFICIENT";
  if (totalMeasured >= T.minSampleForStrong && successRate != null) {
    evidenceStrength = successRate >= T.successRateHigh ? "STRONG" : "MODERATE";
  } else if (totalMeasured >= T.minSampleForReliability) {
    evidenceStrength = "WEAK";
  }

  return {
    decisionType,
    totalMeasured,
    successCount,
    partialCount,
    failureCount,
    unknownCount,
    successRate,
    failureRate,
    sampleQuality,
    evidenceStrength,
  };
}

/**
 * Map existing RulePerformance (V4 memory) into SuccessRateSummary without inventing rows.
 */
export function successRatesFromRulePerformance(
  performance: RulePerformance[]
): SuccessRateSummary[] {
  return performance
    .map((p) => {
      const totalMeasured = p.attempts;
      const sampleQuality =
        totalMeasured >= T.minSampleForReliability
          ? ("SUFFICIENT" as const)
          : ("INSUFFICIENT" as const);
      let evidenceStrength: SuccessRateSummary["evidenceStrength"] =
        "INSUFFICIENT";
      if (totalMeasured >= T.minSampleForStrong && p.successRate != null) {
        evidenceStrength =
          p.successRate >= T.successRateHigh ? "STRONG" : "MODERATE";
      } else if (totalMeasured >= T.minSampleForReliability) {
        evidenceStrength = "WEAK";
      }
      return {
        decisionType: mapInterventionToDecisionType(p.type),
        totalMeasured,
        successCount: p.successes,
        partialCount: p.partials,
        failureCount: p.failures,
        unknownCount: 0,
        successRate:
          totalMeasured >= T.minSampleForReliability ? p.successRate : null,
        failureRate:
          totalMeasured >= T.minSampleForReliability && totalMeasured > 0
            ? Math.round((p.failures / totalMeasured) * 100) / 100
            : null,
        sampleQuality,
        evidenceStrength,
      };
    })
    .sort((a, b) => a.decisionType.localeCompare(b.decisionType));
}

export function mapInterventionToDecisionType(type: string): string {
  if (type === "COD_VERIFICATION") return "REVIEW_PENDING_COD";
  if (type === "DNS_DIAGNOSIS" || type === "FIX_DOMAIN") return "DIAGNOSE_DNS";
  if (type === "SUPPORT_ESCALATION") return "ANSWER_SUPPORT";
  if (type === "FIRST_SALE_ASSIST") return "PRIORITIZE_FIRST_SALE";
  if (type === "ACTIVATION_OUTREACH") return "ACTIVATE_MID_TIER_MERCHANTS";
  return type;
}
