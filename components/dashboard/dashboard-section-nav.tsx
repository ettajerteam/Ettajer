"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  dashboardSegmentNav,
  dashboardSegmentTab,
  dashboardSegmentTabActive,
  dashboardSegmentTabInactive,
} from "@/lib/dashboard-ui";

export interface DashboardSectionTab {
  id: string;
  label: string;
  href: string;
}

interface DashboardSectionNavProps {
  tabs: readonly DashboardSectionTab[];
  isTabActive: (pathname: string, search: string, tabId: string) => boolean;
  className?: string;
}

export function DashboardSectionNav({ tabs, isTabActive, className }: DashboardSectionNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  return (
    <nav className={cn(dashboardSegmentNav, className)}>
      {tabs.map((tab) => {
        const active = isTabActive(pathname, search, tab.id);
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              dashboardSegmentTab,
              "px-3",
              active ? dashboardSegmentTabActive : dashboardSegmentTabInactive
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
