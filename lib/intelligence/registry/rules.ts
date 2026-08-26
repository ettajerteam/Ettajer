import type { PlatformState } from "@/lib/intelligence/engine-types";
import { collectAllSignals } from "@/lib/intelligence/signals/collect";
import type { IntelligenceSignal } from "@/lib/intelligence/engine-types";
import { INTELLIGENCE_THRESHOLDS as T } from "@/lib/intelligence/thresholds";

export type RegistryRule = {
  id: string;
  category: string;
  description: string;
  severity: string;
  evaluate: (state: PlatformState) => boolean;
  evidence: (state: PlatformState) => { label: string; value: string | number | boolean | null; source: string }[];
  recommendation: (state: PlatformState) => { label: string; href: string } | null;
};

/**
 * Central rule registry — extensible, deterministic.
 */
export const INTELLIGENCE_RULES: RegistryRule[] = [
  {
    id: "OPERATIONAL_COD_BOTTLENECK",
    category: "operations",
    description: "Pending real COD orders block courier handoff.",
    severity: "high",
    evaluate: (s) => s.pendingRealOrders > 0,
    evidence: (s) => [
      { label: "pendingRealOrders", value: s.pendingRealOrders, source: "platform.overview" },
    ],
    recommendation: () => ({
      label: "Review pending COD",
      href: "/admin/payments?focus=pending",
    }),
  },
  {
    id: "FIRST_SALE_BOTTLENECK",
    category: "activation",
    description: "Stores with live products and zero real orders.",
    severity: "high",
    evaluate: (s) => s.firstSaleCount >= T.firstSalePoolElevated,
    evidence: (s) => [
      { label: "firstSaleCount", value: s.firstSaleCount, source: "activation.funnel" },
      { label: "highIntent", value: s.firstSaleHighIntent, source: "activation.temperature" },
    ],
    recommendation: () => ({
      label: "View first-sale targets",
      href: "/admin/activation?stage=listed",
    }),
  },
  {
    id: "REVENUE_CONCENTRATION",
    category: "revenue",
    description: "Top merchants dominate tracked GMV.",
    severity: "high",
    evaluate: (s) => s.top2SharePct / 100 >= T.revenueConcentrationHigh,
    evidence: (s) => [
      { label: "top2SharePct", value: s.top2SharePct, source: "platform.gmv" },
    ],
    recommendation: () => ({
      label: "Activate mid-tier merchants",
      href: "/admin/activation?stage=listed",
    }),
  },
  {
    id: "DOMAIN_HEALTH_FAILURE",
    category: "technical",
    description: "Custom domains failing live DNS checks.",
    severity: "critical",
    evaluate: (s) => s.domainFailing > 0,
    evidence: (s) => [
      { label: "domainFailing", value: s.domainFailing, source: "domains.live" },
    ],
    recommendation: () => ({
      label: "Diagnose domains",
      href: "/admin/domains",
    }),
  },
  {
    id: "SUPPORT_BACKLOG",
    category: "support",
    description: "Unanswered support threads.",
    severity: "high",
    evaluate: (s) => s.openSupport > 0,
    evidence: (s) => [
      { label: "openSupport", value: s.openSupport, source: "support.inbox" },
    ],
    recommendation: () => ({
      label: "Open inbox",
      href: "/admin/messages",
    }),
  },
  {
    id: "MERCHANT_DORMANCY",
    category: "activation",
    description: "Large empty-store pool with weak recent login.",
    severity: "medium",
    evaluate: (s) =>
      s.funnel.noProducts > 20 && s.loggedInEmpty7d < s.funnel.noProducts * 0.2,
    evidence: (s) => [
      { label: "noProducts", value: s.funnel.noProducts, source: "activation.funnel" },
      { label: "loggedInEmpty7d", value: s.loggedInEmpty7d, source: "activation.gap" },
    ],
    recommendation: () => ({
      label: "Open cold activation",
      href: "/admin/activation?stage=empty&temp=cold",
    }),
  },
  {
    id: "ACTIVATION_DECAY",
    category: "activation",
    description: "Hot empty stores indicate activation decay risk.",
    severity: "medium",
    evaluate: (s) => s.hotEmptyCount >= T.hotEmptyElevated,
    evidence: (s) => [
      { label: "hotEmptyCount", value: s.hotEmptyCount, source: "activation.gap" },
    ],
    recommendation: () => ({
      label: "Open hot empty list",
      href: "/admin/activation?stage=empty&temp=hot",
    }),
  },
];

export function evaluateRegistry(state: PlatformState): {
  id: string;
  fired: boolean;
  description: string;
  evidence: ReturnType<RegistryRule["evidence"]>;
  recommendation: { label: string; href: string } | null;
}[] {
  return INTELLIGENCE_RULES.map((rule) => ({
    id: rule.id,
    fired: rule.evaluate(state),
    description: rule.description,
    evidence: rule.evidence(state),
    recommendation: rule.evaluate(state) ? rule.recommendation(state) : null,
  }));
}

/** Cross-check registry against collected signals for consistency */
export function registrySignalCoverage(
  state: PlatformState,
  signals: IntelligenceSignal[]
): { ruleId: string; signalPresent: boolean }[] {
  const ids = new Set(signals.map((s) => s.id));
  void collectAllSignals;
  return [
    {
      ruleId: "OPERATIONAL_COD_BOTTLENECK",
      signalPresent: ids.has("pending-cod"),
    },
    {
      ruleId: "DOMAIN_HEALTH_FAILURE",
      signalPresent: ids.has("dns-failure"),
    },
    {
      ruleId: "SUPPORT_BACKLOG",
      signalPresent: ids.has("support-backlog"),
    },
    {
      ruleId: "FIRST_SALE_BOTTLENECK",
      signalPresent: ids.has("zero-sale-stores"),
    },
    {
      ruleId: "REVENUE_CONCENTRATION",
      signalPresent: ids.has("revenue-concentration") || !INTELLIGENCE_RULES.find(r => r.id === "REVENUE_CONCENTRATION")!.evaluate(state),
    },
  ];
}
