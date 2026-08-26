/**
 * Scenario generation + deterministic simulation (historical ranges, not AI).
 */
import { INTELLIGENCE_SCORING_CONFIG as C } from "@/lib/intelligence/config/scoring";
import type { RulePerformance } from "@/lib/intelligence/memory/types";
import type { PlatformDigitalTwin } from "@/lib/intelligence/twin/types";

export type ScenarioKind =
  | "BASELINE"
  | "NO_ACTION"
  | "INTERVENTION"
  | "ALTERNATIVE_INTERVENTION"
  | "CHAINED_INTERVENTION"
  | "RECOVERY_SCENARIO";

export type MetricRange = {
  before: number;
  expectedAfter: [number, number];
  direction: "up" | "down" | "flat";
};

export type ScenarioOutcome = {
  scenarioId: string;
  kind: ScenarioKind;
  label: string;
  intervention: string | null;
  chain: string[];
  stateBefore: Record<string, number>;
  metrics: Record<string, MetricRange>;
  expectedImpact: number;
  expectedRisk: number;
  timeToEffect: string;
  confidence: number;
  assumptions: string[];
  blockedFactors: string[];
  evidence: string[];
  historicalSupport: string;
  overlappingEffects: string[];
  cascadingEffects: string[];
  whyGenerated: string;
  whyChosen: string | null;
  whyNotChosen: string | null;
  whatWouldChangeDecision: string;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function rangeFromClearance(
  before: number,
  clearance: readonly [number, number]
): [number, number] {
  const hiClear = Math.max(clearance[0], clearance[1]);
  const loClear = Math.min(clearance[0], clearance[1]);
  const afterLo = Math.round(before * (1 - hiClear));
  const afterHi = Math.round(before * (1 - loClear));
  return [Math.max(0, afterLo), Math.max(0, afterHi)];
}

function histNote(
  type: string,
  performance: RulePerformance[]
): { rate: number | null; note: string } {
  const row = performance.find((p) => p.type === type);
  if (!row || row.successRate == null) {
    return {
      rate: null,
      note: "Insufficient historical evidence — using configured deterministic ranges.",
    };
  }
  return {
    rate: row.successRate,
    note: `Historically, ${type} succeeded in ${row.successes} of ${row.attempts} comparable cases.`,
  };
}

function adjustRangeByHistory(
  range: [number, number],
  before: number,
  successRate: number | null
): [number, number] {
  if (successRate == null) return range;
  // Higher success → bias toward lower end of backlog (better clearance)
  const mid = (range[0] + range[1]) / 2;
  const bias = (successRate - 0.5) * (before * 0.1);
  return [
    Math.max(0, Math.round(range[0] - bias)),
    Math.max(0, Math.round(Math.max(range[0], range[1] - bias))),
  ];
}

export function simulateNoAction(
  twin: PlatformDigitalTwin,
  velocity: { pendingCOD: number; support: number; dns: number }
): ScenarioOutcome {
  const before = twin.metrics.pendingCOD;
  const v = velocity.pendingCOD;
  const afterLo = Math.max(0, before + Math.min(0, v));
  const afterHi = Math.max(0, before + Math.max(1, Math.abs(v) || 1));
  const rising = v > 0 || before > 0;
  return {
    scenarioId: "sc-no-action",
    kind: "NO_ACTION",
    label: "NO_ACTION",
    intervention: null,
    chain: [],
    stateBefore: { pendingCOD: before },
    metrics: {
      pendingCOD: {
        before,
        expectedAfter: rising
          ? [before, afterHi]
          : [afterLo, before],
        direction: v > 0 ? "up" : v < 0 ? "down" : before > 0 ? "up" : "flat",
      },
    },
    expectedImpact: rising ? -0.2 : 0,
    expectedRisk: rising ? 0.7 : 0.2,
    timeToEffect: "24–72h",
    confidence: clamp(twin.confidence * 0.85, 0.3, 0.95),
    assumptions: [
      "Velocity extrapolated from recent early-warning / period change (deterministic).",
      "No new operational throughput assumed.",
    ],
    blockedFactors: [],
    evidence: [
      `pendingCOD=${before}`,
      `velocity≈${v}/period`,
      "historical deterministic range",
    ],
    historicalSupport: "Trend extrapolation only — not an AI prediction.",
    overlappingEffects: [],
    cascadingEffects: [],
    whyGenerated: "Required NO_ACTION baseline for every decision cycle.",
    whyChosen: null,
    whyNotChosen: null,
    whatWouldChangeDecision:
      "Sustained recovery velocity would make no-action acceptable.",
  };
}

export function simulateIntervention(input: {
  twin: PlatformDigitalTwin;
  type: string;
  kind?: ScenarioKind;
  chain?: string[];
  performance: RulePerformance[];
  blockedFactors?: string[];
}): ScenarioOutcome {
  const { twin, type } = input;
  const hist = histNote(type, input.performance);
  const assumptions: string[] = [
    "Expected range derived from configured historical clearance bands.",
    "This is a historical deterministic range — not an AI prediction.",
  ];
  const metrics: Record<string, MetricRange> = {};
  let expectedImpact = 0.4;
  let expectedRisk = 0.2;
  const cascading: string[] = [];

  if (type === "COD_VERIFICATION") {
    const before = twin.metrics.pendingCOD;
    let range = rangeFromClearance(before, C.twin.defaultCodClearanceRange);
    range = adjustRangeByHistory(range, before, hist.rate);
    metrics.pendingCOD = {
      before,
      expectedAfter: range,
      direction: "down",
    };
    expectedImpact = before > 0 ? 0.85 : 0.1;
    cascading.push("EXPECTED_OPPORTUNITY: operations trust pressure eases");
  } else if (type === "DNS_DIAGNOSIS" || type === "FIX_DOMAIN") {
    const before = twin.metrics.domainFailures;
    let range = rangeFromClearance(before, C.twin.defaultDnsClearanceRange);
    range = adjustRangeByHistory(range, before, hist.rate);
    metrics.domainFailures = {
      before,
      expectedAfter: range,
      direction: "down",
    };
    expectedImpact = before > 0 ? 0.75 : 0.1;
    cascading.push(
      "EXPECTED_OPPORTUNITY: storefront access may improve after healthy DNS"
    );
    cascading.push(
      "EXPECTED_OPPORTUNITY: first-sale assist becomes unblocked (not guaranteed orders)"
    );
  } else if (type === "SUPPORT_ESCALATION") {
    const before = twin.metrics.supportBacklog;
    let range = rangeFromClearance(before, C.twin.defaultSupportClearanceRange);
    range = adjustRangeByHistory(range, before, hist.rate);
    metrics.supportBacklog = {
      before,
      expectedAfter: range,
      direction: "down",
    };
    expectedImpact = before > 0 ? 0.7 : 0.1;
  } else if (
    type === "FIRST_SALE_ASSIST" ||
    type === "ACTIVATION_OUTREACH" ||
    type === "DOMAIN_SETUP_ASSIST"
  ) {
    metrics.firstSalePool = {
      before: twin.metrics.firstSaleCount,
      expectedAfter: [
        twin.metrics.firstSaleCount,
        twin.metrics.firstSaleCount,
      ],
      direction: "flat",
    };
    expectedImpact = 0.45;
    assumptions.push(
      "Activation interventions improve opportunity — they do not guarantee orders."
    );
    cascading.push("EXPECTED_OPPORTUNITY: merchant engagement may rise");
  } else {
    expectedImpact = 0.35;
    assumptions.push(`Generic intervention model for ${type}.`);
  }

  const blocked = input.blockedFactors ?? [];
  if (blocked.length > 0) {
    expectedImpact *= 0.25;
    expectedRisk += 0.4;
  }

  const confidence = clamp(
    twin.confidence *
      (hist.rate != null ? 0.7 + hist.rate * 0.3 : 0.55) *
      (blocked.length ? 0.5 : 1),
    0.2,
    0.95
  );

  return {
    scenarioId: `sc-${type.toLowerCase()}-${(input.chain ?? []).join("-") || "solo"}`,
    kind: input.kind ?? "INTERVENTION",
    label: type,
    intervention: type,
    chain: input.chain ?? [type],
    stateBefore: Object.fromEntries(
      Object.entries(metrics).map(([k, v]) => [k, v.before])
    ),
    metrics,
    expectedImpact: Math.round(expectedImpact * 1000) / 1000,
    expectedRisk: Math.round(expectedRisk * 1000) / 1000,
    timeToEffect: "24h",
    confidence: Math.round(confidence * 100) / 100,
    assumptions,
    blockedFactors: blocked,
    evidence: [
      ...Object.entries(metrics).map(
        ([k, v]) =>
          `${k}: before=${v.before} expectedAfter=[${v.expectedAfter[0]}, ${v.expectedAfter[1]}]`
      ),
      "historical deterministic range",
    ],
    historicalSupport: hist.note,
    overlappingEffects: [],
    cascadingEffects: cascading,
    whyGenerated: `Generated from live twin metrics for ${type}.`,
    whyChosen: null,
    whyNotChosen: null,
    whatWouldChangeDecision:
      "Stronger historical success or removal of blockedFactors would raise rank.",
  };
}

export function generateScenarios(input: {
  twin: PlatformDigitalTwin;
  candidateInterventions: string[];
  performance: RulePerformance[];
  domainFailing: number;
  recoveringCOD: boolean;
  velocity: { pendingCOD: number; support: number; dns: number };
}): ScenarioOutcome[] {
  const out: ScenarioOutcome[] = [];
  out.push(simulateNoAction(input.twin, input.velocity));

  if (input.recoveringCOD) {
    out.push({
      ...simulateNoAction(input.twin, {
        ...input.velocity,
        pendingCOD: -Math.max(1, Math.abs(input.velocity.pendingCOD) || 2),
      }),
      scenarioId: "sc-recovery",
      kind: "RECOVERY_SCENARIO",
      label: "RECOVERY_ON_TRACK",
      whyGenerated: "COD backlog already recovering — intervention may be unnecessary.",
      expectedImpact: 0.5,
      expectedRisk: 0.1,
      historicalSupport: "Recovery trajectory observed in early-warning series.",
    });
  }

  const unique = [...new Set(input.candidateInterventions)].slice(0, 8);
  for (const type of unique) {
    const blocked: string[] = [];
    if (
      (type === "FIRST_SALE_ASSIST" || type === "ACTIVATION_OUTREACH") &&
      input.domainFailing > 0
    ) {
      blocked.push("DOMAIN_FAILURE prerequisite");
    }
    out.push(
      simulateIntervention({
        twin: input.twin,
        type,
        performance: input.performance,
        blockedFactors: blocked,
      })
    );
  }

  // Chained: FIX_DOMAIN → ACTIVATION when DNS failing
  if (input.domainFailing > 0) {
    const chained = simulateIntervention({
      twin: input.twin,
      type: "FIX_DOMAIN",
      kind: "CHAINED_INTERVENTION",
      chain: ["FIX_DOMAIN", "WAIT_FOR_HEALTHY_DNS", "ACTIVATION_INTERVENTION"],
      performance: input.performance,
    });
    chained.scenarioId = "sc-chain-domain-activation";
    chained.label = "FIX_DOMAIN→ACTIVATE";
    chained.cascadingEffects.push(
      "EXPECTED_OPPORTUNITY: activation after healthy DNS (sequential, not guaranteed sales)"
    );
    out.push(chained);

    // Explicit blocked alternate: activate without fix
    const blockedAlt = simulateIntervention({
      twin: input.twin,
      type: "ACTIVATION_OUTREACH",
      kind: "ALTERNATIVE_INTERVENTION",
      performance: input.performance,
      blockedFactors: ["DOMAIN_FAILURE prerequisite"],
    });
    blockedAlt.scenarioId = "sc-activate-without-domain-fix";
    blockedAlt.whyNotChosen =
      "Domain failure creates a prerequisite dependency — activation without FIX_DOMAIN is blocked.";
    out.push(blockedAlt);
  }

  // Combined COD + support when both present
  if (
    input.twin.metrics.pendingCOD > 0 &&
    input.twin.metrics.supportBacklog > 0
  ) {
    const combo = simulateIntervention({
      twin: input.twin,
      type: "COD_VERIFICATION",
      kind: "CHAINED_INTERVENTION",
      chain: ["COD_VERIFICATION", "SUPPORT_ESCALATION"],
      performance: input.performance,
    });
    combo.scenarioId = "sc-cod-plus-support";
    combo.label = "COD_VERIFICATION+SUPPORT";
    combo.overlappingEffects.push(
      "OVERLAPPING_EFFECT: both affect operational trust — effects not double-counted on pendingCOD"
    );
    // Add support metric without double-counting COD impact
    const supportBefore = input.twin.metrics.supportBacklog;
    combo.metrics.supportBacklog = {
      before: supportBefore,
      expectedAfter: rangeFromClearance(
        supportBefore,
        C.twin.defaultSupportClearanceRange
      ),
      direction: "down",
    };
    combo.expectedImpact = Math.min(0.95, combo.expectedImpact + 0.1);
    out.push(combo);
  }

  return out;
}
