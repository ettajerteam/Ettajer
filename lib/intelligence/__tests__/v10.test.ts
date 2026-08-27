/**
 * Dr Sara V10 — Platform Intelligence OS tests.
 */
import { describe, expect, it, beforeEach } from "vitest";
import { snapshotToBriefing } from "@/lib/intelligence/adapt-briefing";
import type { PlatformState } from "@/lib/intelligence/engine-types";
import { emptyPlatformState } from "@/lib/intelligence/platform-state";
import { buildDrSaraSnapshotFromState } from "@/lib/intelligence/snapshot";
import {
  runDrSaraCycle,
  composeIntelligenceOS,
  OS_CONFIG,
  buildInterventionPortfolio,
  resolveAutonomy,
  runOsGovernor,
  detectPortfolioConflicts,
  topologicalOrder,
  buildLearningState,
  buildAdaptation,
  evaluateBudgets,
} from "@/lib/intelligence/os/index";
import { resetExecutionEngine } from "@/lib/intelligence/execution/index";
import { TRACE_STAGES } from "@/lib/intelligence/os/config";

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
    hotEmptyCount: 5,
    top2SharePct: 67,
    concentrationElevated: true,
    totalStores: 50,
    realOrders7d: 40,
    ordersChange7d: -5,
  });
}

beforeEach(() => {
  resetExecutionEngine();
});

describe("V10 architecture", () => {
  it("runDrSaraCycle produces intelligenceOS", () => {
    const result = runDrSaraCycle({ state: liveOps() });
    expect(result.snapshot.metadata.version).toBe("10.0.0");
    expect(result.cycleId).toMatch(/^c10_/);
    expect(result.intelligenceOS.cycleId).toBe(result.cycleId);
    expect(result.productionMutation).toBe("NONE");
    expect(result.autoExecute).toBe(false);
    expect(result.intelligenceOS.trace.length).toBeGreaterThan(10);
  });

  it("graph and portfolio present", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    expect(snap.intelligenceOS?.graph.nodeCount).toBeGreaterThan(0);
    expect(snap.intelligenceOS?.portfolio.items.length).toBeGreaterThan(0);
    expect(snap.intelligenceOS?.bestStrategy?.strategyId).toBeTruthy();
  });

  it("deterministic cycle", () => {
    const s = liveOps();
    const a = runDrSaraCycle({ state: s });
    const b = runDrSaraCycle({ state: s });
    expect(a.cycleId).toBe(b.cycleId);
    expect(a.intelligenceOS.bestStrategy?.strategyId).toBe(
      b.intelligenceOS.bestStrategy?.strategyId
    );
    expect(JSON.stringify(a.intelligenceOS.trace)).toBe(
      JSON.stringify(b.intelligenceOS.trace)
    );
  });
});

describe("V10 detection + strategy", () => {
  it("early warnings and opportunities", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    expect(snap.intelligenceOS?.warnings.some((w) => w.id.includes("cod"))).toBe(
      true
    );
    expect(
      snap.intelligenceOS?.opportunities.some((o) => o.id.includes("intent"))
    ).toBe(true);
  });

  it("dependency ordering", () => {
    const ordered = topologicalOrder([
      "FIRST_SALE_ASSISTANCE",
      "DNS_DIAGNOSIS",
      "COD_VERIFICATION",
    ]);
    expect(ordered.indexOf("DNS_DIAGNOSIS")).toBeLessThan(
      ordered.indexOf("FIRST_SALE_ASSISTANCE")
    );
  });

  it("conflict detection", () => {
    const c = detectPortfolioConflicts({
      interventionTypes: ["MERCHANT_ONBOARDING", "SUPPORT_ESCALATION"],
      openSupport: 8,
    });
    expect(c.status).toBe("CONFLICT");
    expect(c.conflicts.some((x) => x.severity === "BLOCK")).toBe(true);
  });

  it("portfolio ranks COD highly on live ops", () => {
    const p = buildInterventionPortfolio({
      candidates: [
        {
          decisionId: "REVIEW_PENDING_COD",
          interventionType: "COD_VERIFICATION",
          title: "COD",
          impact: 0.9,
          urgency: 0.9,
          confidence: 0.8,
          reversibility: 0.8,
          actionability: 0.9,
          risk: "HIGH",
          blastRadius: "HIGH",
          historicalReliability: "INSUFFICIENT",
          expectedEffect: "pending↓",
          approvalRequired: true,
          targetCount: 12,
        },
        {
          decisionId: "ANSWER_SUPPORT",
          interventionType: "SUPPORT_ESCALATION",
          title: "Support",
          impact: 0.4,
          urgency: 0.4,
          confidence: 0.7,
          reversibility: 0.9,
          actionability: 0.8,
          risk: "LOW",
          blastRadius: "LOW",
          historicalReliability: "INSUFFICIENT",
          expectedEffect: "support↓",
          approvalRequired: true,
          targetCount: 1,
        },
      ],
      openSupport: 1,
    });
    expect(p.orderedIds[0]).toBe("REVIEW_PENDING_COD");
  });
});

