/**
 * Dr Sara V6 — Decision Intelligence tests.
 */
import { describe, expect, it } from "vitest";
import { snapshotToBriefing } from "@/lib/intelligence/adapt-briefing";
import type { PlatformState } from "@/lib/intelligence/engine-types";
import { emptyPlatformState } from "@/lib/intelligence/platform-state";
import { buildDrSaraSnapshotFromState } from "@/lib/intelligence/snapshot";
import { buildPlatformDigitalTwin } from "@/lib/intelligence/twin/build";
import {
  generateScenarios,
  simulateIntervention,
} from "@/lib/intelligence/scenarios/simulate";
import {
  generateDecisionCandidates,
  dedupeCandidates,
} from "@/lib/intelligence/decisions/candidates";
import {
  evaluateConstraints,
  isBlocked,
} from "@/lib/intelligence/decisions/constraints";
import {
  scoreDecisionCandidate,
  rankScoredCandidates,
  selectTopDecisionCandidate,
} from "@/lib/intelligence/decisions/scoring";
import { buildDecisionRationale } from "@/lib/intelligence/decisions/rationale";
import { attachScenarioSupport } from "@/lib/intelligence/decisions/scenario-support";
import { runDecisionEngine } from "@/lib/intelligence/decisions/engine";
import {
  DECISION_WEIGHTS,
  DECISION_THRESHOLDS,
} from "@/lib/intelligence/decisions/config";
import { getRecommendedActions } from "@/lib/intelligence/recommendations/actions";
import { collectAllSignals } from "@/lib/intelligence/signals/collect";
import { diagnosePlatform } from "@/lib/intelligence/diagnosis";
import { correlateSignals } from "@/lib/intelligence/correlation";

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

function intel(s: PlatformState) {
  const signals = collectAllSignals(s);
  const correlations = correlateSignals(signals, s);
  const diagnoses = diagnosePlatform(s, signals, correlations);
  const actions = getRecommendedActions(s, signals);
  return { signals, correlations, diagnoses, actions };
}

function liveOps() {
  return state({
    pendingRealOrders: 12,
    pendingRealGmv: 2272.98,
    openSupport: 1,
    domainFailing: 4,
    firstSaleCount: 128,
    firstSaleHighIntent: 103,
    hotEmptyCount: 5,
    loggedInEmpty7d: 8,
    top2SharePct: 67,
    concentrationElevated: true,
    totalStores: 50,
    liveStores: 40,
    funnel: {
      totalStores: 50,
      noProducts: 10,
      draftOnly: 5,
      activeNoOrders: 20,
      hasOrders: 15,
    },
  });
}

describe("V6 candidate generation", () => {
  it("generates candidates from signals without hardcoding winner", () => {
    const s = liveOps();
    const { signals, diagnoses, actions } = intel(s);
    const cands = generateDecisionCandidates({
      state: s,
      signals,
      diagnoses,
      recommendedActions: actions,
      evidenceQuality: 1,
    });
    const ids = cands.map((c) => c.id);
    expect(ids).toContain("NO_ACTION");
    expect(ids).toContain("REVIEW_PENDING_COD");
    expect(ids).toContain("DIAGNOSE_DNS");
    expect(ids).toContain("ANSWER_SUPPORT");
    expect(ids).toContain("PRIORITIZE_FIRST_SALE");
    expect(cands.every((c) => c.mode === "RECOMMENDED")).toBe(true);
    expect(cands.every((c) => c.route.startsWith("/admin"))).toBe(true);
  });

  it("deduplicates by id", () => {
    const s = liveOps();
    const { signals, diagnoses, actions } = intel(s);
    const cands = generateDecisionCandidates({
      state: s,
      signals,
      diagnoses,
      recommendedActions: actions,
      evidenceQuality: 1,
    });
    const duped = dedupeCandidates([...cands, ...cands]);
    expect(duped.map((c) => c.id).sort().join(",")).toBe(
      [...new Set(cands.map((c) => c.id))].sort().join(",")
    );
  });
});

