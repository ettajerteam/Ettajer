"use client";

import Link from "next/link";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { dashboardSubtitle, dashboardTitle } from "@/lib/dashboard-ui";
import { cn, formatCurrency } from "@/lib/utils";
import type { LiveViewData } from "@/lib/live-view-types";
import { ArrowUpRight, MapPin, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <section className="premium-card overflow-hidden ring-1 ring-neutral-200/60 dark:ring-white/10">
      <div className="flex items-center justify-between border-b border-neutral-200/80 bg-gradient-to-r from-white to-neutral-50/50 px-4 py-3.5 dark:border-white/10 dark:from-[#161616] dark:to-white/[0.02]">
        <div>
          <h3 className={dashboardTitle}>Recent orders</h3>
          <p className={dashboardSubtitle}>Click to focus country on the globe</p>
        </div>
        <Button asChild variant="outline" size="sm" className="h-8 rounded-lg text-xs">
          <Link href="/dashboard/orders">View all</Link>
        </Button>
      </div>

      {refreshing && orders.length > 0 ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="premium-skeleton h-14 rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-white/5">
            <ShoppingBag className="h-6 w-6 text-neutral-300" />
          </div>
          <p className="mt-3 text-sm font-medium text-neutral-700 dark:text-neutral-200">
            No recent orders
          </p>
          <p className="mt-1 text-xs text-neutral-500">New orders will appear here in real time</p>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-200/70 dark:divide-white/10">
          {orders.slice(0, 6).map((order) => {
            const isFocused = focusCode === order.countryCode;

            return (
              <li key={order.id}>
                <div
                  className={cn(
                    "group flex items-center gap-2 px-3 py-2.5 transition-all duration-300 sm:px-4 sm:py-3",
                    isFocused
                      ? "bg-gradient-to-r from-[#007AFF]/10 via-[#007AFF]/5 to-transparent"
                      : "hover:bg-neutral-50/80 dark:hover:bg-white/[0.02]"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onFocusOrder(order.countryCode)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                        isFocused
                          ? "bg-[#007AFF]/15 text-[#007AFF]"
                          : "bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-neutral-300"
                      )}
                    >
                      {getInitials(order.customerName)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                          {order.customerName}
                        </p>
                        <span className="hidden shrink-0 text-[10px] text-neutral-400 sm:inline">
                          {formatRelativeTime(order.createdAt)}
                        </span>
                      </div>
                      <p className="truncate text-xs text-neutral-500">
                        #{order.orderNumber}
                        {order.countryName ? ` · ${order.countryName}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
                        {formatCurrency(order.total, currency)}
                      </span>
                      {order.countryCode ? (
                        <MapPin
                          className={cn(
                            "h-3.5 w-3.5 transition-colors",
                            isFocused ? "text-[#007AFF]" : "text-neutral-300"
                          )}
                        />
                      ) : null}
                    </div>
                  </button>
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-neutral-300 transition-all hover:border-neutral-200/80 hover:bg-white hover:text-neutral-700 dark:hover:border-white/10 dark:hover:bg-white/[0.04] dark:hover:text-white"
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