describe("V10 learning + autonomy", () => {
  it("insufficient evidence does not invent rates", () => {
    const learning = buildLearningState({
      successRates: [
        {
          decisionType: "REVIEW_PENDING_COD",
          totalMeasured: 1,
          successCount: 1,
          partialCount: 0,
          failureCount: 0,
          unknownCount: 0,
          successRate: 1,
          failureRate: 0,
          sampleQuality: "INSUFFICIENT",
          evidenceStrength: "INSUFFICIENT",
        },
      ],
      reliability: [
        {
          decisionType: "REVIEW_PENDING_COD",
          band: "INSUFFICIENT",
          successRate: null,
          sampleSize: 1,
          predictionAccuracyGoodShare: null,
          evidenceStrength: "INSUFFICIENT",
          note: "n=1",
        },
      ],
      outcomes: [],
      decisionConfidence: 0.8,
    });
    expect(learning.interventionSuccessRate.REVIEW_PENDING_COD).toBeNull();
    expect(learning.confidenceAdjustment.after).toBeLessThanOrEqual(0.98);
    expect(learning.confidenceAdjustment.after).toBeGreaterThanOrEqual(0.01);
  });

  it("adaptation bounded", () => {
    const learning = buildLearningState({
      successRates: [
        {
          decisionType: "REVIEW_PENDING_COD",
          totalMeasured: 20,
          successCount: 18,
          partialCount: 1,
          failureCount: 1,
          unknownCount: 0,
          successRate: 0.9,
          failureRate: 0.05,
          sampleQuality: "SUFFICIENT",
          evidenceStrength: "STRONG",
        },
      ],
      reliability: [
        {
          decisionType: "REVIEW_PENDING_COD",
          band: "HIGH",
          successRate: 0.9,
          sampleSize: 20,
          predictionAccuracyGoodShare: 0.8,
          evidenceStrength: "STRONG",
          note: "strong",
        },
      ],
      outcomes: [],
      decisionConfidence: 0.7,
    });
    const adapt = buildAdaptation({
      learning,
      decisionIds: ["REVIEW_PENDING_COD"],
    });
    expect(adapt.priorityDeltas[0]?.delta).toBeLessThanOrEqual(
      OS_CONFIG.adaptation.maxAbsDelta
    );
  });

  it("controlled auto disabled by default", () => {
    expect(OS_CONFIG.controlledAutoEnabled).toBe(false);
    const a = resolveAutonomy({
      items: [
        {
          interventionType: "SUPPORT_ESCALATION",
          risk: "LOW",
          blastRadius: "LOW",
          confidence: 0.9,
          reversibility: 0.9,
          historicalReliability: "HIGH",
          approvalRequired: false,
        },
      ],
      dataQuality: "OK",
    });
    expect(a.autoExecute).toBe(false);
    expect(a.controlledAutoEnabled).toBe(false);
    expect(a.perIntervention[0]?.maxMode).not.toBe("CONTROLLED_AUTO");
  });

  it("governor never allows intelligence to authorize", () => {
    const g = runOsGovernor({
      dataQuality: "OK",
      stateFresh: true,
      interventionRegistered: true,
      approvalValid: true,
      approvalRequired: false,
      riskAcceptable: true,
      blastAcceptable: true,
      dependenciesSatisfied: true,
      conflicts: { status: "NO_CONFLICT", conflicts: [] },
      budgetExceeded: false,
      autonomy: {
        mode: "RECOMMEND",
        controlledAutoEnabled: false,
        autoExecute: false,
        perIntervention: [],
        reasons: [],
      },
      authorizeViaIntelligence: true,
    });
    expect(g.decision).toBe("BLOCKED");
  });

  it("budget exceeded", () => {
    const b = evaluateBudgets({
      plannedRisks: ["CRITICAL", "CRITICAL", "CRITICAL"],
      plannedBlast: ["CRITICAL", "CRITICAL"],
      plannedContacts: 1000,
      plannedExecutions: 50,
    });
    expect(b.exceeded).toBe(true);
  });
});

