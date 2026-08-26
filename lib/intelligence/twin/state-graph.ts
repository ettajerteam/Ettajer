/**
 * Deterministic state dependency graph — only explicit rule-supported edges.
 */
import type { PlatformState } from "@/lib/intelligence/engine-types";
import type {
  TwinEdge,
  TwinRelationKind,
  TwinRelationshipLabel,
} from "@/lib/intelligence/twin/types";

function edge(input: {
  from: string;
  to: string;
  kind: TwinRelationKind;
  relationship: TwinRelationshipLabel;
  strength: number;
  evidence: string;
  ruleId: string;
  explanation: string;
}): TwinEdge {
  return input;
}

export function buildStateGraph(state: PlatformState): TwinEdge[] {
  const edges: TwinEdge[] = [
    edge({
      from: "merchant",
      to: "store",
      kind: "CAUSAL_SUPPORTED",
      relationship: "dependency",
      strength: 1,
      evidence: "Store ownership is a structural platform dependency.",
      ruleId: "TWIN_EDGE_MERCHANT_STORE",
      explanation: "Every store belongs to a merchant account.",
    }),
    edge({
      from: "store",
      to: "product",
      kind: "CAUSAL_SUPPORTED",
      relationship: "dependency",
      strength: 0.95,
      evidence: "Catalog products require a store container.",
      ruleId: "TWIN_EDGE_STORE_PRODUCT",
      explanation: "Products are scoped to stores.",
    }),
    edge({
      from: "DOMAIN_HEALTH",
      to: "STOREFRONT_ACCESS",
      kind: "CAUSAL_SUPPORTED",
      relationship: "inferred causal relationship",
      strength: 0.9,
      evidence: "Live DNS checks gate custom-domain storefront reach.",
      ruleId: "TWIN_EDGE_DOMAIN_STOREFRONT",
      explanation:
        "Healthy DNS is a prerequisite for reliable custom-domain storefront access.",
    }),
    edge({
      from: "PRODUCTS",
      to: "STORE_READY",
      kind: "CAUSAL_SUPPORTED",
      relationship: "dependency",
      strength: 0.95,
      evidence: "Published products required for catalog readiness.",
      ruleId: "TWIN_EDGE_PRODUCTS_READY",
      explanation: "Published products are required for a storefront catalog.",
    }),
    edge({
      from: "STORE_READY",
      to: "FIRST_ORDER",
      kind: "CORRELATION_ONLY",
      relationship: "correlation",
      strength: 0.45,
      evidence:
        "Catalog readiness correlates with first-order opportunity; traffic not measured.",
      ruleId: "TWIN_EDGE_READY_FIRST_ORDER",
      explanation:
        "Catalog readiness correlates with first-order opportunity; traffic not measured here.",
    }),
    edge({
      from: "checkout",
      to: "order",
      kind: "CAUSAL_SUPPORTED",
      relationship: "dependency",
      strength: 1,
      evidence: "Orders are created through checkout.",
      ruleId: "TWIN_EDGE_CHECKOUT_ORDER",
      explanation: "Checkout produces orders.",
    }),
    edge({
      from: "order",
      to: "verification",
      kind: "CAUSAL_SUPPORTED",
      relationship: "observed relationship",
      strength: 0.85,
      evidence: "Pending real COD orders await verification before processing.",
      ruleId: "TWIN_EDGE_ORDER_VERIFICATION",
      explanation: "COD orders enter verification before courier handoff.",
    }),
    edge({
      from: "ORDERS",
      to: "GMV",
      kind: "CAUSAL_SUPPORTED",
      relationship: "inferred causal relationship",
      strength: 1,
      evidence: "Real GMV is the sum of real order values.",
      ruleId: "TWIN_EDGE_ORDERS_GMV",
      explanation: "Real orders compose real GMV by definition.",
    }),
    edge({
      from: "COD_VERIFICATION",
      to: "OPERATIONS_HEALTH",
      kind: "CAUSAL_SUPPORTED",
      relationship: "inferred causal relationship",
      strength: 0.85,
      evidence: "Pending COD backlog pressures operations health score.",
      ruleId: "TWIN_EDGE_COD_OPS",
      explanation: "Clearing pending COD reduces operational backlog pressure.",
    }),
    edge({
      from: "merchant",
      to: "custom_domain",
      kind: "CORRELATION_ONLY",
      relationship: "correlation",
      strength: 0.5,
      evidence: "Domain attachment is optional per merchant.",
      ruleId: "TWIN_EDGE_MERCHANT_DOMAIN",
      explanation: "Merchants may attach custom domains for storefront reach.",
    }),
  ];

  if (state.domainFailing > 0) {
    edges.push(
      edge({
        from: "DOMAIN_FAILURE",
        to: "ACTIVATION",
        kind: "CAUSAL_SUPPORTED",
        relationship: "inferred causal relationship",
        strength: 0.9,
        evidence: `domainFailing=${state.domainFailing} blocks activation outreach.`,
        ruleId: "TWIN_EDGE_DNS_BLOCKS_ACTIVATION",
        explanation: "Broken domains block activation outreach effectiveness.",
      })
    );
  }

  if (
    state.firstSaleCount > 0 &&
    state.firstSaleBottlenecks.noCustomDomain > 0
  ) {
    edges.push(
      edge({
        from: "NO_CUSTOM_DOMAIN",
        to: "FIRST_SALE_FRICTION",
        kind: "CORRELATION_ONLY",
        relationship: "correlation",
        strength: 0.4,
        evidence: `noCustomDomain=${state.firstSaleBottlenecks.noCustomDomain} among first-sale cohort.`,
        ruleId: "TWIN_EDGE_DOMAIN_FIRST_SALE",
        explanation:
          "Missing domains correlate with first-sale friction — not proven causation.",
      })
    );
  }

  if (state.loggedInEmpty7d > 0) {
    edges.push(
      edge({
        from: "merchant_activity",
        to: "activation_probability",
        kind: "CORRELATION_ONLY",
        relationship: "correlation",
        strength: 0.55,
        evidence: `loggedInEmpty7d=${state.loggedInEmpty7d} indicates recent empty-store activity.`,
        ruleId: "TWIN_EDGE_ACTIVITY_ACTIVATION",
        explanation:
          "Recent login on empty stores correlates with activation opportunity.",
      })
    );
  }

  return edges;
}
