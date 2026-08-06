"use client";

import Link from "next/link";
import { formatRelativeTime } from "@/lib/format-relative-time";
import {
  dashboardCard,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn, formatCurrency } from "@/lib/utils";
import type { LiveViewData } from "@/lib/live-view-types";
import { ArrowUpRight, MapPin, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface LiveRecentOrdersProps {
  orders: LiveViewData["recentOrders"];
  currency: string;
  focusCode: string | null;
  refreshing: boolean;
  onFocusOrder: (countryCode: string | null) => void;
}

export function LiveRecentOrders({
  orders,
  currency,
  focusCode,
  refreshing,
  onFocusOrder,
}: LiveRecentOrdersProps) {
  return (
    <section className={cn(dashboardCard, "overflow-hidden")}>
      <div className="flex items-center justify-between border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
        <div>
          <h3 className={dashboardTitle}>Recent orders</h3>
          <p className={dashboardSubtitle}>Click to focus country on the globe</p>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-7 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10"
        >
          <Link href="/dashboard/orders">View all</Link>
        </Button>
      </div>

      {refreshing && orders.length > 0 ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
          <ShoppingBag className="h-5 w-5 text-neutral-300" />
          <p className="mt-2 text-[12px] font-medium text-neutral-700 dark:text-neutral-200">
            No recent orders
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">
            New orders will appear here in real time
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-black/[0.04] dark:divide-white/5">
          {orders.slice(0, 6).map((order) => {
            const isFocused = focusCode === order.countryCode;

            return (
              <li key={order.id}>
                <div
                  className={cn(
                    "group flex items-center gap-1.5 px-3 py-2.5 sm:px-4",
                    isFocused
                      ? "bg-[#007AFF]/[0.06]"
                      : "hover:bg-[#F5F5F7]/80 dark:hover:bg-white/[0.03]"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onFocusOrder(order.countryCode)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                        isFocused
                          ? "bg-[#007AFF]/15 text-[#007AFF]"
                          : "bg-[#F5F5F7] text-neutral-600 dark:bg-white/[0.08] dark:text-neutral-300"
                      )}
                    >
                      {getInitials(order.customerName)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                          {order.customerName}
                        </p>
                        <span
                          className="hidden shrink-0 text-[10px] text-neutral-400 sm:inline"
                          suppressHydrationWarning
                        >
                          {formatRelativeTime(order.createdAt)}
                        </span>
                      </div>
                      <p className="truncate text-[10px] text-neutral-400">
                        #{order.orderNumber}
                        {order.countryName ? ` · ${order.countryName}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="text-[12px] font-semibold tabular-nums text-neutral-900 dark:text-white">
                        {formatCurrency(order.total, currency)}
                      </span>
                      {order.countryCode ? (
                        <MapPin
                          className={cn(
                            "h-3.5 w-3.5",
                            isFocused ? "text-[#007AFF]" : "text-neutral-300"
                          )}
                        />
                      ) : null}
                    </div>
                  </button>
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-300 transition-colors hover:bg-black/[0.04] hover:text-neutral-700 dark:hover:bg-white/[0.06] dark:hover:text-white"
                    aria-label={`Open order ${order.orderNumber}`}
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
