"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ProductsSectionCounts } from "@/types/products-stats";
import { EMPTY_PRODUCTS_SECTION_COUNTS } from "@/types/products-stats";
import {
  dashboardSegmentNav,
  dashboardSegmentTab,
  dashboardSegmentTabActive,
  dashboardSegmentTabInactive,
} from "@/lib/dashboard-ui";

const TABS = [
  { id: "all", label: "All products", href: "/dashboard/products", countKey: "products" as const },
  {
    id: "inventory",
    label: "Inventory",
    href: "/dashboard/products/inventory",
    countKey: "products" as const,
  },
];

interface ProductsSectionNavProps {
  counts?: ProductsSectionCounts;
  inventoryCount?: number;
}

function isActiveTab(pathname: string, href: string): boolean {
  if (href === "/dashboard/products") {
    return pathname === "/dashboard/products";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ProductsSectionNav({
  counts = EMPTY_PRODUCTS_SECTION_COUNTS,
  inventoryCount,
}: ProductsSectionNavProps) {
  const pathname = usePathname();

  return (
    <nav className={dashboardSegmentNav}>
      {TABS.map((tab) => {
        const active = isActiveTab(pathname, tab.href);
        const count =
          tab.id === "inventory" ? (inventoryCount ?? counts.products) : counts[tab.countKey];
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
            <span
              className={cn(
                "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                active ? "bg-[#007AFF]/10 text-[#007AFF]" : "bg-muted text-muted-foreground"
              )}
            >
              {count}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
