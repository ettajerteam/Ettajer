/**
 * Predicted vs observed scenario outcome feedback (no ML).
 */
export type ScenarioOutcomeRecord = {
  scenarioId: string;
  predicted: Record<string, number | [number, number]>;
  observed: Record<string, number>;
  result: "SUCCESS" | "PARTIAL" | "FAILURE" | "INCONCLUSIVE";
  predictionError: Record<string, number>;
  note: string;
  kind: "SCENARIO_OUTCOME";
};

export function comparePredictedVsObserved(input: {
  scenarioId: string;
  /** Central or range prediction */
  predicted: Record<string, number | [number, number]>;
  observed: Record<string, number>;
  sufficientData: boolean;
}): ScenarioOutcomeRecord {
  if (!input.sufficientData) {
    return {
      scenarioId: input.scenarioId,
      predicted: input.predicted,
      observed: input.observed,
      result: "INCONCLUSIVE",
      predictionError: {},
      note: "INSUFFICIENT EVIDENCE to score scenario outcome.",
      kind: "SCENARIO_OUTCOME",
    };
  }

  const predictionError: Record<string, number> = {};
  let hits = 0;
  let checks = 0;
  for (const [k, pred] of Object.entries(input.predicted)) {
    if (!(k in input.observed)) continue;
    checks++;
    const obs = input.observed[k]!;
    if (Array.isArray(pred)) {
      const [lo, hi] = pred;
      const err =
        obs < lo ? lo - obs : obs > hi ? obs - hi : 0;
      predictionError[k] = err;
      if (err === 0) hits++;
      else if (err <= Math.max(1, (hi - lo) / 2)) hits += 0.5;
    } else {
      const err = Math.abs(obs - pred);
      predictionError[k] = err;
      if (err === 0) hits++;
      else if (err <= Math.max(1, Math.abs(pred) * 0.25)) hits += 0.5;
    }
  }

  let result: ScenarioOutcomeRecord["result"] = "INCONCLUSIVE";
  if (checks === 0) result = "INCONCLUSIVE";
  else if (hits / checks >= 0.9) result = "SUCCESS";
  else if (hits / checks >= 0.4) result = "PARTIAL";
  else result = "FAILURE";

  return {
    scenarioId: input.scenarioId,
    predicted: input.predicted,
    observed: input.observed,
    result,
    predictionError,
    note: `Scenario outcome ${result} — prediction vs observed (deterministic calibration, not ML).`,
    kind: "SCENARIO_OUTCOME",
  };
}
