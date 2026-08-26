/**
 * Decision stability + change explanation.
 */
import { INTELLIGENCE_SCORING_CONFIG as C } from "@/lib/intelligence/config/scoring";

export type DecisionMemoryEntry = {
  cycleId: string;
  topAction: string | null;
  topScenario: string | null;
  at: Date;
};

export type DecisionChange = {
  previousTopAction: string | null;
  currentTopAction: string | null;
  previousTopScenario: string | null;
  currentTopScenario: string | null;
  changed: boolean;
  changeReason: string;
  changedEvidence: string[];
  stability: "STABLE" | "CHANGED" | "OSCILLATING";
};

export function assessDecisionStability(input: {
  history: DecisionMemoryEntry[];
  currentTopAction: string | null;
  currentTopScenario: string | null;
  evidence: string[];
}): DecisionChange {
  const prev = input.history[input.history.length - 1] ?? null;
  const previousTopAction = prev?.topAction ?? null;
  const previousTopScenario = prev?.topScenario ?? null;
  const changed =
    previousTopAction != null &&
    previousTopAction !== input.currentTopAction;

  const window = input.history.slice(-C.twin.decisionStabilityWindow);
  const actions = [
    ...window.map((h) => h.topAction),
    input.currentTopAction,
  ].filter(Boolean) as string[];
  const unique = new Set(actions);
  let stability: DecisionChange["stability"] = "STABLE";
  if (changed) stability = "CHANGED";
  if (unique.size >= 3 && actions.length >= 3) stability = "OSCILLATING";

  let changeReason = "No change — decision trajectory is stable.";
  if (changed) {
    changeReason = `TOP_ACTION changed from ${previousTopAction} to ${input.currentTopAction} because ${input.evidence.join(" ") || "new live evidence."}`;
  }
  if (stability === "OSCILLATING") {
    changeReason +=
      " Warning: recent decisions oscillated across multiple actions — prefer stable trajectory unless evidence is strong.";
  }

  return {
    previousTopAction,
    currentTopAction: input.currentTopAction,
    previousTopScenario,
    currentTopScenario: input.currentTopScenario,
    changed: Boolean(changed),
    changeReason,
    changedEvidence: input.evidence,
    stability,
  };
}
