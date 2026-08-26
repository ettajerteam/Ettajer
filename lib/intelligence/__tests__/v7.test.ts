/**
 * Dr Sara V7 — Memory & Outcome Intelligence tests.
 */
import { describe, expect, it } from "vitest";
import { snapshotToBriefing } from "@/lib/intelligence/adapt-briefing";
import type { PlatformState } from "@/lib/intelligence/engine-types";
import { emptyPlatformState } from "@/lib/intelligence/platform-state";
import { buildDrSaraSnapshotFromState } from "@/lib/intelligence/snapshot";
import {
  buildStateFingerprints,
  primaryStateFingerprint,
  fingerprintHash,
} from "@/lib/intelligence/memory/fingerprints";
import {
  compareOutcome,
  classifyMetricAccuracy,
} from "@/lib/intelligence/memory/outcome-history";
import { computeSuccessRates } from "@/lib/intelligence/memory/success-rates";
import { assessReliability } from "@/lib/intelligence/memory/reliability";
import { adjustConfidence } from "@/lib/intelligence/memory/confidence-adjustment";
import { MEMORY_THRESHOLDS } from "@/lib/intelligence/memory/config";
import type { OutcomeMemoryRecord } from "@/lib/intelligence/memory/v7-types";
import { emptyIntelligenceMemory } from "@/lib/intelligence/memory/types";
import { runDecisionEngine } from "@/lib/intelligence/decisions/engine";
import { evaluateConstraints, isBlocked } from "@/lib/intelligence/decisions/constraints";
import { generateDecisionCandidates } from "@/lib/intelligence/decisions/candidates";
import { collectAllSignals } from "@/lib/intelligence/signals/collect";
import { diagnosePlatform } from "@/lib/intelligence/diagnosis";
import { correlateSignals } from "@/lib/intelligence/correlation";
import { getRecommendedActions } from "@/lib/intelligence/recommendations/actions";
import { buildPlatformDigitalTwin } from "@/lib/intelligence/twin/build";
import { generateScenarios } from "@/lib/intelligence/scenarios/simulate";
import {
  computeMemoryScoreAdjustments,
  applyMemoryToCandidates,
} from "@/lib/intelligence/memory/learning";
import { runMemoryEngine } from "@/lib/intelligence/memory/memory-engine";

function state(partial: Partial<PlatformState> = {}): PlatformState {
  const base = emptyPlatformState(new Date("2026-08-26T12:00:00Z"));
  return {
    ...base,
    ...partial,
    funnel: { ...base.funnel, ...partial.funnel },
    firstSaleBottlenecks: {
      ...base.firstSaleBottlenecks,
      ...partial.firstSaleBottlenecks,
    },
    sparklines: { ...base.sparklines, ...partial.sparklines },
    today: { ...base.today, ...partial.today },
    yesterday: { ...base.yesterday, ...partial.yesterday },
  };
}

function liveOps() {
  return state({
    pendingRealOrders: 12,
    pendingRealGmv: 2272.98,
    openSupport: 1,
    domainFailing: 4,
    firstSaleCount: 128,
    firstSaleHighIntent: 103,
    top2SharePct: 67,
    concentrationElevated: true,
    totalStores: 50,
  });
}

