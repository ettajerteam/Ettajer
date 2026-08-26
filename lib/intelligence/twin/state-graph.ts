/**
 * Deterministic state dependency graph — only explicit rule-supported edges.
 */
import type { PlatformState } from "@/lib/intelligence/engine-types";
import type { TwinEdge } from "@/lib/intelligence/twin/types";

export function buildStateGraph(state: PlatformState): TwinEdge[] {
  const edges: TwinEdge[] = [
    {
      from: "DOMAIN_HEALTH",
      to: "STOREFRONT_ACCESS",
      kind: "CAUSAL_SUPPORTED",
      ruleId: "TWIN_EDGE_DOMAIN_STOREFRONT",
      explanation:
        "Healthy DNS is a prerequisite for reliable custom-domain storefront access.",
    },
    {
      from: "PRODUCTS",
      to: "STORE_READY",
      kind: "CAUSAL_SUPPORTED",
      ruleId: "TWIN_EDGE_PRODUCTS_READY",
      explanation: "Published products are required for a storefront catalog.",
    },
    {
      from: "STORE_READY",
      to: "FIRST_ORDER",
      kind: "CORRELATION_ONLY",
      ruleId: "TWIN_EDGE_READY_FIRST_ORDER",
      explanation:
        "Catalog readiness correlates with first-order opportunity; traffic not measured here.",
    },
    {
      from: "ORDERS",
      to: "GMV",
      kind: "CAUSAL_SUPPORTED",
      ruleId: "TWIN_EDGE_ORDERS_GMV",
      explanation: "Real orders compose real GMV by definition.",
    },
    {
      from: "COD_VERIFICATION",
      to: "OPERATIONS_HEALTH",
      kind: "CAUSAL_SUPPORTED",
      ruleId: "TWIN_EDGE_COD_OPS",
      explanation: "Clearing pending COD reduces operational backlog pressure.",
    },
  ];

  if (state.domainFailing > 0) {
    edges.push({
      from: "DOMAIN_FAILURE",
      to: "ACTIVATION",
      kind: "CAUSAL_SUPPORTED",
      ruleId: "TWIN_EDGE_DNS_BLOCKS_ACTIVATION",
      explanation: "Broken domains block activation outreach effectiveness.",
    });
  }

  if (state.firstSaleCount > 0 && state.firstSaleBottlenecks.noCustomDomain > 0) {
    edges.push({
      from: "NO_CUSTOM_DOMAIN",
      to: "FIRST_SALE_FRICTION",
      kind: "CORRELATION_ONLY",
      ruleId: "TWIN_EDGE_DOMAIN_FIRST_SALE",
      explanation:
        "Missing domains correlate with first-sale friction — not proven causation.",
    });
  }

  return edges;
}
