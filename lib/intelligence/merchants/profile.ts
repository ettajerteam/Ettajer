import type { Evidence } from "@/lib/intelligence/engine-types";
import type { MerchantFacts } from "@/lib/intelligence/merchants/journey";
import {
  buildMerchantJourney,
  detectMerchantBottleneck,
  inferJourneyStage,
} from "@/lib/intelligence/merchants/journey";
import { INTELLIGENCE_SCORING_CONFIG as S } from "@/lib/intelligence/config/scoring";

export type MerchantLifecycle =
  | "CREATED"
  | "EMPTY"
  | "CATALOG_READY"
  | "CHECKOUT_READY"
  | "FIRST_SALE_PENDING"
  | "FIRST_SALE"
  | "REPEAT_SALES"
  | "GROWING"
  | "POWER"
  | "DORMANT"
  | "AT_RISK";

export type ScoreBreakdown = {
  score: number;
  formula: string;
  inputs: Record<string, number | boolean>;
  evidence: Evidence[];
  confidence: number;
};

export type MerchantIntelligenceProfile = {
  merchantId: string;
  storeId?: string;
  storeName?: string;
  lifecycleStage: MerchantLifecycle;
  activityState: "hot" | "warm" | "cold";
  commerceState: "none" | "ready" | "selling" | "growing";
  activationHealth: number;
  conversionHealth: number;
  operationalHealth: number;
  revenueHealth: number;
  technicalHealth: number;
  currentBottleneck: string;
  previousBottleneck: string | null;
  trend: "up" | "down" | "flat" | "unknown";
  risk: string | null;
  opportunity: string | null;
  intentScore: ScoreBreakdown;
  activationScore: ScoreBreakdown;
  commerceReadinessScore: ScoreBreakdown;
  firstSaleProbabilityProxy: ScoreBreakdown;
  churnRisk: ScoreBreakdown;
  interventionScore: number;
  evidence: Evidence[];
  recommendedActions: { label: string; href: string }[];
  forecast: string;
  explainability: string;
};

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function lifecycleFromFacts(facts: MerchantFacts): MerchantLifecycle {
  if ((facts.sharePct ?? 0) >= 10 || (facts.realGmv ?? 0) > 5000) return "POWER";
  if (facts.realOrders >= 3) return "GROWING";
  if (facts.realOrders >= 2) return "REPEAT_SALES";
  if (facts.realOrders >= 1) return "FIRST_SALE";
  if (
    facts.activeProductCount > 0 &&
    facts.codConfigured !== false &&
    facts.recentLogin
  ) {
    return "FIRST_SALE_PENDING";
  }
  if (facts.activeProductCount > 0 && facts.codConfigured !== false) {
    return "CHECKOUT_READY";
  }
  if (facts.activeProductCount > 0) return "CATALOG_READY";
  if (facts.hasStore && facts.productCount === 0) {
    return facts.recentLogin ? "EMPTY" : "DORMANT";
  }
  if (!facts.hasStore) return "CREATED";
  if (!facts.recentLogin && facts.realOrders === 0) return "DORMANT";
  return "CREATED";
}

export function scoreIntent(facts: MerchantFacts): ScoreBreakdown {
  const w = S.intent;
  const recentActivity = facts.recentLogin ? w.recentActivity : 0;
  const productReadiness =
    facts.activeProductCount >= 3
      ? w.productReadiness
      : facts.activeProductCount >= 1
        ? Math.round(w.productReadiness * 0.7)
        : 0;
  const checkoutReadiness =
    facts.codConfigured === false ? 0 : facts.codConfigured === true ? w.checkoutReadiness : Math.round(w.checkoutReadiness * 0.5);
  const storefrontReadiness =
    facts.hasCustomDomain === true
      ? w.storefrontReadiness
      : facts.hasCustomDomain === false
        ? Math.round(w.storefrontReadiness * 0.3)
        : Math.round(w.storefrontReadiness * 0.5);
  const trafficSignals = facts.realOrders > 0 ? w.trafficSignals : facts.recentLogin ? Math.round(w.trafficSignals * 0.4) : 0;
  const score = clamp(
    recentActivity + productReadiness + checkoutReadiness + storefrontReadiness + trafficSignals
  );
  return {
    score,
    formula:
      "intent = recentActivity + productReadiness + checkoutReadiness + storefrontReadiness + trafficSignals",
    inputs: {
      recentActivity,
      productReadiness,
      checkoutReadiness,
      storefrontReadiness,
      trafficSignals,
    },
    evidence: [
      { label: "recentLogin", value: facts.recentLogin, source: "merchant.facts" },
      { label: "activeProductCount", value: facts.activeProductCount, source: "merchant.facts" },
      { label: "codConfigured", value: facts.codConfigured ?? null, source: "merchant.facts" },
      { label: "hasCustomDomain", value: facts.hasCustomDomain ?? null, source: "merchant.facts" },
    ],
    confidence: 0.85,
  };
}

