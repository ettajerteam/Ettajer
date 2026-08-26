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
import { diagnosePlatform } from "@/lib/intelligence/diagnosis";
import type { DrSaraSnapshot } from "@/lib/intelligence/engine-types";
import {
  normalizeLiveFeedEvents,
  synthesizeStateEvents,
} from "@/lib/intelligence/events/normalize";
import { explainTopDecision } from "@/lib/intelligence/explainability/why-first";
import { buildTemporalTrends } from "@/lib/intelligence/forecasting";
import { buildForecastsV2 } from "@/lib/intelligence/forecasts/v2";
import { buildIntelligenceGraph } from "@/lib/intelligence/graph/model";
import {
  buildMerchantInterventions,
  buildPlatformInterventions,
  getTopIntervention,
  rankInterventions,
} from "@/lib/intelligence/interventions/engine";
import { buildMerchantJourney } from "@/lib/intelligence/merchants/journey";
import { buildMerchantIntelligenceProfile } from "@/lib/intelligence/merchants/profile";
import { getOpportunities } from "@/lib/intelligence/opportunities";
import { createRecommendedEvent } from "@/lib/intelligence/outcomes/lifecycle";
import { emptyInterventionMemory } from "@/lib/intelligence/outcomes/memory";
import { toPlatformState } from "@/lib/intelligence/platform-state";
import {
  getTopAction,
  rankTopActions,
} from "@/lib/intelligence/prioritization/top-action";
import { runQualityFirewall } from "@/lib/intelligence/quality/firewall";
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
import { INTELLIGENCE_THRESHOLDS } from "@/lib/intelligence/thresholds";
import type { SaraBriefing } from "@/lib/intelligence/types";

const ENGINE_VERSION = "3.0.0";

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

export function buildDrSaraSnapshotFromState(
  state: ReturnType<typeof toPlatformState>
): DrSaraSnapshot {
  const t0 = Date.now();
  const snapshotId = `sara-${state.now.getTime()}`;

  const gate = runQualityFirewall(state);
  const signals = collectAllSignals(state);
  const correlations = correlateSignals(signals, state);
  const diagnoses = diagnosePlatform(state, signals, correlations);
  const health = calculatePlatformHealth(state);
  const priorities = prioritizeSignals(signals, 5);
  const opportunities = getOpportunities(state);
  const temporalTrends = buildTemporalTrends(state);
  const forecastsV2 = buildForecastsV2(state, gate);
  const risks = detectProactiveRisks(state, signals, temporalTrends);
  const recommendedActions = getRecommendedActions(state, signals);
  const topActionsRanked = rankTopActions(signals, recommendedActions);
  const top = getTopAction(signals, recommendedActions);
  const bottlenecks = detectPlatformBottlenecks(state);
  const causal = gate.blockedOperations.includes("causal")
    ? []
    : buildCausalHypotheses(state);
  const anomalies = detectAnomalies(state, temporalTrends);
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

  const memory = emptyInterventionMemory();
  const interventions = rankInterventions(
    [
      ...buildPlatformInterventions(state, state.now),
      ...buildMerchantInterventions(profiles, state.now),
    ],
    memory
  );
  const topIntervention = getTopIntervention(interventions);

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

  const graph = buildIntelligenceGraph({
    signalIds: signals.map((s) => s.id),
    diagnosisIds: diagnoses.map((d) => d.diagnosisId),
    bottleneckCodes: bottlenecks.map((b) => b.code),
    interventionIds: interventions.slice(0, 10).map((i) => i.id),
    causalIds: causal.map((c) => c.id),
    merchantIds: profiles.map((p) => p.merchantId),
  });

  const evidenceCount =
    signals.reduce((n, s) => n + s.evidence.length, 0) +
    diagnoses.reduce((n, d) => n + d.evidence.length, 0);
  const overallConfidence =
    signals.length === 0
      ? 0.6
      : Math.round(
          (signals.reduce((n, s) => n + s.confidence, 0) / signals.length) * 100
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

  const executionTimeMs = Date.now() - t0;

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
      ...new Set([...registryV2.filter((r) => r.fired).map((r) => r.id), ...registryV3.fired]),
    ],
    confidence: {
      overall: overallConfidence,
      evidenceCount,
      notes: [
        "Deterministic engine — not LLM-generated.",
        gate.warnings.length > 0
          ? `${gate.warnings.length} data-quality warning(s) present.`
          : "No data-quality warnings.",
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
    interventionMemory: memory.map((m) => ({
      type: m.type,
      totalAttempts: m.totalAttempts,
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
      snapshotId,
      rulesEvaluated: registryV3.evaluated,
      rulesFired: registryV3.fired.length,
      signalsGenerated: signals.length,
      diagnoses: diagnoses.filter((d) => d.diagnosisId !== "NONE").length,
      interventions: interventions.length,
      topAction: top?.action.label ?? null,
      warnings: gate.warnings.length,
      executionTimeMs,
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
  return buildDrSaraSnapshotFromState(toPlatformState(overview));
}

export async function getDrSaraCriticalCount(): Promise<number> {
  const snapshot = await getDrSaraSnapshot();
  return snapshot.criticalCount;
}

export async function getDrSaraBriefing(): Promise<SaraBriefing> {
  const snapshot = await getDrSaraSnapshot();
  return snapshotToBriefing(snapshot);
}
