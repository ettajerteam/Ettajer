import type { PlatformOverviewData } from "@/lib/admin/platform-stats";
import { formatAdminInt } from "@/lib/admin/format";
import type { SaraOpportunity } from "@/lib/intelligence/types";

export function getOpportunities(
  overview: PlatformOverviewData
): SaraOpportunity[] {
  const out: SaraOpportunity[] = [];

  if (overview.loggedInEmpty7d > 0) {
    out.push({
      id: "hot-empty",
      title: "Recently active empty stores",
      potentialImpact: "High — merchants already engaged this week",
      merchantCount: overview.loggedInEmpty7d,
      reason: "Logged in during the last 7 days with zero products — prime activation targets.",
      href: "/admin/activation?stage=empty&temp=hot",
      cta: "Open activation",
      explanation: {
        signal: `${overview.loggedInEmpty7d} empty stores with login in 7d`,
        evidence: `loggedInEmpty7d = ${overview.loggedInEmpty7d}`,
        rule: "loggedInEmpty7d > 0",
        impact: "High-probability path to catalog → first sale",
        recommendation: "Nudge / open activation targets",
        source: "deterministic",
      },
    });
  }

  if (overview.firstSale.count > 0) {
    out.push({
      id: "first-sale",
      title: "Stores with products but zero sales",
      potentialImpact: "High — closest to first real GMV",
      merchantCount: overview.firstSale.count,
      reason: `${formatAdminInt(overview.firstSale.highIntentCount)} show high intent (recent activity). Catalog is live; commerce has not started.`,
      href: "/admin/activation?stage=listed",
      cta: "View first-sale queue",
      explanation: {
        signal: `${overview.firstSale.count} stores with products · 0 real orders`,
        evidence: `funnel.activeNoOrders = ${overview.firstSale.count}; highIntent = ${overview.firstSale.highIntentCount}`,
        rule: "funnel.activeNoOrders > 0",
        impact: "Unlocking first sale expands mid-tier GMV",
        recommendation: "Prioritize high-intent first-sale merchants",
        source: "deterministic",
      },
    });
  }

  if (overview.hotEmptyCount > 0 && overview.hotEmptyCount !== overview.loggedInEmpty7d) {
    out.push({
      id: "hot-empty-all",
      title: "Hot empty stores",
      potentialImpact: "Medium — warm outreach window",
      merchantCount: overview.hotEmptyCount,
      reason: "Temperature scored hot from recent login / store age signals.",
      href: "/admin/activation?temp=hot",
      cta: "Open hot list",
      explanation: {
        signal: `${overview.hotEmptyCount} hot empty stores`,
        evidence: `hotEmptyCount = ${overview.hotEmptyCount}`,
        rule: "hotEmptyCount > 0",
        impact: "Catch merchants before they go dormant",
        recommendation: "Activation outreach",
        source: "deterministic",
      },
    });
  }

  if (overview.changes.orders7d > 0 && overview.realOrders7d > 0) {
    out.push({
      id: "growing-orders",
      title: "Merchants with recent growth",
      potentialImpact: "Positive — reinforce winning motion",
      merchantCount: overview.concentration.filter((c) => c.orders > 0).length,
      reason: `Real orders ${overview.changes.orders7d > 0 ? "+" : ""}${overview.changes.orders7d}% vs prior 7 days.`,
      href: "/admin/analytics?range=7",
      cta: "View analytics",
      explanation: {
        signal: `orders7d change ${overview.changes.orders7d}%`,
        evidence: `realOrders7d = ${overview.realOrders7d}`,
        rule: "changes.orders7d > 0",
        impact: "Protect and learn from growing merchants",
        recommendation: "Review concentration and support winners",
        source: "deterministic",
      },
    });
  }

  if (overview.helpToday.length > 0) {
    out.push({
      id: "help-today",
      title: "Who should we help today",
      potentialImpact: "Operational — ranked help list",
      merchantCount: overview.helpToday.length,
      reason: "Merchants scored for activation health / bottlenecks today.",
      href: "/admin/activation",
      cta: "Open help list",
      explanation: {
        signal: `${overview.helpToday.length} merchants on today's help list`,
        evidence: "helpToday from activation + merchant health",
        rule: "helpToday.length > 0",
        impact: "Focused outreach beats spray-and-pray",
        recommendation: "Work the help-today queue",
        source: "deterministic",
      },
    });
  }

  return out.slice(0, 6);
}
