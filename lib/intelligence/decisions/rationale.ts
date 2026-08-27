/**
 * Structured decision rationale — evidence-driven, no free-form AI text.
 */
import type {
  DecisionRationale,
  ScoredDecisionCandidate,
} from "@/lib/intelligence/decisions/types";

export function buildDecisionRationale(input: {
  selected: ScoredDecisionCandidate;
  alternatives: ScoredDecisionCandidate[];
}): DecisionRationale {
  const { selected } = input;
  const whyThis: string[] = [];

  if (selected.affectedCount > 0) {
    whyThis.push(
      `${selected.affectedCount} item(s) currently in scope (${selected.domain}).`
    );
  }
  for (const e of selected.evidence.slice(0, 4)) {
    whyThis.push(e);
  }
  whyThis.push(
    `Urgency=${selected.urgency}; reversibility=${selected.reversibility}; actionability=${selected.actionability}.`
  );
  whyThis.push(`Admin route exists: ${selected.route}.`);
  whyThis.push(
    `Scenario support=${selected.scenarioSupport.strength}` +
      (selected.scenarioSupport.scenarioId
        ? ` (${selected.scenarioSupport.scenarioId})`
        : "") +
      `.`
  );
  if (Object.keys(selected.scenarioSupport.baseline).length > 0) {
    const parts = Object.entries(selected.scenarioSupport.baseline).map(
      ([k, v]) => {
        const after = selected.scenarioSupport.expectedAfter[k];
        return after
          ? `${k}: baseline=${v} → expectedAfter=[${after[0]}, ${after[1]}] (SIMULATED)`
          : `${k}: baseline=${v}`;
      }
    );
    whyThis.push(...parts.slice(0, 3));
  }
  whyThis.push(
    `Decision score=${selected.score}; confidence=${selected.confidence}; mode=RECOMMENDED (no execution).`
  );
  for (const a of selected.scenarioSupport.assumptions.slice(0, 2)) {
    whyThis.push(`Assumption: ${a}`);
  }

  const whyNotAlternatives = input.alternatives
    .filter((a) => a.id !== selected.id)
    .slice(0, 6)
    .map((alt) => {
      const reasons: string[] = [];
      if (alt.blocked) {
        reasons.push(
          `Blocked by constraints: ${alt.constraints
            .filter((c) => c.status === "BLOCK")
            .map((c) => c.constraintId)
            .join(", ")}`
        );
      }
      reasons.push(
        `Score ${alt.score} vs selected ${selected.score} (Δ=${Math.round((selected.score - alt.score) * 100) / 100}).`
      );
      reasons.push(
        `Horizon/timeToImpact=${alt.timeToImpact}; urgency=${alt.urgency}; affected=${alt.affectedCount}.`
      );
      if (alt.scenarioSupport.strength !== "STRONG") {
        reasons.push(`Scenario support=${alt.scenarioSupport.strength}.`);
      }
      if (alt.timeToImpact !== selected.timeToImpact) {
        reasons.push(
          `Different time-to-impact (${alt.timeToImpact} vs ${selected.timeToImpact}).`
        );
      }
      return { actionId: alt.id, title: alt.title, reasons };
    });

  const tradeoffs = [
    ...selected.scenarioSupport.tradeoffs.slice(0, 3),
    `Selected domain=${selected.domain}; competing domains remain observable.`,
  ];

  return {
    whyThis,
    whyNotAlternatives,
    tradeoffs,
    evidenceSummary: selected.evidence.slice(0, 6),
  };
}
