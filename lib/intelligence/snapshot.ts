import { getPlatformOverview } from "@/lib/admin/platform-stats";
import { snapshotToBriefing } from "@/lib/intelligence/adapt-briefing";
import { correlateSignals } from "@/lib/intelligence/correlation";
import { diagnosePlatform } from "@/lib/intelligence/diagnosis";
import type { DrSaraSnapshot } from "@/lib/intelligence/engine-types";
import { getOpportunities } from "@/lib/intelligence/opportunities";
import { toPlatformState } from "@/lib/intelligence/platform-state";
import {
  getRecommendedActions,
  getRisks,
} from "@/lib/intelligence/recommendations/actions";
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

const ENGINE_VERSION = "1.0.0";

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
  if (
    state.failedLogins24h >= INTELLIGENCE_THRESHOLDS.failedLoginsHigh
  ) {
    return `${state.failedLogins24h} failed logins`;
  }
  return score >= 85 ? "Operational" : `Score ${score}`;
}

/**
 * Pure snapshot builder — testable without DB.
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
  const risks = getRisks(state, signals);
  const recommendedActions = getRecommendedActions(state, signals);
  const summary = getMerchantSegmentSummary(state);
  const merchants = getMerchantSegments(state);

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

  return {
    generatedAt: state.now,
    headline:
      state.attentionSentence ||
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
    metadata: {
      engine: "deterministic",
      version: ENGINE_VERSION,
      thresholds: { ...INTELLIGENCE_THRESHOLDS },
      source: "getPlatformOverview",
    },
  };
}

/**
 * Single source of truth for /admin/sara.
 * Reuses getPlatformOverview() — no duplicate Prisma business logic.
 */
export async function getDrSaraSnapshot(): Promise<DrSaraSnapshot> {
  const overview = await getPlatformOverview();
  return buildDrSaraSnapshotFromState(toPlatformState(overview));
}

export async function getDrSaraCriticalCount(): Promise<number> {
  const snapshot = await getDrSaraSnapshot();
  return snapshot.criticalCount;
}

/** UI briefing from engine snapshot (stable SaraBriefing contract). */
export async function getDrSaraBriefing(): Promise<SaraBriefing> {
  const snapshot = await getDrSaraSnapshot();
  return snapshotToBriefing(snapshot);
}
