/**
 * Provenance-bearing metric wrapper for twin values.
 */
export type ProvenancedValue<T = number> = {
  value: T;
  source: string;
  observedAt: Date;
  confidence: number;
  freshness: "fresh" | "stale" | "unknown";
};

export function prove<T>(
  value: T,
  source: string,
  observedAt: Date,
  confidence: number,
  freshness: ProvenancedValue["freshness"] = "fresh"
): ProvenancedValue<T> {
  return { value, source, observedAt, confidence, freshness };
}
