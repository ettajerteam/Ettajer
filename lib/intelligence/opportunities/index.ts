import type {
  Opportunity,
  PlatformState,
} from "@/lib/intelligence/engine-types";
import { INTELLIGENCE_THRESHOLDS as T } from "@/lib/intelligence/thresholds";

export function getOpportunities(state: PlatformState): Opportunity[] {
  const out: Opportunity[] = [];

  if (T.emptyStoreOpportunity && state.loggedInEmpty7d > 0) {
    out.push({
      id: "opp-hot-empty",
      title: "Recently active empty stores",
      impact: "High — merchants already engaged this week",
      confidence: 0.9,
      affectedCount: state.loggedInEmpty7d,
      reason: `Logged in during the last ${T.activationWindowDays} days with zero products.`,
      href: "/admin/activation?stage=empty&temp=hot",
      cta: "Open activation",
      ruleId: "activation.empty_store && merchant.logged_in_within_window",
      evidence: [
        {
          label: "loggedInEmpty7d",
          value: state.loggedInEmpty7d,
          source: "activation.gap",
        },
      ],
    });
  }

  if (state.firstSaleCount > 0) {
    out.push({
      id: "opp-first-sale",
      title: "Stores with products but zero sales",
      impact: "High — closest to first real GMV",
      confidence: 0.92,
      affectedCount: state.firstSaleCount,
      reason:
        state.firstSaleHighIntent > 0
          ? `${state.firstSaleHighIntent} show high intent (recent activity).`
          : "Catalog is live; commerce has not started.",
      href: "/admin/activation?stage=listed",
      cta: "View first-sale queue",
      ruleId: "activation.live_products && realOrders = 0",
      evidence: [
        {
          label: "firstSaleCount",
          value: state.firstSaleCount,
          source: "activation.funnel",
        },
        {
          label: "firstSaleHighIntent",
          value: state.firstSaleHighIntent,
          source: "activation.temperature",
        },
      ],
    });
  }

  if (state.firstSaleBottlenecks.noCodConfigured > 0) {
    out.push({
      id: "opp-cod-config",
      title: "First-sale stores missing COD configuration",
      impact: "Medium — unlocks checkout completion",
      confidence: 0.85,
      affectedCount: state.firstSaleBottlenecks.noCodConfigured,
      reason: "Products live but cash-on-delivery not configured.",
      href: "/admin/activation?stage=listed",
      cta: "Review COD readiness",
      ruleId: "activation.first_sale && !cod_configured",
      evidence: [
        {
          label: "noCodConfigured",
          value: state.firstSaleBottlenecks.noCodConfigured,
          source: "store.settings",
        },
      ],
    });
  }

  if (state.firstSaleBottlenecks.noCustomDomain > 0) {
    out.push({
      id: "opp-domain-setup",
      title: "Merchants with products but no custom domain",
      impact: "Medium — improves shareability",
      confidence: 0.8,
      affectedCount: state.firstSaleBottlenecks.noCustomDomain,
      reason: "Live catalog without a branded custom domain.",
      href: "/admin/domains",
      cta: "View domains",
      ruleId: "activation.first_sale && !custom_domain",
      evidence: [
        {
          label: "noCustomDomain",
          value: state.firstSaleBottlenecks.noCustomDomain,
          source: "store.settings",
        },
      ],
    });
  }

  if (state.ordersChange7d > 0 && state.realOrders7d > 0) {
    out.push({
      id: "opp-growing",
      title: "Merchants with recent order growth",
      impact: "Positive — reinforce winning motion",
      confidence: 0.88,
      affectedCount: state.concentration.filter((c) => c.orders > 0).length,
      reason: `Real orders ${state.ordersChange7d > 0 ? "+" : ""}${state.ordersChange7d}% vs prior 7 days.`,
      href: "/admin/analytics?range=7",
      cta: "View analytics",
      ruleId: "revenue.orders_change_7d > 0",
      evidence: [
        {
          label: "ordersChange7d",
          value: state.ordersChange7d,
          source: "platform.analytics",
        },
        {
          label: "realOrders7d",
          value: state.realOrders7d,
          source: "platform.analytics",
        },
      ],
    });
  }

  if (state.helpToday.length > 0) {
    out.push({
      id: "opp-help-today",
      title: "Who should we help today",
      impact: "Operational — ranked help list",
      confidence: 0.9,
      affectedCount: state.helpToday.length,
      reason: "Merchants scored for activation health / bottlenecks today.",
      href: "/admin/activation",
      cta: "Open help list",
      ruleId: "merchant.help_today.length > 0",
      evidence: state.helpToday.slice(0, 3).map((h) => ({
        label: h.storeName,
        value: h.intent,
        source: "merchant.health",
      })),
    });
  }

  return out.slice(0, 8);
}
