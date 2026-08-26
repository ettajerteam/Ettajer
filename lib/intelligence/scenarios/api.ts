/**
 * Public what-if API — pure deterministic simulation from twin + intervention.
 * AUTO_EXECUTE is never performed here.
 */
import { emptyIntelligenceMemory } from "@/lib/intelligence/memory/types";
import type { IntelligenceMemory } from "@/lib/intelligence/memory/types";
import type { PlatformState } from "@/lib/intelligence/engine-types";
import { buildPlatformDigitalTwin } from "@/lib/intelligence/twin/build";
import {
  generateScenarios,
  simulateIntervention,
  simulateNoAction,
  type ScenarioOutcome,
} from "@/lib/intelligence/scenarios/simulate";
import { calculateInterventionAdvantage } from "@/lib/intelligence/scenarios/rank";
import { toPlatformState, emptyPlatformState } from "@/lib/intelligence/platform-state";

export type SimulateScenarioInput = {
  intervention: string;
  state?: PlatformState;
  memory?: IntelligenceMemory;
  sourceSnapshotId?: string;
};

export type SimulateScenarioResult = {
  simulationId: string;
  snapshotId: string;
  createdAt: Date;
  rulesUsed: string[];
  evidenceUsed: string[];
  assumptions: string[];
  baseline: ScenarioOutcome;
  scenario: ScenarioOutcome;
  expectedState: Record<string, { before: number; expectedAfter: [number, number] }>;
  deltas: Record<string, string>;
  confidence: number;
  evidence: string[];
  risks: string[];
  dependencies: string[];
  advantage: ReturnType<typeof calculateInterventionAdvantage>;
  autoExecute: false;
};

export function simulateDrSaraScenario(
  input: SimulateScenarioInput
): SimulateScenarioResult {
  const state = input.state ?? emptyPlatformState(new Date("2026-08-26T12:00:00Z"));
  const memory = input.memory ?? emptyIntelligenceMemory();
  const snapshotId = input.sourceSnapshotId ?? `sim-${state.now.getTime()}`;
  const twin = buildPlatformDigitalTwin({
    state,
    sourceSnapshotId: snapshotId,
  });
  const baseline = simulateNoAction(twin, {
    pendingCOD: state.ordersChange7d < 0 ? 1 : state.pendingRealOrders > 0 ? 1 : 0,
    support: 0,
    dns: 0,
  });
  const blocked: string[] = [];
  if (
    (input.intervention === "ACTIVATION_OUTREACH" ||
      input.intervention === "FIRST_SALE_ASSIST") &&
    state.domainFailing > 0
  ) {
    blocked.push("DOMAIN_FAILURE prerequisite");
  }
  const scenario = simulateIntervention({
    twin,
    type: input.intervention,
    performance: memory.rulePerformance,
    blockedFactors: blocked,
  });
  const advantage = calculateInterventionAdvantage(scenario, baseline);
  const expectedState: SimulateScenarioResult["expectedState"] = {};
  const deltas: Record<string, string> = {};
  for (const [k, v] of Object.entries(scenario.metrics)) {
    expectedState[k] = { before: v.before, expectedAfter: v.expectedAfter };
    deltas[k] = `${v.before} → [${v.expectedAfter[0]}, ${v.expectedAfter[1]}] (${v.direction})`;
  }

  return {
    simulationId: `simulation-${snapshotId}-${input.intervention}`,
    snapshotId,
    createdAt: state.now,
    rulesUsed: ["SCENARIO_SIM_V5", input.intervention],
    evidenceUsed: scenario.evidence,
    assumptions: scenario.assumptions,
    baseline,
    scenario,
    expectedState,
    deltas,
    confidence: scenario.confidence,
    evidence: scenario.evidence,
    risks: twin.riskState,
    dependencies: blocked,
    advantage,
    autoExecute: false,
  };
}

/** Helper for tests / smoke using empty base + partial overrides */
export function simulateFromPartial(
  intervention: string,
  partial: Partial<PlatformState> = {}
): SimulateScenarioResult {
  const base = emptyPlatformState(new Date("2026-08-26T12:00:00Z"));
  const state = {
    ...base,
    ...partial,
    funnel: { ...base.funnel, ...partial.funnel },
    firstSaleBottlenecks: {
      ...base.firstSaleBottlenecks,
      ...partial.firstSaleBottlenecks,
    },
  };
  return simulateDrSaraScenario({ intervention, state });
}

export { generateScenarios, toPlatformState };
