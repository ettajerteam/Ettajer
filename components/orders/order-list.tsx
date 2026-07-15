"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Package, ChevronRight } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrdersEmptyState } from "@/components/orders/orders-empty-state";
import { formatCurrency } from "@/lib/utils";
import type { OrderListItem } from "@/types/orders";

interface OrderListProps {
  orders: OrderListItem[];
  currency: string;
  title?: string;
  toolbar?: ReactNode;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function OrderList({ orders, currency, title = "Orders", toolbar }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <OrdersEmptyState
        icon={Package}
        title="No orders found"
        description="Orders will appear here when customers purchase from your storefront."
      />
    );
  }

  return (
    <div className="premium-card overflow-hidden">
      <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">{title}</h2>
        {toolbar}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-6 py-3 font-medium">Order</th>
              <th className="px-6 py-3 font-medium">Customer</th>
              <th className="px-6 py-3 font-medium">Items</th>
              <th className="px-6 py-3 font-medium">Total</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="hidden px-6 py-3 font-medium md:table-cell">Date</th>
              <th className="px-5 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="group border-b border-border/80 last:border-0 hover:bg-muted/35 transition-colors duration-200"
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="font-medium text-foreground hover:text-[#007AFF] transition-colors"
                  >
                    #{order.orderNumber}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-foreground">{order.customerName}</p>
                  <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{order.itemCount}</td>
                <td className="px-6 py-4 font-medium text-foreground">
                  {formatCurrency(order.total, currency)}
                </td>
                <td className="px-6 py-4">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="hidden px-6 py-4 text-muted-foreground md:table-cell">
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
