"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  Package,
  MoreHorizontal,
  ExternalLink,
  FileText,
  Copy,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrdersEmptyState } from "@/components/orders/orders-empty-state";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, cn } from "@/lib/utils";
import { getPaymentMethodLabel, getPaymentStatusLabel } from "@/types/orders";
import type { OrderListItem } from "@/types/orders";
import { dashboardCard, dashboardTitle } from "@/lib/dashboard-ui";

interface OrderListProps {
  orders: OrderListItem[];
  currency: string;
  title?: string;
  toolbar?: ReactNode;
  emptyAction?: ReactNode;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onPrintEtickets?: (orderIds: string[]) => void;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const paymentStyles: Record<string, string> = {
  unpaid: "text-amber-700",
  paid: "text-emerald-700",
  refunded: "text-pink-700",
  partially_refunded: "text-orange-700",
};

export function OrderList({
  orders,
  currency,
  title = "Orders",
  toolbar,
  emptyAction,
  selectedIds = [],
  onSelectionChange,
  onPrintEtickets,
}: OrderListProps) {
  const router = useRouter();
  const selectedSet = new Set(selectedIds);
  const allSelected = orders.length > 0 && orders.every((o) => selectedSet.has(o.id));
  const someSelected = orders.some((o) => selectedSet.has(o.id));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) onSelectionChange([]);
    else onSelectionChange(orders.map((o) => o.id));
  };

  const toggleOne = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedSet.has(id)) onSelectionChange(selectedIds.filter((x) => x !== id));
    else onSelectionChange([...selectedIds, id]);
  };

  const openOrder = (id: string) => {
    router.push(`/dashboard/orders/${id}`);
  };

  const copyOrderNumber = async (orderNumber: string) => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      toast.success("Order number copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  if (orders.length === 0) {
    return (
      <OrdersEmptyState
        icon={Package}
        title="No orders found"
        description="Orders appear when customers buy from your storefront, or create one manually."
        action={emptyAction}
      />
    );
  }

  return (
    <div className={cn(dashboardCard, "overflow-hidden")}>
      <div className="flex flex-col gap-2.5 border-b border-black/[0.05] px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
        <div className="flex items-center gap-2">
          <h2 className={dashboardTitle}>{title}</h2>
          {selectedIds.length > 0 && (
            <span className="rounded-md bg-[#F5F5F7] px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-white/10">
              {selectedIds.length} selected
            </span>
          )}
        </div>
        {toolbar}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-black/[0.05] text-left text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10">
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={toggleAll}
                  className="h-3.5 w-3.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
                  aria-label="Select all orders"
                />
              </th>
              <th className="px-3 py-2.5">Order</th>
              <th className="px-3 py-2.5">Customer</th>
              <th className="px-3 py-2.5">Items</th>
              <th className="px-3 py-2.5">Total</th>
              <th className="px-3 py-2.5">Payment</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="hidden px-3 py-2.5 md:table-cell">Date</th>
              <th className="w-10 px-2 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const selected = selectedSet.has(order.id);
              return (
                <tr
                  key={order.id}
                  onClick={() => openOrder(order.id)}
                  className={cn(
                    "group cursor-pointer border-b border-black/[0.04] last:border-0 transition-colors duration-150",
                    selected
                      ? "bg-[#F5F5F7]/90 dark:bg-white/[0.05]"
                      : "hover:bg-[#F5F5F7]/80 dark:hover:bg-white/[0.03]"
                  )}
                >
                  <td
                    className="px-3 py-2.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleOne(order.id)}
                      className="h-3.5 w-3.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
                      aria-label={`Select order ${order.orderNumber}`}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-medium text-neutral-900 dark:text-white">
                      #{order.orderNumber}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {order.customerName}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      {order.customerPhone || order.customerEmail}
                    </p>
                  </td>
                  <td className="px-3 py-2.5 text-neutral-500">{order.itemCount}</td>
                  <td className="px-3 py-2.5 font-medium text-neutral-900 dark:text-white">
                    {formatCurrency(order.total, currency)}
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="text-[10px] text-neutral-400">
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </p>
                    <p className={cn("text-[11px] font-medium", paymentStyles[order.paymentStatus])}>
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </p>
                  </td>
                  <td className="px-3 py-2.5">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="hidden px-3 py-2.5 text-neutral-400 md:table-cell">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-neutral-400 hover:text-neutral-800"
                          aria-label="Order actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => openOrder(order.id)}>
                          <ExternalLink className="mr-2 h-3.5 w-3.5" />
                          Open order
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onPrintEtickets?.([order.id])}
                        >
                          <Ticket className="mr-2 h-3.5 w-3.5" />
                          Print e-tickets
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            window.open(`/api/orders/${order.id}/invoice`, "_blank")
                          }
                        >
                          <FileText className="mr-2 h-3.5 w-3.5" />
                          Print invoice
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => void copyOrderNumber(order.orderNumber)}>
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          Copy order #
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
