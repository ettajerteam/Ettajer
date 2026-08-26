import type { PlatformOverviewData } from "@/lib/admin/platform-stats";
import { formatAdminInt } from "@/lib/admin/format";
import type { SaraRisk } from "@/lib/intelligence/types";

export function getOperationalRisks(
  overview: PlatformOverviewData
): SaraRisk[] {
  const risks: SaraRisk[] = [];
  const domainFailing = Math.max(
    0,
    overview.domainsConnected - overview.domainsConnectedSuccess
  );

  if (overview.pendingRealOrders > 0) {
    risks.push({
      id: "ops-pending-cod",
      category: "Operational",
      title: "Pending COD verification",
      metric: formatAdminInt(overview.pendingRealOrders),
      detail: "Orders waiting before courier handoff.",
      riskLevel: overview.pendingRealOrders >= 10 ? "high" : "medium",
      href: "/admin/payments?focus=pending",
      cta: "Review orders",
      explanation: {
        signal: `${overview.pendingRealOrders} pending real orders`,
        evidence: `pendingRealOrders = ${overview.pendingRealOrders}`,
        rule: "pendingRealOrders > 0",
        impact: "Potential courier delay",
        recommendation: "Review pending COD orders",
        source: "deterministic",
      },
    });
  }

  if (overview.concentrationRisk.top2SharePct > 0) {
    risks.push({
      id: "revenue-concentration",
      category: "Revenue concentration",
      title: "Top-2 merchant GMV share",
      metric: `${overview.concentrationRisk.top2SharePct}%`,
      detail:
        overview.concentrationRisk.message ??
        "Share of tracked GMV from top 2 merchants.",
      riskLevel: overview.concentrationRisk.elevated
        ? "high"
        : overview.concentrationRisk.top2SharePct >= 35
          ? "medium"
          : "low",
      href: "/admin/analytics?range=30",
      cta: "View merchants",
      explanation: {
        signal: `Top 2 share ${overview.concentrationRisk.top2SharePct}%`,
        evidence: overview.concentration
          .slice(0, 2)
          .map((c) => `${c.name} ${c.sharePct}%`)
          .join(" · "),
        rule: "top2SharePct >= 50 → elevated",
        impact:
          overview.concentrationRisk.why ??
          "Platform GMV depends on a small merchant set",
        recommendation:
          overview.concentrationRisk.recommended ??
          "Grow mid-tier first sales",
        source: "deterministic",
      },
    });
  }

  if (domainFailing > 0) {
    risks.push({
      id: "tech-domains",
      category: "Technical",
      title: "Custom domains failing DNS",
      metric: formatAdminInt(domainFailing),
      detail: "Broken domains damage merchant trust and storefront reach.",
      riskLevel: domainFailing >= 3 ? "high" : "medium",
      href: "/admin/domains",
      cta: "Diagnose",
      explanation: {
        signal: `${domainFailing} domains failing DNS`,
        evidence: `${overview.domainsConnectedSuccess}/${overview.domainsConnected} OK`,
        rule: "domainsConnected - domainsConnectedSuccess > 0",
        impact: "Storefront / brand trust risk",
        recommendation: "Diagnose failing domains",
        source: "deterministic",
      },
    });
  }

  if (overview.newMessages > 0) {
    risks.push({
      id: "support-open",
      category: "Support",
      title: "Open support threads",
      metric: formatAdminInt(overview.newMessages),
      detail: "Unresolved merchant conversations.",
      riskLevel: overview.newMessages >= 5 ? "medium" : "low",
      href: "/admin/messages",
      cta: "Open inbox",
      explanation: {
        signal: `${overview.newMessages} open support`,
        evidence: `newMessages = ${overview.newMessages}`,
        rule: "newMessages > 0",
        impact: "Relationship / trust risk if left waiting",
        recommendation: "Clear support inbox",
        source: "deterministic",
      },
    });
  }

  if (overview.failedLogins24h >= 5) {
    risks.push({
      id: "tech-auth",
      category: "Technical",
      title: "Failed logins (24h)",
      metric: formatAdminInt(overview.failedLogins24h),
      detail: "Elevated auth failures may indicate user friction or abuse.",
      riskLevel: overview.failedLogins24h >= 10 ? "high" : "medium",
      href: "/admin/errors",
      cta: "View errors",
      explanation: {
        signal: `${overview.failedLogins24h} failed logins / 24h`,
        evidence: `failedLogins24h = ${overview.failedLogins24h}`,
        rule: "failedLogins24h >= 5",
        impact: "Access friction / security signal",
        recommendation: "Inspect error logs",
        source: "deterministic",
      },
    });
  }

  if (overview.funnel.noProducts > 20) {
    risks.push({
      id: "activation-empty",
      category: "Activation",
      title: "Stores with no products",
      metric: formatAdminInt(overview.funnel.noProducts),
      detail: "Large empty-store backlog slows platform GMV growth.",
      riskLevel: overview.funnel.noProducts >= 50 ? "medium" : "low",
      href: "/admin/activation?stage=empty",
      cta: "Open activation",
      explanation: {
        signal: `${overview.funnel.noProducts} stores with no products`,
        evidence: `funnel.noProducts = ${overview.funnel.noProducts}`,
        rule: "funnel.noProducts > 20",
        impact: "Activation pipeline risk",
        recommendation: "Work empty-store activation",
        source: "deterministic",
      },
    });
  }

  return risks;
}