export function scoreActivation(facts: MerchantFacts): ScoreBreakdown {
  const w = S.activation;
  const inputs = {
    hasStore: facts.hasStore ? w.hasStore : 0,
    hasProducts: facts.productCount > 0 ? w.hasProducts : 0,
    publishedProducts: facts.activeProductCount > 0 ? w.publishedProducts : 0,
    recentLogin: facts.recentLogin ? w.recentLogin : 0,
  };
  const score = clamp(
    inputs.hasStore + inputs.hasProducts + inputs.publishedProducts + inputs.recentLogin
  );
  return {
    score,
    formula: "activation = hasStore + hasProducts + publishedProducts + recentLogin",
    inputs,
    evidence: [
      { label: "hasStore", value: facts.hasStore, source: "merchant.facts" },
      { label: "productCount", value: facts.productCount, source: "merchant.facts" },
    ],
    confidence: 0.9,
  };
}

export function scoreCommerceReadiness(facts: MerchantFacts): ScoreBreakdown {
  const w = S.commerceReadiness;
  const inputs = {
    publishedCatalog: facts.activeProductCount > 0 ? w.publishedCatalog : 0,
    codConfigured: facts.codConfigured === true ? w.codConfigured : 0,
    domainHealthy: facts.hasCustomDomain === true ? w.domainHealthy : 0,
    recentActivity: facts.recentLogin ? w.recentActivity : 0,
  };
  const score = clamp(
    inputs.publishedCatalog +
      inputs.codConfigured +
      inputs.domainHealthy +
      inputs.recentActivity
  );
  return {
    score,
    formula:
      "commerceReadiness = publishedCatalog + COD + domainHealthy + recentActivity",
    inputs,
    evidence: [
      { label: "activeProductCount", value: facts.activeProductCount, source: "merchant.facts" },
      { label: "codConfigured", value: facts.codConfigured ?? null, source: "merchant.facts" },
    ],
    confidence: 0.85,
  };
}

export function scoreFirstSaleProxy(facts: MerchantFacts): ScoreBreakdown {
  const w = S.firstSaleProxy;
  if (facts.realOrders > 0) {
    return {
      score: 0,
      formula: "firstSaleProxy = 0 when realOrders > 0 (already converted)",
      inputs: { realOrders: facts.realOrders },
      evidence: [
        { label: "realOrders", value: facts.realOrders, source: "merchant.facts" },
      ],
      confidence: 1,
    };
  }
  const inputs = {
    catalogReady: facts.activeProductCount > 0 ? w.catalogReady : 0,
    recentActivity: facts.recentLogin ? w.recentActivity : 0,
    checkoutReady: facts.codConfigured !== false ? w.checkoutReady : 0,
    domainReady: facts.hasCustomDomain === true ? w.domainReady : 0,
    noOrdersYet: w.noOrdersYet,
  };
  const score = clamp(
    inputs.catalogReady +
      inputs.recentActivity +
      inputs.checkoutReady +
      inputs.domainReady +
      inputs.noOrdersYet
  );
  return {
    score,
    formula:
      "firstSaleProxy = catalogReady + recentActivity + checkoutReady + domainReady + noOrdersYet",
    inputs,
    evidence: [
      { label: "activeProductCount", value: facts.activeProductCount, source: "merchant.facts" },
      { label: "recentLogin", value: facts.recentLogin, source: "merchant.facts" },
    ],
    confidence: 0.75,
  };
}

