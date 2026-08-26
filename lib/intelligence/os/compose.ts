/**
 * Compose V10 Intelligence OS from V1–V9 snapshot slices (no duplicate engines).
 */
import type { PlatformState } from "@/lib/intelligence/engine-types";
import type {
  IntelligenceOSResult,
  SnapshotIntelligenceOS,
  CycleStatus,
  QualityState,
} from "@/lib/intelligence/os/types";
import { OS_CONFIG } from "@/lib/intelligence/os/config";
import { buildCycleId } from "@/lib/intelligence/os/cycle-id";
import { buildPlatformHealthModel } from "@/lib/intelligence/os/health";
import {
  detectOsEarlyWarnings,
  detectOsOpportunities,
} from "@/lib/intelligence/os/warnings";
import { buildStrategyPortfolio } from "@/lib/intelligence/os/strategies";
import {
  buildInterventionPortfolio,
  type PortfolioCandidate,
} from "@/lib/intelligence/os/portfolio";
import { detectPortfolioConflicts } from "@/lib/intelligence/os/conflicts";
import { dependenciesFor, unresolvedPrerequisites } from "@/lib/intelligence/os/dependencies";
import { evaluateBudgets } from "@/lib/intelligence/os/budgets";
import { resolveAutonomy } from "@/lib/intelligence/os/autonomy";
import { runOsGovernor } from "@/lib/intelligence/os/governor";
import {
  buildLearningState,
  buildAdaptation,
} from "@/lib/intelligence/os/learning";
import { buildIntelligenceGraph } from "@/lib/intelligence/os/graph";
import { buildDecisionExplanation } from "@/lib/intelligence/os/explainability";
import { buildIntelligenceTrace } from "@/lib/intelligence/os/trace";
import { decisionToInterventionType } from "@/lib/intelligence/interventions/registry";
import { getExecutionDef } from "@/lib/intelligence/execution/registry";
import type {
  OutcomeMemoryRecord,
  ReliabilityAssessment,
  SuccessRateSummary,
} from "@/lib/intelligence/memory/v7-types";

export type ComposeOsInput = {
  state: PlatformState;
  stateFingerprint: string;
  twinHash: string;
  cycleTimestampIso: string;
  dataQuality: QualityState;
  insufficientEvidence: boolean;
  healthScore: number;
  topDecision: {
    id: string;
    title: string;
    score: number;
    confidence: number;
    whyThis: string[];
    whyNot: { actionId: string; title: string; reasons: string[] }[];
    expectedEffect: string;
    uncertainty: string;
    risk: string;
    historicalReliability: string;
  } | null;
  decisionCandidates: {
    id: string;
    title: string;
    urgency: number;
    impact: number;
    confidence: number;
  }[];
  signalIds: string[];
  diagnosisIds: string[];
  scenarioIds: string[];
  topScenarioLabel: string | null;
  intervention: {
    type: string;
    risk: string;
    blastRadius: string;
    approval: string;
    targetCount: number;
    status: string;
  } | null;
  successRates: SuccessRateSummary[];
  reliability: ReliabilityAssessment[];
  outcomes: OutcomeMemoryRecord[];
};