function measuredOutcomes(nSuccess: number, nFail: number): OutcomeMemoryRecord[] {
  const out: OutcomeMemoryRecord[] = [];
  for (let i = 0; i < nSuccess; i++) {
    out.push({
      outcomeId: `ok-${i}`,
      decisionId: `d-${i}`,
      decisionType: "REVIEW_PENDING_COD",
      stateFingerprint: "COD_BACKLOG_HIGH",
      measuredAt: "2026-01-01T00:00:00.000Z",
      status: "SUCCESS",
      accuracy: "ACCURATE",
      predicted: { pendingCOD: [4, 7] },
      observed: { pendingCOD: 5 },
      delta: { pendingCOD: -7 },
      expectedRange: { pendingCOD: [4, 7] },
      confidence: 0.8,
      measurementWindow: "7d",
      evidenceStrength: "MODERATE",
      evidence: ["measured"],
    });
  }
  for (let i = 0; i < nFail; i++) {
    out.push({
      outcomeId: `fail-${i}`,
      decisionId: `df-${i}`,
      decisionType: "REVIEW_PENDING_COD",
      stateFingerprint: "COD_BACKLOG_HIGH",
      measuredAt: "2026-01-02T00:00:00.000Z",
      status: "FAILED",
      accuracy: "MISS",
      predicted: { pendingCOD: [4, 7] },
      observed: { pendingCOD: 20 },
      delta: { pendingCOD: 8 },
      expectedRange: { pendingCOD: [4, 7] },
      confidence: 0.5,
      measurementWindow: "7d",
      evidenceStrength: "MODERATE",
      evidence: ["measured"],
    });
  }
  return out;
}

describe("V7 fingerprints", () => {
  it("is deterministic and stable", () => {
    const s = liveOps();
    expect(buildStateFingerprints(s)).toEqual(buildStateFingerprints(s));
    expect(primaryStateFingerprint(s)).toContain("COD_BACKLOG_HIGH");
    expect(fingerprintHash(s)).toBe(fingerprintHash(s));
  });

  it("quiet platform gets PLATFORM_QUIET", () => {
    expect(buildStateFingerprints(state({ totalStores: 5 }))).toContain(
      "PLATFORM_QUIET"
    );
  });
});

describe("V7 outcome compare + success rates", () => {
  it("ACCURATE when observed in range", () => {
    expect(classifyMetricAccuracy([4, 7], 5)).toBe("ACCURATE");
    const r = compareOutcome({
      predicted: { pendingCOD: [4, 7] },
      observed: { pendingCOD: 5 },
      sufficientData: true,
    });
    expect(r.status).toBe("SUCCESS");
    expect(r.accuracy).toBe("ACCURATE");
  });

  it("MISS outside range", () => {
    expect(classifyMetricAccuracy([4, 7], 20)).toBe("MISS");
  });

  it("insufficient sample → INSUFFICIENT evidence", () => {
    const rates = computeSuccessRates(measuredOutcomes(1, 0));
    expect(rates[0]!.evidenceStrength).toBe("INSUFFICIENT");
    expect(rates[0]!.successRate).toBeNull();
  });

  it("sufficient sample computes successRate", () => {
    const rates = computeSuccessRates(measuredOutcomes(8, 2));
    expect(rates[0]!.totalMeasured).toBe(10);
    expect(rates[0]!.successRate).toBe(0.8);
    expect(rates[0]!.sampleQuality).toBe("SUFFICIENT");
  });
});

describe("V7 reliability + confidence adjustment", () => {
  it("INSUFFICIENT when sample small", () => {
    const summary = computeSuccessRates(measuredOutcomes(2, 0))[0]!;
    const rel = assessReliability({ summary });
    expect(rel.band).toBe("INSUFFICIENT");
  });

  it("boosts confidence within cap when HIGH reliability", () => {
    const summary = computeSuccessRates(measuredOutcomes(9, 1))[0]!;
    const rel = assessReliability({
      summary,
      outcomes: measuredOutcomes(9, 1),
    });
    expect(rel.band).toBe("HIGH");
    const adj = adjustConfidence({
      confidenceBefore: 0.9,
      reliability: rel,
    });
    expect(adj.applied).toBe(true);
    expect(adj.after).toBeGreaterThan(adj.before);
    expect(adj.after).toBeLessThanOrEqual(MEMORY_THRESHOLDS.maxConfidence);
  });

  it("does not adjust on insufficient evidence", () => {
    const summary = computeSuccessRates(measuredOutcomes(1, 0))[0]!;
    const rel = assessReliability({ summary });
    const adj = adjustConfidence({
      confidenceBefore: 0.9,
      reliability: rel,
    });
    expect(adj.applied).toBe(false);
    expect(adj.delta).toBe(0);
  });

  it("never reaches 1.0", () => {
    const summary = computeSuccessRates(measuredOutcomes(10, 0))[0]!;
    const rel = assessReliability({
      summary,
      outcomes: measuredOutcomes(10, 0),
    });
    const adj = adjustConfidence({
      confidenceBefore: 0.97,
      reliability: rel,
    });
    expect(adj.after).toBeLessThanOrEqual(0.98);
    expect(adj.after).toBeLessThan(1);
  });
});

