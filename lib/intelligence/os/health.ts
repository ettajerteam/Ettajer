/**
 * Composite platform health — does not hide weak dimensions.
 */
import type { PlatformState } from "@/lib/intelligence/engine-types";
import type {
  HealthDimension,
  PlatformHealthModel,
} from "@/lib/intelligence/os/types";

export function buildPlatformHealthModel(input: {
  state: PlatformState;
  healthScore?: number;
}): PlatformHealthModel {
  const s = input.state;
  const dimensions: HealthDimension[] = [
    dim(
      "OPERATIONS",
      scoreInverse(s.pendingRealOrders, 20),
      s.pendingRealOrders > s.processingRealOrders ? "DOWN" : "FLAT",
      [`pendingRealOrders=${s.pendingRealOrders}`],
      s.pendingRealOrders >= 10 ? "HIGH" : "LOW",
      "Review pending COD"
    ),
    dim(
      "ACTIVATION",
      scoreDirect(s.firstSaleHighIntent, 100),
      "UNKNOWN",
      [`firstSaleHighIntent=${s.firstSaleHighIntent}`],
      s.firstSaleHighIntent > 50 ? "LOW" : "MEDIUM",
      "Assist high-intent merchants"
    ),
    dim(
      "REVENUE",
      scoreInverse(s.top2SharePct, 100),
      s.concentrationElevated ? "DOWN" : "FLAT",
      [`top2SharePct=${s.top2SharePct}`],
      s.concentrationElevated ? "HIGH" : "LOW",
      "Review revenue concentration"
    ),
    dim(
      "SUPPORT",
      scoreInverse(s.openSupport, 10),
      "UNKNOWN",
      [`openSupport=${s.openSupport}`],
      s.openSupport >= 3 ? "MEDIUM" : "LOW",
      "Answer support"
    ),
    dim(
      "TECHNICAL",
      scoreInverse(s.domainFailing, 10),
      s.domainFailing >= 3 ? "DOWN" : "FLAT",
      [`domainFailing=${s.domainFailing}`],
      s.domainFailing >= 3 ? "HIGH" : "LOW",
      "Diagnose DNS"
    ),
    dim(
      "RETENTION",
      scoreDirect(s.liveStores, Math.max(1, s.totalStores)),
      "UNKNOWN",
      [`liveStores=${s.liveStores}`],
      "MEDIUM",
      "Monitor dormant merchants"
    ),
    dim(
      "TRUST",
      scoreInverse(s.pendingRealOrders + s.openSupport, 25),
      "UNKNOWN",
      ["COD + support backlog as trust proxies"],
      "MEDIUM",
      "Clear operational backlog"
    ),
    dim(
      "GROWTH",
      scoreDirect(s.realOrders7d, 50),
      trendFromChange(s.ordersChange7d),
      [`realOrders7d=${s.realOrders7d}`, `ordersChange7d=${s.ordersChange7d}`],
      "MEDIUM",
      "Pursue activation opportunities"
    ),
  ];

  const weakDimensions = dimensions
    .filter((d) => d.score < 55)
    .map((d) => d.id)
    .sort();

  const composite =
    input.healthScore != null
      ? input.healthScore
      : Math.round(
          dimensions.reduce((a, d) => a + d.score, 0) / dimensions.length
        );

  return {
    composite,
    dimensions,
    weakDimensions,
    note:
      weakDimensions.length > 0
        ? `Weak dimensions: ${weakDimensions.join(", ")} — not hidden by average.`
        : "No weak dimensions below threshold.",
  };
}

function dim(
  id: string,
  score: number,
  trend: HealthDimension["trend"],
  evidence: string[],
  risk: string,
  recommendedAction: string
): HealthDimension {
  return {
    id,
    score: Math.max(0, Math.min(100, Math.round(score))),
    trend,
    evidence,
    risk,
    recommendedAction,
  };
}

function scoreInverse(value: number, badAt: number): number {
  if (badAt <= 0) return 100;
  return Math.max(0, 100 - (value / badAt) * 100);
}

function scoreDirect(value: number, goodAt: number): number {
  if (goodAt <= 0) return 0;
  return Math.min(100, (value / goodAt) * 100);
}

function trendFromChange(change: number): HealthDimension["trend"] {
  if (change > 5) return "UP";
  if (change < -5) return "DOWN";
  return "FLAT";
}
