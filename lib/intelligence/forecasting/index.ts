import type { PlatformState } from "@/lib/intelligence/engine-types";
import {
  analyzeSparkline,
  comparePeriods,
  previousFromChange,
  type TemporalMetric,
} from "@/lib/intelligence/temporal";

export type Forecast = {
  id: string;
  metric: string;
  forecastDirection: "up" | "down" | "flat";
  confidence: number;
  statement: string;
  basis: string;
  temporal: TemporalMetric;
};

/**
 * Lightweight deterministic forecasting — moving averages / velocity only.
 * No ML dependency.
 */
export function buildForecasts(state: PlatformState): Forecast[] {
  const out: Forecast[] = [];

  const revPrev = previousFromChange(
    state.realRevenue7d,
    state.revenueChange7d
  );
  const revTemporal = comparePeriods(state.realRevenue7d, revPrev, {
    id: "gmv-7d",
    label: "Real GMV (7d)",
    timeWindow: "7d vs prior 7d",
  });
  const spark = analyzeSparkline(state.sparklines?.revenue ?? []);

  out.push({
    id: "forecast-gmv",
    metric: "real_gmv_7d",
    forecastDirection: revTemporal.direction,
    confidence: revTemporal.confidence,
    statement:
      revTemporal.direction === "up"
        ? "Real GMV is likely to remain above the previous 7-day baseline if current order velocity continues."
        : revTemporal.direction === "down"
          ? "Real GMV may stay below the prior baseline unless order velocity recovers."
          : "Real GMV is likely to hold near the recent baseline.",
    basis: `${revTemporal.basis}; sparklineVelocity=${spark.velocity}%; concentration=${state.top2SharePct}%`,
    temporal: revTemporal,
  });

  const ordPrev = previousFromChange(
    state.realOrders7d,
    state.ordersChange7d
  );
  const ordTemporal = comparePeriods(state.realOrders7d, ordPrev, {
    id: "orders-7d",
    label: "Real orders (7d)",
  });
  out.push({
    id: "forecast-orders",
    metric: "real_orders_7d",
    forecastDirection: ordTemporal.direction,
    confidence: ordTemporal.confidence,
    statement:
      ordTemporal.direction === "up"
        ? "Order volume trajectory is positive versus the prior window."
        : ordTemporal.direction === "down"
          ? "Order volume trajectory is weakening versus the prior window."
          : "Order volume trajectory is stable.",
    basis: ordTemporal.basis,
    temporal: ordTemporal,
  });

  // COD backlog trajectory (simple): if pending high, risk of sustained backlog
  const codTemporal = comparePeriods(
    state.pendingRealOrders,
    Math.max(0, state.pendingRealOrders - state.processingRealOrders),
    { id: "cod-backlog", label: "COD backlog", timeWindow: "current vs clearing proxy" }
  );
  out.push({
    id: "forecast-cod",
    metric: "cod_backlog",
    forecastDirection:
      state.pendingRealOrders >= 5
        ? "up"
        : state.pendingRealOrders === 0
          ? "flat"
          : "down",
    confidence: 0.65,
    statement:
      state.pendingRealOrders >= 5
        ? "COD backlog is likely to remain elevated until verification throughput increases."
        : state.pendingRealOrders > 0
          ? "COD backlog is manageable if current verification continues."
          : "No COD backlog pressure forecast.",
    basis: codTemporal.basis,
    temporal: codTemporal,
  });

  out.push({
    id: "forecast-support",
    metric: "support_load",
    forecastDirection: state.openSupport >= 3 ? "up" : "flat",
    confidence: 0.7,
    statement:
      state.openSupport > 0
        ? "Support load remains elevated until open threads are cleared."
        : "Support load forecast is clear.",
    basis: `openSupport=${state.openSupport}`,
    temporal: comparePeriods(state.openSupport, 0, {
      id: "support",
      label: "Open support",
      timeWindow: "current",
    }),
  });

  out.push({
    id: "forecast-activation",
    metric: "first_sale_pool",
    forecastDirection: state.firstSaleCount > 50 ? "up" : "flat",
    confidence: 0.75,
    statement:
      state.firstSaleCount > 0
        ? "First-sale pool will remain large unless mid-tier conversion improves."
        : "First-sale pool is not a forecast pressure.",
    basis: `firstSaleCount=${state.firstSaleCount}; highIntent=${state.firstSaleHighIntent}`,
    temporal: comparePeriods(state.firstSaleCount, state.funnel.hasOrders, {
      id: "activation-pool",
      label: "First-sale vs has-orders",
      timeWindow: "funnel snapshot",
    }),
  });

  return out;
}

export function buildTemporalTrends(state: PlatformState): TemporalMetric[] {
  const revPrev = previousFromChange(
    state.realRevenue7d,
    state.revenueChange7d
  );
  const ordPrev = previousFromChange(
    state.realOrders7d,
    state.ordersChange7d
  );
  const usersPrev = previousFromChange(
    state.newUsers7d ?? 0,
    state.usersChange7d ?? 0
  );

  return [
    comparePeriods(state.realRevenue7d, revPrev, {
      id: "gmv",
      label: "Real GMV",
    }),
    comparePeriods(state.realOrders7d, ordPrev, {
      id: "orders",
      label: "Real orders",
    }),
    comparePeriods(state.newUsers7d ?? 0, usersPrev, {
      id: "signups",
      label: "Signups",
    }),
    comparePeriods(state.today?.revenue ?? 0, state.yesterday?.revenue ?? 0, {
      id: "gmv-today",
      label: "GMV today vs yesterday",
      timeWindow: "1d",
    }),
  ];
}
