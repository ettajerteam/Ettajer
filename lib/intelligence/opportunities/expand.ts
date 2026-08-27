/**
 * Expanded opportunities + negative signal detection (evidence-only).
 */
import type { Evidence, Opportunity, PlatformState } from "@/lib/intelligence/engine-types";
import { getOpportunities } from "@/lib/intelligence/opportunities";

export type NegativeSignal = {
  id: string;
  ruleId: string;
  title: string;
  evidence: Evidence[];
  confidence: number;
  recommendedAction: { label: string; href: string };
  note: string;
};

/**
 * Detect absence-of-expected-behavior ONLY when supporting metrics exist.
 * Does not invent traffic/visits — returns empty when those metrics are unavailable.
 */
export function detectNegativeSignals(state: PlatformState): NegativeSignal[] {
  const out: NegativeSignal[] = [];

  // Retention gap: has orders but concentration of one-timers is not directly
  // measured — use funnel hasOrders vs growing concentration count as weak proxy only
  // when we have selling merchants with zero recent change.
  if (
    state.funnel.hasOrders > 0 &&
    state.ordersChange7d < 0 &&
    state.realOrders7d > 0
  ) {
    out.push({
      id: "neg-retention-gap",
      ruleId: "NEGATIVE_RETENTION_GAP",
      title: "Order velocity declining among selling base",
      evidence: [
        {
          label: "ordersChange7d",
          value: state.ordersChange7d,
          source: "platform.analytics",
        },
        {
          label: "hasOrders",
          value: state.funnel.hasOrders,
          source: "activation.funnel",
        },
      ],
      confidence: 0.7,
      recommendedAction: {
        label: "Review merchant retention",
        href: "/admin/analytics?range=7",
      },
      note: "Consistent with RETENTION_GAP when repeat velocity is not separately available.",
    });
  }

  // Catalog ready but zero orders — checkout/trust friction hypothesis only as soft signal
  if (
    state.firstSaleCount > 0 &&
    state.firstSaleBottlenecks.noCodConfigured > 0
  ) {
    out.push({
      id: "neg-checkout-friction",
      ruleId: "NEGATIVE_CHECKOUT_FRICTION",
      title: "Catalog-ready stores missing COD configuration",
      evidence: [
        {
          label: "firstSaleCount",
          value: state.firstSaleCount,
          source: "activation.funnel",
        },
        {
          label: "noCodConfigured",
          value: state.firstSaleBottlenecks.noCodConfigured,
          source: "store.settings",
        },
      ],
      confidence: 0.75,
      recommendedAction: {
        label: "Review COD readiness",
        href: "/admin/activation?stage=listed",
      },
      note: "May indicate CHECKOUT_FRICTION — not claimed as proven causation.",
    });
  }

  return out;
}

export function expandOpportunities(state: PlatformState): Opportunity[] {
  const base = getOpportunities(state);
  const extra: Opportunity[] = [];

  if (state.revenueChange7d >= 20 && state.realOrders7d > 0) {
    extra.push({
      id: "opp-rising-gmv",
      title: "Rising GMV momentum",
      impact: "Reinforce growing merchants",
      confidence: 0.8,
      affectedCount: state.concentration.length,
      reason: `Real GMV ${state.revenueChange7d}% / 7d with ${state.realOrders7d} real orders.`,
      href: "/admin/analytics?range=7",
      cta: "Review momentum",
      evidence: [
        {
          label: "revenueChange7d",
          value: state.revenueChange7d,
          source: "platform.analytics",
        },
      ],
      ruleId: "OPPORTUNITY_RISING_GMV",
    });
  }

  if (state.firstSaleHighIntent > 0) {
    extra.push({
      id: "opp-near-first-sale",
      title: "Merchants near first sale",
      impact: "Convert high-intent catalog-ready stores",
      confidence: 0.85,
      affectedCount: state.firstSaleHighIntent,
      reason: `${state.firstSaleHighIntent} high-intent merchants in first-sale pool.`,
      href: "/admin/activation?stage=listed",
      cta: "Assist first sale",
      evidence: [
        {
          label: "firstSaleHighIntent",
          value: state.firstSaleHighIntent,
          source: "activation.temperature",
        },
      ],
      ruleId: "OPPORTUNITY_NEAR_FIRST_SALE",
    });
  }

  if (state.loggedInEmpty7d > 0) {
    extra.push({
      id: "opp-catalog-expand",
      title: "Recently active empty stores",
      impact: "Catalog creation while intent is hot",
      confidence: 0.8,
      affectedCount: state.loggedInEmpty7d,
      reason: `${state.loggedInEmpty7d} empty stores logged in within activation window.`,
      href: "/admin/activation?stage=empty&temp=hot",
      cta: "Help empty stores",
      evidence: [
        {
          label: "loggedInEmpty7d",
          value: state.loggedInEmpty7d,
          source: "activation.temperature",
        },
      ],
      ruleId: "OPPORTUNITY_CATALOG_EXPAND",
    });
  }

  // Dedupe by id
  const seen = new Set<string>();
  const merged = [...base, ...extra].filter((o) => {
    if (seen.has(o.id)) return false;
    seen.add(o.id);
    return true;
  });
  return merged;
}
