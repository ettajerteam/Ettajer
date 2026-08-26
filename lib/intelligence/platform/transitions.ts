/**
 * Platform state transitions across cycles.
 */
import type { PlatformState } from "@/lib/intelligence/engine-types";
import type {
  IntelligenceObservation,
  PlatformDimensionSnapshot,
} from "@/lib/intelligence/memory/types";
import { calculatePlatformHealth } from "@/lib/intelligence/scoring/health";

export type TransitionLabel = "IMPROVED" | "STABLE" | "DEGRADED";

export type DimensionTransition = {
  dimension: keyof PlatformDimensionSnapshot;
  from: number;
  to: number;
  label: TransitionLabel;
  delta: number;
};

export type PlatformStateTransition = {
  fromCycleId: string | null;
  toCycleId: string;
  overall: TransitionLabel;
  dimensions: DimensionTransition[];
  evidence: string[];
};

export function captureDimensionSnapshot(
  state: PlatformState
): PlatformDimensionSnapshot {
  const health = calculatePlatformHealth(state);
  const trust =
    state.pendingRealOrders > 0 || state.openSupport > 0
      ? Math.max(
          0,
          100 - state.pendingRealOrders * 5 - state.openSupport * 8
        )
      : 90;
  return {
    OPERATIONS: health.dimensions.operations,
    ACTIVATION: health.dimensions.activation,
    REVENUE: health.dimensions.revenue,
    SUPPORT: health.dimensions.support,
    TECHNICAL: health.dimensions.technical,
    TRUST: trust,
  };
}

function labelDelta(delta: number): TransitionLabel {
  if (delta >= 3) return "IMPROVED";
  if (delta <= -3) return "DEGRADED";
  return "STABLE";
}

export function comparePlatformStates(
  previous: IntelligenceObservation | null,
  current: {
    cycleId: string;
    dimensions: PlatformDimensionSnapshot;
  }
): PlatformStateTransition {
  if (!previous) {
    return {
      fromCycleId: null,
      toCycleId: current.cycleId,
      overall: "STABLE",
      dimensions: (
        Object.keys(current.dimensions) as (keyof PlatformDimensionSnapshot)[]
      ).map((d) => ({
        dimension: d,
        from: current.dimensions[d],
        to: current.dimensions[d],
        label: "STABLE" as const,
        delta: 0,
      })),
      evidence: ["No prior observation — baseline established."],
    };
  }

  const dimensions: DimensionTransition[] = (
    Object.keys(current.dimensions) as (keyof PlatformDimensionSnapshot)[]
  ).map((d) => {
    const from = previous.dimensions[d];
    const to = current.dimensions[d];
    const delta = to - from;
    return { dimension: d, from, to, label: labelDelta(delta), delta };
  });

  const improved = dimensions.filter((d) => d.label === "IMPROVED").length;
  const degraded = dimensions.filter((d) => d.label === "DEGRADED").length;
  const overall: TransitionLabel =
    degraded > improved ? "DEGRADED" : improved > degraded ? "IMPROVED" : "STABLE";

  return {
    fromCycleId: previous.cycleId,
    toCycleId: current.cycleId,
    overall,
    dimensions,
    evidence: dimensions
      .filter((d) => d.label !== "STABLE")
      .map((d) => `${d.dimension}: ${d.from}→${d.to} (${d.label})`),
  };
}
