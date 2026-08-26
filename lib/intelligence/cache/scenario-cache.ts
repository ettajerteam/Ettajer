/**
 * Deterministic scenario cache — keyed by twin hash + scenario + rule version.
 */
import { INTELLIGENCE_SCORING_CONFIG as C } from "@/lib/intelligence/config/scoring";
import type { ScenarioOutcome } from "@/lib/intelligence/scenarios/simulate";

const RULE_VERSION = "v5-scenario-1";

type CacheEntry = {
  key: string;
  outcomes: ScenarioOutcome[];
  createdAt: number;
};

const globalCache = new Map<string, CacheEntry>();

export function scenarioCacheKey(input: {
  twinHash: string;
  scenarioLabel: string;
  evidenceFingerprint: string;
}): string {
  return `${RULE_VERSION}|${input.twinHash}|${input.scenarioLabel}|${input.evidenceFingerprint}`;
}

export function getCachedScenarios(key: string): ScenarioOutcome[] | null {
  const hit = globalCache.get(key);
  return hit ? hit.outcomes : null;
}

export function setCachedScenarios(
  key: string,
  outcomes: ScenarioOutcome[]
): void {
  globalCache.set(key, {
    key,
    outcomes,
    createdAt: Date.now(),
  });
  while (globalCache.size > C.twin.scenarioCacheMax) {
    const first = globalCache.keys().next().value;
    if (!first) break;
    globalCache.delete(first);
  }
}

export function invalidateScenarioCache(twinHash?: string): void {
  if (!twinHash) {
    globalCache.clear();
    return;
  }
  for (const k of [...globalCache.keys()]) {
    if (k.includes(twinHash)) globalCache.delete(k);
  }
}

export function cacheSize(): number {
  return globalCache.size;
}

export { RULE_VERSION as SCENARIO_RULE_VERSION };