export function composeIntelligenceOS(input: ComposeOsInput): IntelligenceOSResult {
  const cycleId = buildCycleId({
    stateFingerprint: input.stateFingerprint,
    twinHash: input.twinHash,
    cycleTimestampIso: input.cycleTimestampIso,
  });

  let status: CycleStatus = "SUCCESS";
  let failureStage: string | null = null;
  let failureReason: string | null = null;
  let recoveryAction: string | null = null;

  if (input.dataQuality === "BLOCKED") {
    status = "BLOCKED";
    failureStage = "QUALITY CHECK";
    failureReason = "Data quality BLOCKED.";
    recoveryAction = "Fix data sources before deciding.";
  } else if (input.dataQuality === "INSUFFICIENT" || input.insufficientEvidence) {
    status = "DEGRADED";
    failureStage = "QUALITY CHECK";
    failureReason = "Insufficient evidence — confidence reduced.";
    recoveryAction = "Gather evidence; prefer OBSERVE/RECOMMEND.";
  }

  const health = buildPlatformHealthModel({
    state: input.state,
    healthScore: input.healthScore,
  });
  const warnings = detectOsEarlyWarnings(input.state);
  const opportunities = detectOsOpportunities(input.state);
  const { strategies, best } = buildStrategyPortfolio({
    state: input.state,
    topScenarioLabel: input.topScenarioLabel,
  });

  const learning = buildLearningState({
    successRates: input.successRates,
    reliability: input.reliability,
    outcomes: input.outcomes,
    decisionConfidence: input.topDecision?.confidence ?? 0.5,
  });

  const candidateIds = input.decisionCandidates.map((c) => c.id);
  if (input.topDecision && !candidateIds.includes(input.topDecision.id)) {
    candidateIds.push(input.topDecision.id);
  }
  const adaptation = buildAdaptation({
    learning,
    decisionIds: candidateIds,
  });

  const portfolioCandidates: PortfolioCandidate[] = input.decisionCandidates.map(
    (c) => {
      const ivType = decisionToInterventionType(c.id);
      const def = getExecutionDef(ivType);
      return {
        decisionId: c.id,
        interventionType: ivType,
        title: c.title,
        impact: c.impact,
        urgency: c.urgency,
        confidence: c.confidence,
        reversibility: def?.reversible ? 0.85 : 0.4,
        actionability: def ? 0.8 : 0.3,
        risk: def?.safetyLevel === "CAUTION" ? "MEDIUM" : "LOW",
        blastRadius: def?.maxBlastRadius ?? "LOW",
        historicalReliability:
          learning.historicalReliability[c.id] ?? "INSUFFICIENT",
        expectedEffect: `Range-based effect for ${ivType}`,
        approvalRequired: def?.requiresApproval ?? true,
        targetCount:
          ivType === "COD_VERIFICATION"
            ? input.state.pendingRealOrders
            : ivType === "DNS_DIAGNOSIS"
              ? input.state.domainFailing
              : ivType === "SUPPORT_ESCALATION"
                ? input.state.openSupport
                : input.state.firstSaleHighIntent,
      };
    }
  );

  // Ensure TOP decision present
  if (
    input.topDecision &&
    !portfolioCandidates.some((p) => p.decisionId === input.topDecision!.id)
  ) {
    const ivType = decisionToInterventionType(input.topDecision.id);
    const def = getExecutionDef(ivType);
    portfolioCandidates.push({
      decisionId: input.topDecision.id,
      interventionType: ivType,
      title: input.topDecision.title,
      impact: 0.9,
      urgency: 0.9,
      confidence: input.topDecision.confidence,
      reversibility: 0.8,
      actionability: 0.85,
      risk: input.intervention?.risk ?? "HIGH",
      blastRadius: input.intervention?.blastRadius ?? "HIGH",
      historicalReliability: input.topDecision.historicalReliability,
      expectedEffect: input.topDecision.expectedEffect,
      approvalRequired: true,
      targetCount: input.intervention?.targetCount ?? 0,
    });
    void def;
  }

  const portfolio = buildInterventionPortfolio({
    candidates: portfolioCandidates,
    openSupport: input.state.openSupport,
    priorityDeltas: adaptation.priorityDeltas,
  });

  const types = portfolio.items.map((i) => i.interventionType);
  const conflicts = detectPortfolioConflicts({
    interventionTypes: types,
    openSupport: input.state.openSupport,
  });
  const deps = dependenciesFor(types);
  const unresolved = unresolvedPrerequisites({
    plannedTypes: types,
    availableTypes: types,
  });

  const budget = evaluateBudgets({
    plannedRisks: portfolio.items.filter((i) => !i.deferred).map((i) => i.risk),
    plannedBlast: portfolio.items
      .filter((i) => !i.deferred)
      .map((i) => i.blastRadius),
    plannedContacts: portfolio.items
      .filter((i) => !i.deferred)
      .reduce((n, i) => n + (portfolioCandidates.find((c) => c.decisionId === i.decisionId)?.targetCount ?? 0), 0),
    plannedExecutions: Math.min(3, portfolio.orderedIds.length),
  });

  const autonomy = resolveAutonomy({
    items: portfolio.items.map((i) => ({
      interventionType: i.interventionType,
      risk: i.risk,
      blastRadius: i.blastRadius,
      confidence: i.confidence,
      reversibility: i.reversibility,
      historicalReliability: i.historicalReliability,
      approvalRequired: i.approvalRequired,
    })),
    dataQuality: input.dataQuality,
    controlledAutoEnabled: OS_CONFIG.controlledAutoEnabled,
  });

  const topType =
    input.intervention?.type ??
    (input.topDecision
      ? decisionToInterventionType(input.topDecision.id)
      : null);
  const registered = topType ? getExecutionDef(topType) != null : false;

  const governance = runOsGovernor({
    dataQuality: input.dataQuality,
    stateFresh: true,
    interventionRegistered: registered || topType == null,
    approvalValid: false,
    approvalRequired: true,
    riskAcceptable: (input.intervention?.risk ?? "MEDIUM") !== "CRITICAL",
    blastAcceptable: (input.intervention?.blastRadius ?? "MEDIUM") !== "CRITICAL" || true,
    dependenciesSatisfied: unresolved.length === 0,
    conflicts,
    budgetExceeded: budget.exceeded,
    autonomy,
    authorizeViaIntelligence: false,
  });

  const graph = buildIntelligenceGraph({
    cycleId,
    timestamp: input.cycleTimestampIso,
    stateFingerprint: input.stateFingerprint,
    topDecisionId: input.topDecision?.id ?? null,
    topInterventionType: topType,
    signalIds: input.signalIds,
    diagnosisIds: input.diagnosisIds,
    scenarioIds: input.scenarioIds,
    warningIds: warnings.map((w) => w.id),
    opportunityIds: opportunities.map((o) => o.id),
    learningNote: learning.confidenceAdjustment.reason,
  });

  const explanation = buildDecisionExplanation({
    decisionId: input.topDecision?.id ?? null,
    evidence: input.topDecision?.whyThis ?? [],
    diagnoses: input.diagnosisIds,
    alternatives: input.topDecision?.whyNot ?? [],
    expectedEffect: input.topDecision?.expectedEffect ?? "n/a",
    confidence: learning.confidenceAdjustment.after,
    uncertainty: input.topDecision?.uncertainty ?? "UNKNOWN",
    risk: input.topDecision?.risk ?? input.intervention?.risk ?? "UNKNOWN",
    dependencies: deps.map((d) => `${d.relation}:${d.from}→${d.to}`),
    historicalEvidence: input.topDecision?.historicalReliability ?? "INSUFFICIENT",
    whyChosen: input.topDecision?.whyThis ?? [],
    bestStrategy: best,
  });

  const trace = buildIntelligenceTrace({
    cycleId,
    timestamp: input.cycleTimestampIso,
    stateFingerprint: input.stateFingerprint,
    stages: {
      OBSERVE: {
        result: "OK",
        reason: "Platform state observed.",
        outputs: [input.stateFingerprint],
      },
      MODEL: {
        result: input.twinHash,
        reason: "Digital twin / fingerprint bound.",
      },
      DETECT: {
        result: `${warnings.length} warnings`,
        reason: "Early warnings + signals.",
        outputs: warnings.map((w) => w.id),
      },
      DIAGNOSE: {
        result: `${input.diagnosisIds.length} diagnoses`,
        reason: "Existing diagnosis layer reused.",
      },
      PREDICT: {
        result: "RANGES_ONLY",
        reason: "No point forecasts.",
      },
      SIMULATE: {
        result: `${strategies.length} strategies`,
        reason: "Scenario/strategy portfolio compared.",
      },
      DECIDE: {
        result: input.topDecision?.id ?? "none",
        reason: "TOP_DECISION from V6/V7.",
      },
      PLAN: {
        result: topType ?? "none",
        reason: "V8 intervention plan.",
      },
      GOVERN: {
        result: governance.decision,
        reason: governance.reasons.join("; "),
      },
      APPROVE: {
        result: "REQUIRED",
        reason: "Human approval required; intelligence ≠ authorization.",
      },
      EXECUTE: {
        result: "NOT_IN_SNAPSHOT",
        reason: "V10 orchestrates; V9 executes only when explicitly invoked.",
      },
      VERIFY: {
        result: "PENDING_EXECUTION",
        reason: "Verification after V9 execute.",
      },
      MEASURE: {
        result: "PENDING_EXECUTION",
        reason: "Measurement after verification.",
      },
      LEARN: {
        result: learning.confidenceAdjustment.reason,
        reason: `delta=${learning.confidenceAdjustment.delta}`,
      },
      ADAPT: {
        result: `${adaptation.priorityDeltas.length} deltas`,
        reason: adaptation.notes[0] ?? "Adaptation applied when evidence sufficient.",
      },
    },
  });

  return {
    cycleId,
    status,
    failureStage,
    failureReason,
    recoveryAction,
    stateFingerprint: input.stateFingerprint,
    twinHash: input.twinHash,
    dataQuality: input.dataQuality,
    health,
    graph,
    warnings,
    opportunities,
    portfolio,
    strategies,
    bestStrategy: best,
    autonomy,
    governance,
    budgets: budget.budgets,
    conflicts,
    dependencies: deps,
    learning,
    adaptation,
    explanation,
    trace,
    productionMutation: "NONE",
    autoExecute: false,
    controlledAutoPolicy: OS_CONFIG.controlledAutoEnabled ? "ENABLED" : "DISABLED",
    note: OS_CONFIG.note,
  };
}

