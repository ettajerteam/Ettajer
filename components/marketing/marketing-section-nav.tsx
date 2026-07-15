"use client";

import {
  DashboardSectionNav,
  type DashboardSectionTab,
} from "@/components/dashboard/dashboard-section-nav";

const TABS: DashboardSectionTab[] = [
  { id: "integrations", label: "Integrations", href: "/dashboard/marketing" },
  { id: "discounts", label: "Discounts", href: "/dashboard/marketing/discounts" },
  { id: "campaigns", label: "Campaigns", href: "/dashboard/marketing/campaigns" },
  { id: "attribution", label: "Attribution", href: "/dashboard/marketing/attribution" },
];

function isTabActive(pathname: string, _search: string, tabId: string): boolean {
  if (tabId === "integrations") {
    return (
      pathname === "/dashboard/marketing" ||
      pathname === "/dashboard/marketing/integrations" ||
      (pathname.startsWith("/dashboard/marketing/") &&
        !pathname.startsWith("/dashboard/marketing/discounts") &&
        !pathname.startsWith("/dashboard/marketing/campaigns") &&
        !pathname.startsWith("/dashboard/marketing/attribution"))
    );
  }
  if (tabId === "discounts") return pathname.startsWith("/dashboard/marketing/discounts");
  if (tabId === "campaigns") return pathname.startsWith("/dashboard/marketing/campaigns");
  return pathname.startsWith("/dashboard/marketing/attribution");
}

export function MarketingSectionNav() {
  return <DashboardSectionNav tabs={TABS} isTabActive={isTabActive} />;
}
