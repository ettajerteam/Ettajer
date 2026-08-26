import type { PlatformOverviewData } from "@/lib/admin/platform-stats";
import { formatAdminInt, formatAdminNumber } from "@/lib/admin/format";
import type { SaraFeedItem, SaraSeverity } from "@/lib/intelligence/types";

function mapSeverity(
  s: "high" | "medium" | "low" | "positive"
): SaraSeverity {
  return s;
}

/**
 * Intelligence feed: Signal → Context → Interpretation → Action.
 * Built from overview insights + concentration / momentum rules.
 */
export function getRevenueAndInsightSignals(
  overview: PlatformOverviewData
): SaraFeedItem[] {
  const feed: SaraFeedItem[] = [];

  const revChange = overview.changes.revenue7d;
  if (overview.realRevenue7d > 0 || overview.totalRevenue > 0) {
    feed.push({
      id: "revenue-momentum",
      category: "REVENUE",
      signal:
        revChange !== 0
          ? `Real GMV ${revChange > 0 ? "increased" : "changed"} ${revChange > 0 ? "+" : ""}${revChange}% over the previous 7 days.`
          : `Real GMV over the last 7 days: ${formatAdminNumber(overview.realRevenue7d)} MAD.`,
      context: `${formatAdminNumber(overview.totalRevenue)} MAD lifetime real GMV · ${formatAdminInt(overview.realOrders)} real orders.`,
      interpretation:
        revChange >= 50
          ? "Momentum is strong."
          : revChange > 0
            ? "Growth is positive but still early."
            : revChange < 0
              ? "Momentum cooled versus the prior window."
              : "Revenue is holding steady.",
      conclusion: overview.concentrationRisk.elevated
        ? `${overview.concentrationRisk.top2SharePct}% of GMV comes from only 2 merchants.`
        : "Revenue is distributed across more than a narrow top set.",
      recommendation: overview.concentrationRisk.elevated
        ? "Activate more mid-tier merchants toward first sale."
        : "Protect winning merchants and keep first-sale pipeline warm.",
      href: "/admin/analytics?range=7",
      cta: "View merchant concentration",
      severity: overview.concentrationRisk.elevated ? "medium" : "positive",
      explanation: {
        signal: `revenue7dChange = ${revChange}%`,
        evidence: `realRevenue7d=${formatAdminNumber(overview.realRevenue7d)} · lifetime=${formatAdminNumber(overview.totalRevenue)} · top2Share=${overview.concentrationRisk.top2SharePct}%`,
        rule: "changes.revenue7d from platform overview; concentrationRisk.top2SharePct >= 50",
        impact: overview.concentrationRisk.why ?? "Revenue trajectory for the platform.",
        recommendation:
          overview.concentrationRisk.recommended ??
          "Review analytics and mid-tier activation.",
        source: "deterministic",
      },
    });
  }

  for (const insight of overview.insights.slice(0, 6)) {
    feed.push({
      id: `insight-${insight.id}`,
      category: insight.category.toUpperCase(),
      signal: insight.signal,
      context: insight.why,
      interpretation: insight.action,
      conclusion: insight.detail || insight.why,
      recommendation: insight.action,
      href: insight.href,
      cta: insight.cta,
      severity: mapSeverity(insight.severity),
      explanation: {
        signal: insight.signal,
        evidence: insight.why,
        rule: `deriveAdminInsights.${insight.id}`,
        impact: insight.why,
        recommendation: `${insight.cta} → ${insight.href}`,
        source: "deterministic",
      },
    });
  }

  return feed.slice(0, 8);
}
