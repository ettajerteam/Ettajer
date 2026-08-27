/**
 * Temporal metric comparison — deterministic, no ML.
 */

export type TrendDirection = "up" | "down" | "flat";

export type TemporalMetric = {
  id: string;
  label: string;
  current: number;
  previous: number;
  delta: number;
  deltaPct: number;
  direction: TrendDirection;
  velocity: number;
  acceleration: "strong" | "moderate" | "weak" | "none" | "negative";
  confidence: number;
  timeWindow: string;
  anomaly: boolean;
  structuralChange: boolean;
  basis: string;
};

export function comparePeriods(
  current: number,
  previous: number,
  opts?: { timeWindow?: string; label?: string; id?: string }
): TemporalMetric {
  const prev = Number.isFinite(previous) ? previous : 0;
  const curr = Number.isFinite(current) ? current : 0;
  const delta = curr - prev;
  const deltaPct =
    prev === 0 ? (curr > 0 ? 100 : 0) : Math.round((delta / Math.abs(prev)) * 1000) / 10;
  const direction: TrendDirection =
    Math.abs(deltaPct) < 5 ? "flat" : deltaPct > 0 ? "up" : "down";
  const velocity = deltaPct;
  const acceleration = detectAcceleration(deltaPct);
  const anomaly = detectAnomaly(curr, prev);
  const structuralChange = detectStructuralChange(deltaPct, prev, curr);

  return {
    id: opts?.id ?? "metric",
    label: opts?.label ?? "Metric",
    current: curr,
    previous: prev,
    delta,
    deltaPct,
    direction,
    velocity,
    acceleration,
    confidence: confidenceFor(prev, curr, anomaly),
    timeWindow: opts?.timeWindow ?? "7d vs prior 7d",
    anomaly,
    structuralChange,
    basis: `current=${curr}; previous=${prev}; deltaPct=${deltaPct}%`,
  };
}

export function detectTrend(deltaPct: number): TrendDirection {
  if (Math.abs(deltaPct) < 5) return "flat";
  return deltaPct > 0 ? "up" : "down";
}

export function detectAcceleration(
  deltaPct: number
): TemporalMetric["acceleration"] {
  if (deltaPct >= 100) return "strong";
  if (deltaPct >= 20) return "moderate";
  if (deltaPct > 5) return "weak";
  if (deltaPct < -20) return "negative";
  return "none";
}

export function detectRegression(deltaPct: number): boolean {
  return deltaPct <= -20;
}

/** Simple anomaly: current >> previous from near-zero or order-of-magnitude jump */
export function detectAnomaly(current: number, previous: number): boolean {
  if (previous <= 0 && current > 0) return current > previous * 10 || current > 1000;
  if (previous > 0 && current / previous >= 10) return true;
  if (previous > 0 && current / previous <= 0.1 && current < previous) return true;
  return false;
}

export function detectStructuralChange(
  deltaPct: number,
  previous: number,
  current: number
): boolean {
  return Math.abs(deltaPct) >= 100 || (previous > 0 && Math.abs(current - previous) / previous >= 2);
}

function confidenceFor(previous: number, current: number, anomaly: boolean): number {
  if (previous <= 0 && current <= 0) return 0.4;
  if (previous <= 0) return 0.55;
  if (anomaly) return 0.7;
  return 0.9;
}

/** Derive previous from current + pct change (overview pattern). */
export function previousFromChange(current: number, changePct: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(changePct)) return 0;
  if (changePct === -100) return current > 0 ? current * 2 : 0;
  const denom = 1 + changePct / 100;
  if (Math.abs(denom) < 0.001) return 0;
  return Math.max(0, current / denom);
}

export function analyzeSparkline(values: number[]): {
  recentAvg: number;
  baselineAvg: number;
  direction: TrendDirection;
  velocity: number;
} {
  const nums = values.filter((v) => Number.isFinite(v));
  if (nums.length === 0) {
    return { recentAvg: 0, baselineAvg: 0, direction: "flat", velocity: 0 };
  }
  const mid = Math.floor(nums.length / 2);
  const baseline = nums.slice(0, mid);
  const recent = nums.slice(mid);
  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const baselineAvg = avg(baseline);
  const recentAvg = avg(recent);
  const velocity =
    baselineAvg === 0
      ? recentAvg > 0
        ? 100
        : 0
      : ((recentAvg - baselineAvg) / Math.abs(baselineAvg)) * 100;
  return {
    recentAvg,
    baselineAvg,
    direction: detectTrend(velocity),
    velocity: Math.round(velocity * 10) / 10,
  };
}
