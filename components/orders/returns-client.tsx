"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, RotateCcw, DollarSign, Calendar, Package } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrdersSectionNav } from "@/components/orders/orders-section-nav";
import { OrdersStatGrid } from "@/components/orders/orders-stat-grid";
import { OrdersEmptyState } from "@/components/orders/orders-empty-state";
import { formatCurrency } from "@/lib/utils";
import type { OrdersSectionCounts, ReturnsListStats } from "@/lib/orders-stats";
import { EMPTY_ORDERS_SECTION_COUNTS } from "@/lib/orders-stats";
import type { OrderListItem } from "@/types/orders";

interface ReturnsClientProps {
  orders: OrderListItem[];
  currency: string;
  counts?: OrdersSectionCounts;
  stats?: ReturnsListStats;
}

function computeReturnStats(orders: OrderListItem[]): ReturnsListStats {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  return {
    count: orders.length,
    totalValue: orders.reduce((sum, o) => sum + o.total, 0),
    thisMonth: orders.filter((o) => new Date(o.createdAt) >= startOfMonth).length,
  };
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ReturnsClient({
  orders,
  currency,
  counts = EMPTY_ORDERS_SECTION_COUNTS,
}: ReturnsClientProps) {
  const [search, setSearch] = useState("");

  const displayStats = useMemo(() => computeReturnStats(orders), [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
    );
  }, [orders, search]);

  const statItems = [
    { icon: RotateCcw, label: "Total returns", value: displayStats.count.toLocaleString() },
    {
      icon: DollarSign,
      label: "Return value",
      value: formatCurrency(displayStats.totalValue, currency),
    },
    {
      icon: Calendar,
      label: "This month",
      value: displayStats.thisMonth.toLocaleString(),
      hint: "Returns processed",
    },
    {
      icon: Package,
      label: "Avg. return",
      value:
        displayStats.count > 0
          ? formatCurrency(displayStats.totalValue / displayStats.count, currency)
          : "—",
    },
  ];

  return (
    <div className="space-y-4">
      <OrdersSectionNav counts={counts} />
      <OrdersStatGrid stats={statItems} />

      {orders.length === 0 ? (
        <OrdersEmptyState
          icon={RotateCcw}
          title="No returns"
          description="Returned orders will appear here. Mark an order as returned from its detail page."
        />
      ) : (
        <div className="premium-card overflow-hidden">
          <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">Returned orders</h2>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search returns..."
                className="h-9 w-44 rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 sm:w-52"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                      No returns match your search
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => (
                    <tr
                      key={order.id}
                      className="group border-b border-border/80 last:border-0 transition-colors duration-200 hover:bg-muted/35"
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="font-medium text-foreground hover:text-[#007AFF] transition-colors"
                        >
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-foreground">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{order.itemCount}</td>
                      <td className="px-5 py-3 font-medium text-foreground">
                        {formatCurrency(order.total, currency)}
                      </td>
                      <td className="px-5 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
