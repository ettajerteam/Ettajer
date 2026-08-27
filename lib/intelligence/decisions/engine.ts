/**
 * Dr Sara V6 Decision Intelligence Engine.
 * Decides only — never executes, never mutates production.
 */
import type {
  Diagnosis,
  IntelligenceSignal,
  PlatformState,
  RecommendedAction,
} from "@/lib/intelligence/engine-types";
import type { ScenarioOutcome } from "@/lib/intelligence/scenarios/simulate";
import { generateDecisionCandidates } from "@/lib/intelligence/decisions/candidates";
import {
  evaluateConstraints,
  isBlocked,
} from "@/lib/intelligence/decisions/constraints";
import { attachScenarioSupport } from "@/lib/intelligence/decisions/scenario-support";
import {
  rankScoredCandidates,
  scoreDecisionCandidate,
  selectTopDecisionCandidate,
} from "@/lib/intelligence/decisions/scoring";
import { buildDecisionRationale } from "@/lib/intelligence/decisions/rationale";
import { DECISION_THRESHOLDS } from "@/lib/intelligence/decisions/config";
import type {
  Decision,
  DecisionEngineResult,
  DecisionTraceStage,
  ScoredDecisionCandidate,
} from "@/lib/intelligence/decisions/types";

export function runDecisionEngine(input: {
  state: PlatformState;
  signals: IntelligenceSignal[];
  diagnoses: Diagnosis[];
  recommendedActions: RecommendedAction[];
  scenarios: ScenarioOutcome[];
  dataQualityStatus: "OK" | "DEGRADED" | "INSUFFICIENT";
  insufficientEvidence: boolean;
  evidenceQuality: number;
  cycleId: string;
}): DecisionEngineResult {
  const trace: DecisionTraceStage[] = [];
  trace.push({
    stage: "INPUT_STATE",
    detail: `now=${input.state.now.toISOString()} stores=${input.state.totalStores} pendingCOD=${input.state.pendingRealOrders}`,
  });
  trace.push({
    stage: "SIGNALS",
    detail: "Non-positive signals feeding candidates",
    count: input.signals.filter((s) => s.severity !== "positive").length,
  });
  trace.push({
    stage: "DIAGNOSES",
    detail: "Active diagnoses",
    count: input.diagnoses.filter((d) => d.diagnosisId !== "NONE").length,
  });

  let candidates = generateDecisionCandidates({
    state: input.state,
    signals: input.signals,
    diagnoses: input.diagnoses,
    recommendedActions: input.recommendedActions,
    evidenceQuality: input.evidenceQuality,
  });

  // Attach scenario support + constraints
  candidates = candidates.map((c) => {
    const scenarioSupport = attachScenarioSupport(c, input.scenarios);
    const withScenario = { ...c, scenarioSupport };
    let confidence = withScenario.confidence;
    if (input.dataQualityStatus === "DEGRADED") {
      confidence = Math.min(
        confidence,
        DECISION_THRESHOLDS.degradedConfidenceCap
      );
    }
    if (
      input.dataQualityStatus === "INSUFFICIENT" ||
      input.insufficientEvidence
    ) {
      confidence = Math.min(
        confidence,
        DECISION_THRESHOLDS.insufficientConfidenceCap
      );
    }
    if (scenarioSupport.strength === "STRONG") {
      confidence = Math.min(0.95, confidence + 0.05);
    }
    const constraints = evaluateConstraints({
      candidate: { ...withScenario, confidence },
      dataQualityStatus: input.dataQualityStatus,
      scenarioAvailable: scenarioSupport.strength !== "UNAVAILABLE",
      insufficientEvidence: input.insufficientEvidence,
    });
    return { ...withScenario, confidence, constraints };
  });

  trace.push({
    stage: "CANDIDATES",
    detail: candidates.map((c) => c.id).join(","),
    count: candidates.length,
  });
  trace.push({
    stage: "CONSTRAINTS",
    detail: `blocked=${candidates.filter((c) => isBlocked(c.constraints)).length}`,
    count: candidates.reduce((n, c) => n + c.constraints.length, 0),
  });
  trace.push({
    stage: "SCENARIOS",
    detail: `v5_scenarios=${input.scenarios.length}`,
    count: input.scenarios.length,
  });

  const scored: ScoredDecisionCandidate[] = candidates.map(scoreDecisionCandidate);
  const ranked = rankScoredCandidates(scored);
  trace.push({
    stage: "SCORES",
    detail: ranked.map((c) => `${c.id}:${c.score}`).join("|"),
    count: ranked.length,
  });
  trace.push({
    stage: "RANKING",
    detail: ranked.map((c) => c.id).join(" > "),
  });

  const selected = selectTopDecisionCandidate(
    ranked,
    input.insufficientEvidence || input.dataQualityStatus === "INSUFFICIENT"
  );

  if (!selected) {
    trace.push({ stage: "SELECTED_DECISION", detail: "none" });
    return {
      topDecision: null,
      alternatives: ranked,
      candidates: ranked,
      trace,
      mode: "RECOMMENDED",
    };
  }

  const rationale = buildDecisionRationale({
    selected,
    alternatives: ranked,
  });

  const topDecision: Decision = {
    id: `decision-${input.cycleId}-${selected.id}`,
    version: "6.0.0",
    selectedAction: {
      id: selected.id,
      type: selected.type,
      title: selected.title,
      route: selected.route,
      mode: "RECOMMENDED",
    },
    score: selected.score,
    confidence: selected.confidence,
    evidence: selected.evidence,
    rationale,
    alternatives: ranked
      .filter((c) => c.id !== selected.id)
      .slice(0, 8)
      .map((c) => ({
        id: c.id,
        title: c.title,
        score: c.score,
        blocked: c.blocked,
      })),
    constraints: selected.constraints,
    scenarioSupport: selected.scenarioSupport,
    expectedOutcome: {
      kind:
        Object.keys(selected.scenarioSupport.expectedAfter).length > 0
          ? "SIMULATED"
          : "NONE",
      baseline: selected.scenarioSupport.baseline,
      expectedAfter: selected.scenarioSupport.expectedAfter,
      note: selected.scenarioSupport.note,
    },
    uncertainty: {
      level: selected.scenarioSupport.uncertainty,
      dataQuality: input.dataQualityStatus,
      notes: [
        `assumptionCount=${selected.scenarioSupport.assumptions.length}`,
        `scenarioStrength=${selected.scenarioSupport.strength}`,
        "V6 does not execute — mode=RECOMMENDED.",
      ],
    },
    createdAt: input.state.now.toISOString(),
    trace,
  };

  trace.push({
    stage: "SELECTED_DECISION",
    detail: `${selected.id} score=${selected.score} mode=RECOMMENDED`,
  });

  return {
    topDecision,
    alternatives: ranked.filter((c) => c.id !== selected.id),
    candidates: ranked,
    trace,
    mode: "RECOMMENDED",
  };
}

export {
  generateDecisionCandidates,
  dedupeCandidates,
} from "@/lib/intelligence/decisions/candidates";
export {
  evaluateConstraints,
  isBlocked,
} from "@/lib/intelligence/decisions/constraints";
export {
  scoreDecisionCandidate,
  rankScoredCandidates,
} from "@/lib/intelligence/decisions/scoring";
export { buildDecisionRationale } from "@/lib/intelligence/decisions/rationale";
export { attachScenarioSupport } from "@/lib/intelligence/decisions/scenario-support";
export { DECISION_WEIGHTS, DECISION_THRESHOLDS } from "@/lib/intelligence/decisions/config";
