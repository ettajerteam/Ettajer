import type { IntelligenceSignal } from "@/lib/intelligence/engine-types";

/** Confidence helpers — signals already carry confidence; clamp + blend. */
export function normalizeConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function blendConfidence(parts: number[]): number {
  if (parts.length === 0) return 0;
  const sum = parts.reduce((a, b) => a + normalizeConfidence(b), 0);
  return normalizeConfidence(sum / parts.length);
}

export function signalConfidence(signal: IntelligenceSignal): number {
  return normalizeConfidence(signal.confidence);
}
