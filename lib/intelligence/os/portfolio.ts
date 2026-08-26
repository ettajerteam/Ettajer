/**
 * Multi-intervention portfolio ranking + scheduling.
 */
import type {
  InterventionPortfolio,
  PortfolioItem,
} from "@/lib/intelligence/os/types";
import { topologicalOrder, dependenciesFor } from "@/lib/intelligence/os/dependencies";
import { detectPortfolioConflicts } from "@/lib/intelligence/os/conflicts";
import { evaluateBudgets } from "@/lib/intelligence/os/budgets";

export type PortfolioCandidate = {
  decisionId: string;
  interventionType: string;
  title: string;
  impact: number;
  urgency: number;
  confidence: number;
  reversibility: number;
  actionability: number;
  risk: string;
  blastRadius: string;
  historicalReliability: string;
  expectedEffect: string;
  approvalRequired: boolean;
  targetCount: number;
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function buildInterventionPortfolio(input: {
  candidates: PortfolioCandidate[];
  openSupport: number;
  priorityDeltas?: { decisionId: string; delta: number }[];
}): InterventionPortfolio {
  const deltaMap = new Map(
    (input.priorityDeltas ?? []).map((d) => [d.decisionId, d.delta])
  );

  const scored: PortfolioItem[] = input.candidates.map((c) => {
    const base =
      clamp01(c.impact) *
      clamp01(c.urgency) *
      clamp01(c.confidence) *
      clamp01(c.reversibility) *
      clamp01(c.actionability) *
      100;
    const adapt = deltaMap.get(c.decisionId) ?? 0;
    const score = Math.round((base + adapt) * 100) / 100;
    const deps = dependenciesFor([c.interventionType]).map(
      (e) => `${e.relation}:${e.from}→${e.to}`
    );
    return {
      rank: 0,
      decisionId: c.decisionId,
      interventionType: c.interventionType,
      title: c.title,
      score,
      impact: c.impact,
      urgency: c.urgency,
      confidence: c.confidence,
      reversibility: c.reversibility,
      actionability: c.actionability,
      risk: c.risk,
      blastRadius: c.blastRadius,
      historicalReliability: c.historicalReliability,
      dependencies: deps,
      conflicts: [],
      expectedEffect: c.expectedEffect,
      approvalRequired: c.approvalRequired,
      deferred: false,
      reasons: [`score=${score}`, `reliability=${c.historicalReliability}`],
    };
  });

  scored.sort(
    (a, b) =>
      b.score - a.score || a.decisionId.localeCompare(b.decisionId)
  );

  const types = scored.map((s) => s.interventionType);
  const conflict = detectPortfolioConflicts({
    interventionTypes: types,
    openSupport: input.openSupport,
  });

  for (const item of scored) {
    item.conflicts = conflict.conflicts
      .filter((c) => c.a === item.interventionType || c.b === item.interventionType)
      .map((c) => c.reason);
    if (conflict.conflicts.some(
      (c) =>
        c.severity === "BLOCK" &&
        (c.a === item.interventionType || c.b === item.interventionType)
    )) {
      item.deferred = true;
      item.reasons.push("Deferred due to BLOCK conflict.");
    }
  }

  const active = scored.filter((s) => !s.deferred);
  const orderedTypes = topologicalOrder(active.map((a) => a.interventionType));
  const byType = new Map(active.map((a) => [a.interventionType, a]));
  const orderedIds: string[] = [];
  const whyOrderedThisWay: string[] = [
    "Order by dependency ENABLES/DEPENDS_ON then residual score.",
  ];

  for (const t of orderedTypes) {
    const item = byType.get(t);
    if (item) orderedIds.push(item.decisionId);
  }
  for (const a of active) {
    if (!orderedIds.includes(a.decisionId)) orderedIds.push(a.decisionId);
  }

  // Prefer ops unblock first when COD present
  if (orderedIds.includes("REVIEW_PENDING_COD")) {
    const rest = orderedIds.filter((id) => id !== "REVIEW_PENDING_COD");
    orderedIds.length = 0;
    orderedIds.push("REVIEW_PENDING_COD", ...rest);
    whyOrderedThisWay.push(
      "Critical operations (COD) prioritized ahead of growth when present."
    );
  }

  const budget = evaluateBudgets({
    plannedRisks: active.map((a) => a.risk),
    plannedBlast: active.map((a) => a.blastRadius),
    plannedContacts: active.reduce(
      (n, a) =>
        n +
        (input.candidates.find((c) => c.decisionId === a.decisionId)
          ?.targetCount ?? 0),
      0
    ),
    plannedExecutions: Math.min(3, active.length),
  });

  if (budget.exceeded) {
    whyOrderedThisWay.push(...budget.reasons);
    // Defer lowest-score items until budget OK
    const ranked = [...active].sort((a, b) => a.score - b.score);
    for (const low of ranked) {
      if (!budget.exceeded) break;
      low.deferred = true;
      low.reasons.push("Deferred — budget exceeded.");
      const still = scored.filter((s) => !s.deferred);
      const re = evaluateBudgets({
        plannedRisks: still.map((a) => a.risk),
        plannedBlast: still.map((a) => a.blastRadius),
        plannedContacts: 0,
        plannedExecutions: still.length,
      });
      if (!re.exceeded) break;
    }
  }

  scored.forEach((s, i) => {
    s.rank = i + 1;
  });

  const maxRisk = maxLevel(scored.map((s) => s.risk));
  const maxBlast = maxLevel(scored.map((s) => s.blastRadius));

  return {
    items: scored,
    orderedIds: orderedIds.filter((id) =>
      scored.some((s) => s.decisionId === id && !s.deferred)
    ),
    combinedRisk: maxRisk,
    combinedBlastRadius: maxBlast,
    resourceUsage: Object.fromEntries(
      budget.budgets.map((b) => [b.budgetId, b.used])
    ),
    expectedCombinedEffect:
      "Combined portfolio targets operational unblock then activation; ranges only — no point forecasts.",
    whyOrderedThisWay,
    conflicts: conflict.conflicts.map((c) => ({
      a: c.a,
      b: c.b,
      reason: c.reason,
    })),
  };
}

function maxLevel(levels: string[]): string {
  const order = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  return levels.reduce(
    (a, b) => (order.indexOf(b) > order.indexOf(a) ? b : a),
    "LOW"
  );
}
