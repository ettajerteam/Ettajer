import type { Evidence, PlatformState } from "@/lib/intelligence/engine-types";
import { INTELLIGENCE_THRESHOLDS as T } from "@/lib/intelligence/thresholds";

export type PlatformBottleneck = {
  id: string;
  code: string;
  title: string;
  affectedCount: number;
  highIntent?: number;
  severity: "critical" | "high" | "medium" | "low";
  confidence: number;
  evidenceCount: number;
  evidenceQuality: "high" | "medium" | "low";
  ruleIds: string[];
  evidence: Evidence[];
  recommendedAction: { label: string; href: string };
};

export function detectPlatformBottlenecks(
  state: PlatformState
): PlatformBottleneck[] {
  const out: PlatformBottleneck[] = [];

  if (state.pendingRealOrders > 0) {
    out.push({
      id: "bn-cod",
      code: "ORDER_VERIFICATION_DELAY",
      title: "COD verification backlog",
      affectedCount: state.pendingRealOrders,
      severity:
        state.pendingRealOrders >= T.pendingOrdersCritical
          ? "critical"
          : "high",
      confidence: 1,
      evidenceCount: 2,
      evidenceQuality: "high",
      ruleIds: ["PENDING_REAL_COD", "OPERATIONAL_COD_BOTTLENECK"],
      evidence: [
        {
          label: "pendingRealOrders",
          value: state.pendingRealOrders,
          source: "platform.overview",
        },
        {
          label: "pendingRealGmv",
          value: state.pendingRealGmv,
          source: "platform.overview",
        },
      ],
      recommendedAction: {
        label: "Review pending COD",
        href: "/admin/payments?focus=pending",
      },
    });
  }

  if (state.firstSaleCount > 0) {
    out.push({
      id: "bn-first-sale",
      code: "NO_FIRST_ORDER",
      title: "First-sale conversion bottleneck",
      affectedCount: state.firstSaleCount,
      highIntent: state.firstSaleHighIntent,
      severity:
        state.firstSaleCount >= T.firstSalePoolElevated ? "high" : "medium",
      confidence: 0.91,
      evidenceCount: 4,
      evidenceQuality: "high",
      ruleIds: [
        "CATALOG_READY",
        "ZERO_REAL_ORDERS",
        "RECENT_ACTIVITY",
        "FIRST_SALE_BOTTLENECK",
      ],
      evidence: [
        {
          label: "firstSaleCount",
          value: state.firstSaleCount,
          source: "activation.funnel",
        },
        {
          label: "highIntent",
          value: state.firstSaleHighIntent,
          source: "activation.temperature",
        },
        {
          label: "noCodConfigured",
          value: state.firstSaleBottlenecks.noCodConfigured,
          source: "store.settings",
        },
        {
          label: "noCustomDomain",
          value: state.firstSaleBottlenecks.noCustomDomain,
          source: "store.settings",
        },
      ],
      recommendedAction: {
        label: "View first-sale targets",
        href: "/admin/activation?stage=listed",
      },
    });
  }

  if (state.hotEmptyCount > 0 || state.loggedInEmpty7d > 0) {
    out.push({
      id: "bn-empty",
      code: "NO_PRODUCTS",
      title: "Empty-store catalog bottleneck",
      affectedCount: Math.max(state.hotEmptyCount, state.loggedInEmpty7d),
      highIntent: state.loggedInEmpty7d,
      severity: "medium",
      confidence: 0.88,
      evidenceCount: 2,
      evidenceQuality: "high",
      ruleIds: ["EMPTY_STORE", "RECENT_LOGIN"],
      evidence: [
        {
          label: "hotEmptyCount",
          value: state.hotEmptyCount,
          source: "activation.gap",
        },
        {
          label: "loggedInEmpty7d",
          value: state.loggedInEmpty7d,
          source: "activation.gap",
        },
      ],
      recommendedAction: {
        label: "Open activation",
        href: "/admin/activation?stage=empty&temp=hot",
      },
    });
  }

  if (state.domainFailing > 0) {
    out.push({
      id: "bn-dns",
      code: "NO_DOMAIN",
      title: "Custom domain DNS failures",
      affectedCount: state.domainFailing,
      severity: state.domainFailing >= 3 ? "critical" : "high",
      confidence: 0.95,
      evidenceCount: 2,
      evidenceQuality: "high",
      ruleIds: ["DOMAIN_DNS_FAILING"],
      evidence: [
        {
          label: "domainFailing",
          value: state.domainFailing,
          source: "domains.live",
        },
        {
          label: "domainsConnected",
          value: state.domainsConnected,
          source: "domains.live",
        },
      ],
      recommendedAction: {
        label: "Diagnose domains",
        href: "/admin/domains",
      },
    });
  }

  if (state.openSupport > 0) {
    out.push({
      id: "bn-support",
      code: "SUPPORT_DELAY",
      title: "Support response backlog",
      affectedCount: state.openSupport,
      severity: state.openSupport >= T.supportBacklogHigh ? "high" : "medium",
      confidence: 1,
      evidenceCount: 1,
      evidenceQuality: "high",
      ruleIds: ["SUPPORT_BACKLOG"],
      evidence: [
        {
          label: "openSupport",
          value: state.openSupport,
          source: "support.inbox",
        },
      ],
      recommendedAction: {
        label: "Open inbox",
        href: "/admin/messages",
      },
    });
  }

  const severityRank = { critical: 0, high: 1, medium: 2, low: 3 };
  return out.sort(
    (a, b) =>
      severityRank[a.severity] - severityRank[b.severity] ||
      b.affectedCount - a.affectedCount
  );
}
