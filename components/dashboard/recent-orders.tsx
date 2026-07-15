"use client";

import Link from "next/link";
import { FadeIn } from "@/components/ui/motion";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { cn, formatCurrency } from "@/lib/utils";
import { dashboardCard, dashboardCardPad } from "@/lib/dashboard-ui";
import type { OrderStatus } from "@/types";

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

interface RecentOrdersTableProps {
  orders: RecentOrder[];
  currency?: string;
}

export function RecentOrdersTable({ orders, currency = "MAD" }: RecentOrdersTableProps) {
  if (orders.length === 0) {
    return (
      <FadeIn>
        <div className={cn(dashboardCard, dashboardCardPad, "p-12 text-center")}>
          <p className="text-muted-foreground">No orders yet. Share your store to get started!</p>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <div className={cn(dashboardCard, "overflow-hidden")}>
        <div className="p-6 border-b">
          <h3 className="font-semibold">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium">
                    <Link href={`/dashboard/orders/${order.id}`} className="hover:text-[#007AFF] transition-colors">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm">{order.customerName}</td>
                  <td className="px-6 py-4 text-sm">{formatCurrency(order.total, currency)}</td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </FadeIn>
  );
}
