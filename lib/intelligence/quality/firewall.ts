import type { PlatformState } from "@/lib/intelligence/engine-types";
import { assessDataQuality } from "@/lib/intelligence/data-quality";
import { INTELLIGENCE_SCORING_CONFIG as C } from "@/lib/intelligence/config/scoring";

export type QualityGate = {
  ok: boolean;
  warnings: { id: string; message: string; severity: string }[];
  blockedOperations: string[];
};

/**
 * Data quality firewall before forecast / score / causal / ranking.
 */
export function runQualityFirewall(state: PlatformState): QualityGate {
  const warnings = assessDataQuality({
    totalRevenue: state.totalRevenue,
    realRevenue7d: state.realRevenue7d,
    pendingRealOrders: state.pendingRealOrders,
    pendingRealGmv: state.pendingRealGmv,
    top2SharePct: state.top2SharePct,
    domainsConnected: state.domainsConnected,
    domainsConnectedSuccess: state.domainsConnectedSuccess,
    sparklines: state.sparklines,
  }).map((w) => ({
    id: w.id,
    message: w.message,
    severity: w.severity,
  }));

  const blocked: string[] = [];

  if (state.totalRevenue < 0 || state.realRevenue7d < 0) {
    blocked.push("forecast");
    blocked.push("causal");
  }
  if (state.top2SharePct < 0 || state.top2SharePct > 100) {
    blocked.push("ranking");
  }
  if (
    (state.sparklines?.revenue.length ?? 0) < C.forecast.minSparkPoints &&
    state.realRevenue7d <= 0 &&
    state.revenueChange7d === 0
  ) {
    // soft — forecasts may return UNAVAILABLE individually
  }

  const high = warnings.some((w) => w.severity === "high");
  return {
    ok: !high,
    warnings,
    blockedOperations: high ? [...new Set([...blocked, "forecast"])] : blocked,
  };
}

export function canRunOperation(
  gate: QualityGate,
  op: string
): { allowed: boolean; reason?: string } {
  if (gate.blockedOperations.includes(op)) {
    return {
      allowed: false,
      reason: `Blocked by data-quality firewall: ${gate.warnings.map((w) => w.id).join(", ")}`,
    };
  }
  return { allowed: true };
}
