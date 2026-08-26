/**
 * Secondary diagnosis after failed primary intervention.
 */
import type { Evidence } from "@/lib/intelligence/engine-types";
import type { MerchantFacts } from "@/lib/intelligence/merchants/journey";

export type SecondaryCheck =
  | "CHECK_PRODUCTS"
  | "CHECK_PRICING"
  | "CHECK_DOMAIN"
  | "CHECK_COD"
  | "CHECK_TRAFFIC"
  | "CHECK_STORE_ACTIVITY"
  | "CHECK_CHECKOUT";

export type SecondaryDiagnosisResult = {
  primary: string;
  deepestBottleneck: string;
  checks: {
    check: SecondaryCheck;
    passed: boolean;
    evidence: Evidence;
  }[];
  ruleId: string;
  explanation: string;
  recommendedAction: { label: string; href: string };
  confidence: number;
};

/**
 * Deepest supported bottleneck from available merchant facts.
 * Never invents traffic/pricing metrics — only uses provided facts.
 */
export function runSecondaryDiagnosis(
  facts: MerchantFacts,
  primaryFailed: string
): SecondaryDiagnosisResult {
  const checks: SecondaryDiagnosisResult["checks"] = [];

  const hasProducts = facts.productCount > 0;
  checks.push({
    check: "CHECK_PRODUCTS",
    passed: hasProducts,
    evidence: {
      label: "productCount",
      value: facts.productCount,
      source: "merchant.facts",
    },
  });

  // Pricing not available in PlatformState — mark as inconclusive pass (no invent)
  checks.push({
    check: "CHECK_PRICING",
    passed: true,
    evidence: {
      label: "pricing",
      value: "INSUFFICIENT_EVIDENCE",
      source: "unavailable",
    },
  });

  const domainOk = facts.hasCustomDomain !== false;
  checks.push({
    check: "CHECK_DOMAIN",
    passed: domainOk,
    evidence: {
      label: "hasCustomDomain",
      value: facts.hasCustomDomain ?? null,
      source: "merchant.facts",
    },
  });

  const codOk = facts.codConfigured !== false;
  checks.push({
    check: "CHECK_COD",
    passed: codOk,
    evidence: {
      label: "codConfigured",
      value: facts.codConfigured ?? null,
      source: "merchant.facts",
    },
  });

  // Traffic unavailable — do not invent
  checks.push({
    check: "CHECK_TRAFFIC",
    passed: true,
    evidence: {
      label: "traffic",
      value: "INSUFFICIENT_EVIDENCE",
      source: "unavailable",
    },
  });

  checks.push({
    check: "CHECK_STORE_ACTIVITY",
    passed: facts.recentLogin,
    evidence: {
      label: "recentLogin",
      value: facts.recentLogin,
      source: "merchant.facts",
    },
  });

  checks.push({
    check: "CHECK_CHECKOUT",
    passed: facts.activeProductCount > 0 && codOk,
    evidence: {
      label: "checkoutReady",
      value: facts.activeProductCount > 0 && codOk,
      source: "merchant.facts",
    },
  });

  let deepest = "NO_FIRST_ORDER";
  let action = {
    label: "Assist first sale",
    href: "/admin/activation?stage=listed",
  };
  if (!hasProducts) {
    deepest = "NO_PRODUCTS";
    action = {
      label: "Help empty store",
      href: "/admin/activation?stage=empty&temp=hot",
    };
  } else if (!domainOk) {
    deepest = "NO_DOMAIN";
    action = { label: "Diagnose domains", href: "/admin/domains" };
  } else if (!codOk) {
    deepest = "NO_COD";
    action = {
      label: "Review COD readiness",
      href: "/admin/activation?stage=listed",
    };
  } else if (!facts.recentLogin) {
    deepest = "MERCHANT_DORMANCY";
    action = {
      label: "Reactivate dormant merchant",
      href: "/admin/activation?temp=cold",
    };
  } else if (facts.activeProductCount <= 0) {
    deepest = "NO_PUBLISHED_PRODUCTS";
    action = {
      label: "Publish products",
      href: "/admin/activation?stage=draft",
    };
  }

  return {
    primary: primaryFailed,
    deepestBottleneck: deepest,
    checks,
    ruleId: "SECONDARY_DIAGNOSIS_FIRST_SALE",
    explanation: `Primary ${primaryFailed} failed or stalled — deepest supported bottleneck is ${deepest}.`,
    recommendedAction: action,
    confidence: 0.8,
  };
}
