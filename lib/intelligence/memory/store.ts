/**
 * Pure memory helpers — aggregate rule performance, cooldowns, append records.
 */
import { INTELLIGENCE_SCORING_CONFIG as C } from "@/lib/intelligence/config/scoring";
import type {
  IntelligenceInterventionRecord,
  IntelligenceMemory,
  IntelligenceObservation,
  IntelligenceOutcomeRecord,
  RulePerformance,
} from "@/lib/intelligence/memory/types";
import { emptyIntelligenceMemory } from "@/lib/intelligence/memory/types";

export function appendObservation(
  memory: IntelligenceMemory,
  observation: IntelligenceObservation
): IntelligenceMemory {
  return {
    ...memory,
    observations: [...memory.observations, observation].slice(-50),
    lastCycleId: observation.cycleId,
  };
}

export function appendIntervention(
  memory: IntelligenceMemory,
  record: IntelligenceInterventionRecord
): IntelligenceMemory {
  return {
    ...memory,
    interventions: [...memory.interventions, record].slice(-200),
  };
}

export function appendOutcome(
  memory: IntelligenceMemory,
  outcome: IntelligenceOutcomeRecord
): IntelligenceMemory {
  const next = {
    ...memory,
    outcomes: [...memory.outcomes, outcome].slice(-200),
  };
  return {
    ...next,
    rulePerformance: recomputeRulePerformance(next),
  };
}

export function recomputeRulePerformance(
  memory: IntelligenceMemory
): RulePerformance[] {
  const byType = new Map<string, IntelligenceOutcomeRecord[]>();
  for (const o of memory.outcomes) {
    const int = memory.interventions.find(
      (i) => i.interventionId === o.interventionId
    );
    const key = int?.type ?? o.interventionId;
    const list = byType.get(key) ?? [];
    list.push(o);
    byType.set(key, list);
  }

  return [...byType.entries()].map(([type, list]) => {
    const successes = list.filter((o) => o.classification === "SUCCESS").length;
    const partials = list.filter((o) => o.classification === "PARTIAL").length;
    const failures = list.filter(
      (o) => o.classification === "FAILED" || o.classification === "NO_EFFECT"
    ).length;
    const decided = successes + partials + failures;
    const minN = C.decisionV4.minHistoryForEffectiveness;
    const successRate =
      decided >= minN
        ? (successes + partials * 0.5) / decided
        : null;
    const impacts = list.map((o) => o.impactRealized);
    const historicalImpact =
      impacts.length > 0
        ? impacts.reduce((a, b) => a + b, 0) / impacts.length
        : null;
    const basePriority = 0.8;
    const adaptivePriority =
      successRate == null
        ? basePriority
        : Math.max(
            0.2,
            Math.min(
              1,
              basePriority * 0.7 + successRate * 0.3
            )
          );
    const ruleId =
      memory.interventions.find((i) => i.type === type)?.ruleId ?? type;
    return {
      ruleId,
      type,
      attempts: list.length,
      successes,
      partials,
      failures,
      successRate,
      historicalImpact,
      historicalSpeedHours: null,
      adaptivePriority,
      note:
        successRate == null
          ? "Insufficient historical evidence."
          : `Historically, this intervention succeeded in ${successes} of ${decided} comparable cases (adaptivePriority=${adaptivePriority.toFixed(2)}).`,
    };
  });
}

export function getActiveCooldown(
  memory: IntelligenceMemory,
  type: string,
  now: Date
): { active: boolean; until: Date | null; reason: string } {
  const recent = [...memory.interventions]
    .filter((i) => i.type === type && i.cooldownUntil)
    .sort(
      (a, b) =>
        (b.cooldownUntil?.getTime() ?? 0) - (a.cooldownUntil?.getTime() ?? 0)
    )[0];
  if (!recent?.cooldownUntil) {
    return { active: false, until: null, reason: "No cooldown recorded." };
  }
  if (recent.cooldownUntil.getTime() > now.getTime()) {
    return {
      active: true,
      until: recent.cooldownUntil,
      reason: `Cooldown active until ${recent.cooldownUntil.toISOString()}.`,
    };
  }
  return { active: false, until: recent.cooldownUntil, reason: "Cooldown expired." };
}

export function lastObservation(
  memory: IntelligenceMemory
): IntelligenceObservation | null {
  return memory.observations[memory.observations.length - 1] ?? null;
}

export function mergeMemory(
  base: IntelligenceMemory,
  patch: Partial<IntelligenceMemory>
): IntelligenceMemory {
  return {
    ...emptyIntelligenceMemory(),
    ...base,
    ...patch,
  };
}

/** Convert audit-shaped JSON into memory (deterministic). */
export function memoryFromSerializable(raw: {
  observations?: IntelligenceObservation[];
  interventions?: IntelligenceInterventionRecord[];
  outcomes?: IntelligenceOutcomeRecord[];
  lastCycleId?: string | null;
}): IntelligenceMemory {
  const mem: IntelligenceMemory = {
    observations: (raw.observations ?? []).map((o) => ({
      ...o,
      observedAt: new Date(o.observedAt),
    })),
    interventions: (raw.interventions ?? []).map((i) => ({
      ...i,
      createdAt: new Date(i.createdAt),
      executedAt: i.executedAt ? new Date(i.executedAt) : null,
      measuredAt: i.measuredAt ? new Date(i.measuredAt) : null,
      cooldownUntil: i.cooldownUntil ? new Date(i.cooldownUntil) : null,
    })),
    outcomes: (raw.outcomes ?? []).map((o) => ({
      ...o,
      measuredAt: new Date(o.measuredAt),
    })),
    rulePerformance: [],
    lastCycleId: raw.lastCycleId ?? null,
  };
  mem.rulePerformance = recomputeRulePerformance(mem);
  return mem;
}
