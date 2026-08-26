import { getPlatformOverview } from "@/lib/admin/platform-stats";
import {
  recommendationsToTrackedActions,
  summarizeOutcomes,
} from "@/lib/intelligence/actions/outcomes";
import { snapshotToBriefing } from "@/lib/intelligence/adapt-briefing";
import { detectAnomalies } from "@/lib/intelligence/anomalies/detect";
import { detectPlatformBottlenecks } from "@/lib/intelligence/bottlenecks/platform";
import { buildCausalHypotheses } from "@/lib/intelligence/causal/hypotheses";
import { correlateSignals } from "@/lib/intelligence/correlation";
import { getAutonomyPolicy } from "@/lib/intelligence/cycle/autonomy";
import { resolveInterventionConflicts } from "@/lib/intelligence/decision/conflicts";
import {
  buildScoreComponents,
  evidenceQualityFrom,
  historicalEffectivenessFor,
  scoreDecisionV4,
} from "@/lib/intelligence/decision/score-components";
import { diagnosePlatform } from "@/lib/intelligence/diagnosis";
import { runSecondaryDiagnosis } from "@/lib/intelligence/diagnosis/secondary";
import type { DrSaraSnapshot } from "@/lib/intelligence/engine-types";
import {
  normalizeLiveFeedEvents,
  synthesizeStateEvents,
} from "@/lib/intelligence/events/normalize";
import { explainTopDecision } from "@/lib/intelligence/explainability/why-first";
import { explainDecisionV4 } from "@/lib/intelligence/explainability/v4";
import { buildTemporalTrends } from "@/lib/intelligence/forecasting";
import { buildForecastsV2 } from "@/lib/intelligence/forecasts/v2";
import { buildIntelligenceGraph } from "@/lib/intelligence/graph/model";
import { activeChainsFor, nextChainStep } from "@/lib/intelligence/interventions/chains";
import {
  buildMerchantInterventions,
  buildPlatformInterventions,
  getTopIntervention,
  rankInterventions,
} from "@/lib/intelligence/interventions/engine";
import { buildMerchantJourney } from "@/lib/intelligence/merchants/journey";
import { buildMerchantIntelligenceProfile } from "@/lib/intelligence/merchants/profile";
import type { IntelligenceMemory } from "@/lib/intelligence/memory/types";
import { emptyIntelligenceMemory } from "@/lib/intelligence/memory/types";
import { getActiveCooldown, lastObservation } from "@/lib/intelligence/memory/store";
import { loadIntelligenceMemory } from "@/lib/intelligence/memory/persist";
import {
  expectedTargetFor,
  measureAgainstExpectation,
} from "@/lib/intelligence/measurement/outcomes";
import {
  detectNegativeSignals,
  expandOpportunities,
} from "@/lib/intelligence/opportunities/expand";
import { createRecommendedEvent } from "@/lib/intelligence/outcomes/lifecycle";
import {
  captureDimensionSnapshot,
  comparePlatformStates,
} from "@/lib/intelligence/platform/transitions";
import { toPlatformState } from "@/lib/intelligence/platform-state";
import {
  getTopAction,
  rankTopActions,
} from "@/lib/intelligence/prioritization/top-action";
import { runQualityFirewallV2 } from "@/lib/intelligence/quality/firewall-v2";
import { getRecommendedActions } from "@/lib/intelligence/recommendations/actions";
import { evaluateRegistry } from "@/lib/intelligence/registry/rules";
import { evaluateRulesV3 } from "@/lib/intelligence/registry/v3";
import { detectProactiveRisks } from "@/lib/intelligence/risks/proactive";
import {
  calculatePlatformHealth,
  dimensionStatus,
} from "@/lib/intelligence/scoring/health";
import {
  countCriticalPriorities,
  prioritizeSignals,
} from "@/lib/intelligence/scoring/priority";
import {
  getMerchantSegments,
  getMerchantSegmentSummary,
} from "@/lib/intelligence/segments/merchants";
import { buildRichSegments } from "@/lib/intelligence/segments/rich";
import { collectAllSignals } from "@/lib/intelligence/signals/collect";
import { createTraceBuilder } from "@/lib/intelligence/trace/stages";
import { INTELLIGENCE_THRESHOLDS } from "@/lib/intelligence/thresholds";
import {
  detectEarlyWarnings,
  shouldSuppressIntervention,
} from "@/lib/intelligence/warnings/early";
import type { SaraBriefing } from "@/lib/intelligence/types";
import { INTELLIGENCE_SCORING_CONFIG as C } from "@/lib/intelligence/config/scoring";