export function scoreChurnRisk(facts: MerchantFacts): ScoreBreakdown {
  const w = S.churnRisk;
  const orderDecline = facts.realOrders > 0 && !facts.recentLogin ? w.orderDeclineWeight : 0;
  const loginCold = !facts.recentLogin ? w.loginColdWeight : 0;
  const zeroRecent = facts.realOrders === 0 && !facts.recentLogin ? w.zeroRecentOrdersWeight : 0;
  const score = clamp(orderDecline + loginCold + zeroRecent);
  return {
    score,
    formula: "churnRisk = orderDecline + loginCold + zeroRecentOrders",
    inputs: { orderDecline, loginCold, zeroRecent },
    evidence: [
      { label: "recentLogin", value: facts.recentLogin, source: "merchant.facts" },
      { label: "realOrders", value: facts.realOrders, source: "merchant.facts" },
    ],
    confidence: 0.7,
  };
}

export function buildMerchantIntelligenceProfile(
  facts: MerchantFacts
): MerchantIntelligenceProfile {
  const journey = buildMerchantJourney(facts);
  const intent = scoreIntent(facts);
  const activation = scoreActivation(facts);
  const commerce = scoreCommerceReadiness(facts);
  const firstSale = scoreFirstSaleProxy(facts);
  const churn = scoreChurnRisk(facts);
  const bottleneck = detectMerchantBottleneck(facts);
  const stage = inferJourneyStage(facts);

  const mw = S.merchantIntervention;
  const interventionScore = clamp(
    intent.score * mw.intentWeight +
      firstSale.score * mw.firstSaleWeight +
      (100 - churn.score) * mw.churnInverseWeight +
      commerce.score * mw.commerceWeight
  );

  let opportunity: string | null = null;
  let risk: string | null = null;
  if (bottleneck === "NO_PRODUCTS" && facts.recentLogin) {
    opportunity = "RECENTLY_ACTIVE_EMPTY_STORE";
  } else if (bottleneck === "NO_FIRST_ORDER" || bottleneck === "NO_DOMAIN") {
    opportunity = "HIGH_INTENT_FIRST_SALE";
  } else if (facts.realOrders >= 3) {
    opportunity = "GROWTH_REINFORCEMENT";
  }
  if (churn.score >= 50) risk = "MERCHANT_CHURN_RISK";
  if (bottleneck === "NO_COD") risk = risk ?? "CHECKOUT_BLOCK";

  return {
    merchantId: facts.merchantId,
    storeId: facts.storeId,
    storeName: facts.storeName,
    lifecycleStage: lifecycleFromFacts(facts),
    activityState: facts.recentLogin ? "hot" : "cold",
    commerceState:
      facts.realOrders >= 3
        ? "growing"
        : facts.realOrders >= 1
          ? "selling"
          : facts.activeProductCount > 0
            ? "ready"
            : "none",
    activationHealth: activation.score,
    conversionHealth: journey.dimensions.conversion,
    operationalHealth: journey.dimensions.operations,
    revenueHealth: journey.dimensions.revenue,
    technicalHealth: journey.dimensions.technical,
    currentBottleneck: bottleneck,
    previousBottleneck: null,
    trend: facts.realOrders > 0 ? "up" : facts.recentLogin ? "flat" : "down",
    risk,
    opportunity,
    intentScore: intent,
    activationScore: activation,
    commerceReadinessScore: commerce,
    firstSaleProbabilityProxy: firstSale,
    churnRisk: churn,
    interventionScore,
    evidence: journey.evidence,
    recommendedActions: [
      { label: journey.recommendedAction, href: journey.actionHref },
    ],
    forecast:
      firstSale.score >= 60
        ? "Deterministic proxy suggests elevated first-sale readiness if outreach occurs within the activation window."
        : facts.realOrders > 0
          ? "Merchant already converting — reinforce growth motion."
          : "Insufficient conversion signals for a strong first-sale proxy.",
    explainability: `stage=${stage}; bottleneck=${bottleneck}; intent=${intent.score}; intervention=${interventionScore}`,
  };
}
