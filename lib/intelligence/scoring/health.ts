import type {
  HealthDimensionScores,
  PlatformHealthResult,
  PlatformState,
} from "@/lib/intelligence/engine-types";
import { INTELLIGENCE_THRESHOLDS as T } from "@/lib/intelligence/thresholds";

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function scoreOperations(state: PlatformState): number {
  let s = 100;
  s -= Math.min(40, state.pendingRealOrders * 3);
  if (state.pendingRealOrders >= T.pendingOrdersCritical) s -= 15;
  else if (state.pendingRealOrders >= T.pendingOrdersHigh) s -= 8;
  s -= Math.min(20, state.waitingUsers * 5);
  return clamp(s);
}

function scoreActivation(state: PlatformState): number {
  let s = 100;
  s -= Math.min(25, state.hotEmptyCount * 2);
  s -= Math.min(30, Math.floor(state.firstSaleCount / 8));
  if (state.funnel.totalStores > 0) {
    const conversion =
      state.funnel.hasOrders / Math.max(1, state.funnel.totalStores);
    if (conversion < 0.1) s -= 15;
    else if (conversion < 0.25) s -= 8;
  }
  return clamp(s);
}

function scoreRevenue(state: PlatformState): number {
  let s = 100;
  const share = state.top2SharePct / 100;
  if (share >= T.revenueConcentrationCritical) s -= 35;
  else if (share >= T.revenueConcentrationHigh) s -= 22;
  else if (share >= 0.4) s -= 10;
  if (state.realOrders7d === 0 && state.totalRevenue === 0) s -= 20;
  if (state.revenueChange7d < -20) s -= 12;
  else if (state.revenueChange7d >= T.revenueMomentumPositive) s += 5;
  return clamp(s);
}

function scoreSupport(state: PlatformState): number {
  let s = 100;
  s -= Math.min(40, state.openSupport * 12);
  if (state.openSupport >= T.supportBacklogHigh) s -= 10;
  return clamp(s);
}

function scoreTechnical(state: PlatformState): number {
  let s = 100;
  s -= Math.min(40, state.domainFailing * 10);
  if (state.failedLogins24h >= T.failedLoginsHigh) s -= 25;
  else s -= Math.min(15, state.failedLogins24h);
  return clamp(s);
}

/**
 * Platform health 0–100 from live state — never hardcoded.
 */
export function calculatePlatformHealth(
  state: PlatformState
): PlatformHealthResult {
  const dimensions: HealthDimensionScores = {
    operations: scoreOperations(state),
    activation: scoreActivation(state),
    revenue: scoreRevenue(state),
    support: scoreSupport(state),
    technical: scoreTechnical(state),
  };

  const score = clamp(
    dimensions.operations * 0.28 +
      dimensions.activation * 0.2 +
      dimensions.revenue * 0.22 +
      dimensions.support * 0.15 +
      dimensions.technical * 0.15
  );

  const reasons: string[] = [];
  if (dimensions.operations < 70) {
    reasons.push(
      `Operations ${dimensions.operations}/100 — ${state.pendingRealOrders} pending COD`
    );
  }
  if (dimensions.activation < 70) {
    reasons.push(
      `Activation ${dimensions.activation}/100 — ${state.firstSaleCount} first-sale gap`
    );
  }
  if (dimensions.revenue < 70) {
    reasons.push(
      `Revenue ${dimensions.revenue}/100 — top-2 share ${state.top2SharePct}%`
    );
  }
  if (dimensions.support < 70) {
    reasons.push(
      `Support ${dimensions.support}/100 — ${state.openSupport} open threads`
    );
  }
  if (dimensions.technical < 70) {
    reasons.push(
      `Technical ${dimensions.technical}/100 — ${state.domainFailing} DNS failing`
    );
  }

  let status: PlatformHealthResult["status"];
  if (score >= 85 && reasons.length === 0) status = "healthy";
  else if (score >= 65) status = "stable";
  else if (score >= 40) status = "attention";
  else status = "critical";

  if (reasons.length === 0) {
    reasons.push("No dimension below attention threshold.");
  }

  return { score, dimensions, status, reasons };
}

export function dimensionStatus(
  score: number
): "ok" | "watch" | "attention" | "critical" {
  if (score >= 85) return "ok";
  if (score >= 70) return "watch";
  if (score >= 45) return "attention";
  return "critical";
}
