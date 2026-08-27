/**
 * Dr Sara V10 — Platform Intelligence OS types.
 * Orchestrates V1–V9. No LLM/ML. autoExecute remains false.
 */

export type CycleStatus =
  | "SUCCESS"
  | "DEGRADED"
  | "BLOCKED"
  | "FAILED"
  | "ROLLED_BACK"
  | "PARTIAL";

export type QualityState = "OK" | "WARN" | "DEGRADED" | "INSUFFICIENT" | "BLOCKED";

export type AutonomyMode =
  | "OBSERVE"
  | "RECOMMEND"
  | "APPROVAL_REQUIRED"
  | "CONTROLLED_AUTO";

export type GovernorDecision =
  | "ALLOWED"
  | "APPROVAL_REQUIRED"
  | "DEFERRED"
  | "BLOCKED";

export type EvidenceLevel =
  | "NONE"
  | "INSUFFICIENT"
  | "WEAK"
  | "MODERATE"
  | "STRONG";

export type DependencyRelation =
  | "BLOCKS"
  | "REQUIRES"
  | "AMPLIFIES"
  | "CONFLICTS_WITH"
  | "ENABLES"
  | "DEPENDS_ON";

export type GraphNodeType =
  | "OBSERVATION"
  | "SIGNAL"
  | "DIAGNOSIS"
  | "CAUSAL_FACTOR"
  | "SCENARIO"
  | "DECISION"
  | "INTERVENTION"
  | "EXECUTION"
  | "OUTCOME"
  | "LEARNING"
  | "WARNING"
  | "OPPORTUNITY"
  | "STRATEGY";

export type IntelligenceGraphNode = {
  id: string;
  type: GraphNodeType;
  timestamp: string;
  source: string;
  stateFingerprint: string;
  confidence: number;
  status: string;
  label: string;
};

export type IntelligenceGraphEdge = {
  from: string;
  to: string;
  relationship: DependencyRelation | "PRODUCES" | "FEEDS" | "INFORMS";
  evidence: string[];
};

export type IntelligenceGraph = {
  nodes: IntelligenceGraphNode[];
  edges: IntelligenceGraphEdge[];
};

export type PortfolioItem = {
  rank: number;
  decisionId: string;
  interventionType: string;
  title: string;
  score: number;
  impact: number;
  urgency: number;
  confidence: number;
  reversibility: number;
  actionability: number;
  risk: string;
  blastRadius: string;
  historicalReliability: string;
  dependencies: string[];
  conflicts: string[];
  expectedEffect: string;
  approvalRequired: boolean;
  deferred: boolean;
  reasons: string[];
};

export type InterventionPortfolio = {
  items: PortfolioItem[];
  orderedIds: string[];
  combinedRisk: string;
  combinedBlastRadius: string;
  resourceUsage: Record<string, number>;
  expectedCombinedEffect: string;
  whyOrderedThisWay: string[];
  conflicts: { a: string; b: string; reason: string }[];
};

export type StrategyHorizon = {
  shortTerm: string;
  mediumTerm: string;
  longTerm: string;
};

export type StrategyOption = {
  strategyId: string;
  label: string;
  primaryInterventions: string[];
  expectedImpact: [number, number];
  risk: string;
  confidence: number;
  timeHorizon: StrategyHorizon;
  dependencies: string[];
  resourceUsage: number;
  uncertainty: string;
  why: string[];
};

export type BestStrategy = {
  strategyId: string;
  label: string;
  whyThisStrategy: string[];
  alternativesRejected: { strategyId: string; reasons: string[] }[];
};

export type EarlyWarning = {
  id: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  evidence: string[];
  trajectory: string;
  estimatedHorizon: string;
  recommendedResponse: string;
};

export type Opportunity = {
  id: string;
  title: string;
  impact: "LOW" | "MEDIUM" | "HIGH";
  confidence: number;
  evidence: string[];
  recommendedAction: string;
};

export type HealthDimension = {
  id: string;
  score: number;
  trend: "UP" | "DOWN" | "FLAT" | "UNKNOWN";
  evidence: string[];
  risk: string;
  recommendedAction: string;
};

export type PlatformHealthModel = {
  composite: number;
  dimensions: HealthDimension[];
  weakDimensions: string[];
  note: string;
};

export type BudgetStatus = {
  budgetId: string;
  limit: number;
  used: number;
  remaining: number;
  status: "OK" | "EXCEEDED" | "NEAR";
};

