/**
 * Dr Sara V6 — Decision Intelligence types (serializable, deterministic).
 * V6 decides. V6 does NOT execute.
 */

export type DecisionMode = "RECOMMENDED";

export type ConstraintStatus = "PASS" | "WARN" | "BLOCK";

export type ScenarioSupportStrength =
  | "STRONG"
  | "MODERATE"
  | "WEAK"
  | "NONE"
  | "UNAVAILABLE";

export type DecisionDomain =
  | "operations"
  | "technical"
  | "support"
  | "activation"
  | "revenue"
  | "baseline";

export type TimeToImpactBand =
  | "immediate"
  | "<24h"
  | "1–3 days"
  | "3–7 days"
  | "7–14 days"
  | "14–30 days";

export type DecisionConstraintResult = {
  constraintId: string;
  status: ConstraintStatus;
  reason: string;
  evidence: string[];
};

export type ScenarioSupport = {
  strength: ScenarioSupportStrength;
  scenarioId: string | null;
  baseline: Record<string, number>;
  expectedAfter: Record<string, [number, number]>;
  expectedDirection: string | null;
  uncertainty: "LOW" | "MEDIUM" | "HIGH";
  scenarioConfidence: number;
  assumptions: string[];
  tradeoffs: string[];
  note: string;
};

export type DecisionCandidate = {
  id: string;
  type: string;
  title: string;
  description: string;
  route: string;
  domain: DecisionDomain;
  affectedCount: number;
  evidence: string[];
  triggeredRules: string[];
  expectedImpact: number;
  urgency: number;
  confidence: number;
  reversibility: number;
  actionability: number;
  cost: number;
  timeToImpact: TimeToImpactBand;
  risk: number;
  constraints: DecisionConstraintResult[];
  scenarioSupport: ScenarioSupport;
  mode: DecisionMode;
};

export type ScoredDecisionCandidate = DecisionCandidate & {
  score: number;
  scoreBreakdown: {
    weightedImpact: number;
    weightedUrgency: number;
    weightedConfidence: number;
    weightedReversibility: number;
    weightedActionability: number;
    scenarioSupport: number;
    riskPenalty: number;
    costPenalty: number;
    delayPenalty: number;
    formula: string;
  };
  blocked: boolean;
};

export type DecisionRationale = {
  whyThis: string[];
  whyNotAlternatives: { actionId: string; title: string; reasons: string[] }[];
  tradeoffs: string[];
  evidenceSummary: string[];
};

export type DecisionExpectedOutcome = {
  kind: "SIMULATED" | "NONE";
  baseline: Record<string, number>;
  expectedAfter: Record<string, [number, number]>;
  note: string;
};

export type Decision = {
  id: string;
  version: "6.0.0";
  selectedAction: {
    id: string;
    type: string;
    title: string;
    route: string;
    mode: DecisionMode;
  };
  score: number;
  confidence: number;
  evidence: string[];
  rationale: DecisionRationale;
  alternatives: {
    id: string;
    title: string;
    score: number;
    blocked: boolean;
  }[];
  constraints: DecisionConstraintResult[];
  scenarioSupport: ScenarioSupport;
  expectedOutcome: DecisionExpectedOutcome;
  uncertainty: {
    level: "LOW" | "MEDIUM" | "HIGH";
    dataQuality: string;
    notes: string[];
  };
  createdAt: string;
  trace: DecisionTraceStage[];
};

export type DecisionTraceStage = {
  stage: string;
  detail: string;
  count?: number;
};

export type DecisionEngineResult = {
  topDecision: Decision | null;
  alternatives: ScoredDecisionCandidate[];
  candidates: ScoredDecisionCandidate[];
  trace: DecisionTraceStage[];
  mode: DecisionMode;
};
