/**
 * V7 Memory Engine — fingerprints, reliability, confidence adjustment, learning trace.
 * Recommend + measure + learn only. No Prisma writes. No execution.
 */
import type { PlatformState } from "@/lib/intelligence/engine-types";
import type { IntelligenceMemory } from "@/lib/intelligence/memory/types";
import type { ScoredDecisionCandidate } from "@/lib/intelligence/decisions/types";
import type { Decision } from "@/lib/intelligence/decisions/types";
import {
  buildStateFingerprints,
  primaryStateFingerprint,
} from "@/lib/intelligence/memory/fingerprints";
import { summarizeDecisionHistory } from "@/lib/intelligence/memory/decision-history";
import type {
  DecisionMemoryRecord,
  LearningTraceStage,
  MemoryEngineResult,
  OutcomeMemoryRecord,
} from "@/lib/intelligence/memory/v7-types";
import {
  computeSuccessRates,
  successRatesFromRulePerformance,
} from "@/lib/intelligence/memory/success-rates";
import {
  assessReliability,
  reliabilityForType,
} from "@/lib/intelligence/memory/reliability";
import { adjustConfidence } from "@/lib/intelligence/memory/confidence-adjustment";
import {
  applyMemoryToCandidates,
  computeMemoryScoreAdjustments,
} from "@/lib/intelligence/memory/learning";

export function runMemoryEngine(input: {
  state: PlatformState;
  twinHash: string;
  intelligenceMemory: IntelligenceMemory;
  decisionHistory?: DecisionMemoryRecord[];
  outcomeHistory?: OutcomeMemoryRecord[];
  topDecision: Decision | null;
  candidates: ScoredDecisionCandidate[];
}): MemoryEngineResult {
  const fingerprints = buildStateFingerprints(input.state);
  const primaryFingerprint = primaryStateFingerprint(input.state);
  const decisionHistory = input.decisionHistory ?? [];
  const outcomeHistory = input.outcomeHistory ?? [];

  const trace: LearningTraceStage[] = [];
  trace.push({
    stage: "INPUT",
    detail: `fingerprint=${primaryFingerprint} twinHash=${input.twinHash} top=${input.topDecision?.selectedAction.id ?? "none"}`,
  });

  const fromOutcomes = computeSuccessRates(outcomeHistory);
  const fromRules = successRatesFromRulePerformance(
    input.intelligenceMemory.rulePerformance
  );
  // Prefer explicit outcome history; merge rule performance for types missing outcomes
  const successRates = mergeSuccessRates(fromOutcomes, fromRules);

  trace.push({
    stage: "HISTORICAL_EVIDENCE",
    detail: `outcomeRecords=${outcomeHistory.length} rulePerformance=${input.intelligenceMemory.rulePerformance.length} types=${successRates.length}`,
  });

  const reliability = successRates.map((s) =>
    assessReliability({
      summary: s,
      outcomes: outcomeHistory,
    })
  );

  // Ensure top decision type has a reliability row even with empty history
  if (
    input.topDecision &&
    !reliability.some(
      (r) => r.decisionType === input.topDecision!.selectedAction.id
    )
  ) {
    reliability.push(
      assessReliability({
        summary: {
          decisionType: input.topDecision.selectedAction.id,
          totalMeasured: 0,
          successCount: 0,
          partialCount: 0,
          failureCount: 0,
          unknownCount: 0,
          successRate: null,
          failureRate: null,
          sampleQuality: "INSUFFICIENT",
          evidenceStrength: "INSUFFICIENT",
        },
      })
    );
  }

  trace.push({
    stage: "RELIABILITY",
    detail: reliability
      .map((r) => `${r.decisionType}:${r.band}`)
      .join("|"),
  });

  const decisionType = input.topDecision?.selectedAction.id ?? "NO_ACTION";
  const rel = reliabilityForType(reliability, decisionType);

  const recentFailures = outcomeHistory
    .filter((o) => o.decisionType === decisionType)
    .slice(-5)
    .filter((o) => o.status === "FAILED" || o.accuracy === "MISS").length;

  const predictionDegraded =
    rel.predictionAccuracyGoodShare != null &&
    rel.predictionAccuracyGoodShare < 0.4;

  trace.push({
    stage: "PREDICTION_ACCURACY",
    detail:
      rel.predictionAccuracyGoodShare == null
        ? "NOT_MEASURED / INSUFFICIENT"
        : `goodShare=${rel.predictionAccuracyGoodShare}`,
  });

  const confidenceBefore = input.topDecision?.confidence ?? 0.5;
  const adjustment = adjustConfidence({
    confidenceBefore,
    reliability: rel,
    recentFailureStreak: recentFailures,
    predictionDegraded,
  });

  trace.push({
    stage: "CONFIDENCE_ADJUSTMENT",
    detail: `before=${adjustment.before} delta=${adjustment.delta} after=${adjustment.after} applied=${adjustment.applied} — ${adjustment.reason}`,
  });

  const scoreAdjustments = computeMemoryScoreAdjustments({
    candidates: input.candidates,
    reliability,
  });

  // Verify BLOCK not bypassed
  for (const c of input.candidates) {
    if (c.blocked) {
      const adj = scoreAdjustments.find((a) => a.decisionType === c.id);
      if (adj && adj.net !== 0) {
        adj.net = 0;
        adj.blockedPreserved = true;
      }
    }
  }

  const memoryImpact =
    !adjustment.applied
      ? ("NONE" as const)
      : adjustment.delta > 0
        ? ("BOOST" as const)
        : ("PENALTY" as const);

  const topDecisionMemory = input.topDecision
    ? {
        decisionType,
        confidenceBeforeMemory: adjustment.before,
        confidenceAfterMemory: adjustment.after,
        historicalReliability: rel.band,
        evidenceStrength: rel.evidenceStrength,
        memoryImpact,
        adjustment,
        note:
          rel.evidenceStrength === "INSUFFICIENT"
            ? "No sufficient measured historical outcomes exist for this decision type."
            : adjustment.reason,
      }
    : null;

  trace.push({
    stage: "FINAL_DECISION",
    detail: `${decisionType} confidence=${adjustment.after} reliability=${rel.band} memoryImpact=${memoryImpact}`,
  });

  return {
    fingerprints,
    primaryFingerprint,
    decisionHistorySummary: summarizeDecisionHistory(decisionHistory),
    successRates,
    reliability,
    topDecisionMemory,
    learningTrace: trace,
    scoreAdjustments,
  };
}

function mergeSuccessRates(
  fromOutcomes: ReturnType<typeof computeSuccessRates>,
  fromRules: ReturnType<typeof successRatesFromRulePerformance>
) {
  const map = new Map(fromOutcomes.map((s) => [s.decisionType, s]));
  for (const r of fromRules) {
    if (!map.has(r.decisionType)) map.set(r.decisionType, r);
  }
  return [...map.values()].sort((a, b) =>
    a.decisionType.localeCompare(b.decisionType)
  );
}

export { applyMemoryToCandidates };