export type ConflictResult = {
  status: "CONFLICT" | "NO_CONFLICT";
  conflicts: { a: string; b: string; severity: "WARN" | "BLOCK"; reason: string }[];
};

export type DependencyEdge = {
  from: string;
  to: string;
  relation: DependencyRelation;
  reason: string;
};

export type AutonomyResolution = {
  mode: AutonomyMode;
  controlledAutoEnabled: boolean;
  autoExecute: false;
  perIntervention: {
    interventionType: string;
    maxMode: AutonomyMode;
    reasons: string[];
  }[];
  reasons: string[];
};

export type GovernanceVerdict = {
  decision: GovernorDecision;
  reasons: string[];
  checks: { id: string; status: "PASS" | "FAIL"; reason: string }[];
};

export type RuleBasedLearningState = {
  interventionSuccessRate: Record<string, number | null>;
  predictionAccuracy: Record<string, string>;
  historicalReliability: Record<string, string>;
  confidenceAdjustment: { before: number; after: number; delta: number; reason: string };
  observedEffect: Record<string, number>;
  expectedEffect: Record<string, number | [number, number]>;
  sampleSize: Record<string, number>;
  evidenceStrength: Record<string, EvidenceLevel>;
  notes: string[];
};

export type AdaptationState = {
  priorityDeltas: { decisionId: string; delta: number; reason: string }[];
  confidenceCaps: { decisionId: string; maxConfidence: number; reason: string }[];
  notes: string[];
};

export type DecisionExplanation = {
  decision: string;
  evidence: string[];
  diagnosis: string[];
  alternatives: { id: string; rejectedBecause: string[] }[];
  expectedEffect: string;
  confidence: number;
  uncertainty: string;
  risk: string;
  dependencies: string[];
  historicalEvidence: string;
  whyChosen: string[];
  whyAlternativesRejected: string[];
};

export type TraceStep = {
  stage: string;
  timestamp: string;
  id: string;
  stateFingerprint: string;
  inputs: string[];
  outputs: string[];
  reason: string;
  evidence: string[];
  result: string;
};

export type IntelligenceOSResult = {
  cycleId: string;
  status: CycleStatus;
  failureStage: string | null;
  failureReason: string | null;
  recoveryAction: string | null;
  stateFingerprint: string;
  twinHash: string;
  dataQuality: QualityState;
  health: PlatformHealthModel;
  graph: IntelligenceGraph;
  warnings: EarlyWarning[];
  opportunities: Opportunity[];
  portfolio: InterventionPortfolio;
  strategies: StrategyOption[];
  bestStrategy: BestStrategy | null;
  autonomy: AutonomyResolution;
  governance: GovernanceVerdict;
  budgets: BudgetStatus[];
  conflicts: ConflictResult;
  dependencies: DependencyEdge[];
  learning: RuleBasedLearningState;
  adaptation: AdaptationState;
  explanation: DecisionExplanation | null;
  trace: TraceStep[];
  productionMutation: "NONE";
  autoExecute: false;
  controlledAutoPolicy: "DISABLED" | "ENABLED";
  note: string;
};

export type SnapshotIntelligenceOS = {
  cycleId: string;
  status: CycleStatus;
  health: {
    composite: number;
    weakDimensions: string[];
    note: string;
  };
  graph: {
    nodeCount: number;
    edgeCount: number;
    nodes: { id: string; type: string; label: string }[];
  };
  warnings: EarlyWarning[];
  opportunities: Opportunity[];
  portfolio: {
    orderedIds: string[];
    items: {
      rank: number;
      decisionId: string;
      interventionType: string;
      title: string;
      score: number;
      approvalRequired: boolean;
    }[];
    whyOrderedThisWay: string[];
    combinedRisk: string;
  };
  bestStrategy: BestStrategy | null;
  autonomy: {
    mode: AutonomyMode;
    controlledAutoEnabled: boolean;
    autoExecute: false;
    reasons: string[];
  };
  governance: {
    decision: GovernorDecision;
    reasons: string[];
  };
  learning: {
    evidenceNotes: string[];
    confidenceAdjustment: RuleBasedLearningState["confidenceAdjustment"];
  };
  adaptation: AdaptationState;
  trace: { stage: string; result: string; reason: string }[];
  productionMutation: "NONE";
  note: string;
};
