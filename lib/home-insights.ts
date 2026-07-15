import type { ExecutiveDashboardData } from "@/types/dashboard";

export type HomeBriefTone = "positive" | "neutral" | "attention";

export interface HomeBrief {
  subtitle: string;
  tone: HomeBriefTone;
  highlight?: string;
}

export interface HomeAttentionItem {
  id: string;
  title: string;
  description: string;
  impact?: string;
  href?: string;
  severity: "high" | "medium" | "low";
}

export interface HomeQuickAction {
  id: string;
  label: string;
  description: string;
  href: string;
}

export function deriveHomeBrief(data: ExecutiveDashboardData): HomeBrief {
  const pending = data.quickSummary.find((item) => item.id === "pending-orders");
  const pendingCount = Number.parseInt(pending?.value.replace(/,/g, "") ?? "0", 10);
  const revenueChange = data.kpis.revenue.change;
  const lowStock = data.inventory.lowStock;
  const outOfStock = data.inventory.outOfStock;
  const todayOrders = data.quickSummary.find((item) => item.id === "today-orders");
  const todayCount = Number.parseInt(todayOrders?.value.replace(/,/g, "") ?? "0", 10);

  if (outOfStock > 0) {
    return {
      subtitle: `${outOfStock} product${outOfStock === 1 ? "" : "s"} out of stock — restock to avoid lost sales.`,
      tone: "attention",
      highlight: `${outOfStock} out of stock`,
    };
  }

  if (pendingCount > 0) {
    return {
      subtitle: `${pendingCount} order${pendingCount === 1 ? "" : "s"} need your attention. Fulfill them while demand is fresh.`,
      tone: "attention",
      highlight: `${pendingCount} pending`,
    };
  }

  if (revenueChange >= 8) {
    return {
      subtitle: `Revenue is up ${revenueChange.toFixed(1)}% this period. Momentum is strong — consider promoting your best sellers.`,
      tone: "positive",
      highlight: `+${revenueChange.toFixed(1)}% revenue`,
    };
  }

  if (revenueChange <= -8) {
    return {
      subtitle: `Revenue dipped ${Math.abs(revenueChange).toFixed(1)}% vs last period. Review traffic and conversion to recover.`,
      tone: "attention",
      highlight: `${revenueChange.toFixed(1)}% revenue`,
    };
  }

  if (lowStock > 0) {
    return {
      subtitle: `${lowStock} product${lowStock === 1 ? "" : "s"} running low on stock. Restock before you miss conversions.`,
      tone: "neutral",
      highlight: `${lowStock} low stock`,
    };
  }

  if (todayCount === 0 && data.homeOrders.length === 0) {
    return {
      subtitle: "Quiet day so far. Use this moment to refine products, collections, or marketing.",
      tone: "neutral",
    };
  }

  if (data.healthScore.grade === "A" || data.healthScore.grade === "B") {
    return {
      subtitle: `Business health is ${data.healthScore.label.toLowerCase()}. Keep shipping fast and inventory balanced.`,
      tone: "positive",
      highlight: `Grade ${data.healthScore.grade}`,
    };
  }

  return {
    subtitle: "Here's what's happening with your business today.",
    tone: "neutral",
  };
}

export function deriveAttentionItems(data: ExecutiveDashboardData): HomeAttentionItem[] {
  const items: HomeAttentionItem[] = [];

  for (const action of data.priorityActions) {
    items.push({
      id: action.id,
      title: action.title,
      description: "Recommended next step based on your store performance.",
      impact: action.impact,
      href: action.href,
      severity: action.id === "restock" || action.id === "pause-ads" ? "high" : "medium",
    });
  }

  for (const risk of data.risks) {
    if (risk.level === "good") continue;
    items.push({
      id: risk.id,
      title: risk.title,
      description: `${risk.current} · target ${risk.target}`,
      impact: risk.impact,
      href:
        risk.id === "inventory"
          ? "/dashboard/products/inventory"
          : risk.id === "shipping-ratio"
            ? "/dashboard/settings?tab=shipping"
            : "/dashboard/analytics/reports",
      severity: risk.level === "high" ? "high" : "medium",
    });
  }

  const priorityInsight = data.insights.find((insight) => insight.priority);
  if (priorityInsight) {
    items.unshift({
      id: `insight-${priorityInsight.id}`,
      title: priorityInsight.title,
      description: priorityInsight.description,
      impact: priorityInsight.impact,
      href: "/dashboard/analytics/reports",
      severity: priorityInsight.impactType === "negative" ? "high" : "medium",
    });
  }

  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  }).slice(0, 4);
}

export function deriveQuickActions(data: ExecutiveDashboardData): HomeQuickAction[] {
  const actions: HomeQuickAction[] = [];

  if (data.inventory.lowStock > 0 || data.inventory.outOfStock > 0) {
    actions.push({
      id: "restock",
      label: "Review inventory",
      description: "Fix stock gaps before they cost sales",
      href: "/dashboard/products/inventory",
    });
  }

  const pending = data.quickSummary.find((item) => item.id === "pending-orders");
  const pendingCount = Number.parseInt(pending?.value.replace(/,/g, "") ?? "0", 10);
  if (pendingCount > 0) {
    actions.push({
      id: "fulfill",
      label: "Fulfill orders",
      description: `${pendingCount} waiting to ship`,
      href: "/dashboard/orders?status=pending",
    });
  }

  if (data.homeTopProducts.length > 0) {
    actions.push({
      id: "promote",
      label: "Promote top seller",
      description: data.bestSellerName,
      href: "/dashboard/products",
    });
  }

  actions.push(
    {
      id: "analytics",
      label: "View analytics",
      description: "Deep dive into revenue trends",
      href: "/dashboard/analytics/reports",
    },
    {
      id: "draft-order",
      label: "Create draft order",
      description: "Manually add a customer order",
      href: "/dashboard/orders/drafts/new",
    }
  );

  return actions.slice(0, 4);
}

export function getKpiStatus(change: number, id: string): "up" | "down" | "alert" | "neutral" {
  if (id === "conversion" || id === "visitors") {
    if (change >= 5) return "up";
    if (change <= -5) return "alert";
    return "neutral";
  }

  if (change >= 3) return "up";
  if (change <= -3) return "down";
  return "neutral";
}

export function deriveNotificationCount(data: ExecutiveDashboardData): number {
  const pending = data.quickSummary.find((item) => item.id === "pending-orders");
  const pendingCount = Number.parseInt(pending?.value.replace(/,/g, "") ?? "0", 10);
  const urgentRisks = data.risks.filter((risk) => risk.level === "high").length;
  return pendingCount + urgentRisks;
}

export function getRangeLabel(range: ExecutiveDashboardData["range"]): string {
  if (range === 1) return "Today";
  if (range === 7) return "Last 7 days";
  if (range === 365) return "Last 12 months";
  return "Last 30 days";
}