export function toSnapshotIntelligenceOS(
  os: IntelligenceOSResult
): SnapshotIntelligenceOS {
  return {
    cycleId: os.cycleId,
    status: os.status,
    health: {
      composite: os.health.composite,
      weakDimensions: os.health.weakDimensions,
      note: os.health.note,
    },
    graph: {
      nodeCount: os.graph.nodes.length,
      edgeCount: os.graph.edges.length,
      nodes: os.graph.nodes.slice(0, 24).map((n) => ({
        id: n.id,
        type: n.type,
        label: n.label,
      })),
    },
    warnings: os.warnings,
    opportunities: os.opportunities,
    portfolio: {
      orderedIds: os.portfolio.orderedIds,
      items: os.portfolio.items.slice(0, 8).map((i) => ({
        rank: i.rank,
        decisionId: i.decisionId,
        interventionType: i.interventionType,
        title: i.title,
        score: i.score,
        approvalRequired: i.approvalRequired,
      })),
      whyOrderedThisWay: os.portfolio.whyOrderedThisWay,
      combinedRisk: os.portfolio.combinedRisk,
    },
    bestStrategy: os.bestStrategy,
    autonomy: {
      mode: os.autonomy.mode,
      controlledAutoEnabled: os.autonomy.controlledAutoEnabled,
      autoExecute: false,
      reasons: os.autonomy.reasons,
    },
    governance: {
      decision: os.governance.decision,
      reasons: os.governance.reasons,
    },
    learning: {
      evidenceNotes: os.learning.notes.slice(0, 8),
      confidenceAdjustment: os.learning.confidenceAdjustment,
    },
    adaptation: os.adaptation,
    trace: os.trace.map((t) => ({
      stage: t.stage,
      result: t.result,
      reason: t.reason,
    })),
    productionMutation: "NONE",
    note: os.note,
  };
}
