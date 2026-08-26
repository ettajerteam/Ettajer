/**
 * Merchant digital twins + limited scenario set.
 */
import { INTELLIGENCE_SCORING_CONFIG as C } from "@/lib/intelligence/config/scoring";
import type { MerchantIntelligenceProfile } from "@/lib/intelligence/merchants/profile";
import type { MerchantTwin } from "@/lib/intelligence/twin/types";

export function buildMerchantTwin(
  profile: MerchantIntelligenceProfile
): MerchantTwin {
  const constraints: string[] = [];
  if (profile.currentBottleneck === "NO_DOMAIN") {
    constraints.push("DOMAIN_REQUIRED");
  }
  if (profile.currentBottleneck === "NO_COD") {
    constraints.push("COD_REQUIRED");
  }
  return {
    merchantId: profile.merchantId,
    storeName: profile.storeName,
    stage: profile.lifecycleStage,
    health: profile.activationHealth,
    momentum: profile.trend === "unknown" ? "flat" : profile.trend,
    intent: profile.intentScore.score,
    bottleneck: profile.currentBottleneck,
    risk: profile.risk,
    opportunity: profile.opportunity,
    constraints,
    recommendedIntervention:
      profile.recommendedActions[0]?.label ??
      (profile.currentBottleneck === "NO_PRODUCTS"
        ? "ACTIVATION_OUTREACH"
        : profile.currentBottleneck === "NO_DOMAIN"
          ? "DOMAIN_SETUP_ASSIST"
          : "FIRST_SALE_ASSIST"),
  };
}

export type MerchantScenario = {
  merchantId: string;
  scenarios: { id: string; label: string; note: string }[];
  recommended: string;
};

export function generateMerchantScenarios(
  twin: MerchantTwin
): MerchantScenario {
  const scenarios = [
    {
      id: "m-no-action",
      label: "NO_ACTION",
      note: "Merchant remains at current bottleneck.",
    },
  ];
  if (twin.constraints.includes("DOMAIN_REQUIRED")) {
    scenarios.push({
      id: "m-domain",
      label: "DOMAIN_SETUP_ASSIST",
      note: "Resolve domain constraint before first-sale assist.",
    });
  } else if (twin.bottleneck === "NO_PRODUCTS") {
    scenarios.push({
      id: "m-activation",
      label: "ACTIVATION_OUTREACH",
      note: "Hot empty store — catalog assist.",
    });
  } else {
    scenarios.push({
      id: "m-first-sale",
      label: "FIRST_SALE_ASSIST",
      note: "Catalog-ready — first-sale assist.",
    });
  }
  scenarios.push({
    id: "m-checkout",
    label: "CHECKOUT_REVIEW",
    note: "Review COD/checkout readiness if first-sale stalls.",
  });

  const limited = scenarios.slice(0, C.twin.maxScenariosPerMerchant);
  const recommended =
    limited.find((s) => s.label !== "NO_ACTION")?.label ?? "NO_ACTION";
  return {
    merchantId: twin.merchantId,
    scenarios: limited,
    recommended,
  };
}
