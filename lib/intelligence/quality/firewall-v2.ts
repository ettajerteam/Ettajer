/**
 * Data quality firewall V2 — freshness, sample size, missing dimensions.
 */
import type { PlatformState } from "@/lib/intelligence/engine-types";
import { runQualityFirewall, type QualityGate } from "@/lib/intelligence/quality/firewall";
import { INTELLIGENCE_SCORING_CONFIG as C } from "@/lib/intelligence/config/scoring";

export type QualityAssessmentV2 = QualityGate & {
  dataFreshness: "fresh" | "stale" | "unknown";
  sampleSize: number;
  missingDimensions: string[];
  confidencePenalty: number;
  insufficientEvidence: boolean;
};

export function runQualityFirewallV2(state: PlatformState): QualityAssessmentV2 {
  const base = runQualityFirewall(state);
  const missing: string[] = [];
  if (!state.sparklines?.revenue?.length) missing.push("sparklines.revenue");
  if (state.totalStores <= 0) missing.push("totalStores");
  if (state.funnel.totalStores <= 0) missing.push("funnel");

  const sampleSize = Math.max(
    state.totalStores,
    state.realOrders7d,
    state.pendingRealOrders,
    0
  );

  let confidencePenalty = 0;
  if (missing.length > 0) confidencePenalty += 0.1 * missing.length;
  if (sampleSize < 3) confidencePenalty += 0.15;
  if (base.warnings.length > 0) confidencePenalty += 0.1 * base.warnings.length;
  confidencePenalty = Math.min(0.7, confidencePenalty);

  const insufficientEvidence =
    state.totalStores === 0 &&
    state.realOrders7d === 0 &&
    state.pendingRealOrders === 0;

  if (insufficientEvidence) {
    base.warnings.push({
      id: "dq-insufficient-evidence",
      message: "INSUFFICIENT_EVIDENCE — platform sample too small for diagnosis.",
      severity: "high",
    });
    base.blockedOperations = [
      ...new Set([...base.blockedOperations, "diagnosis", "forecast", "causal"]),
    ];
  }

  // Soft freshness — overview is live per request
  const dataFreshness: QualityAssessmentV2["dataFreshness"] = "fresh";

  return {
    ...base,
    dataFreshness,
    sampleSize,
    missingDimensions: missing,
    confidencePenalty,
    insufficientEvidence,
    ok: base.ok && !insufficientEvidence,
  };
}

export function applyConfidencePenalty(
  confidence: number,
  penalty: number
): number {
  return Math.max(0.2, Math.round((confidence * (1 - penalty)) * 100) / 100);
}

export { C as SCORING_CONFIG_REF };
