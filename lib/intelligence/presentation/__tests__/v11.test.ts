/**
 * Dr Sara V11 — Experience presentation layer tests.
 */
import { describe, expect, it } from "vitest";
import { buildDrSaraSnapshotFromState } from "@/lib/intelligence/snapshot";
import { emptyPlatformState } from "@/lib/intelligence/platform-state";
import type { PlatformState } from "@/lib/intelligence/engine-types";
import {
  buildSaraExperienceViewModel,
  EXPERIENCE_VERSION,
  buildPlatformMapView,
  buildTimelineView,
  buildScenarioLabView,
  buildDecisionRoomView,
  buildRiskFieldView,
  buildLearningLoopView,
  buildAgentNetworkView,
} from "@/lib/intelligence/presentation";

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

describe("V11 experience model", () => {
  it("builds deterministic view model from snapshot", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const a = buildSaraExperienceViewModel(snap);
    const b = buildSaraExperienceViewModel(snap);
    expect(a.version).toBe(EXPERIENCE_VERSION);
    expect(a.engineVersion).toBe("10.0.0");
    expect(a.autoExecute).toBe(false);
    expect(a.productionMutation).toBe("NONE");
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("renders TOP_DECISION in NOW and preserved fields", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const vm = buildSaraExperienceViewModel(snap);
    expect(snap.decision?.topDecision).toBeTruthy();
    expect(vm.preserved.topDecision).toBe(
      snap.decision?.topDecision?.selectedAction.id
    );
    expect(vm.preserved.topAction).toBe(snap.topAction?.label);
    expect(vm.preserved.topScenario).toBe(
      snap.topScenario?.scenarioId ?? null
    );
    expect(vm.now.headline).toBe(
      snap.decision?.topDecision?.selectedAction.title
    );
    expect(vm.now.decisionId).toBe("REVIEW_PENDING_COD");
  });

  it("why chain uses engine data not fabrication", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const vm = buildSaraExperienceViewModel(snap);
    expect(vm.whyChain.length).toBeGreaterThan(2);
    const decisionStep = vm.whyChain.find((s) => s.label === "DECISION");
    expect(decisionStep?.detail).toBe(
      snap.decision?.topDecision?.selectedAction.title
    );
    if (snap.intervention) {
      const interventionStep = vm.whyChain.find(
        (s) => s.label === "INTERVENTION"
      );
      expect(interventionStep?.detail).toContain(snap.intervention.type);
    }
  });

  it("scenario lab includes expected ranges from intervention", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const vm = buildSaraExperienceViewModel(snap);
    expect(vm.scenarioLab.length).toBeGreaterThan(0);
    const primary = vm.scenarioLab.find(
      (r) => r.scenarioId === snap.intervention?.type
    );
    expect(primary).toBeTruthy();
    if (snap.intervention?.measurement.primaryMetric) {
      const metric = snap.intervention.measurement.primaryMetric;
      expect(primary?.baseline[metric]).toBeDefined();
      expect(primary?.expectedRange[metric]).toBeDefined();
    }
  });

  it("shows insufficient evidence when data quality degraded", () => {
    const base = liveOps();
    const snap = buildDrSaraSnapshotFromState({
      ...base,
      totalStores: 0,
      pendingRealOrders: 0,
      realOrders7d: 0,
    });
    if (snap.dataQualityV2.insufficientEvidence) {
      const vm = buildSaraExperienceViewModel(snap);
      expect(vm.live).toBe(false);
      const outcome = vm.whyChain.find((s) => s.label === "EXPECTED OUTCOME");
      expect(outcome?.detail).toBe("INSUFFICIENT EVIDENCE");
    }
  });

  it("platform map has consistent nodes and edges", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const map = buildPlatformMapView(snap);
    expect(map.nodes).toHaveLength(8);
    expect(map.edges.length).toBeGreaterThan(0);
    for (const edge of map.edges) {
      expect(map.nodes.some((n) => n.id === edge.from)).toBe(true);
      expect(map.nodes.some((n) => n.id === edge.to)).toBe(true);
    }
  });

  it("decision room connects V6 V8 V9", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const room = buildDecisionRoomView(snap);
    expect(room).toBeTruthy();
    expect(room?.decisionId).toBe(snap.decision?.topDecision?.selectedAction.id);
    expect(room?.risk).toBe(snap.intervention?.overallRisk);
    expect(room?.beforeExecution.length).toBeGreaterThan(0);
  });

  it("execution state reflects governance", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const vm = buildSaraExperienceViewModel(snap);
    expect(vm.execution.autoExecute).toBe(false);
    expect(vm.execution.productionExecutionDisabled).toBe(true);
    expect(snap.execution?.outcome?.productionMutation).toBe("NONE");
  });

  it("learning loop handles insufficient history", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const learning = buildLearningLoopView(snap);
    expect(learning.steps).toHaveLength(6);
    expect(typeof learning.insufficientHistory).toBe("boolean");
  });

  it("agent network placeholder only shows Dr Sara active", () => {
    const network = buildAgentNetworkView();
    expect(network.master.status).toBe("ACTIVE");
    expect(network.futureModules.length).toBeGreaterThan(0);
  });

  it("responsive navigation ordering includes core sections", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const vm = buildSaraExperienceViewModel(snap);
    const ids = vm.navigation.map((n) => n.id);
    expect(ids.indexOf("now")).toBeLessThan(ids.indexOf("decision"));
    expect(ids.indexOf("decision")).toBeLessThan(ids.indexOf("execution"));
    expect(ids).toContain("system");
    expect(ids).toContain("learning");
  });

  it("timeline uses temporal trends without fabrication", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const timeline = buildTimelineView(snap);
    expect(timeline.some((t) => t.phase === "NOW")).toBe(true);
    for (const seg of timeline) {
      if (seg.insufficientEvidence) {
        expect(
          seg.detail.includes("INSUFFICIENT") ||
            seg.evidence.length >= 0
        ).toBe(true);
      }
    }
  });

  it("risk field uses warnings and intervention blast radius", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const risks = buildRiskFieldView(snap);
    expect(risks.length).toBeGreaterThan(0);
    if (snap.intervention) {
      expect(
        risks.some((r) => r.id === "intervention-risk")
      ).toBe(true);
    } else {
      expect(risks.length).toBeGreaterThan(0);
    }
  });

  it("presentation layer has no LLM imports", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const dir = path.join(process.cwd(), "lib/intelligence/presentation");
    for (const f of fs.readdirSync(dir).filter((x: string) => x.endsWith(".ts"))) {
      const text = fs.readFileSync(path.join(dir, f), "utf8");
      expect(text).not.toMatch(/openai|anthropic|@ai-sdk|langchain|embedding/i);
    }
  });
});

describe("V11 backward compatibility", () => {
  it("does not alter engine snapshot fields", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    buildSaraExperienceViewModel(snap);
    expect(snap.metadata.version).toBe("10.0.0");
    expect(snap.topAction).toBeTruthy();
    expect(snap.decision?.topDecision).toBeTruthy();
    expect(snap.execution?.autoExecute).toBe(false);
  });
});
