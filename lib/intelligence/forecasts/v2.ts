import type { PlatformState } from "@/lib/intelligence/engine-types";
import {
  analyzeSparkline,
  comparePeriods,
  previousFromChange,
  type TemporalMetric,
} from "@/lib/intelligence/temporal";
import { INTELLIGENCE_SCORING_CONFIG as C } from "@/lib/intelligence/config/scoring";
import type { QualityGate } from "@/lib/intelligence/quality/firewall";

export type ForecastV2 = {
  id: string;
  metric: string;
  status: "OK" | "FORECAST_UNAVAILABLE";
  unavailableReason?: string;
  forecastDirection: "up" | "down" | "flat" | "unknown";
  confidence: number;
  horizon: string;
  baseline: number;
  velocity: number;
  acceleration: string;
  trendDirection: string;
  dataQuality: "high" | "medium" | "low" | "insufficient";
  statement: string;
  basis: string;
  temporal?: TemporalMetric;
};

function unavailable(id: string, metric: string, reason: string): ForecastV2 {
  return {
    id,
    metric,
    status: "FORECAST_UNAVAILABLE",
    unavailableReason: reason,
    forecastDirection: "unknown",
    confidence: C.forecast.unavailableConfidence,
    horizon: "7d",
    baseline: 0,
    velocity: 0,
    acceleration: "none",
    trendDirection: "flat",
    dataQuality: "insufficient",
    statement: "FORECAST_UNAVAILABLE",
    basis: reason,
  };
}

/**
 * Forecast V2 — deterministic with confidence, horizon, DQ gating.
 */
export function buildForecastsV2(
  state: PlatformState,
  gate: QualityGate
): ForecastV2[] {
  if (gate.blockedOperations.includes("forecast")) {
    return [
      unavailable(
        "forecast-gmv",
        "real_gmv_7d",
        gate.warnings[0]?.message ?? "Data quality firewall blocked forecasts"
      ),
    ];
  }

  const out: ForecastV2[] = [];
  const sparkLen = state.sparklines?.revenue.length ?? 0;

  const revPrev = previousFromChange(
    state.realRevenue7d,
    state.revenueChange7d
  );
  if (state.realRevenue7d <= 0 && revPrev <= 0 && sparkLen < C.forecast.minSparkPoints) {
    out.push(
      unavailable(
        "forecast-gmv",
        "real_gmv_7d",
        "Insufficient history for GMV forecast"
      )
    );
  } else {
    const t = comparePeriods(state.realRevenue7d, revPrev, {
      id: "gmv-7d",
      label: "Real GMV (7d)",
    });
    const spark = analyzeSparkline(state.sparklines?.revenue ?? []);
    out.push({
      id: "forecast-gmv",
      metric: "real_gmv_7d",
      status: "OK",
      forecastDirection: t.direction,
      confidence: t.confidence,
      horizon: "7d",
      baseline: t.previous,
      velocity: t.velocity,
      acceleration: t.acceleration,
      trendDirection: t.direction,
      dataQuality:
        sparkLen >= C.forecast.minSparkPoints
          ? "high"
          : revPrev > 0
            ? "medium"
            : "low",
      statement:
        t.direction === "up"
          ? "Real GMV is likely to remain above the previous 7-day baseline if current order velocity continues."
          : t.direction === "down"
            ? "Real GMV may stay below the prior baseline unless order velocity recovers."
            : "Real GMV is likely to hold near the recent baseline.",
      basis: `${t.basis}; sparkVelocity=${spark.velocity}`,
      temporal: t,
    });
  }

  const ordPrev = previousFromChange(state.realOrders7d, state.ordersChange7d);
  const ot = comparePeriods(state.realOrders7d, ordPrev, {
    id: "orders-7d",
    label: "Real orders (7d)",
  });
  out.push({
    id: "forecast-orders",
    metric: "real_orders_7d",
    status: "OK",
    forecastDirection: ot.direction,
    confidence: ot.confidence,
    horizon: "7d",
    baseline: ot.previous,
    velocity: ot.velocity,
    acceleration: ot.acceleration,
    trendDirection: ot.direction,
    dataQuality: ordPrev > 0 ? "medium" : "low",
    statement:
      ot.direction === "up"
        ? "Order volume trajectory is positive versus the prior window."
        : ot.direction === "down"
          ? "Order volume trajectory is weakening versus the prior window."
          : "Order volume trajectory is stable.",
    basis: ot.basis,
    temporal: ot,
  });

  out.push({
    id: "forecast-cod",
    metric: "cod_backlog",
    status: "OK",
    forecastDirection:
      state.pendingRealOrders >= 5
        ? "up"
        : state.pendingRealOrders === 0
          ? "flat"
          : "down",
    confidence: 0.65,
    horizon: "2d",
    baseline: 0,
    velocity: state.pendingRealOrders,
    acceleration: state.pendingRealOrders >= 10 ? "strong" : "none",
    trendDirection: state.pendingRealOrders >= 5 ? "up" : "flat",
    dataQuality: "high",
    statement:
      state.pendingRealOrders >= 5
        ? "COD backlog is likely to remain elevated until verification throughput increases."
        : state.pendingRealOrders > 0
          ? "COD backlog is manageable if current verification continues."
          : "No COD backlog pressure forecast.",
    basis: `pendingRealOrders=${state.pendingRealOrders}`,
  });

  out.push({
    id: "forecast-activation",
    metric: "first_sale_pool",
    status: state.firstSaleCount > 0 ? "OK" : "FORECAST_UNAVAILABLE",
    unavailableReason:
      state.firstSaleCount > 0 ? undefined : "No first-sale pool to forecast",
    forecastDirection: state.firstSaleCount > 50 ? "up" : "flat",
    confidence: state.firstSaleCount > 0 ? 0.75 : 0,
    horizon: "14d",
    baseline: state.funnel.hasOrders,
    velocity: state.firstSaleCount,
    acceleration: "none",
    trendDirection: "flat",
    dataQuality: "medium",
    statement:
      state.firstSaleCount > 0
        ? "First-sale pool will remain large unless mid-tier conversion improves."
        : "FORECAST_UNAVAILABLE",
    basis: `firstSaleCount=${state.firstSaleCount}`,
  });

  return out;
}

// Keep V1 builder available via re-export for compatibility
export { buildForecasts, buildTemporalTrends } from "@/lib/intelligence/forecasting/index";
