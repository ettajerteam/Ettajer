/**
 * Dr Sara Design V2 + V11 presentation tests.
 */
import { describe, expect, it } from "vitest";
import { buildDrSaraSnapshotFromState } from "@/lib/intelligence/snapshot";
import { emptyPlatformState } from "@/lib/intelligence/platform-state";
import type { PlatformState } from "@/lib/intelligence/engine-types";
import {
  buildSaraExperienceViewModel,
  EXPERIENCE_VERSION,
  DESIGN_VERSION,
  buildPlatformMapView,
  buildTimelineView,
  buildScenarioLabView,
  buildDecisionRoomView,
  buildRiskFieldView,
  buildLearningLoopView,
  buildAgentNetworkView,
  opportunityLayout,
  riskLayout,
  SYSTEM_NODE_LAYOUT,
  stableHash,
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

describe("Design V2 experience model", () => {
  it("includes design version and arrival", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const vm = buildSaraExperienceViewModel(snap);
    expect(vm.version).toBe(EXPERIENCE_VERSION);
    expect(vm.designVersion).toBe(DESIGN_VERSION);
    expect(vm.designVersion).toBe("3.0.0");
    expect(vm.arrival.operatorName).toBe("Professor Salah");
    expect(vm.arrival.greeting.length).toBeGreaterThan(0);
    expect(vm.arrival.observationLine).toContain("observing");
    expect(vm.arrival.attentionCount).toBeGreaterThan(0);
    expect(vm.presence.label.length).toBeGreaterThan(0);
  });

  it("is deterministic including radar and risk positions", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const a = buildSaraExperienceViewModel(snap);
    const b = buildSaraExperienceViewModel(snap);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.opportunities.map((o) => [o.id, o.x, o.y])).toEqual(
      b.opportunities.map((o) => [o.id, o.x, o.y])
    );
    expect(a.riskField.map((r) => [r.id, r.x, r.y, r.scale])).toEqual(
      b.riskField.map((r) => [r.id, r.x, r.y, r.scale])
    );
  });

  it("stableHash and layouts are deterministic", () => {
    expect(stableHash("cod")).toBe(stableHash("cod"));
    const a = opportunityLayout("opp-1", "REVENUE", 0, 3);
    const b = opportunityLayout("opp-1", "REVENUE", 0, 3);
    expect(a).toEqual(b);
    const r1 = riskLayout("risk-1", "HIGH", 0, 4);
    const r2 = riskLayout("risk-1", "HIGH", 0, 4);
    expect(r1).toEqual(r2);
  });

  it("platform map has fixed coordinates and emphasis path", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const map = buildPlatformMapView(snap);
    expect(map.nodes).toHaveLength(8);
    for (const n of map.nodes) {
      expect(SYSTEM_NODE_LAYOUT[n.id]).toEqual({ x: n.x, y: n.y });
    }
    if (snap.decision?.topDecision?.selectedAction.id === "REVIEW_PENDING_COD") {
      expect(map.nodes.filter((n) => n.emphasis).map((n) => n.id).sort()).toEqual(
        ["operations", "payments", "support"].sort()
      );
      expect(map.edges.some((e) => e.active)).toBe(true);
    }
  });

  it("NOW exposes domain metric and review CTA", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const vm = buildSaraExperienceViewModel(snap);
    expect(vm.now.cta).toBe("Review decision");
    expect(vm.now.domain).toBeTruthy();
    expect(vm.now.relatedPath.length).toBeGreaterThan(0);
  });

  it("decision room CTA is Review decision", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const room = buildDecisionRoomView(snap);
    expect(room?.cta).toBe("Review decision");
  });

  it("agent network marks only Dr Sara active with fixed modules", () => {
    const network = buildAgentNetworkView();
    expect(network.modules.filter((m) => m.status === "ACTIVE")).toHaveLength(1);
    expect(network.modules.find((m) => m.id === "dr-sara")?.status).toBe("ACTIVE");
    expect(network.modules.some((m) => m.status === "FUTURE")).toBe(true);
  });

  it("learning loop has active step index", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const learning = buildLearningLoopView(snap);
    expect(learning.steps).toHaveLength(6);
    expect(learning.activeStepIndex).toBeGreaterThanOrEqual(0);
    expect(learning.activeStepIndex).toBeLessThan(learning.steps.length);
  });

  it("navigation narrative order", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const vm = buildSaraExperienceViewModel(snap);
    const ids = vm.navigation.map((n) => n.id);
    expect(ids.indexOf("now")).toBeLessThan(ids.indexOf("why"));
    expect(ids.indexOf("why")).toBeLessThan(ids.indexOf("system"));
    expect(ids.indexOf("system")).toBeLessThan(ids.indexOf("outcome"));
    expect(ids.indexOf("decision")).toBeLessThan(ids.indexOf("execution"));
    expect(ids).toContain("network");
  });

  it("preserves engine contract", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const vm = buildSaraExperienceViewModel(snap);
    expect(vm.engineVersion).toBe("10.0.0");
    expect(vm.autoExecute).toBe(false);
    expect(vm.productionMutation).toBe("NONE");
    expect(vm.preserved.topDecision).toBe(
      snap.decision?.topDecision?.selectedAction.id
    );
  });
});

describe("V11 regression under Design V2", () => {
  it("builds deterministic view model from snapshot", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const a = buildSaraExperienceViewModel(snap);
    const b = buildSaraExperienceViewModel(snap);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("why chain uses engine data", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const vm = buildSaraExperienceViewModel(snap);
    expect(vm.whyChain.length).toBeGreaterThan(2);
  });

  it("scenario lab includes expected ranges", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const rows = buildScenarioLabView(snap);
    expect(rows.length).toBeGreaterThan(0);
  });

  it("timeline uses temporal trends", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const timeline = buildTimelineView(snap);
    expect(timeline.some((t) => t.phase === "NOW")).toBe(true);
  });

  it("risk field includes intervention risk", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const risks = buildRiskFieldView(snap);
    if (snap.intervention) {
      expect(risks.some((r) => r.id === "intervention-risk")).toBe(true);
    }
  });

  it("presentation has no LLM imports", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const dir = path.join(process.cwd(), "lib/intelligence/presentation");
    for (const f of fs.readdirSync(dir).filter((x: string) => x.endsWith(".ts"))) {
      const text = fs.readFileSync(path.join(dir, f), "utf8");
      expect(text).not.toMatch(/openai|anthropic|@ai-sdk|langchain|embedding/i);
    }
  });
});
