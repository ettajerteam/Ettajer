"use client";

import {
  DashboardSectionNav,
  type DashboardSectionTab,
} from "@/components/dashboard/dashboard-section-nav";
import type { ReportRange } from "@/lib/reports";

const TABS: DashboardSectionTab[] = [
  { id: "reports", label: "Reports", href: "/dashboard/analytics/reports" },
  { id: "live", label: "Live view", href: "/dashboard/analytics/live" },
];

function isTabActive(pathname: string, _search: string, tabId: string): boolean {
  const tab = TABS.find((t) => t.id === tabId);
  if (!tab) return false;
  return pathname === tab.href || pathname.startsWith(`${tab.href}/`);
}

export function AnalyticsSectionNav() {
  return <DashboardSectionNav tabs={TABS} isTabActive={isTabActive} />;
}

export const REPORT_RANGES: { value: ReportRange; label: string }[] = [
  { value: 1, label: "Today" },
  { value: 7, label: "7 Days" },
  { value: 30, label: "30 Days" },
  { value: 365, label: "12 Months" },
];
