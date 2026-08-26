import type { PlatformOverviewData } from "@/lib/admin/platform-stats";
import type {
  SaraDimensionStatus,
  SaraPlatformPulse,
  SaraPulseDimension,
} from "@/lib/intelligence/types";

function statusRank(s: SaraDimensionStatus): number {
  if (s === "critical") return 0;
  if (s === "attention") return 1;
  if (s === "watch") return 2;
  return 3;
}

function mapHealthStatus(
  status: "operational" | "attention" | "issues" | "unknown"
): SaraDimensionStatus {
  if (status === "issues") return "critical";
  if (status === "attention") return "attention";
  if (status === "unknown") return "watch";
  return "ok";
}

/**
 * Numeric 0–100 platform health for Dr Sara pulse.
 * Deterministic from existing overview signals — not a fake probe.
 */
export function scorePlatformHealth(
  overview: PlatformOverviewData
): SaraPlatformPulse {
  const domainFailing = Math.max(
    0,
    overview.domainsConnected - overview.domainsConnectedSuccess
  );

  let score = 100;
  score -= Math.min(25, overview.pendingRealOrders * 2);
  score -= Math.min(15, domainFailing * 4);
  score -= Math.min(12, overview.failedLogins24h >= 10 ? 12 : overview.failedLogins24h);
  score -= Math.min(10, overview.newMessages * 2);
  score -= Math.min(10, overview.waitingUsers * 3);
  if (overview.concentrationRisk.elevated) score -= 8;
  if (overview.firstSale.count > 50) score -= 5;
  if (overview.hotEmptyCount > 5) score -= 4;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const operations: SaraPulseDimension = {
    id: "operations",
    label: "Operations",
    status:
      overview.pendingRealOrders >= 10
        ? "critical"
        : overview.pendingRealOrders > 0
          ? "attention"
          : "ok",
    statusLabel:
      overview.pendingRealOrders > 0
        ? `${overview.pendingRealOrders} pending COD`
        : "Clear",
    detail: `${overview.pendingRealOrders} pending · ${overview.processingRealOrders} processing`,
  };

  const activation: SaraPulseDimension = {
    id: "activation",
    label: "Activation",
    status:
      overview.hotEmptyCount >= 8 || overview.firstSale.count >= 80
        ? "attention"
        : overview.hotEmptyCount > 0 || overview.firstSale.count > 0
          ? "watch"
          : "ok",
    statusLabel:
      overview.firstSale.count > 0
        ? `${overview.firstSale.count} near first sale`
        : "Stable",
    detail: `${overview.hotEmptyCount} hot empty · ${overview.loggedInEmpty7d} logged in / 7d empty`,
  };

  const revenue: SaraPulseDimension = {
    id: "revenue",
    label: "Revenue",
    status: overview.concentrationRisk.elevated
      ? "attention"
      : overview.realOrders7d > 0
        ? "ok"
        : "watch",
    statusLabel: overview.concentrationRisk.elevated
      ? `${overview.concentrationRisk.top2SharePct}% top-2`
      : overview.changes.revenue7d !== 0
        ? `${overview.changes.revenue7d > 0 ? "+" : ""}${overview.changes.revenue7d}% / 7d`
        : "Steady",
    detail: `${Math.round(overview.realRevenue7d).toLocaleString("en-US")} MAD real / 7d`,
  };

  const support: SaraPulseDimension = {
    id: "support",
    label: "Support",
    status:
      overview.newMessages >= 5
        ? "attention"
        : overview.newMessages > 0
          ? "watch"
          : "ok",
    statusLabel:
      overview.newMessages > 0
        ? `${overview.newMessages} open`
        : "Clear",
    detail: `${overview.newMessages} unread / open threads`,
  };

  const techFromHealth = overview.health.items.find(
    (i) => i.id === "domains" || i.id === "auth"
  );
  const worstTech = overview.health.items
    .filter((i) => i.id === "domains" || i.id === "auth" || i.id === "email")
    .map((i) => mapHealthStatus(i.status))
    .sort((a, b) => statusRank(a) - statusRank(b))[0] ?? "ok";

  const technical: SaraPulseDimension = {
    id: "technical",
    label: "Technical",
    status: worstTech,
    statusLabel:
      domainFailing > 0
        ? `${domainFailing} DNS failing`
        : overview.failedLogins24h >= 10
          ? `${overview.failedLogins24h} failed logins`
          : techFromHealth?.statusLabel ?? "Operational",
    detail: `${overview.domainsConnectedSuccess}/${overview.domainsConnected} domains OK · ${overview.failedLogins24h} failed logins / 24h`,
  };

  const dimensions = [operations, activation, revenue, support, technical];
  const hasCritical = dimensions.some((d) => d.status === "critical");
  const hasAttention = dimensions.some((d) => d.status === "attention");

  let label: string;
  let summary: string;
  if (score >= 85 && !hasCritical && !hasAttention) {
    label = "Healthy";
    summary = "Platform is stable. No urgent operational blockers.";
  } else if (score >= 65) {
    label = "Stable";
    summary = hasCritical || hasAttention
      ? "Stable, but operational attention is required."
      : "Generally stable with a few watch items.";
  } else if (score >= 40) {
    label = "Needs attention";
    summary = "Several signals require action to protect merchant trust and GMV.";
  } else {
    label = "Critical";
    summary = "High-severity operational issues need immediate review.";
  }

  return { score, label, summary, dimensions };
}
