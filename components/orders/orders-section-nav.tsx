"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { OrdersSectionCounts } from "@/lib/orders-stats";
import { EMPTY_ORDERS_SECTION_COUNTS } from "@/lib/orders-stats";
import {
  dashboardSegmentNav,
  dashboardSegmentTab,
  dashboardSegmentTabActive,
  dashboardSegmentTabInactive,
} from "@/lib/dashboard-ui";

const TABS = [
  { id: "all", label: "All orders", href: "/dashboard/orders", countKey: "orders" as const },
  { id: "drafts", label: "Drafts", href: "/dashboard/orders/drafts", countKey: "drafts" as const },
  {
    id: "abandoned",
    label: "Abandoned checkouts",
    href: "/dashboard/orders/abandoned",
    countKey: "abandoned" as const,
  },
  { id: "returns", label: "Returns", href: "/dashboard/orders/returns", countKey: "returns" as const },
];

interface OrdersSectionNavProps {
  counts?: OrdersSectionCounts;
}

function isActiveTab(pathname: string, href: string): boolean {
  if (href === "/dashboard/orders") {
    return (
      pathname === "/dashboard/orders" ||
      (pathname.startsWith("/dashboard/orders/") &&
        !pathname.startsWith("/dashboard/orders/drafts") &&
        !pathname.startsWith("/dashboard/orders/abandoned") &&
        !pathname.startsWith("/dashboard/orders/returns"))
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function OrdersSectionNav({ counts = EMPTY_ORDERS_SECTION_COUNTS }: OrdersSectionNavProps) {
  const pathname = usePathname();

  return (
    <nav className={dashboardSegmentNav}>
      {TABS.map((tab) => {
        const active = isActiveTab(pathname, tab.href);
        const count = counts[tab.countKey];
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
                "inline-flex min-w-[1.1rem] items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                active
                  ? "bg-white text-neutral-700 dark:bg-white/10 dark:text-neutral-200"
                  : "bg-[#F5F5F7] text-neutral-400 dark:bg-white/[0.06]"
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
