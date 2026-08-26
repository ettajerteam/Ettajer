/**
 * Early warnings + opportunities — evidence-bound, no fake timing.
 */
import type { PlatformState } from "@/lib/intelligence/engine-types";
import type { EarlyWarning, Opportunity } from "@/lib/intelligence/os/types";

export function detectOsEarlyWarnings(state: PlatformState): EarlyWarning[] {
  const out: EarlyWarning[] = [];

  if (state.pendingRealOrders >= 10) {
    out.push({
      id: "warn_cod_backlog",
      severity: state.pendingRealOrders >= 20 ? "CRITICAL" : "HIGH",
      title: "COD backlog elevated",
      evidence: [`pendingRealOrders=${state.pendingRealOrders}`],
      trajectory: "Backlog pressure on fulfillment trust",
      estimatedHorizon: "INSUFFICIENT_EVIDENCE_FOR_EXACT_TIMING",
      recommendedResponse: "COD_VERIFICATION",
    });
  }
  if (state.domainFailing >= 3) {
    out.push({
      id: "warn_dns_spike",
      severity: "HIGH",
      title: "DNS failure cluster",
      evidence: [`domainFailing=${state.domainFailing}`],
      trajectory: "Storefront accessibility degradation",
      estimatedHorizon: "INSUFFICIENT_EVIDENCE_FOR_EXACT_TIMING",
      recommendedResponse: "DNS_DIAGNOSIS",
    });
  }
  if (state.openSupport >= 3) {
    out.push({
      id: "warn_support_growth",
      severity: "MEDIUM",
      title: "Support backlog growth",
      evidence: [`openSupport=${state.openSupport}`],
      trajectory: "Merchant trust / retention risk",
      estimatedHorizon: "INSUFFICIENT_EVIDENCE_FOR_EXACT_TIMING",
      recommendedResponse: "SUPPORT_ESCALATION",
    });
  }
  if (state.concentrationElevated || state.top2SharePct >= 60) {
    out.push({
      id: "warn_gmv_concentration",
      severity: "MEDIUM",
      title: "GMV concentration elevated",
      evidence: [`top2SharePct=${state.top2SharePct}`],
      trajectory: "Platform revenue fragility",
      estimatedHorizon: "MEDIUM_TERM",
      recommendedResponse: "REVENUE_CONCENTRATION_REVIEW",
    });
  }
  if (state.ordersChange7d < -20) {
    out.push({
      id: "warn_order_velocity",
      severity: "HIGH",
      title: "Order velocity collapse signal",
      evidence: [`ordersChange7d=${state.ordersChange7d}`],
      trajectory: "Demand / conversion degradation",
      estimatedHorizon: "SHORT_TERM",
      recommendedResponse: "Review ops + activation",
    });
  }
  if (state.hotEmptyCount >= 5) {
    out.push({
      id: "warn_merchant_inactivity",
      severity: "MEDIUM",
      title: "Empty-store activity without catalog",
      evidence: [`hotEmptyCount=${state.hotEmptyCount}`],
      trajectory: "Activation decay risk",
      estimatedHorizon: "MEDIUM_TERM",
      recommendedResponse: "ACTIVATION_OUTREACH",
    });
  }

  return out.sort((a, b) => a.id.localeCompare(b.id));
}

export function detectOsOpportunities(state: PlatformState): Opportunity[] {
  const out: Opportunity[] = [];

  if (state.firstSaleHighIntent >= 20) {
    out.push({
      id: "opp_high_intent",
      title: "High-intent first-sale cluster",
      impact: "HIGH",
      confidence: 0.7,
      evidence: [`firstSaleHighIntent=${state.firstSaleHighIntent}`],
      recommendedAction: "FIRST_SALE_ASSISTANCE",
    });
  }
  if (state.ordersChange7d > 10) {
    out.push({
      id: "opp_order_momentum",
      title: "Order momentum",
      impact: "MEDIUM",
      confidence: 0.65,
      evidence: [`ordersChange7d=${state.ordersChange7d}`],
      recommendedAction: "Protect fulfillment capacity",
    });
  }
  if (state.revenueChange7d > 10) {
    out.push({
      id: "opp_gmv_momentum",
      title: "GMV momentum",
      impact: "MEDIUM",
      confidence: 0.65,
      evidence: [`revenueChange7d=${state.revenueChange7d}`],
      recommendedAction: "Reinforce winning segments without over-concentration",
    });
  }
  if (state.pendingRealOrders === 0 && state.domainFailing === 0) {
    out.push({
      id: "opp_stable_ops",
      title: "Stable operations window",
      impact: "LOW",
      confidence: 0.6,
      evidence: ["No COD backlog; no DNS failures"],
      recommendedAction: "Prioritize activation / growth",
    });
  }

  return out.sort((a, b) => a.id.localeCompare(b.id));
}
