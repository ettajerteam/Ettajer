/**
 * Rule-based learning + adaptation — evidence or INSUFFICIENT_EVIDENCE.
 */
import { OS_CONFIG } from "@/lib/intelligence/os/config";
import type {
  AdaptationState,
  EvidenceLevel,
  RuleBasedLearningState,
} from "@/lib/intelligence/os/types";
import type {
  OutcomeMemoryRecord,
  ReliabilityAssessment,
  SuccessRateSummary,
} from "@/lib/intelligence/memory/v7-types";

export function buildLearningState(input: {
  successRates: SuccessRateSummary[];
  reliability: ReliabilityAssessment[];
  outcomes: OutcomeMemoryRecord[];
  decisionConfidence: number;
}): RuleBasedLearningState {
  const interventionSuccessRate: Record<string, number | null> = {};
  const predictionAccuracy: Record<string, string> = {};
  const historicalReliability: Record<string, string> = {};
  const sampleSize: Record<string, number> = {};
  const evidenceStrength: Record<string, EvidenceLevel> = {};
  const notes: string[] = [];

  for (const s of input.successRates) {
    sampleSize[s.decisionType] = s.totalMeasured;
    if (s.totalMeasured < OS_CONFIG.minSampleForRate) {
      interventionSuccessRate[s.decisionType] = null;
      evidenceStrength[s.decisionType] = "INSUFFICIENT";
      notes.push(`${s.decisionType}: INSUFFICIENT_EVIDENCE (n=${s.totalMeasured})`);
    } else {
      interventionSuccessRate[s.decisionType] = s.successRate;
      evidenceStrength[s.decisionType] =
        s.totalMeasured >= OS_CONFIG.minSampleForStrong ? "STRONG" : "MODERATE";
    }
  }

  for (const r of input.reliability) {
    historicalReliability[r.decisionType] = r.band;
    if (!evidenceStrength[r.decisionType]) {
      evidenceStrength[r.decisionType] = mapEvidence(r.evidenceStrength);
    }
  }

  const observedEffect: Record<string, number> = {};
  const expectedEffect: Record<string, number | [number, number]> = {};
  for (const o of input.outcomes) {
    for (const [k, v] of Object.entries(o.observed)) {
      observedEffect[`${o.decisionType}:${k}`] = v;
    }
    for (const [k, v] of Object.entries(o.predicted)) {
      expectedEffect[`${o.decisionType}:${k}`] = v;
    }
    predictionAccuracy[o.decisionType] = o.accuracy;
  }

  const before = input.decisionConfidence;
  let after = before;
  let reason = "No adjustment — insufficient or neutral evidence.";
  const topRel = input.reliability[0];
  if (topRel && topRel.sampleSize >= OS_CONFIG.minSampleForRate) {
    if (topRel.band === "HIGH") {
      after = Math.min(OS_CONFIG.maxConfidence, before + 0.02);
      reason = `Historical reliability HIGH (n=${topRel.sampleSize}).`;
    } else if (topRel.band === "LOW") {
      after = Math.max(OS_CONFIG.minConfidence, before - 0.03);
      reason = `Historical reliability LOW (n=${topRel.sampleSize}).`;
    }
  } else {
    reason = "INSUFFICIENT_EVIDENCE — no confidence inflation.";
  }
  after = Math.max(OS_CONFIG.minConfidence, Math.min(OS_CONFIG.maxConfidence, after));

  return {
    interventionSuccessRate,
    predictionAccuracy,
    historicalReliability,
    confidenceAdjustment: {
      before,
      after,
      delta: Math.round((after - before) * 1000) / 1000,
      reason,
    },
    observedEffect,
    expectedEffect,
    sampleSize,
    evidenceStrength,
    notes,
  };
}

export function buildAdaptation(input: {
  learning: RuleBasedLearningState;
  decisionIds: string[];
}): AdaptationState {
  const priorityDeltas: AdaptationState["priorityDeltas"] = [];
  const confidenceCaps: AdaptationState["confidenceCaps"] = [];
  const notes: string[] = [];
  const A = OS_CONFIG.adaptation;

  for (const id of input.decisionIds) {
    const rate = input.learning.interventionSuccessRate[id];
    const n = input.learning.sampleSize[id] ?? 0;
    const strength = input.learning.evidenceStrength[id] ?? "INSUFFICIENT";
    if (strength === "INSUFFICIENT" || n < OS_CONFIG.minSampleForRate) {
      notes.push(`${id}: no adaptation — INSUFFICIENT_EVIDENCE`);
      continue;
    }
    if (rate != null && rate >= 0.75) {
      priorityDeltas.push({
        decisionId: id,
        delta: Math.min(A.maxAbsDelta, A.successBoost),
        reason: `Success rate ${rate} — priority ↑`,
      });
    } else if (rate != null && rate < 0.4) {
      priorityDeltas.push({
        decisionId: id,
        delta: -Math.min(A.maxAbsDelta, A.failurePenalty),
        reason: `Success rate ${rate} — priority ↓`,
      });
      confidenceCaps.push({
        decisionId: id,
        maxConfidence: 0.7,
        reason: "Repeated underperformance caps confidence.",
      });
    }
    const acc = input.learning.predictionAccuracy[id];
    if (acc === "MISS" || acc === "DRIFT") {
      priorityDeltas.push({
        decisionId: id,
        delta: -A.underperformPenalty,
        reason: `Prediction ${acc} — priority ↓`,
      });
    }
  }

  priorityDeltas.sort((a, b) => a.decisionId.localeCompare(b.decisionId));
  return { priorityDeltas, confidenceCaps, notes };
}

function mapEvidence(s: string): EvidenceLevel {
  if (s === "STRONG") return "STRONG";
  if (s === "MODERATE") return "MODERATE";
  if (s === "WEAK") return "WEAK";
  return "INSUFFICIENT";
}
