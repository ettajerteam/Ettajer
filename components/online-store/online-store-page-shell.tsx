"use client";

import { Suspense } from "react";
import {
  DashboardSectionNav,
  type DashboardSectionTab,
} from "@/components/dashboard/dashboard-section-nav";
import { dashboardStack } from "@/lib/dashboard-ui";

const TABS: DashboardSectionTab[] = [
  { id: "themes", label: "Themes", href: "/dashboard/themes" },
  { id: "blog", label: "Blog posts", href: "/dashboard/blog" },
  { id: "pages", label: "Pages", href: "/dashboard/pages" },
  { id: "navigation", label: "Navigation", href: "/dashboard/navigation" },
  { id: "preferences", label: "Preferences", href: "/dashboard/settings?tab=general" },
];

function isTabActive(pathname: string, search: string, tabId: string): boolean {
  if (tabId === "themes") return pathname.startsWith("/dashboard/themes");
  if (tabId === "blog") return pathname.startsWith("/dashboard/blog");
  if (tabId === "pages") return pathname.startsWith("/dashboard/pages");
  if (tabId === "navigation") return pathname.startsWith("/dashboard/navigation");
  return pathname.startsWith("/dashboard/settings") && search.includes("tab=general");
}

function OnlineStoreSectionNavInner() {
  return <DashboardSectionNav tabs={TABS} isTabActive={isTabActive} />;
}

export function OnlineStoreSectionNav() {
  return (
    <Suspense fallback={null}>
      <OnlineStoreSectionNavInner />
    </Suspense>
  );
}

interface OnlineStorePageShellProps {
  children: React.ReactNode;
}

export function OnlineStorePageShell({ children }: OnlineStorePageShellProps) {
  return (
    <div className={dashboardStack}>
      <OnlineStoreSectionNav />
      {children}
    </div>
  );
}