const ENGINE_VERSION = "4.0.0";

const DIMENSION_LABELS: Record<
  keyof DrSaraSnapshot["health"]["dimensions"],
  string
> = {
  operations: "Operations",
  activation: "Activation",
  revenue: "Revenue",
  support: "Support",
  technical: "Technical",
};

function statusLabelFor(
  id: keyof typeof DIMENSION_LABELS,
  score: number,
  state: ReturnType<typeof toPlatformState>
): string {
  if (id === "operations") {
    return state.pendingRealOrders > 0
      ? `${state.pendingRealOrders} pending COD`
      : "Clear";
  }
  if (id === "activation") {
    return state.firstSaleCount > 0
      ? `${state.firstSaleCount} near first sale`
      : "Stable";
  }
  if (id === "revenue") {
    return state.top2SharePct >=
      INTELLIGENCE_THRESHOLDS.revenueConcentrationHigh * 100
      ? `${state.top2SharePct}% top-2`
      : state.revenueChange7d !== 0
        ? `${state.revenueChange7d > 0 ? "+" : ""}${state.revenueChange7d}% / 7d`
        : "Steady";
  }
  if (id === "support") {
    return state.openSupport > 0 ? `${state.openSupport} open` : "Clear";
  }
  if (state.domainFailing > 0) return `${state.domainFailing} DNS failing`;
  if (state.failedLogins24h >= INTELLIGENCE_THRESHOLDS.failedLoginsHigh) {
    return `${state.failedLogins24h} failed logins`;
  }
  return score >= 85 ? "Operational" : `Score ${score}`;
}

export type BuildSnapshotOptions = {
  memory?: IntelligenceMemory;
};