describe("V6 scoring + weights", () => {
  it("exposes configurable weights", () => {
    expect(DECISION_WEIGHTS.impact).toBeGreaterThan(0);
    expect(DECISION_THRESHOLDS.preferActionOverNoAction).toBeGreaterThan(0);
  });

  it("scores COD higher urgency than long-horizon activation", () => {
    const s = liveOps();
    const { signals, diagnoses, actions } = intel(s);
    const twin = buildPlatformDigitalTwin({ state: s, sourceSnapshotId: "t" });
    const scenarios = generateScenarios({
      twin,
      candidateInterventions: [
        "COD_VERIFICATION",
        "DNS_DIAGNOSIS",
        "FIRST_SALE_ASSIST",
      ],
      performance: [],
      domainFailing: s.domainFailing,
      recoveringCOD: false,
      velocity: { pendingCOD: 1, support: 0, dns: 1 },
    });
    let cands = generateDecisionCandidates({
      state: s,
      signals,
      diagnoses,
      recommendedActions: actions,
      evidenceQuality: 1,
    }).map((c) => ({
      ...c,
      scenarioSupport: attachScenarioSupport(c, scenarios),
      constraints: evaluateConstraints({
        candidate: c,
        dataQualityStatus: "OK",
        scenarioAvailable: true,
        insufficientEvidence: false,
      }),
    }));
    const scored = rankScoredCandidates(cands.map(scoreDecisionCandidate));
    const cod = scored.find((c) => c.id === "REVIEW_PENDING_COD")!;
    const first = scored.find((c) => c.id === "PRIORITIZE_FIRST_SALE")!;
    expect(cod.score).toBeGreaterThan(first.score);
    expect(cod.scoreBreakdown.formula).toContain("impact");
  });
});

describe("V6 constraints", () => {
  it("PASS on healthy candidate", () => {
    const s = liveOps();
    const signals = collectAllSignals(s);
    const cands = generateDecisionCandidates({
      state: s,
      signals,
      diagnoses: intel(s).diagnoses,
      recommendedActions: intel(s).actions,
      evidenceQuality: 1,
    });
    const cod = cands.find((c) => c.id === "REVIEW_PENDING_COD")!;
    const r = evaluateConstraints({
      candidate: cod,
      dataQualityStatus: "OK",
      scenarioAvailable: true,
      insufficientEvidence: false,
    });
    expect(r.some((x) => x.status === "PASS")).toBe(true);
    expect(isBlocked(r)).toBe(false);
  });

  it("WARN on degraded data", () => {
    const s = liveOps();
    const signals = collectAllSignals(s);
    const cands = generateDecisionCandidates({
      state: s,
      signals,
      diagnoses: intel(s).diagnoses,
      recommendedActions: intel(s).actions,
      evidenceQuality: 0.5,
    });
    const cod = cands.find((c) => c.id === "REVIEW_PENDING_COD")!;
    const r = evaluateConstraints({
      candidate: cod,
      dataQualityStatus: "DEGRADED",
      scenarioAvailable: true,
      insufficientEvidence: false,
    });
    expect(r.some((x) => x.status === "WARN" && x.constraintId === "DEGRADED_DATA_QUALITY")).toBe(
      true
    );
  });

  it("BLOCK on insufficient evidence for non-NO_ACTION", () => {
    const s = liveOps();
    const signals = collectAllSignals(s);
    const cands = generateDecisionCandidates({
      state: s,
      signals,
      diagnoses: intel(s).diagnoses,
      recommendedActions: intel(s).actions,
      evidenceQuality: 0.2,
    });
    const cod = cands.find((c) => c.id === "REVIEW_PENDING_COD")!;
    const r = evaluateConstraints({
      candidate: cod,
      dataQualityStatus: "INSUFFICIENT",
      scenarioAvailable: false,
      insufficientEvidence: true,
    });
    expect(isBlocked(r)).toBe(true);
  });

  it("BLOCK missing route", () => {
    const s = liveOps();
    const signals = collectAllSignals(s);
    const cands = generateDecisionCandidates({
      state: s,
      signals,
      diagnoses: intel(s).diagnoses,
      recommendedActions: intel(s).actions,
      evidenceQuality: 1,
    });
    const bad = {
      ...cands.find((c) => c.id === "REVIEW_PENDING_COD")!,
      route: "",
    };
    const r = evaluateConstraints({
      candidate: bad,
      dataQualityStatus: "OK",
      scenarioAvailable: true,
      insufficientEvidence: false,
    });
    expect(
      r.some((x) => x.constraintId === "MISSING_OR_INVALID_ROUTE" && x.status === "BLOCK")
    ).toBe(true);
  });
});

