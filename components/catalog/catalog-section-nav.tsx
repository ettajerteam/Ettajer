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
  { id: "collections", label: "Collections", href: "/dashboard/collections" },
  { id: "categories", label: "Categories", href: "/dashboard/categories" },
  { id: "gift-cards", label: "Gift cards", href: "/dashboard/gift-cards" },
];

export function CatalogSectionNav() {
  const pathname = usePathname();

  return (
    <nav className={dashboardSegmentNav}>
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              dashboardSegmentTab,
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
