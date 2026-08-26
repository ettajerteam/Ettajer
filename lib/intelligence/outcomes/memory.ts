/**
 * Deterministic intervention memory aggregates.
 * Never fabricates — returns insufficient evidence when empty.
 */

export type InterventionMemoryStats = {
  type: string;
  totalAttempts: number;
  successes: number;
  partialSuccesses: number;
  failures: number;
  noEffect: number;
  successRate: number | null;
  medianTimeToOutcomeHours: number | null;
  averageImpact: number | null;
  note: string;
};

export type MemoryRecord = {
  type: string;
  outcome: "SUCCESS" | "PARTIAL_SUCCESS" | "FAILED" | "NO_EFFECT" | "NEGATIVE" | "INCONCLUSIVE";
  impact?: number;
  timeToOutcomeHours?: number;
};

export function aggregateInterventionMemory(
  records: MemoryRecord[]
): InterventionMemoryStats[] {
  const byType = new Map<string, MemoryRecord[]>();
  for (const r of records) {
    const list = byType.get(r.type) ?? [];
    list.push(r);
    byType.set(r.type, list);
  }

  return [...byType.entries()].map(([type, list]) => {
    const successes = list.filter((r) => r.outcome === "SUCCESS").length;
    const partialSuccesses = list.filter(
      (r) => r.outcome === "PARTIAL_SUCCESS"
    ).length;
    const failures = list.filter(
      (r) => r.outcome === "FAILED" || r.outcome === "NEGATIVE"
    ).length;
    const noEffect = list.filter((r) => r.outcome === "NO_EFFECT").length;
    const decided = successes + partialSuccesses + failures + noEffect;
    const successRate =
      decided >= 3 ? (successes + partialSuccesses * 0.5) / decided : null;
    const times = list
      .map((r) => r.timeToOutcomeHours)
      .filter((t): t is number => typeof t === "number")
      .sort((a, b) => a - b);
    const medianTimeToOutcomeHours =
      times.length > 0 ? times[Math.floor(times.length / 2)]! : null;
    const impacts = list
      .map((r) => r.impact)
      .filter((x): x is number => typeof x === "number");
    const averageImpact =
      impacts.length > 0
        ? impacts.reduce((a, b) => a + b, 0) / impacts.length
        : null;

    return {
      type,
      totalAttempts: list.length,
      successes,
      partialSuccesses,
      failures,
      noEffect,
      successRate,
      medianTimeToOutcomeHours,
      averageImpact,
      note:
        successRate == null
          ? "Insufficient historical evidence."
          : `Historically, this intervention succeeded in ${successes} of ${decided} comparable cases.`,
    };
  });
}

/** Default empty memory for live runs until audit-backed history is populated */
export function emptyInterventionMemory(): InterventionMemoryStats[] {
  return [];
}
