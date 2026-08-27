/**
 * Decision Engine V4 — scoreComponents with historicalEffectiveness.
 */
import { INTELLIGENCE_SCORING_CONFIG as C } from "@/lib/intelligence/config/scoring";
import type { RulePerformance } from "@/lib/intelligence/memory/types";

export type ScoreComponents = {
  impact: number;
  urgency: number;
  confidence: number;
  reversibility: number;
  actionability: number;
  historicalEffectiveness: number;
  timeSensitivity: number;
  evidenceQuality: number;
};

export type DecisionScoreV4 = {
  score: number;
  scoreComponents: ScoreComponents;
  calculation: string;
  whyThisActionWon: string;
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function buildScoreComponents(input: {
  impact: number;
  urgency: number;
  confidence: number;
  reversibility: number;
  actionability: number;
  timeSensitivity?: number;
  evidenceQuality?: number;
  historicalEffectiveness?: number | null;
}): ScoreComponents {
  return {
    impact: clamp01(input.impact),
    urgency: clamp01(input.urgency),
    confidence: clamp01(input.confidence),
    reversibility: clamp01(input.reversibility),
    actionability: clamp01(input.actionability),
    historicalEffectiveness: clamp01(
      input.historicalEffectiveness ??
        C.decisionV4.historicalEffectivenessDefault
    ),
    timeSensitivity: clamp01(input.timeSensitivity ?? input.urgency),
    evidenceQuality: clamp01(
      input.evidenceQuality ?? C.decisionV4.evidenceQualityFull
    ),
  };
}

/**
 * V4 score =
 * geometric-ish product of components × 100, live evidence dominant.
 */
export function scoreDecisionV4(
  components: ScoreComponents,
  opts?: { alternativeLabel?: string }
): DecisionScoreV4 {
  const c = components;
  const product =
    c.impact *
    c.urgency *
    c.confidence *
    c.reversibility *
    c.actionability *
    c.historicalEffectiveness *
    c.timeSensitivity *
    c.evidenceQuality;
  // Blend: 85% live product (without historical) + 15% full product
  const liveProduct =
    c.impact *
    c.urgency *
    c.confidence *
    c.reversibility *
    c.actionability *
    c.timeSensitivity *
    c.evidenceQuality;
  const blended =
    liveProduct * C.intervention.liveEvidenceFloor +
    product * C.intervention.historicalMaxBoost;
  const score = Math.max(0, Math.min(100, Math.round(blended * 100 * 1.05)));

  const calculation = `V4 = live×${C.intervention.liveEvidenceFloor} + full×${C.intervention.historicalMaxBoost}; components=${JSON.stringify(c)} → ${score}`;

  const whyThisActionWon = opts?.alternativeLabel
    ? `Highest V4 score ${score} vs alternative "${opts.alternativeLabel}" given live urgency=${c.urgency} and historicalEffectiveness=${c.historicalEffectiveness}.`
    : `Highest V4 score ${score} from impact×urgency×confidence×reversibility×actionability×historicalEffectiveness×timeSensitivity×evidenceQuality.`;

  return { score, scoreComponents: c, calculation, whyThisActionWon };
}

export function historicalEffectivenessFor(
  type: string,
  performance: RulePerformance[]
): { value: number; note: string } {
  const row = performance.find((p) => p.type === type || p.ruleId === type);
  if (!row || row.successRate == null) {
    return {
      value: C.decisionV4.historicalEffectivenessDefault,
      note: "Insufficient historical evidence.",
    };
  }
  return {
    value: row.successRate,
    note: row.note,
  };
}

export function evidenceQualityFrom(input: {
  sampleSize: number;
  warnings: number;
  missingCritical: boolean;
}): number {
  if (input.missingCritical) return C.decisionV4.evidenceQualityInsufficient;
  if (input.warnings > 0 || input.sampleSize < 3) {
    return C.decisionV4.evidenceQualityWeak;
  }
  return C.decisionV4.evidenceQualityFull;
}
