import type { Evidence } from "@/lib/intelligence/engine-types";

export type JourneyStage =
  | "SIGNED_UP"
  | "STORE_CREATED"
  | "PRODUCT_ADDED"
  | "STORE_PUBLISHED"
  | "TRAFFIC"
  | "FIRST_ORDER"
  | "FIRST_DELIVERED_ORDER"
  | "REPEAT_ORDERS"
  | "GROWING"
  | "POWER";

export type MerchantBottleneckCode =
  | "NO_STORE"
  | "NO_PRODUCTS"
  | "NO_PUBLISHED_PRODUCTS"
  | "NO_TRAFFIC"
  | "NO_FIRST_ORDER"
  | "NO_COD"
  | "NO_DOMAIN"
  | "ORDER_VERIFICATION_DELAY"
  | "MERCHANT_DORMANCY"
  | "SUPPORT_DELAY"
  | "NONE";

export type MerchantJourney = {
  merchantId: string;
  storeId?: string;
  storeName?: string;
  stage: JourneyStage;
  bottleneck: MerchantBottleneckCode;
  reasons: string[];
  evidence: Evidence[];
  recommendedAction: string;
  actionHref: string;
  healthScore: number;
  dimensions: {
    activation: number;
    catalog: number;
    traffic: number;
    conversion: number;
    operations: number;
    revenue: number;
    retention: number;
    technical: number;
  };
};

export type MerchantFacts = {
  merchantId: string;
  storeId?: string;
  storeName?: string;
  hasStore: boolean;
  productCount: number;
  activeProductCount: number;
  realOrders: number;
  realGmv?: number;
  sharePct?: number;
  recentLogin: boolean;
  hasCustomDomain?: boolean;
  codConfigured?: boolean;
  healthScore?: number;
  intent?: string;
};

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function detectMerchantBottleneck(
  facts: MerchantFacts
): MerchantBottleneckCode {
  if (!facts.hasStore) return "NO_STORE";
  if (facts.productCount <= 0) return "NO_PRODUCTS";
  if (facts.activeProductCount <= 0) return "NO_PUBLISHED_PRODUCTS";
  if (facts.codConfigured === false) return "NO_COD";
  if (facts.hasCustomDomain === false && facts.realOrders === 0) return "NO_DOMAIN";
  if (facts.realOrders === 0) return "NO_FIRST_ORDER";
  if (!facts.recentLogin && facts.realOrders > 0) return "MERCHANT_DORMANCY";
  return "NONE";
}

export function inferJourneyStage(facts: MerchantFacts): JourneyStage {
  if ((facts.sharePct ?? 0) >= 10 || (facts.realGmv ?? 0) > 5000) return "POWER";
  if (facts.realOrders >= 3) return "GROWING";
  if (facts.realOrders >= 2) return "REPEAT_ORDERS";
  if (facts.realOrders >= 1) return "FIRST_ORDER";
  if (facts.activeProductCount > 0) return "STORE_PUBLISHED";
  if (facts.productCount > 0) return "PRODUCT_ADDED";
  if (facts.hasStore) return "STORE_CREATED";
  return "SIGNED_UP";
}

/**
 * Deterministic merchant health dimensions with evidence.
 * Traffic/conversion are partial when pageviews unavailable — scored conservatively.
 */
export function scoreMerchantDimensions(facts: MerchantFacts): MerchantJourney["dimensions"] & {
  evidence: Evidence[];
  score: number;
} {
  const activation = clamp(
    (facts.hasStore ? 40 : 0) +
      (facts.recentLogin ? 40 : 10) +
      (facts.productCount > 0 ? 20 : 0)
  );
  const catalog = clamp(
    facts.activeProductCount >= 3
      ? 100
      : facts.activeProductCount >= 1
        ? 70
        : facts.productCount > 0
          ? 40
          : 0
  );
  // No pageview series in overview sample — traffic unknown ⇒ mid-low unless orders prove demand
  const traffic = facts.realOrders > 0 ? 60 : facts.recentLogin ? 34 : 15;
  const conversion =
    facts.realOrders > 0 ? clamp(40 + facts.realOrders * 15) : 0;
  const operations = facts.codConfigured === false ? 40 : 90;
  const revenue = clamp(
    Math.min(100, ((facts.realGmv ?? 0) / 1000) * 10 + facts.realOrders * 8)
  );
  const retention =
    facts.realOrders >= 2 ? 75 : facts.realOrders === 1 ? 40 : 10;
  const technical =
    facts.hasCustomDomain === false
      ? 55
      : facts.hasCustomDomain === true
        ? 85
        : 70;

  const score = clamp(
    activation * 0.15 +
      catalog * 0.15 +
      traffic * 0.1 +
      conversion * 0.2 +
      operations * 0.1 +
      revenue * 0.15 +
      retention * 0.05 +
      technical * 0.1
  );

  return {
    activation,
    catalog,
    traffic,
    conversion,
    operations,
    revenue,
    retention,
    technical,
    score,
    evidence: [
      { label: "hasStore", value: facts.hasStore, source: "merchant.facts" },
      { label: "activeProducts", value: facts.activeProductCount, source: "merchant.facts" },
      { label: "realOrders", value: facts.realOrders, source: "merchant.facts" },
      { label: "recentLogin", value: facts.recentLogin, source: "merchant.facts" },
      { label: "codConfigured", value: facts.codConfigured ?? null, source: "merchant.facts" },
      { label: "hasCustomDomain", value: facts.hasCustomDomain ?? null, source: "merchant.facts" },
    ],
  };
}

export function buildMerchantJourney(facts: MerchantFacts): MerchantJourney {
  const bottleneck = detectMerchantBottleneck(facts);
  const stage = inferJourneyStage(facts);
  const dims = scoreMerchantDimensions(facts);
  const reasons: string[] = [];
  if (facts.productCount === 0) reasons.push("catalog_empty");
  if (facts.activeProductCount > 0 && facts.realOrders === 0) {
    reasons.push("catalog_ready");
    reasons.push("zero_orders");
  }
  if (facts.recentLogin) reasons.push("active");
  if (facts.hasCustomDomain === false) reasons.push("no_custom_domain");
  if (facts.codConfigured === false) reasons.push("no_cod");

  let recommendedAction = "Review merchant";
  let actionHref = facts.storeId
    ? `/admin/stores/${facts.storeId}`
    : "/admin/activation";
  if (bottleneck === "NO_PRODUCTS") {
    recommendedAction = "FIRST_SALE_ASSISTANCE — help list products";
    actionHref = "/admin/activation?stage=empty&temp=hot";
  } else if (bottleneck === "NO_FIRST_ORDER" || bottleneck === "NO_DOMAIN") {
    recommendedAction = "FIRST_SALE_ASSISTANCE";
    actionHref = "/admin/activation?stage=listed";
  } else if (bottleneck === "NO_COD") {
    recommendedAction = "Enable COD configuration";
    actionHref = "/admin/activation?stage=listed";
  }

  return {
    merchantId: facts.merchantId,
    storeId: facts.storeId,
    storeName: facts.storeName,
    stage,
    bottleneck,
    reasons,
    evidence: dims.evidence,
    recommendedAction,
    actionHref,
    healthScore: facts.healthScore ?? dims.score,
    dimensions: {
      activation: dims.activation,
      catalog: dims.catalog,
      traffic: dims.traffic,
      conversion: dims.conversion,
      operations: dims.operations,
      revenue: dims.revenue,
      retention: dims.retention,
      technical: dims.technical,
    },
  };
}
