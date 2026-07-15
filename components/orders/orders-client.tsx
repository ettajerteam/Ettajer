"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardCheck, Clock, Package, TrendingUp } from "lucide-react";
import { OrderFiltersBar, type OrderFilters } from "@/components/orders/order-filters";
import { OrderList } from "@/components/orders/order-list";
import { OrderTableSkeleton } from "@/components/orders/order-table-skeleton";
import { OrdersSectionNav } from "@/components/orders/orders-section-nav";
import { OrdersStatGrid } from "@/components/orders/orders-stat-grid";
import { formatCurrency } from "@/lib/utils";
import type { OrdersListStats, OrdersSectionCounts } from "@/lib/orders-stats";
import {
  EMPTY_ORDERS_LIST_STATS,
  EMPTY_ORDERS_SECTION_COUNTS,
} from "@/lib/orders-stats";
import type { OrderListItem } from "@/types/orders";

interface OrdersClientProps {
  initialOrders: OrderListItem[];
  currency: string;
  counts?: OrdersSectionCounts;
  stats?: OrdersListStats;
}

const defaultFilters: OrderFilters = {
  status: "all",
  dateFrom: "",
  dateTo: "",
  search: "",
};

export function OrdersClient({
  initialOrders,
  currency,
  counts = EMPTY_ORDERS_SECTION_COUNTS,
  stats = EMPTY_ORDERS_LIST_STATS,
}: OrdersClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [filters, setFilters] = useState<OrderFilters>(defaultFilters);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async (f: OrderFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.status !== "all") params.set("status", f.status);
      if (f.dateFrom) params.set("dateFrom", f.dateFrom);
      if (f.dateTo) params.set("dateTo", f.dateTo);
      if (f.search) params.set("search", f.search);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setOrders(data.orders);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasFilters =
        filters.status !== "all" || filters.dateFrom || filters.dateTo || filters.search;
      if (hasFilters) fetchOrders(filters);
      else setOrders(initialOrders);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, fetchOrders, initialOrders]);

  const statItems = [
    { icon: Package, label: "Total orders", value: stats.total.toLocaleString() },
    { icon: Clock, label: "Pending", value: stats.pending.toLocaleString() },
    { icon: ClipboardCheck, label: "In progress", value: stats.inProgress.toLocaleString() },
    {
      icon: TrendingUp,
      label: "Revenue",
      value: formatCurrency(stats.revenue, currency),
      hint: "Excludes cancelled",
    },
  ];

  return (
    <div className="space-y-4">
      <OrdersSectionNav counts={counts} />
      <OrdersStatGrid stats={statItems} />
      {loading ? (
        <OrderTableSkeleton />
      ) : (
        <OrderList
          orders={orders}
          currency={currency}
          title="All orders"
          toolbar={<OrderFiltersBar filters={filters} onChange={setFilters} compact />}
        />
      )}
    </div>
  );
}
