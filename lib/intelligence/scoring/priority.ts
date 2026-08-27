import type {
  IntelligenceSignal,
  IntelligenceSeverity,
  PriorityBand,
  PrioritizedItem,
} from "@/lib/intelligence/engine-types";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function severityImpact(severity: IntelligenceSeverity): number {
  switch (severity) {
    case "critical":
      return 1;
    case "high":
      return 0.85;
    case "medium":
      return 0.55;
    case "low":
      return 0.35;
    case "positive":
      return 0.2;
  }
}

function categoryUrgency(category: IntelligenceSignal["category"]): number {
  switch (category) {
    case "orders":
      return 1;
    case "support":
      return 0.9;
    case "technical":
      return 0.85;
    case "operations":
      return 0.8;
    case "activation":
      return 0.55;
    case "merchant":
      return 0.5;
    case "revenue":
      return 0.45;
  }
}

/**
 * priorityScore = impact × urgency × confidence, normalized 0–100.
 * Explainable and deterministic.
 */
export function calculatePriority(signal: IntelligenceSignal): PrioritizedItem {
  const affected = signal.affectedCount ?? signal.value ?? 1;
  const affectedFactor = clamp(20 + Math.log10(Math.max(1, affected) + 1) * 35);
  const financialFactor =
    signal.financialImpact && signal.financialImpact > 0
      ? clamp(10 + Math.log10(signal.financialImpact + 1) * 15)
      : 0;

  const impactScore = clamp(
    severityImpact(signal.severity) * 70 +
      affectedFactor * 0.25 +
      financialFactor * 0.2
  );
  const urgencyScore = clamp(categoryUrgency(signal.category) * 100);
  const confidenceScore = clamp((signal.confidence ?? 1) * 100);

  // Geometric blend keeps all three dimensions meaningful
  const raw =
    (impactScore / 100) * (urgencyScore / 100) * (confidenceScore / 100) * 100;
  // Scale so typical high ops land ~70–95
  const priorityScore = clamp(Math.round(raw * 1.15 + impactScore * 0.15));

  const band: PriorityBand =
    priorityScore >= 90
      ? "critical"
      : priorityScore >= 70
        ? "high"
        : priorityScore >= 40
          ? "medium"
          : "low";

  const calculation = [
    `impact=${impactScore.toFixed(1)} (severity=${signal.severity}, affected=${affected}, financial=${signal.financialImpact ?? 0})`,
    `urgency=${urgencyScore.toFixed(1)} (category=${signal.category})`,
    `confidence=${confidenceScore.toFixed(1)}`,
    `priority = clamp(round(impact/100 × urgency/100 × confidence/100 × 100 × 1.15 + impact×0.15)) = ${priorityScore}`,
  ].join("; ");

  return {
    id: `prio-${signal.id}`,
    signalId: signal.id,
    priorityScore,
    band,
    impactScore: Math.round(impactScore),
    urgencyScore: Math.round(urgencyScore),
    confidenceScore: Math.round(confidenceScore),
    calculation,
    title: signal.title,
    summary: signal.summary,
    severity: signal.severity,
    affectedCount: signal.affectedCount ?? 0,
    href: signal.href ?? "/admin",
    cta: signal.cta ?? "Open",
    evidence: signal.evidence,
    ruleId: signal.ruleId,
  };
}

export function prioritizeSignals(
  signals: IntelligenceSignal[],
  limit = 5
): PrioritizedItem[] {
  return signals
    .filter((s) => s.severity !== "positive")
    .map(calculatePriority)
    .sort(
      (a, b) =>
        b.priorityScore - a.priorityScore ||
        b.affectedCount - a.affectedCount
    )
    .slice(0, limit);
}

export function countCriticalPriorities(items: PrioritizedItem[]): number {
  return items.filter(
    (i) => i.band === "critical" || i.band === "high" || i.severity === "critical" || i.severity === "high"
  ).length;
}