describe("V10 safety + execution integration", () => {
  it("default cycle zero production mutation", () => {
    const r = runDrSaraCycle({ state: liveOps() });
    expect(r.productionMutation).toBe("NONE");
    expect(r.snapshot.autonomy.autoExecute).toBe(false);
    expect(r.intelligenceOS.governance.decision).not.toBe("ALLOWED");
  });

  it("sandbox execution via V9 remains NONE mutation", () => {
    const r = runDrSaraCycle({
      state: liveOps(),
      runSandboxExecution: true,
    });
    expect(r.sandboxExecution?.productionMutation).toBe("NONE");
    expect(
      r.sandboxExecution?.status === "EXECUTED" ||
        r.sandboxExecution?.status === "DRY_RUN_OK" ||
        r.sandboxExecution?.status === "BLOCKED" ||
        r.sandboxExecution?.status === "PRECONDITION_FAILED"
    ).toBe(true);
  });

  it("stale / bad quality degrades cycle", () => {
    const os = composeIntelligenceOS({
      state: liveOps(),
      stateFingerprint: "fp",
      twinHash: "t",
      cycleTimestampIso: "2026-08-26T12:00:00.000Z",
      dataQuality: "INSUFFICIENT",
      insufficientEvidence: true,
      healthScore: 50,
      topDecision: null,
      decisionCandidates: [],
      signalIds: [],
      diagnosisIds: [],
      scenarioIds: [],
      topScenarioLabel: null,
      intervention: null,
      successRates: [],
      reliability: [],
      outcomes: [],
    });
    expect(os.status).toBe("DEGRADED");
  });

  it("trace covers required stages", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const stages = new Set(snap.intelligenceOS?.trace.map((t) => t.stage));
    for (const s of TRACE_STAGES) {
      expect(stages.has(s)).toBe(true);
    }
  });
});

describe("V10 compatibility + audits", () => {
  it("preserves V1–V9 snapshot fields", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    expect(snap.topAction).toBeTruthy();
    expect(snap.topScenario).toBeTruthy();
    expect(snap.decision?.topDecision).toBeTruthy();
    expect(snap.memory?.primaryFingerprint).toBeTruthy();
    expect(snap.intervention?.type).toBe("COD_VERIFICATION");
    expect(snap.execution?.autoExecute).toBe(false);
    expect(snap.intelligenceOS?.productionMutation).toBe("NONE");
  });

  it("UI briefing works", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    expect(snapshotToBriefing(snap).pulse.score).toBe(snap.health.score);
  });

  it("no LLM/ML/random in os modules", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const dir = path.join(process.cwd(), "lib/intelligence/os");
    for (const f of fs.readdirSync(dir).filter((x: string) => x.endsWith(".ts"))) {
      const text = fs.readFileSync(path.join(dir, f), "utf8");
      expect(text).not.toMatch(/openai|anthropic|@ai-sdk|langchain|embedding/i);
      expect(text).not.toMatch(/prisma\.(.*)(create|update|delete|upsert)/i);
      expect(text).not.toMatch(/\bMath\.random\s*\(|\bDate\.now\s*\(|\brandomUUID\s*\(/);
    }
  });
});