describe("V6 engine + TOP_DECISION", () => {
  it("selects TOP_DECISION with rationale and alternatives", () => {
    const s = liveOps();
    const { signals, diagnoses, actions } = intel(s);
    const twin = buildPlatformDigitalTwin({ state: s, sourceSnapshotId: "t" });
    const scenarios = generateScenarios({
      twin,
      candidateInterventions: [
        "COD_VERIFICATION",
        "DNS_DIAGNOSIS",
        "SUPPORT_ESCALATION",
        "FIRST_SALE_ASSIST",
      ],
      performance: [],
      domainFailing: 4,
      recoveringCOD: false,
      velocity: { pendingCOD: 1, support: 0, dns: 1 },
    });
    const result = runDecisionEngine({
      state: s,
      signals,
      diagnoses,
      recommendedActions: actions,
      scenarios,
      dataQualityStatus: "OK",
      insufficientEvidence: false,
      evidenceQuality: 1,
      cycleId: "cycle-1",
    });
    expect(result.topDecision?.selectedAction.id).toBe("REVIEW_PENDING_COD");
    expect(result.topDecision?.selectedAction.mode).toBe("RECOMMENDED");
    expect(result.topDecision?.rationale.whyThis.length).toBeGreaterThan(2);
    expect(result.topDecision?.rationale.whyNotAlternatives.length).toBeGreaterThan(0);
    expect(result.topDecision?.expectedOutcome.kind).toBe("SIMULATED");
    expect(result.trace.map((t) => t.stage)).toContain("SELECTED_DECISION");
  });

  it("forces NO_ACTION on insufficient evidence", () => {
    const s = state({ totalStores: 0, pendingRealOrders: 0 });
    const signals = collectAllSignals(s);
    const result = runDecisionEngine({
      state: s,
      signals,
      diagnoses: intel(s).diagnoses,
      recommendedActions: intel(s).actions,
      scenarios: [],
      dataQualityStatus: "INSUFFICIENT",
      insufficientEvidence: true,
      evidenceQuality: 0.2,
      cycleId: "empty",
    });
    expect(result.topDecision?.selectedAction.id).toBe("NO_ACTION");
  });

  it("deterministic repeated execution", () => {
    const s = liveOps();
    const { signals, diagnoses, actions } = intel(s);
    const twin = buildPlatformDigitalTwin({ state: s, sourceSnapshotId: "t" });
    const scenarios = generateScenarios({
      twin,
      candidateInterventions: ["COD_VERIFICATION", "DNS_DIAGNOSIS"],
      performance: [],
      domainFailing: 4,
      recoveringCOD: false,
      velocity: { pendingCOD: 1, support: 0, dns: 1 },
    });
    const args = {
      state: s,
      signals,
      diagnoses,
      recommendedActions: actions,
      scenarios,
      dataQualityStatus: "OK" as const,
      insufficientEvidence: false,
      evidenceQuality: 1,
      cycleId: "det",
    };
    const a = runDecisionEngine(args);
    const b = runDecisionEngine(args);
    expect(a.topDecision?.selectedAction.id).toBe(b.topDecision?.selectedAction.id);
    expect(a.topDecision?.score).toBe(b.topDecision?.score);
    expect(a.candidates.map((c) => `${c.id}:${c.score}`)).toEqual(
      b.candidates.map((c) => `${c.id}:${c.score}`)
    );
    expect(JSON.stringify(a.topDecision?.rationale)).toBe(
      JSON.stringify(b.topDecision?.rationale)
    );
  });

  it("rationale structure from evidence", () => {
    const s = liveOps();
    const { signals, diagnoses, actions } = intel(s);
    const twin = buildPlatformDigitalTwin({ state: s, sourceSnapshotId: "t" });
    const scenarios = generateScenarios({
      twin,
      candidateInterventions: ["COD_VERIFICATION"],
      performance: [],
      domainFailing: 0,
      recoveringCOD: false,
      velocity: { pendingCOD: 1, support: 0, dns: 0 },
    });
    const result = runDecisionEngine({
      state: s,
      signals,
      diagnoses: intel(s).diagnoses,
      recommendedActions: intel(s).actions,
      scenarios,
      dataQualityStatus: "OK",
      insufficientEvidence: false,
      evidenceQuality: 1,
      cycleId: "r",
    });
    const r = buildDecisionRationale({
      selected: result.candidates.find((c) => c.id === result.topDecision?.selectedAction.id)!,
      alternatives: result.candidates,
    });
    expect(r.whyThis.some((w) => /pendingRealOrders|route|Scenario/i.test(w))).toBe(
      true
    );
  });
});

describe("V6 snapshot integration + V5 compatibility", () => {
  it("version 6.0.0 with TOP_ACTION, TOP_SCENARIO, TOP_DECISION", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    expect(snap.metadata.version).toBe("9.0.0");
    expect(snap.topAction?.label).toBeTruthy();
    expect(snap.topScenario).toBeTruthy();
    expect(snap.decision?.topDecision?.selectedAction.id).toBeTruthy();
    expect(snap.decision?.topDecision?.mode).toBe("RECOMMENDED");
    expect(snap.digitalTwin?.metrics.pendingCOD).toBe(12);
    expect(snap.autonomy.autoExecute).toBe(false);
  });

  it("UI briefing still works", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const briefing = snapshotToBriefing(snap);
    expect(briefing.pulse.score).toBe(snap.health.score);
    expect(briefing.actions[0]?.label).toBeTruthy();
  });

  it("identical state → identical TOP_DECISION", () => {
    const s = liveOps();
    const a = buildDrSaraSnapshotFromState(s);
    const b = buildDrSaraSnapshotFromState(s);
    expect(a.decision?.topDecision?.selectedAction.id).toBe(
      b.decision?.topDecision?.selectedAction.id
    );
    expect(a.decision?.topDecision?.score).toBe(b.decision?.topDecision?.score);
  });

  it("simulation remains immutable", () => {
    const twin = buildPlatformDigitalTwin({
      state: liveOps(),
      sourceSnapshotId: "i",
    });
    const before = twin.metrics.pendingCOD;
    simulateIntervention({ twin, type: "COD_VERIFICATION", performance: [] });
    expect(twin.metrics.pendingCOD).toBe(before);
  });
});

