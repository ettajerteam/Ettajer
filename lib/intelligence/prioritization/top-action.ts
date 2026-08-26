import type {
  IntelligenceSignal,
  PrioritizedItem,
  RecommendedAction,
} from "@/lib/intelligence/engine-types";
import { calculatePriority } from "@/lib/intelligence/scoring/priority";

export type TopAction = {
  action: RecommendedAction;
  priorityScore: number;
  rank: number;
  whyThisFirst: string;
  calculation: string;
  relatedSignalId?: string;
};

function reversibility(signal: IntelligenceSignal): number {
  // Higher = more reversible / recoverable if we act now
  switch (signal.category) {
    case "orders":
      return 0.95;
    case "support":
      return 0.9;
    case "technical":
      return 0.75;
    case "operations":
      return 0.8;
    case "activation":
      return 0.55;
    case "revenue":
      return 0.4;
    case "merchant":
      return 0.5;
    default:
      return 0.5;
  }
}

function actionability(signal: IntelligenceSignal): number {
  // Clear nav CTA with finite queue = high actionability
  if (signal.href && signal.cta) {
    if (signal.category === "orders" || signal.category === "support") return 1;
    if (signal.category === "technical") return 0.9;
    if (signal.category === "activation") return 0.7;
    return 0.65;
  }
  return 0.4;
}

/**
 * Extended priority: impact × urgency × confidence × reversibility × actionability
 */
export function calculateExtendedPriority(signal: IntelligenceSignal): {
  item: PrioritizedItem;
  reversibility: number;
  actionability: number;
  extendedScore: number;
  calculation: string;
} {
  const base = calculatePriority(signal);
  const rev = reversibility(signal);
  const act = actionability(signal);
  const extendedScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(base.priorityScore * rev * act * 1.05)
    )
  );
  const calculation = `${base.calculation}; reversibility=${rev}; actionability=${act}; extended=${extendedScore}`;
  return {
    item: { ...base, priorityScore: extendedScore, calculation },
    reversibility: rev,
    actionability: act,
    extendedScore,
    calculation,
  };
}

export function rankTopActions(
  signals: IntelligenceSignal[],
  actions: RecommendedAction[]
): TopAction[] {
  const scored = signals
    .filter((s) => s.severity !== "positive")
    .map((s) => {
      const ext = calculateExtendedPriority(s);
      const action =
        actions.find((a) => a.relatedSignalIds?.includes(s.id)) ||
        actions.find((a) => a.href === s.href);
      return { signal: s, ext, action };
    })
    .filter((x) => x.action)
    .sort((a, b) => b.ext.extendedScore - a.ext.extendedScore);

  // Dedupe by action id
  const seen = new Set<string>();
  const ranked: TopAction[] = [];
  for (const row of scored) {
    const action = row.action!;
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    ranked.push({
      action,
      priorityScore: row.ext.extendedScore,
      rank: ranked.length + 1,
      whyThisFirst:
        ranked.length === 0
          ? whyFirst(row.signal, row.ext.extendedScore, row.ext.reversibility, row.ext.actionability)
          : `Next: ${row.signal.title} (extended score ${row.ext.extendedScore}).`,
      calculation: row.ext.calculation,
      relatedSignalId: row.signal.id,
    });
    if (ranked.length >= 5) break;
  }

  // Ensure actions without signals still appear at end
  for (const a of actions) {
    if (seen.has(a.id)) continue;
    ranked.push({
      action: a,
      priorityScore: a.urgency === "critical" ? 60 : a.urgency === "high" ? 45 : 25,
      rank: ranked.length + 1,
      whyThisFirst: `Supporting action: ${a.label}`,
      calculation: `urgency=${a.urgency}`,
    });
    if (ranked.length >= 6) break;
  }

  return ranked;
}

function whyFirst(
  signal: IntelligenceSignal,
  score: number,
  rev: number,
  act: number
): string {
  return (
    `This is first because it combines high operational impact with immediate actionability ` +
    `(extended score ${score}; reversibility ${rev}; actionability ${act}): ${signal.title}. ` +
    `Acting now reduces customer/merchant trust risk faster than longer-horizon activation work.`
  );
}

export function getTopAction(
  signals: IntelligenceSignal[],
  actions: RecommendedAction[]
): TopAction | null {
  const ranked = rankTopActions(signals, actions);
  const top = ranked[0];
  if (!top) return null;
  // Don't elevate generic supporting actions when no problem signals exist
  if (
    top.action.urgency === "normal" &&
    !signals.some((s) => s.severity !== "positive")
  ) {
    return null;
  }
  return top;
}
