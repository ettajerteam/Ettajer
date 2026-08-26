import { getPlatformOverview } from "@/lib/admin/platform-stats";
import {
  recommendationsToTrackedActions,
  summarizeOutcomes,
} from "@/lib/intelligence/actions/outcomes";
import { snapshotToBriefing } from "@/lib/intelligence/adapt-briefing";
import { detectPlatformBottlenecks } from "@/lib/intelligence/bottlenecks/platform";
import { correlateSignals } from "@/lib/intelligence/correlation";
import { assessDataQuality } from "@/lib/intelligence/data-quality";
import { diagnosePlatform } from "@/lib/intelligence/diagnosis";
import type { DrSaraSnapshot } from "@/lib/intelligence/engine-types";
import {
  normalizeLiveFeedEvents,
  synthesizeStateEvents,
} from "@/lib/intelligence/events/normalize";
import {
  buildForecasts,
  buildTemporalTrends,
} from "@/lib/intelligence/forecasting";
import { buildMerchantJourney } from "@/lib/intelligence/merchants/journey";
import { getOpportunities } from "@/lib/intelligence/opportunities";
import { toPlatformState } from "@/lib/intelligence/platform-state";
import {
  getTopAction,
  rankTopActions,
} from "@/lib/intelligence/prioritization/top-action";
import { getRecommendedActions } from "@/lib/intelligence/recommendations/actions";
import { evaluateRegistry } from "@/lib/intelligence/registry/rules";
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
import { collectAllSignals } from "@/lib/intelligence/signals/collect";
import { INTELLIGENCE_THRESHOLDS } from "@/lib/intelligence/thresholds";
import type { SaraBriefing } from "@/lib/intelligence/types";

const ENGINE_VERSION = "2.0.0";

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

/**
 * Pure snapshot builder V2 — testable without DB.
 */
export function buildDrSaraSnapshotFromState(
  state: ReturnType<typeof toPlatformState>
): DrSaraSnapshot {
  const signals = collectAllSignals(state);
  const correlations = correlateSignals(signals, state);
  const diagnoses = diagnosePlatform(state, signals, correlations);
  const health = calculatePlatformHealth(state);
  const priorities = prioritizeSignals(signals, 5);
  const opportunities = getOpportunities(state);
  const temporalTrends = buildTemporalTrends(state);
  const forecasts = buildForecasts(state);
  const risks = detectProactiveRisks(state, signals, temporalTrends);
  const recommendedActions = getRecommendedActions(state, signals);
  const topActionsRanked = rankTopActions(signals, recommendedActions);
  const top = getTopAction(signals, recommendedActions);
  const bottlenecks = detectPlatformBottlenecks(state);
  const summary = getMerchantSegmentSummary(state);
  const merchants = getMerchantSegments(state);
  const dq = assessDataQuality({
    totalRevenue: state.totalRevenue,
    realRevenue7d: state.realRevenue7d,
    pendingRealOrders: state.pendingRealOrders,
    pendingRealGmv: state.pendingRealGmv,
    top2SharePct: state.top2SharePct,
    domainsConnected: state.domainsConnected,
    domainsConnectedSuccess: state.domainsConnectedSuccess,
    sparklines: state.sparklines,
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

  const merchantJourneys = [
    ...state.helpToday.map((h) =>
      buildMerchantJourney({
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
      buildMerchantJourney({
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

  const registry = evaluateRegistry(state);
  const registryFired = registry.filter((r) => r.fired).map((r) => r.id);

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
    top
      ? `Top action: ${top.action.label}`
      : null,
  ].filter(Boolean);

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
    forecasts: forecasts.map((f) => ({
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
    merchantJourneys: merchantJourneys.map((j) => ({
      merchantId: j.merchantId,
      storeName: j.storeName,
      stage: j.stage,
      bottleneck: j.bottleneck,
      healthScore: j.healthScore,
      recommendedAction: j.recommendedAction,
    })),
    events: events.map((e) => ({
      type: e.type,
      timestamp: e.timestamp,
      metadata: e.metadata,
    })),
    dataQualityWarnings: dq.map((w) => ({
      id: w.id,
      severity: w.severity,
      message: w.message,
    })),
    actionOutcomes: {
      totalTracked: actionOutcomes.totalTracked,
      successCount: actionOutcomes.successCount,
      failureCount: actionOutcomes.failureCount,
      actionSuccessRate: actionOutcomes.actionSuccessRate,
      notes: actionOutcomes.notes,
    },
    registryFired,
    confidence: {
      overall: overallConfidence,
      evidenceCount,
      notes: [
        "Deterministic engine — not LLM-generated.",
        dq.length > 0
          ? `${dq.length} data-quality warning(s) present.`
          : "No data-quality warnings.",
      ],
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
