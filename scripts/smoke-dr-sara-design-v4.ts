/**
 * Smoke check — Dr Sara Design V4 (glass morphism / Academy-aligned).
 * Run: npx tsx scripts/smoke-dr-sara-design-v4.ts
 */
import {
  buildSaraExperienceViewModel,
  DESIGN_VERSION,
  EXPERIENCE_VERSION,
} from "@/lib/intelligence/presentation";
import { buildDrSaraSnapshotFromState } from "@/lib/intelligence/snapshot";
import { emptyPlatformState } from "@/lib/intelligence/platform-state";
import type { PlatformState } from "@/lib/intelligence/engine-types";

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

const snap = buildDrSaraSnapshotFromState(
  state({
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
  })
);

const vm = buildSaraExperienceViewModel(snap);

console.log(`experienceVersion: ${EXPERIENCE_VERSION}`);
console.log(`designVersion: ${DESIGN_VERSION}`);
console.log(`vm.designVersion: ${vm.designVersion}`);
console.log(`arrival: ${vm.arrival.headline}`);
console.log(`presence: ${vm.presence.status}`);
console.log(`now.cta: ${vm.now.cta}`);
console.log(`decision.cta: ${vm.decisionRoom?.cta ?? "—"}`);
console.log(`productionMutation: ${vm.productionMutation}`);

if (DESIGN_VERSION !== "4.0.0") {
  console.error("FAIL: expected DESIGN_VERSION 4.0.0");
  process.exit(1);
}
if (vm.now.cta.toLowerCase().includes("execute")) {
  console.error("FAIL: CTA must not say Execute");
  process.exit(1);
}
if (vm.productionMutation !== "NONE") {
  console.error("FAIL: productionMutation must be NONE");
  process.exit(1);
}

console.log("OK — Design V4 glass experience model healthy");
