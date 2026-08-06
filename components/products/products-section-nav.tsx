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
import type { ProductsSectionCounts } from "@/types/products-stats";
import { EMPTY_PRODUCTS_SECTION_COUNTS } from "@/types/products-stats";

const TABS = [
  { id: "all", label: "All products", href: "/dashboard/products", countKey: "products" as const },
  {
    id: "inventory",
    label: "Inventory",
    href: "/dashboard/products/inventory",
    countKey: "products" as const,
  },
  {
    id: "reviews",
    label: "Reviews",
    href: "/dashboard/products/reviews",
    countKey: "products" as const,
  },
];

interface ProductsSectionNavProps {
  counts?: ProductsSectionCounts;
  inventoryCount?: number;
  reviewsCount?: number;
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
  reviewsCount,
}: ProductsSectionNavProps) {
  const pathname = usePathname();

  return (
    <nav className={dashboardSegmentNav}>
      {TABS.map((tab) => {
        const active = isActiveTab(pathname, tab.href);
        const count =
          tab.id === "inventory"
            ? (inventoryCount ?? counts.products)
            : tab.id === "reviews"
              ? (reviewsCount ?? 0)
              : counts[tab.countKey];
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
                "inline-flex min-w-[1.15rem] items-center justify-center rounded px-1 text-[10px] font-semibold tabular-nums",
                active
                  ? "text-neutral-400 dark:text-neutral-500"
                  : "text-neutral-300 dark:text-neutral-600"
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