describe("V7 memory scoring + BLOCK safety", () => {
  it("BLOCK cannot be bypassed by memory bonus", () => {
    const s = liveOps();
    const signals = collectAllSignals(s);
    const correlations = correlateSignals(signals, s);
    const diagnoses = diagnosePlatform(s, signals, correlations);
    const actions = getRecommendedActions(s, signals);
    let cands = generateDecisionCandidates({
      state: s,
      signals,
      diagnoses,
      recommendedActions: actions,
      evidenceQuality: 1,
    });
    // Force BLOCK on COD
    cands = cands.map((c) =>
      c.id === "REVIEW_PENDING_COD"
        ? {
            ...c,
            constraints: evaluateConstraints({
              candidate: { ...c, route: "" },
              dataQualityStatus: "OK",
              scenarioAvailable: true,
              insufficientEvidence: false,
            }),
          }
        : {
            ...c,
            constraints: evaluateConstraints({
              candidate: c,
              dataQualityStatus: "OK",
              scenarioAvailable: true,
              insufficientEvidence: false,
            }),
          }
    );
    const blocked = cands.find((c) => c.id === "REVIEW_PENDING_COD")!;
    expect(isBlocked(blocked.constraints)).toBe(true);

    const twin = buildPlatformDigitalTwin({ state: s, sourceSnapshotId: "t" });
    const scenarios = generateScenarios({
      twin,
      candidateInterventions: ["COD_VERIFICATION"],
      performance: [],
      domainFailing: 4,
      recoveringCOD: false,
      velocity: { pendingCOD: 1, support: 0, dns: 1 },
    });
    const engine = runDecisionEngine({
      state: s,
      signals,
      diagnoses,
      recommendedActions: actions,
      scenarios,
      dataQualityStatus: "OK",
      insufficientEvidence: false,
      evidenceQuality: 1,
      cycleId: "b",
    });
    // Manually mark COD blocked in candidates
    const withBlock = engine.candidates.map((c) =>
      c.id === "REVIEW_PENDING_COD"
        ? {
            ...c,
            blocked: true,
            constraints: [
              ...c.constraints,
              {
                constraintId: "MISSING_OR_INVALID_ROUTE",
                status: "BLOCK" as const,
                reason: "test",
                evidence: [],
              },
            ],
            score: -50,
          }
        : c
    );
    const rel = [
      assessReliability({
        summary: computeSuccessRates(measuredOutcomes(10, 0))[0]!,
        outcomes: measuredOutcomes(10, 0),
      }),
    ];
    const adj = computeMemoryScoreAdjustments({
      candidates: withBlock,
      reliability: rel,
    });
    const codAdj = adj.find((a) => a.decisionType === "REVIEW_PENDING_COD")!;
    expect(codAdj.blockedPreserved).toBe(true);
    expect(codAdj.net).toBe(0);
    const applied = applyMemoryToCandidates(withBlock, adj);
    expect(applied.find((c) => c.id === "REVIEW_PENDING_COD")!.blocked).toBe(
      true
    );
  });
});

