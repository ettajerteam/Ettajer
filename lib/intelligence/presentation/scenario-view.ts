/**
 * Scenario lab presentation — V5/V6/V8 structures.
 */
import type { DrSaraSnapshot } from "@/lib/intelligence/engine-types";
import type { ScenarioLabRow } from "@/lib/intelligence/presentation/experience-model";

export function buildScenarioLabView(snapshot: DrSaraSnapshot): ScenarioLabRow[] {
  const rows: ScenarioLabRow[] = [];
  const td = snapshot.decision?.topDecision;
  const iv = snapshot.intervention;

  if (iv) {
    rows.push({
      scenarioId: iv.type,
      label: iv.objective,
      baseline: iv.measurement.baseline,
      simulated: iv.type,
      expectedRange: iv.measurement.expectedAfter,
      impact: iv.objective,
      risk: iv.overallRisk,
      confidence: td?.confidence ?? 0,
      assumptions: iv.rationale.slice(0, 4),
      uncertainty: td?.uncertainty.level ?? "UNKNOWN",
    });
  }

  for (const s of snapshot.scenarios.slice(0, 4)) {
    if (rows.some((r) => r.scenarioId === s.scenarioId)) continue;
    rows.push({
      scenarioId: s.scenarioId,
      label: s.label,
      baseline: {},
      simulated: s.intervention ?? s.kind,
      expectedRange: {},
      impact: `Expected impact ${s.expectedImpact}`,
      risk: s.blockedFactors.length > 0 ? "ELEVATED" : "MODERATE",
      confidence: s.confidence,
      assumptions: s.blockedFactors.length
        ? s.blockedFactors
        : ["Deterministic twin simulation"],
      uncertainty: s.confidence < 0.5 ? "HIGH" : "MODERATE",
    });
  }

  if (snapshot.topScenario) {
    const ts = snapshot.topScenario;
    if (!rows.some((r) => r.scenarioId === ts.scenarioId)) {
      rows.unshift({
        scenarioId: ts.scenarioId,
        label: ts.label,
        baseline: {},
        simulated: ts.intervention ?? "TOP_SCENARIO",
        expectedRange: {},
        impact: `Score ${ts.score}`,
        risk: "MODERATE",
        confidence: ts.score / 100,
        assumptions: [ts.whyChosen],
        uncertainty: "MODERATE",
      });
    }
  }

  return rows;
}
