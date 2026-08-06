"use client";

import Link from "next/link";
import { ArrowUpRight, ShoppingBag, Share2 } from "lucide-react";
import type { HomeOrderRow } from "@/types/dashboard";
import type { OrderStatus } from "@/types";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { homeCard, homeSubtitle, homeTitle } from "./home-ui";
import { useHomeCopy } from "./home-i18n";

interface HomeRecentOrdersProps {
  orders: HomeOrderRow[];
  currency: string;
  storeSlug: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function HomeRecentOrders({ orders, currency, storeSlug }: HomeRecentOrdersProps) {
  const t = useHomeCopy();
  return (
    <section id="orders" className={`${homeCard} scroll-mt-24 overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
        <div>
          <h2 className={homeTitle}>{t.recentOrders}</h2>
          <p className={homeSubtitle}>{t.latestPurchases}</p>
        </div>
        <Button asChild variant="outline" size="sm" className="h-7 rounded-md text-[11px]">
          <Link href="/dashboard/orders">{t.viewAll}</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-neutral-100 dark:bg-white/[0.05]">
            <ShoppingBag className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="mt-4 text-[14px] font-semibold text-neutral-900 dark:text-white">
            {t.noOrdersYet}
          </h3>
          <p className="mt-1.5 max-w-sm text-[12px] leading-relaxed text-neutral-400">
            {t.noOrdersHint}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
            <Button asChild size="sm" className="h-7 rounded-md bg-neutral-900 px-3 text-[11px] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900">
              <Link href="/dashboard/orders/drafts/new">{t.createOrder}</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-7 rounded-md text-[11px]">
              <Link href={`/store/${storeSlug}`} target="_blank">
                <Share2 className="mr-1.5 h-3 w-3" />
                {t.shareStore}
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.05] text-left text-[11px] font-medium uppercase tracking-wide text-neutral-500 dark:border-white/10">
                <th className="px-5 py-2.5">Customer</th>
                <th className="px-5 py-2.5">Order</th>
                <th className="px-5 py-2.5">Status</th>
                <th className="px-5 py-2.5">Amount</th>
                <th className="w-10 px-5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map((order) => (
                <tr
                  key={order.id}
                  className="group border-b border-black/[0.04] last:border-0 hover:bg-neutral-50/80 dark:border-white/5 dark:hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-semibold text-neutral-700 dark:bg-white/10">
                        {getInitials(order.customerName)}
                      </span>
                      <span className="max-w-[120px] truncate font-medium text-neutral-900 dark:text-white">
                        {order.customerName}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-neutral-600">#{order.orderNumber}</td>
                  <td className="px-5 py-3">
                    <OrderStatusBadge status={order.status as OrderStatus} />
                  </td>
                  <td className="px-5 py-3 font-medium text-neutral-900 dark:text-white">
                    {formatCurrency(order.total, currency)}
                  </td>
                  <td className="px-5 py-3">
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
