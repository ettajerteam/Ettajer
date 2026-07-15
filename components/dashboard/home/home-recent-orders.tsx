"use client";

import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import type { HomeOrderRow } from "@/types/dashboard";
import type { OrderStatus } from "@/types";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { HomeEmptyState } from "./home-empty-state";
import { homeCard, homeSubtitle, homeTitle } from "./home-ui";

interface HomeRecentOrdersProps {
  orders: HomeOrderRow[];
  currency: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function HomeRecentOrders({ orders, currency }: HomeRecentOrdersProps) {
  return (
    <section id="orders" className={`${homeCard} scroll-mt-24 overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-neutral-200/80 px-4 py-3 dark:border-white/10">
        <div>
          <h2 className={homeTitle}>Recent orders</h2>
          <p className={homeSubtitle}>Latest customer activity</p>
        </div>
        <Button asChild variant="outline" size="sm" className="h-8 rounded-lg text-xs">
          <Link href="/dashboard/orders">View all</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="p-4">
          <HomeEmptyState
            icon={ShoppingBag}
            title="No orders yet"
            description="Orders will appear here when customers purchase."
            actionLabel="Create order"
            actionHref="/dashboard/orders/drafts/new"
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200/80 text-left text-[11px] font-medium uppercase tracking-wide text-neutral-500 dark:border-white/10">
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Amount</th>
                <th className="w-10 px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map((order) => (
                <tr
                  key={order.id}
                  className="group border-b border-neutral-200/60 last:border-0 hover:bg-neutral-50/80 dark:border-white/5 dark:hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-semibold text-neutral-700 dark:bg-white/10">
                        {getInitials(order.customerName)}
                      </span>
                      <span className="max-w-[120px] truncate font-medium text-neutral-900 dark:text-white">
                        {order.customerName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-600">#{order.orderNumber}</td>
                  <td className="px-4 py-2.5">
                    <OrderStatusBadge status={order.status as OrderStatus} />
                  </td>
                  <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-white">
                    {formatCurrency(order.total, currency)}
                  </td>
                  <td className="px-4 py-2.5">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100"
                    >
                      <Link href={`/dashboard/orders/${order.id}`} aria-label={`View order ${order.orderNumber}`}>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