export function buildDrSaraSnapshotFromState(
  state: ReturnType<typeof toPlatformState>,
  options: BuildSnapshotOptions = {}
): DrSaraSnapshot {
  const memory = options.memory ?? emptyIntelligenceMemory();
  const cycleId = `sara-${state.now.getTime()}`;
  const trace = createTraceBuilder(cycleId);
  const autonomy = getAutonomyPolicy();

  trace.stage("OBSERVE", "Normalized platform state loaded", 1);

  const gate = runQualityFirewallV2(state);
  const signals = gate.insufficientEvidence ? [] : collectAllSignals(state);
  trace.stage("DETECT", "Signals + anomalies", signals.length);

  const correlations = correlateSignals(signals, state);
  const diagnoses = gate.blockedOperations.includes("diagnosis")
    ? []
    : diagnosePlatform(state, signals, correlations);
  trace.stage("DIAGNOSE", "Platform diagnoses", diagnoses.length);

  const health = calculatePlatformHealth(state);
  const priorities = prioritizeSignals(signals, 5);
  const opportunities = expandOpportunities(state);
  const negativeSignals = detectNegativeSignals(state);
  const temporalTrends = buildTemporalTrends(state);
  const forecastsV2 = buildForecastsV2(state, gate);
  trace.stage("PREDICT", "Forecasts V2", forecastsV2.length);

  const risks = detectProactiveRisks(state, signals, temporalTrends);
  const recommendedActions = getRecommendedActions(state, signals);
  const topActionsRanked = rankTopActions(signals, recommendedActions);
  const top = getTopAction(signals, recommendedActions);
  const bottlenecks = detectPlatformBottlenecks(state);
  const causal = gate.blockedOperations.includes("causal")
    ? []
    : buildCausalHypotheses(state);
  const anomalies = detectAnomalies(state, temporalTrends);
  const earlyWarnings = detectEarlyWarnings(state, memory.observations);
  const recovery = earlyWarnings
    .filter((w) => w.state === "RECOVERING" || w.state === "RESOLVED")
    .map((w) => ({
      metric: w.metric,
      state: w.state,
      recoveryScore: w.recoveryScore,
      recoveryVelocity: w.recoveryVelocity,
    }));

  const summary = getMerchantSegmentSummary(state);
  const merchants = getMerchantSegments(state);
  const richSegments = buildRichSegments(state);
  const registryV2 = evaluateRegistry(state);
  const registryV3 = evaluateRulesV3(state);

  const profiles = [
    ...state.helpToday.map((h) =>
      buildMerchantIntelligenceProfile({
        merchantId: h.ownerId || h.storeId,
        storeId: h.storeId,
        storeName: h.storeName,
        hasStore: true,
        productCount: 0,
        activeProductCount: 0,
        realOrders: 0,
        recentLogin: true,
        healthScore: h.healthScore,
        intent: h.intent,
      })
    ),
    ...state.concentration.map((c) =>
      buildMerchantIntelligenceProfile({
        merchantId: c.id,
        storeId: c.id,
        storeName: c.name,
        hasStore: true,
        productCount: Math.max(1, c.orders),
        activeProductCount: Math.max(1, c.orders),
        realOrders: c.orders,
        realGmv: c.gmv,
        sharePct: c.sharePct,
        recentLogin: true,
      })
    ),
  ].slice(0, 16);

  // Secondary diagnosis for merchants with prior failed first-sale assists
  const failedFirstSale = memory.outcomes.filter(
    (o) =>
      o.classification === "FAILED" || o.classification === "NO_EFFECT"
  );
  const secondaryDiagnoses = profiles
    .filter((p) =>
      failedFirstSale.some((o) => {
        const int = memory.interventions.find(
          (i) => i.interventionId === o.interventionId
        );
        return (
          int?.merchantId === p.merchantId &&
          (int.type === "FIRST_SALE_ASSIST" || int.type === "ACTIVATION_OUTREACH")
        );
      })
    )
    .slice(0, 5)
    .map((p) =>
      runSecondaryDiagnosis(
        {
          merchantId: p.merchantId,
          storeId: p.storeId,
          storeName: p.storeName,
          hasStore: true,
          productCount: p.lifecycleStage === "EMPTY" ? 0 : 1,
          activeProductCount:
            p.lifecycleStage === "EMPTY" || p.lifecycleStage === "CREATED"
              ? 0
              : 1,
          realOrders: p.commerceState === "none" ? 0 : 1,
          recentLogin: p.activityState === "hot",
          hasCustomDomain: p.currentBottleneck !== "NO_DOMAIN",
          codConfigured: p.currentBottleneck !== "NO_COD",
        },
        "NO_FIRST_ORDER"
      )
    );

  let candidates = [
    ...buildPlatformInterventions(state, state.now),
    ...buildMerchantInterventions(profiles, state.now),
  ];

  // Cooldown + recovery suppression
  candidates = candidates.filter((i) => {
    const cd = getActiveCooldown(memory, i.type, state.now);
    const suppress = shouldSuppressIntervention({
      type: i.type,
      warnings: earlyWarnings,
      cooldownActive: cd.active,
    });
    return !suppress.suppress;
  });

  // Apply V4 score components + historical effectiveness
  const eq = evidenceQualityFrom({
    sampleSize: gate.sampleSize,
    warnings: gate.warnings.length,
    missingCritical: gate.insufficientEvidence,
  });
  candidates = candidates.map((i) => {
    const hist = historicalEffectivenessFor(i.type, memory.rulePerformance);
    const components = buildScoreComponents({
      impact: i.impact / 100,
      urgency: i.urgency / 100,
      confidence: i.confidence / 100,
      reversibility: i.reversibility / 100,
      actionability: i.actionability / 100,
      timeSensitivity: i.timeSensitivity / 100,
      evidenceQuality: eq,
      historicalEffectiveness: hist.value,
    });
    const scored = scoreDecisionV4(components);
    return {
      ...i,
      priority: scored.score,
      adaptiveScore: scored.score,
      historicalNote: hist.note,
    };
  });

  const ranked = rankInterventions(candidates, memory.rulePerformance.map((r) => ({
    type: r.type,
    totalAttempts: r.attempts,
    successes: r.successes,
    partialSuccesses: r.partials,
    failures: r.failures,
    noEffect: 0,
    successRate: r.successRate,
    medianTimeToOutcomeHours: r.historicalSpeedHours,
    averageImpact: r.historicalImpact,
    note: r.note,
  })));

  trace.stage("DECIDE", "Intervention candidates", ranked.length);

  const conflicts = resolveInterventionConflicts(ranked);
  trace.stage("FILTER", "Conflict resolution", conflicts.blocked.length);
  trace.stage("RANK", "Allowed interventions", conflicts.allowed.length);

  const interventions = conflicts.allowed;
  const topIntervention = getTopIntervention(interventions);

  const chains = activeChainsFor({
    domainFailing: state.domainFailing,
    pendingRealOrders: state.pendingRealOrders,
  }).map((c) => ({
    chainId: c.chainId,
    name: c.name,
    nextStep: nextChainStep(c, [])?.action ?? null,
  }));

  // Measure prior executed interventions against current state (learning)
  let learningUpdate: string | null = null;
  const openExecuted = memory.interventions.filter(
    (i) => i.status === "EXECUTED" || i.status === "PLANNED"
  );
  if (openExecuted.length > 0) {
    const sample = openExecuted[0]!;
    const metricKey = Object.keys(sample.expected)[0] ?? "pendingRealOrders";
    const baseline = sample.baseline[metricKey] ?? 0;
    const expected = sample.expected[metricKey] ?? baseline;
    const observed =
      metricKey === "pendingRealOrders"
        ? state.pendingRealOrders
        : metricKey === "domainFailing"
          ? state.domainFailing
          : metricKey === "openSupport"
            ? state.openSupport
            : baseline;
    const measured = measureAgainstExpectation({
      interventionId: sample.interventionId,
      metric: metricKey,
      direction: "lower_is_better",
      baseline,
      expected,
      observed,
      sufficientData: true,
      measuredAt: state.now,
    });
    learningUpdate = `${sample.type}: ${measured.classification} (${measured.expectedVsActual})`;
    trace.stage("MEASURE", learningUpdate, 1);
    trace.stage("LEARN", measured.expectedVsActual, 1);
  } else {
    trace.stage("MEASURE", "No open executed interventions to measure", 0);
    trace.stage(
      "LEARN",
      memory.rulePerformance.length > 0
        ? `${memory.rulePerformance.length} rule performance rows`
        : "Insufficient historical evidence.",
      memory.rulePerformance.length
    );
  }

  const dimensions = captureDimensionSnapshot(state);
  const prev = lastObservation(memory);
  const stateTransitions = comparePlatformStates(prev, {
    cycleId,
    dimensions,
  });

  const merchantJourneys = profiles.map((p) => {
    const j = buildMerchantJourney({
      merchantId: p.merchantId,
      storeId: p.storeId,
      storeName: p.storeName,
      hasStore: true,
      productCount: p.lifecycleStage === "EMPTY" ? 0 : 1,
      activeProductCount:
        p.lifecycleStage === "EMPTY" || p.lifecycleStage === "CREATED" ? 0 : 1,
      realOrders: p.commerceState === "none" ? 0 : 1,
      recentLogin: p.activityState === "hot",
    });
    return {
      merchantId: p.merchantId,
      storeName: p.storeName,
      stage: j.stage,
      bottleneck: p.currentBottleneck,
      healthScore: p.intentScore.score,
      recommendedAction: p.recommendedActions[0]?.label ?? j.recommendedAction,
    };
  });

  const events = [
    ...normalizeLiveFeedEvents(state.liveFeed),
    ...synthesizeStateEvents({
      pendingRealOrders: state.pendingRealOrders,
      domainFailing: state.domainFailing,
      openSupport: state.openSupport,
      now: state.now,
    }),
  ];

  const tracked = recommendationsToTrackedActions(
    recommendedActions,
    state.now,
    {
      pendingRealOrders: state.pendingRealOrders,
      openSupport: state.openSupport,
      domainFailing: state.domainFailing,
    }
  );
  const actionOutcomes = summarizeOutcomes(tracked);

  const actionHistory = interventions.slice(0, 8).map((i) => {
    const baseline = {
      pendingRealOrders: state.pendingRealOrders,
      domainFailing: state.domainFailing,
      openSupport: state.openSupport,
    };
    const expected = expectedTargetFor(i.type, baseline);
    const ev = createRecommendedEvent({
      actionId: i.id,
      merchantId: i.merchantId,
      type: i.type,
      ruleId: i.type,
      targetMetric: i.targetMetric,
      baselineValue:
        i.type === "COD_VERIFICATION"
          ? state.pendingRealOrders
          : i.type === "DNS_DIAGNOSIS"
            ? state.domainFailing
            : i.type === "SUPPORT_ESCALATION"
              ? state.openSupport
              : 0,
      now: state.now,
      evidence: i.evidence.map((e) => `${e.label}=${String(e.value)}`),
    });
    void expected;
    return {
      actionId: ev.actionId,
      type: ev.type,
      status: ev.status,
      timestamp: ev.timestamp,
    };
  });

  const alt = topActionsRanked[1];
  const whyFirst = top
    ? explainTopDecision({
        topLabel: top.action.label,
        topHref: top.action.href,
        topScore: top.priorityScore,
        topReason: top.whyThisFirst,
        pendingRealOrders: state.pendingRealOrders,
        firstSaleCount: state.firstSaleCount,
        domainFailing: state.domainFailing,
        openSupport: state.openSupport,
        alternativeLabel: alt?.action.label,
        calculation: top.calculation,
        ruleIds: [top.relatedSignalId ?? top.action.id],
        confidence: 0.95,
      })
    : null;

  const topType =
    topIntervention?.type ??
    (top?.action.href.includes("payments") ? "COD_VERIFICATION" : "UNKNOWN");
  const histTop = historicalEffectivenessFor(topType, memory.rulePerformance);
  const topComponents = topIntervention
    ? buildScoreComponents({
        impact: topIntervention.impact / 100,
        urgency: topIntervention.urgency / 100,
        confidence: topIntervention.confidence / 100,
        reversibility: topIntervention.reversibility / 100,
        actionability: topIntervention.actionability / 100,
        timeSensitivity: topIntervention.timeSensitivity / 100,
        evidenceQuality: eq,
        historicalEffectiveness: histTop.value,
      })
    : null;
  const topDecision = topComponents
    ? scoreDecisionV4(topComponents, { alternativeLabel: alt?.action.label })
    : null;

  const explainabilityV4 = top
    ? explainDecisionV4({
        decision: top.action.label,
        whatHappened:
          state.pendingRealOrders > 0
            ? `${state.pendingRealOrders} COD orders awaiting verification.`
            : state.attentionSentence,
        whyItMatters:
          "Operational trust and GMV handoff depend on clearing actionable queues first.",
        evidence: [
          ...(state.pendingRealOrders > 0
            ? [
                `pendingCOD=${state.pendingRealOrders}`,
                `pendingGMV=${state.pendingRealGmv}`,
              ]
            : []),
          ...(state.domainFailing > 0
            ? [`domainFailing=${state.domainFailing}`]
            : []),
          `historicalSuccess=${histTop.value}`,
        ],
        whatChanged: stateTransitions.evidence.join("; ") || "Baseline cycle.",
        whatNext: top.action.label,
        whyThisAction:
          topDecision?.whyThisActionWon ?? top.whyThisFirst,
        historicalNote: histTop.note,
        expected:
          topType === "COD_VERIFICATION"
            ? `Reduce backlog by ~${Math.round(C.outcome.expectedCodClearanceRatio * 100)}% within 24h.`
            : "Improve the targeted metric within the observation window.",
        measureIn: `${C.outcome.observationWindowDays}d observation window`,
        ifFails: "Run secondary diagnosis and re-rank interventions.",
        scoreComponents: topComponents,
        confidence: Math.max(0.2, 0.95 * (1 - gate.confidencePenalty)),
        ruleIds: [top.relatedSignalId ?? top.action.id],
      })
    : null;

  const graph = buildIntelligenceGraph({
    signalIds: signals.map((s) => s.id),
    diagnosisIds: diagnoses.map((d) => d.diagnosisId),
    bottleneckCodes: bottlenecks.map((b) => b.code),
    interventionIds: interventions.slice(0, 10).map((i) => i.id),
    causalIds: causal.map((c) => c.id),
    merchantIds: profiles.map((p) => p.merchantId),
    opportunityIds: opportunities.map((o) => o.id),
    riskIds: risks.map((r) => r.id),
    outcomeIds: memory.outcomes.slice(0, 5).map((o) => o.outcomeId),
    dependencyEdges: conflicts.dependencyGraph,
  });

  const evidenceCount =
    signals.reduce((n, s) => n + s.evidence.length, 0) +
    diagnoses.reduce((n, d) => n + d.evidence.length, 0);
  const overallConfidence =
    signals.length === 0
      ? 0.6
      : Math.round(
          (signals.reduce((n, s) => n + s.confidence, 0) / signals.length) *
            (1 - gate.confidencePenalty) *
            100
        ) / 100;

  const pulseDimensions = (
    Object.keys(DIMENSION_LABELS) as (keyof typeof DIMENSION_LABELS)[]
  ).map((id) => {
    const score = health.dimensions[id];
    return {
      id,
      label: DIMENSION_LABELS[id],
      score,
      status: dimensionStatus(score),
      statusLabel: statusLabelFor(id, score, state),
    };
  });

  const headlineParts = [
    state.attentionSentence,
    top ? `Top action: ${top.action.label}` : null,
  ].filter(Boolean);

  const executionTraceV4 = trace.build({
    topAction: top?.action.label ?? null,
    warnings: gate.warnings.length,
    rulesEvaluated: registryV3.evaluated,
    rulesFired: registryV3.fired.length,
    signalsGenerated: signals.length,
    diagnoses: diagnoses.filter((d) => d.diagnosisId !== "NONE").length,
    interventions: interventions.length,
    blockedInterventions: conflicts.blocked.length,
    learningUpdate,
  });

  return {
    generatedAt: state.now,
    headline:
      headlineParts.join(" · ") ||
      health.reasons[0] ||
      "Here's what matters right now.",
    health,
    pulseDimensions,
    priorities,
    signals,
    correlations,
    diagnoses,
    opportunities,
    risks,
    merchantSegments: { summary, merchants },
    recommendedActions,
    criticalCount: countCriticalPriorities(priorities),
    topAction: top
      ? {
          label: top.action.label,
          href: top.action.href,
          whyThisFirst: top.whyThisFirst,
          priorityScore: top.priorityScore,
          calculation: top.calculation,
        }
      : null,
    topActions: topActionsRanked.map((t) => ({
      rank: t.rank,
      label: t.action.label,
      href: t.action.href,
      whyThisFirst: t.whyThisFirst,
      priorityScore: t.priorityScore,
    })),
    temporalTrends: temporalTrends.map((t) => ({
      id: t.id,
      label: t.label,
      current: t.current,
      previous: t.previous,
      deltaPct: t.deltaPct,
      direction: t.direction,
      acceleration: t.acceleration,
      confidence: t.confidence,
      anomaly: t.anomaly,
      basis: t.basis,
    })),
    forecasts: forecastsV2.map((f) => ({
      id: f.id,
      metric: f.metric,
      forecastDirection: f.forecastDirection,
      confidence: f.confidence,
      statement: f.statement,
      basis: f.basis,
    })),
    bottlenecks: bottlenecks.map((b) => ({
      code: b.code,
      title: b.title,
      affectedCount: b.affectedCount,
      highIntent: b.highIntent,
      severity: b.severity,
      confidence: b.confidence,
      ruleIds: b.ruleIds,
    })),
    merchantJourneys,
    events: events.map((e) => ({
      type: e.type,
      timestamp: e.timestamp,
      metadata: e.metadata,
    })),
    dataQualityWarnings: gate.warnings,
    actionOutcomes: {
      totalTracked: actionOutcomes.totalTracked,
      successCount: actionOutcomes.successCount,
      failureCount: actionOutcomes.failureCount,
      actionSuccessRate: actionOutcomes.actionSuccessRate,
      notes: actionOutcomes.notes,
    },
    registryFired: [
      ...new Set([
        ...registryV2.filter((r) => r.fired).map((r) => r.id),
        ...registryV3.fired,
      ]),
    ],
    confidence: {
      overall: overallConfidence,
      evidenceCount,
      notes: [
        "Deterministic engine — not LLM-generated.",
        gate.warnings.length > 0
          ? `${gate.warnings.length} data-quality warning(s) present.`
          : "No data-quality warnings.",
        `Autonomy: ${autonomy.label} (autoExecute=${autonomy.autoExecute}).`,
      ],
    },
    causalHypotheses: causal.map((c) => ({
      id: c.id,
      ruleId: c.ruleId,
      hypothesis: c.hypothesis,
      confidence: c.confidence,
      affectedCount: c.affectedCount,
      evidenceLines: c.evidenceLines,
    })),
    anomalies: anomalies.map((a) => ({
      id: a.id,
      ruleId: a.ruleId,
      title: a.title,
      baseline: a.baseline,
      observed: a.observed,
      deltaPct: a.deltaPct,
      confidence: a.confidence,
    })),
    merchantIntelligence: profiles.map((p) => ({
      merchantId: p.merchantId,
      storeName: p.storeName,
      lifecycleStage: p.lifecycleStage,
      bottleneck: p.currentBottleneck,
      intentScore: p.intentScore.score,
      interventionScore: p.interventionScore,
      opportunity: p.opportunity,
    })),
    interventions: interventions.slice(0, 12).map((i) => ({
      id: i.id,
      type: i.type,
      merchantId: i.merchantId,
      priority: i.priority,
      reason: i.reason,
      recommendedRoute: i.recommendedRoute,
      expectedOutcome: i.expectedOutcome,
    })),
    topIntervention: topIntervention
      ? {
          type: topIntervention.type,
          merchantId: topIntervention.merchantId,
          reason: topIntervention.reason,
          recommendedRoute: topIntervention.recommendedRoute,
          priority: topIntervention.priority,
          whyThisFirst: `${topIntervention.type}: ${topIntervention.reason}`,
        }
      : null,
    whyFirst: whyFirst
      ? {
          decision: whyFirst.decision,
          whyThis: whyFirst.whyThis,
          whyNow: whyFirst.whyNow,
          whyNotAlternative: whyFirst.whyNotAlternative,
          evidence: whyFirst.evidence,
        }
      : null,
    actionHistory,
    interventionMemory: memory.rulePerformance.map((m) => ({
      type: m.type,
      totalAttempts: m.attempts,
      successRate: m.successRate,
      note: m.note,
    })),
    richSegments: richSegments.map((s) => ({
      id: s.id,
      label: s.label,
      count: s.count,
      ruleId: s.ruleId,
      priority: s.priority,
    })),
    graph: {
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
    },
    executionTrace: {
      snapshotId: cycleId,
      rulesEvaluated: registryV3.evaluated,
      rulesFired: registryV3.fired.length,
      signalsGenerated: signals.length,
      diagnoses: diagnoses.filter((d) => d.diagnosisId !== "NONE").length,
      interventions: interventions.length,
      topAction: top?.action.label ?? null,
      warnings: gate.warnings.length,
      executionTimeMs: executionTraceV4.executionTimeMs,
    },
    earlyWarnings: earlyWarnings.map((w) => ({
      id: w.id,
      metric: w.metric,
      state: w.state,
      current: w.current,
      velocity: w.velocity,
      recoveryScore: w.recoveryScore,
      ruleId: w.ruleId,
    })),
    recovery,
    stateTransitions,
    blockedInterventions: conflicts.blocked.map((b) => ({
      id: b.intervention.id,
      type: b.intervention.type,
      blockedBy: b.blockedBy,
      reasons: b.reasons,
    })),
    interventionChains: chains,
    learning: {
      rulePerformance: memory.rulePerformance.map((r) => ({
        type: r.type,
        successRate: r.successRate,
        adaptivePriority: r.adaptivePriority,
        note: r.note,
      })),
      update: learningUpdate,
    },
    decisionV4: {
      scoreComponents: topComponents,
      whyThisActionWon: topDecision?.whyThisActionWon ?? null,
      historicalEffectiveness: histTop.value,
    },
    explainabilityV4: explainabilityV4
      ? {
          decision: explainabilityV4.decision,
          whatHappened: explainabilityV4.whatHappened,
          whyItMatters: explainabilityV4.whyItMatters,
          evidence: explainabilityV4.evidence,
          whatNext: explainabilityV4.whatNext,
          whyThisAction: explainabilityV4.whyThisAction,
          whatHappenedLastTime: explainabilityV4.whatHappenedLastTime,
          whatWeExpect: explainabilityV4.whatWeExpect,
          whenWeMeasure: explainabilityV4.whenWeMeasure,
          ifFails: explainabilityV4.ifFails,
        }
      : null,
    negativeSignals: negativeSignals.map((n) => ({
      id: n.id,
      ruleId: n.ruleId,
      title: n.title,
      confidence: n.confidence,
    })),
    secondaryDiagnoses: secondaryDiagnoses.map((s) => ({
      primary: s.primary,
      deepestBottleneck: s.deepestBottleneck,
      explanation: s.explanation,
    })),
    autonomy: {
      level: autonomy.level,
      label: autonomy.label,
      autoExecute: autonomy.autoExecute,
    },
    executionTraceV4: {
      cycleId: executionTraceV4.cycleId,
      stages: executionTraceV4.stages.map((s) => ({
        stage: s.stage,
        detail: s.detail,
        count: s.count,
      })),
      blockedInterventions: executionTraceV4.blockedInterventions,
      learningUpdate: executionTraceV4.learningUpdate,
    },
    dataQualityV2: {
      dataFreshness: gate.dataFreshness,
      sampleSize: gate.sampleSize,
      missingDimensions: gate.missingDimensions,
      confidencePenalty: gate.confidencePenalty,
      insufficientEvidence: gate.insufficientEvidence,
    },
    metadata: {
      engine: "deterministic",
      version: ENGINE_VERSION,
      thresholds: { ...INTELLIGENCE_THRESHOLDS },
      source: "getPlatformOverview",
    },
  };
}

export async function getDrSaraSnapshot(): Promise<DrSaraSnapshot> {
  const overview = await getPlatformOverview();
  const memory = await loadIntelligenceMemory();
  return buildDrSaraSnapshotFromState(toPlatformState(overview), { memory });
}

export async function getDrSaraCriticalCount(): Promise<number> {
  const snapshot = await getDrSaraSnapshot();
  return snapshot.criticalCount;
}

export async function getDrSaraBriefing(): Promise<SaraBriefing> {
  const snapshot = await getDrSaraSnapshot();
  return snapshotToBriefing(snapshot);
}