describe("V6 adversarial", () => {
  it("zero merchants / orders → conservative", () => {
    const snap = buildDrSaraSnapshotFromState(
      state({
        totalStores: 0,
        pendingRealOrders: 0,
        realOrders7d: 0,
        totalRevenue: 0,
      })
    );
    expect(snap.decision?.topDecision?.selectedAction.id).toBe("NO_ACTION");
  });

  it("huge affected count low urgency still ranks below COD", () => {
    const snap = buildDrSaraSnapshotFromState(
      state({
        pendingRealOrders: 12,
        pendingRealGmv: 2000,
        firstSaleCount: 500,
        firstSaleHighIntent: 400,
        totalStores: 600,
      })
    );
    expect(snap.decision?.topDecision?.selectedAction.id).toBe(
      "REVIEW_PENDING_COD"
    );
  });

  it("all candidates blocked → NO_ACTION path via insufficient", () => {
    const result = runDecisionEngine({
      state: state({ pendingRealOrders: 5, totalStores: 10 }),
      signals: collectAllSignals(state({ pendingRealOrders: 5, totalStores: 10 })),
      diagnoses: [],
      recommendedActions: [],
      scenarios: [],
      dataQualityStatus: "INSUFFICIENT",
      insufficientEvidence: true,
      evidenceQuality: 0.1,
      cycleId: "block",
    });
    expect(result.topDecision?.selectedAction.id).toBe("NO_ACTION");
  });

  it("tie-break is deterministic", () => {
    const a = selectTopDecisionCandidate(
      rankScoredCandidates([
        scoreDecisionCandidate({
          id: "A",
          type: "A",
          title: "A",
          description: "",
          route: "/admin/payments",
          domain: "operations",
          affectedCount: 1,
          evidence: [],
          triggeredRules: [],
          expectedImpact: 0.5,
          urgency: 0.5,
          confidence: 0.5,
          reversibility: 0.5,
          actionability: 0.5,
          cost: 0.2,
          timeToImpact: "immediate",
          risk: 0.2,
          constraints: [
            {
              constraintId: "DATA_QUALITY_OK",
              status: "PASS",
              reason: "ok",
              evidence: [],
            },
          ],
          scenarioSupport: {
            strength: "NONE",
            scenarioId: null,
            baseline: {},
            expectedAfter: {},
            expectedDirection: null,
            uncertainty: "HIGH",
            scenarioConfidence: 0,
            assumptions: [],
            tradeoffs: [],
            note: "",
          },
          mode: "RECOMMENDED",
        }),
        scoreDecisionCandidate({
          id: "B",
          type: "B",
          title: "B",
          description: "",
          route: "/admin/domains",
          domain: "technical",
          affectedCount: 1,
          evidence: [],
          triggeredRules: [],
          expectedImpact: 0.5,
          urgency: 0.5,
          confidence: 0.5,
          reversibility: 0.5,
          actionability: 0.5,
          cost: 0.2,
          timeToImpact: "immediate",
          risk: 0.2,
          constraints: [
            {
              constraintId: "DATA_QUALITY_OK",
              status: "PASS",
              reason: "ok",
              evidence: [],
            },
          ],
          scenarioSupport: {
            strength: "NONE",
            scenarioId: null,
            baseline: {},
            expectedAfter: {},
            expectedDirection: null,
            uncertainty: "HIGH",
            scenarioConfidence: 0,
            assumptions: [],
            tradeoffs: [],
            note: "",
          },
          mode: "RECOMMENDED",
        }),
      ]),
      false
    );
    expect(a?.id).toBe("A");
  });

  it("no LLM/ML imports in decisions module", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const dir = path.join(process.cwd(), "lib/intelligence/decisions");
    for (const f of fs.readdirSync(dir)) {
      const text = fs.readFileSync(path.join(dir, f), "utf8");
      expect(text).not.toMatch(/openai|anthropic|@ai-sdk|langchain|embedding/i);
    }
  });
});
