"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  dashboardSegmentNav,
  dashboardSegmentTab,
  dashboardSegmentTabActive,
  dashboardSegmentTabInactive,
} from "@/lib/dashboard-ui";

const TABS = [
  { id: "themes", label: "Themes", href: "/dashboard/themes" },
  { id: "domains", label: "Domains", href: "/dashboard/domains" },
  { id: "blog", label: "Blog", href: "/dashboard/blog" },
  { id: "pages", label: "Pages", href: "/dashboard/pages" },
  { id: "navigation", label: "Navigation", href: "/dashboard/navigation" },
] as const;

function isActiveTab(pathname: string, href: string): boolean {
  if (href === "/dashboard/themes") {
    return pathname === "/dashboard/themes" || pathname.startsWith("/dashboard/themes/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function OnlineStoreSectionNav() {
  const pathname = usePathname();

  return (
    <nav className={dashboardSegmentNav}>
      {TABS.map((tab) => {
        const active = isActiveTab(pathname, tab.href);
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