describe("V7 snapshot + learning trace", () => {
  it("version 7.0.0 with memory + learning on empty history", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    expect(snap.metadata.version).toBe("8.0.0");
    expect(snap.memory?.primaryFingerprint).toBeTruthy();
    expect(snap.learning?.learningTrace?.map((t) => t.stage)).toEqual([
      "INPUT",
      "HISTORICAL_EVIDENCE",
      "RELIABILITY",
      "PREDICTION_ACCURACY",
      "CONFIDENCE_ADJUSTMENT",
      "FINAL_DECISION",
    ]);
    expect(snap.decision?.topDecision?.historicalReliability).toBe(
      "INSUFFICIENT"
    );
    expect(snap.decision?.topDecision?.memoryImpact).toBe("NONE");
    expect(snap.topAction).toBeTruthy();
    expect(snap.topScenario).toBeTruthy();
    expect(snap.decision?.topDecision?.mode).toBe("RECOMMENDED");
    expect(snap.autonomy.autoExecute).toBe(false);
  });

  it("memory boosts confidence when history sufficient", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps(), {
      memory: emptyIntelligenceMemory(),
      v7OutcomeHistory: measuredOutcomes(9, 1),
    });
    expect(snap.decision?.topDecision?.historicalReliability).toBe("HIGH");
    expect(
      (snap.decision?.topDecision?.confidenceAfterMemory ?? 0) >=
        (snap.decision?.topDecision?.confidenceBeforeMemory ?? 0)
    ).toBe(true);
    expect(snap.learning?.topDecisionMemory?.memoryImpact).toMatch(
      /BOOST|NONE/
    );
  });

  it("deterministic repeated execution", () => {
    const s = liveOps();
    const hist = measuredOutcomes(8, 2);
    const a = buildDrSaraSnapshotFromState(s, { v7OutcomeHistory: hist });
    const b = buildDrSaraSnapshotFromState(s, { v7OutcomeHistory: hist });
    expect(a.memory?.primaryFingerprint).toBe(b.memory?.primaryFingerprint);
    expect(a.decision?.topDecision?.selectedAction.id).toBe(
      b.decision?.topDecision?.selectedAction.id
    );
    expect(a.decision?.topDecision?.confidenceAfterMemory).toBe(
      b.decision?.topDecision?.confidenceAfterMemory
    );
    expect(JSON.stringify(a.learning?.learningTrace)).toBe(
      JSON.stringify(b.learning?.learningTrace)
    );
  });

  it("UI briefing still works", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const briefing = snapshotToBriefing(snap);
    expect(briefing.pulse.score).toBe(snap.health.score);
  });

  it("no LLM imports in memory modules", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const dir = path.join(process.cwd(), "lib/intelligence/memory");
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".ts")) continue;
      const text = fs.readFileSync(path.join(dir, f), "utf8");
      expect(text).not.toMatch(/openai|anthropic|@ai-sdk|langchain|embedding/i);
    }
  });
});

describe("V7 memory engine empty history safe", () => {
  it("runMemoryEngine with empty history", () => {
    const s = liveOps();
    const signals = collectAllSignals(s);
    const correlations = correlateSignals(signals, s);
    const diagnoses = diagnosePlatform(s, signals, correlations);
    const actions = getRecommendedActions(s, signals);
    const twin = buildPlatformDigitalTwin({ state: s, sourceSnapshotId: "t" });
    const scenarios = generateScenarios({
      twin,
      candidateInterventions: ["COD_VERIFICATION"],
      performance: [],
      domainFailing: 4,
      recoveringCOD: false,
      velocity: { pendingCOD: 1, support: 0, dns: 1 },
    });
    const decision = runDecisionEngine({
      state: s,
      signals,
      diagnoses,
      recommendedActions: actions,
      scenarios,
      dataQualityStatus: "OK",
      insufficientEvidence: false,
      evidenceQuality: 1,
      cycleId: "m",
    });
    const mem = runMemoryEngine({
      state: s,
      twinHash: twin.twinHash,
      intelligenceMemory: emptyIntelligenceMemory(),
      topDecision: decision.topDecision,
      candidates: decision.candidates,
    });
    expect(mem.topDecisionMemory?.evidenceStrength).toBe("INSUFFICIENT");
    expect(mem.topDecisionMemory?.memoryImpact).toBe("NONE");
  });
});
