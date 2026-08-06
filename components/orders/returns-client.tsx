"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Copy,
  ExternalLink,
  MoreHorizontal,
  Package,
  RotateCcw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  dashboardCard,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  type OrderListItem,
} from "@/types/orders";

interface ReturnsClientProps {
  orders: OrderListItem[];
  currency: string;
}

type ReturnsFilter = "all" | "returned" | "refunded";

const FILTERS: { value: ReturnsFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "returned", label: "Returned" },
  { value: "refunded", label: "Refunded" },
];

function ReturnsEmptyState() {
  return (
    <div className={cn(dashboardCard, "overflow-hidden")}>
      <div className="px-6 py-10 text-center sm:px-10 sm:py-12">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F5F7] dark:bg-white/[0.06]">
          <RotateCcw className="h-5 w-5 text-neutral-400" />
        </div>
        <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
          No returns yet
        </h3>
        <p className="mx-auto mt-2 max-w-md text-[12px] leading-relaxed text-neutral-400">
          Returned and refunded orders appear here. Process them from an order’s
          detail page — inventory restocks automatically when eligible.
        </p>
        <Button
          asChild
          variant="outline"
          className="mt-5 h-8 rounded-md border-black/[0.06] px-3 text-[12px] dark:border-white/10"
        >
          <Link href="/dashboard/orders">
            <Package className="mr-1.5 h-3.5 w-3.5" />
            View orders
          </Link>
        </Button>
      </div>

      <div className="grid gap-px border-t border-black/[0.05] bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.06] sm:grid-cols-3">
        {[
          {
            step: "01",
            title: "Open the order",
            body: "Find the order in Orders, then open its detail page.",
          },
          {
            step: "02",
            title: "Mark returned or refunded",
            body: "Update status or record a refund from fulfillment and payment.",
          },
          {
            step: "03",
            title: "Track it here",
            body: "It shows up in Returns so you can review history anytime.",
          },
        ].map((tip) => (
          <div
            key={tip.step}
            className="bg-white px-5 py-4 text-left dark:bg-[#1C1C1E]"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-300">
              {tip.step}
            </p>
            <p className={cn(dashboardTitle, "mt-1.5")}>{tip.title}</p>
            <p className={cn(dashboardSubtitle, "mt-1 leading-relaxed")}>{tip.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReturnsClient({ orders, currency }: ReturnsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ReturnsFilter>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!q) return true;
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
      );
    });
  }, [orders, search, filter]);

  const counts = useMemo(() => {
    let returned = 0;
    let refunded = 0;
    for (const o of orders) {
      if (o.status === "returned") returned += 1;
      if (o.status === "refunded") refunded += 1;
    }
    return { all: orders.length, returned, refunded };
  }, [orders]);

  async function copyOrderNumber(orderNumber: string) {
    try {
      await navigator.clipboard.writeText(orderNumber);
      toast.success("Order number copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  if (orders.length === 0) {
    return <ReturnsEmptyState />;
  }

  return (
    <div className={cn(dashboardCard, "overflow-hidden")}>
      <div className="flex flex-col gap-2.5 border-b border-black/[0.05] px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
        <h2 className={dashboardTitle}>
          Returns & refunds
          <span className="ml-1.5 font-normal text-neutral-400">{filtered.length}</span>
        </h2>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="inline-flex rounded-md border border-black/[0.06] bg-[#F5F5F7]/80 p-0.5 dark:border-white/10 dark:bg-white/[0.04]">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={cn(
                  "rounded-[5px] px-2 py-1 text-[11px] font-medium transition-colors",
                  filter === f.value
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-white/10 dark:text-white"
                    : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                )}
              >
                {f.label}
                <span className="ml-1 text-neutral-300 dark:text-neutral-500">
                  {counts[f.value]}
                </span>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders…"
              className="h-7 w-36 rounded-md border border-black/[0.06] bg-[#F5F5F7] pl-7 pr-2.5 text-[12px] outline-none focus:ring-1 focus:ring-[#007AFF]/30 sm:w-44 dark:border-white/10 dark:bg-white/[0.05]"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-4 py-10 text-center text-[12px] text-neutral-400">
          No returns match your filters
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-black/[0.05] text-left text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10">
                <th className="px-4 py-2.5">Order</th>
                <th className="px-4 py-2.5">Customer</th>
                <th className="px-4 py-2.5">Items</th>
                <th className="px-4 py-2.5">Total</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="hidden px-4 py-2.5 md:table-cell">Payment</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                  className="cursor-pointer border-b border-black/[0.04] last:border-0 transition-colors duration-150 hover:bg-[#F5F5F7]/80 dark:border-white/5 dark:hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-neutral-900 dark:text-white">
                      #{order.orderNumber}
                    </p>
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {order.customerName}
                    </p>
                    <p className="text-[10px] text-neutral-400">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-500">{order.itemCount}</td>
                  <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-white">
                    {formatCurrency(order.total, currency)}
                  </td>
                  <td className="px-4 py-2.5">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="hidden px-4 py-2.5 text-neutral-400 md:table-cell">
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-300">
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </p>
                    <p className="text-[10px]">
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </p>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-400">
                    <span suppressHydrationWarning>{formatDate(order.createdAt)}</span>
                  </td>
                  <td
                    className="px-4 py-2.5 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-neutral-400"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                        >
                          <ExternalLink className="mr-2 h-3.5 w-3.5" />
                          Open order
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => void copyOrderNumber(order.orderNumber)}
                        >
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          Copy number
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
