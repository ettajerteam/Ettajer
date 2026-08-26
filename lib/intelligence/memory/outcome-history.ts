/**
 * Outcome memory + compareOutcome — measured history only, never invented.
 */
import { MEMORY_THRESHOLDS as T } from "@/lib/intelligence/memory/config";
import type {
  CompareOutcomeResult,
  DecisionOutcomeStatus,
  OutcomeMemoryRecord,
  PredictionAccuracyClass,
  EvidenceStrength,
} from "@/lib/intelligence/memory/v7-types";

export function emptyOutcomeHistory(): OutcomeMemoryRecord[] {
  return [];
}

/**
 * Compare predicted expectedAfter ranges vs observed values.
 * Does not invent observations — caller must supply measured observed.
 */
export function compareOutcome(input: {
  predicted: Record<string, number | [number, number]>;
  observed: Record<string, number>;
  sufficientData: boolean;
}): CompareOutcomeResult {
  if (!input.sufficientData) {
    return {
      status: "NOT_MEASURED",
      accuracy: "NOT_MEASURED",
      evidenceStrength: "INSUFFICIENT",
      deviations: [],
      explanation: "INSUFFICIENT EVIDENCE — observation not measured.",
    };
  }

  const keys = Object.keys(input.predicted).filter((k) => k in input.observed);
  if (keys.length === 0) {
    return {
      status: "UNKNOWN",
      accuracy: "NOT_MEASURED",
      evidenceStrength: "INSUFFICIENT",
      deviations: ["No overlapping predicted/observed metrics."],
      explanation: "Cannot compare — missing observed metrics for predictions.",
    };
  }

  const deviations: string[] = [];
  let accurate = 0;
  let acceptable = 0;
  let drift = 0;
  let miss = 0;

  for (const k of keys) {
    const pred = input.predicted[k]!;
    const obs = input.observed[k]!;
    const cls = classifyMetricAccuracy(pred, obs);
    if (cls === "ACCURATE") accurate++;
    else if (cls === "ACCEPTABLE") acceptable++;
    else if (cls === "DRIFT") {
      drift++;
      deviations.push(`${k}: DRIFT observed=${obs} vs predicted=${fmtPred(pred)}`);
    } else {
      miss++;
      deviations.push(`${k}: MISS observed=${obs} vs predicted=${fmtPred(pred)}`);
    }
  }

  const accuracy = aggregateAccuracy(accurate, acceptable, drift, miss, keys.length);
  const status = statusFromAccuracy(accuracy, miss, keys.length);
  const evidenceStrength: EvidenceStrength =
    keys.length >= 2 ? "MODERATE" : "WEAK";

  return {
    status,
    accuracy,
    evidenceStrength,
    deviations,
    explanation: `Prediction vs observed: ${accuracy} (${accurate} accurate, ${acceptable} acceptable, ${drift} drift, ${miss} miss).`,
  };
}

export function classifyMetricAccuracy(
  predicted: number | [number, number],
  observed: number
): PredictionAccuracyClass {
  if (Array.isArray(predicted)) {
    const [lo, hi] = predicted[0] <= predicted[1] ? predicted : [predicted[1], predicted[0]];
    if (observed >= lo && observed <= hi) return "ACCURATE";
    const span = Math.max(1, hi - lo);
    const dist = observed < lo ? lo - observed : observed - hi;
    if (dist <= span * 0.5) return "ACCEPTABLE";
    if (dist <= span * 1.5) return "DRIFT";
    return "MISS";
  }
  const err = Math.abs(observed - predicted);
  const tol = Math.max(1, Math.abs(predicted) * 0.15);
  if (err === 0) return "ACCURATE";
  if (err <= tol) return "ACCEPTABLE";
  if (err <= tol * 2) return "DRIFT";
  return "MISS";
}

function aggregateAccuracy(
  accurate: number,
  acceptable: number,
  drift: number,
  miss: number,
  n: number
): PredictionAccuracyClass {
  if (miss / n >= 0.5) return "MISS";
  if ((accurate + acceptable) / n >= 0.9) return "ACCURATE";
  if ((accurate + acceptable) / n >= 0.6) return "ACCEPTABLE";
  if (drift > 0) return "DRIFT";
  return "MISS";
}

function statusFromAccuracy(
  accuracy: PredictionAccuracyClass,
  miss: number,
  n: number
): DecisionOutcomeStatus {
  if (accuracy === "ACCURATE") return "SUCCESS";
  if (accuracy === "ACCEPTABLE") return "PARTIAL";
  if (accuracy === "DRIFT") return "PARTIAL";
  if (miss >= n) return "FAILED";
  return "FAILED";
}

function fmtPred(p: number | [number, number]): string {
  return Array.isArray(p) ? `[${p[0]},${p[1]}]` : String(p);
}

export function outcomesOfType(
  records: OutcomeMemoryRecord[],
  decisionType: string
): OutcomeMemoryRecord[] {
  return records.filter((r) => r.decisionType === decisionType);
}

/** Round confidence to 2 decimals — no fake precision. */
export function roundConfidence(n: number): number {
  return Math.round(Math.max(T.minConfidence, Math.min(T.maxConfidence, n)) * 100) / 100;
}
