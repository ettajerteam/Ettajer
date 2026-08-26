import type { PlatformOverviewData } from "@/lib/admin/platform-stats";
import type { SaraAction } from "@/lib/intelligence/types";

/** Recommended actions that navigate to existing admin routes only. */
export function getRecommendedActions(
  overview: PlatformOverviewData
): SaraAction[] {
  const actions: SaraAction[] = [];

  if (overview.pendingRealOrders > 0) {
    actions.push({
      id: "review-cod",
      label: "Review pending COD",
      description: `${overview.pendingRealOrders} orders awaiting verification`,
      href: "/admin/payments?focus=pending",
      urgency: overview.pendingRealOrders >= 10 ? "critical" : "high",
    });
  }

  if (overview.newMessages > 0) {
    actions.push({
      id: "support-inbox",
      label: "Open support inbox",
      description: `${overview.newMessages} open conversations`,
      href: "/admin/messages",
      urgency: overview.newMessages >= 5 ? "high" : "normal",
    });
  }

  if (overview.hotEmptyCount > 0 || overview.firstSale.count > 0) {
    actions.push({
      id: "activation",
      label: "Open activation targets",
      description: "Empty stores & first-sale queue",
      href: "/admin/activation",
      urgency: "high",
    });
  }

  const domainFailing =
    overview.domainsConnected - overview.domainsConnectedSuccess;
  if (domainFailing > 0) {
    actions.push({
      id: "domains",
      label: "Diagnose domains",
      description: `${domainFailing} DNS failing`,
      href: "/admin/domains",
      urgency: domainFailing >= 3 ? "critical" : "high",
    });
  }

  actions.push({
    id: "analytics",
    label: "View analytics",
    description: "Signal · why · action",
    href: "/admin/analytics?range=30",
    urgency: "normal",
  });

  if (overview.concentration[0]) {
    actions.push({
      id: "top-merchant",
      label: "View top merchant",
      description: overview.concentration[0].name,
      href: `/admin/stores/${overview.concentration[0].id}`,
      urgency: "normal",
    });
  }

  actions.push({
    id: "orders",
    label: "View orders",
    description: "Order & payments pipeline",
    href: "/admin/payments",
    urgency: "normal",
  });

  return actions.slice(0, 8);
}
