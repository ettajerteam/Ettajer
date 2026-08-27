/**
 * Counterfactual API — OBSERVED vs COUNTERFACTUAL (never presented as facts).
 */
import type { PlatformState } from "@/lib/intelligence/engine-types";
import type { IntelligenceMemory } from "@/lib/intelligence/memory/types";
import { emptyIntelligenceMemory } from "@/lib/intelligence/memory/types";
import { buildPlatformDigitalTwin } from "@/lib/intelligence/twin/build";
import {
  simulateIntervention,
  simulateNoAction,
} from "@/lib/intelligence/scenarios/simulate";
import { assumptionsForScenario } from "@/lib/intelligence/assumptions/registry";
import { getScenarioDefinition } from "@/lib/intelligence/scenarios/registry";

export type CounterfactualResult = {
  kind: "COUNTERFACTUAL";
  statement: string;
  baseline: {
    label: "OBSERVED_REALITY";
    metrics: Record<string, number>;
  };
  counterfactual: {
    label: "COUNTERFACTUAL";
    metrics: Record<string, { expectedAfter: [number, number] }>;
  };
  delta: string[];
  assumptions: string[];
  confidence: number;
  uncertainty: string;
  evidence: string[];
  affectedDimensions: string[];
  evidenceStrength: "STRONG" | "MODERATE" | "WEAK" | "INSUFFICIENT";
};

export function simulateCounterfactual(input: {
  state: PlatformState;
  scenarioId: string;
  memory?: IntelligenceMemory;
}): CounterfactualResult {
  const memory = input.memory ?? emptyIntelligenceMemory();
  const twin = buildPlatformDigitalTwin({
    state: input.state,
    sourceSnapshotId: `cf-${input.state.now.getTime()}`,
  });
  const def = getScenarioDefinition(input.scenarioId);
  const assumptions = assumptionsForScenario(
    input.scenarioId === "COD_VERIFICATION"
      ? "COD_VERIFICATION_CLEARANCE"
      : input.scenarioId
  );

  const hist = memory.rulePerformance.find(
    (p) =>
      p.type === def?.interventionType ||
      p.type === input.scenarioId
  );
  let evidenceStrength: CounterfactualResult["evidenceStrength"] =
    "INSUFFICIENT";
  if (hist?.successRate != null && hist.attempts >= 10 && hist.successRate >= 0.7) {
    evidenceStrength = "STRONG";
  } else if (hist?.successRate != null && hist.attempts >= 3) {
    evidenceStrength = "MODERATE";
  } else if (hist?.successRate != null) {
    evidenceStrength = "WEAK";
  }

  if (evidenceStrength === "INSUFFICIENT" && !def) {
    return {
      kind: "COUNTERFACTUAL",
      statement: `INSUFFICIENT EVIDENCE for counterfactual ${input.scenarioId}.`,
      baseline: {
        label: "OBSERVED_REALITY",
        metrics: { pendingCOD: twin.metrics.pendingCOD },
      },
      counterfactual: { label: "COUNTERFACTUAL", metrics: {} },
      delta: [],
      assumptions: assumptions.map((a) => a.description),
      confidence: 0,
      uncertainty: "No comparable historical outcomes in memory.",
      evidence: ["INSUFFICIENT EVIDENCE"],
      affectedDimensions: [],
      evidenceStrength,
    };
  }

  const intervention =
    def?.interventionType ??
    (input.scenarioId.includes("COD")
      ? "COD_VERIFICATION"
      : input.scenarioId.includes("DNS")
        ? "DNS_DIAGNOSIS"
        : "FIRST_SALE_ASSIST");

  const baseline = simulateNoAction(twin, {
    pendingCOD: twin.metrics.pendingCOD > 0 ? 1 : 0,
    support: 0,
    dns: 0,
  });
  const cf = simulateIntervention({
    twin,
    type: intervention,
    performance: memory.rulePerformance,
  });

  const delta: string[] = [];
  for (const [k, v] of Object.entries(cf.metrics)) {
    delta.push(
      `${k}: observed=${v.before} vs counterfactualExpected=[${v.expectedAfter[0]}, ${v.expectedAfter[1]}] (SIMULATED range)`
    );
  }

  const confidence =
    evidenceStrength === "INSUFFICIENT"
      ? Math.min(0.5, cf.confidence)
      : cf.confidence;

  return {
    kind: "COUNTERFACTUAL",
    statement: `COUNTERFACTUAL: if ${def?.name ?? intervention} had been applied, metrics may have followed the simulated historical deterministic range — not observed fact.`,
    baseline: {
      label: "OBSERVED_REALITY",
      metrics: Object.fromEntries(
        Object.entries(cf.metrics).map(([k, v]) => [k, v.before])
      ),
    },
    counterfactual: {
      label: "COUNTERFACTUAL",
      metrics: Object.fromEntries(
        Object.entries(cf.metrics).map(([k, v]) => [
          k,
          { expectedAfter: v.expectedAfter },
        ])
      ),
    },
    delta,
    assumptions: [
      ...assumptions.map((a) => `${a.id}: ${a.description}`),
      ...cf.assumptions,
      "This result is COUNTERFACTUAL / SIMULATED — not observed reality.",
    ],
    confidence,
    uncertainty:
      evidenceStrength === "INSUFFICIENT"
        ? "Wide uncertainty — using configured bands only."
        : `Evidence strength ${evidenceStrength}; treat as bounded range.`,
    evidence: [...cf.evidence, `baselineKind=${baseline.kind}`],
    affectedDimensions: def?.affectedDimensions ?? ["operations"],
    evidenceStrength,
  };
}
