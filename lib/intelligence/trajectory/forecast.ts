/**
 * Deterministic state trajectory + early-warning / recovery simulation.
 */
import { INTELLIGENCE_SCORING_CONFIG as C } from "@/lib/intelligence/config/scoring";
import type { PlatformDigitalTwin } from "@/lib/intelligence/twin/types";

export type TrajectoryPoint = {
  horizonHours: number;
  label: string;
  range: [number, number];
};

export type DimensionTrajectory = {
  dimension: string;
  now: number;
  points: TrajectoryPoint[];
  method: "deterministic_velocity_extrapolation";
};

export function buildStateTrajectory(input: {
  twin: PlatformDigitalTwin;
  velocity: {
    pendingCOD: number;
    operationsHealth: number;
  };
}): DimensionTrajectory[] {
  const horizons = C.twin.trajectoryHorizonsHours;
  const opsNow = input.twin.health.operationsHealth;
  const codNow = input.twin.metrics.pendingCOD;

  const opsPoints: TrajectoryPoint[] = horizons.map((h) => {
    const days = h / 24;
    const drift = input.velocity.operationsHealth * days;
    const mid = opsNow + drift;
    return {
      horizonHours: h,
      label: h === 24 ? "+24h" : h === 48 ? "+48h" : "+7d",
      range: [
        Math.round(clamp(mid - 4, 0, 100)),
        Math.round(clamp(mid + 4, 0, 100)),
      ],
    };
  });

  const codPoints: TrajectoryPoint[] = horizons.map((h) => {
    const days = h / 24;
    const mid = codNow + input.velocity.pendingCOD * days;
    const spread = Math.max(1, Math.abs(input.velocity.pendingCOD) * days);
    return {
      horizonHours: h,
      label: h === 24 ? "+24h" : h === 48 ? "+48h" : "+7d",
      range: [
        Math.max(0, Math.round(mid - spread)),
        Math.max(0, Math.round(mid + spread)),
      ],
    };
  });

  return [
    {
      dimension: "OPERATIONS",
      now: opsNow,
      points: opsPoints,
      method: "deterministic_velocity_extrapolation",
    },
    {
      dimension: "pendingCOD",
      now: codNow,
      points: codPoints,
      method: "deterministic_velocity_extrapolation",
    },
  ];
}

export function simulateEscalationRisk(input: {
  pendingCOD: number;
  velocityPerDay: number;
}): {
  at24: number;
  at48: number;
  at72: number;
  escalationRisk: boolean;
  note: string;
} {
  const at24 = Math.max(0, Math.round(input.pendingCOD + input.velocityPerDay));
  const at48 = Math.max(0, Math.round(input.pendingCOD + input.velocityPerDay * 2));
  const at72 = Math.max(0, Math.round(input.pendingCOD + input.velocityPerDay * 3));
  const escalationRisk = input.velocityPerDay > 0 && at72 > input.pendingCOD;
  return {
    at24,
    at48,
    at72,
    escalationRisk,
    note: escalationRisk
      ? `ESCALATION_RISK: deterministic extrapolation ${input.pendingCOD}→${at24}→${at48}→${at72}`
      : "No escalation risk under current velocity.",
  };
}

export function simulateRecovery(input: {
  series: number[];
}): {
  onTrack: boolean;
  expectedResolutionSteps: number | null;
  note: string;
} {
  if (input.series.length < 2) {
    return {
      onTrack: false,
      expectedResolutionSteps: null,
      note: "Insufficient series for recovery simulation.",
    };
  }
  const last = input.series[input.series.length - 1]!;
  const prev = input.series[input.series.length - 2]!;
  const velocity = last - prev;
  if (velocity >= 0 || last <= 0) {
    return {
      onTrack: last === 0,
      expectedResolutionSteps: last === 0 ? 0 : null,
      note: last === 0 ? "Already resolved." : "Not in recovery.",
    };
  }
  const steps = Math.ceil(last / Math.abs(velocity));
  return {
    onTrack: true,
    expectedResolutionSteps: steps,
    note: `RECOVERY_ON_TRACK: ~${steps} steps at current recovery velocity.`,
  };
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
