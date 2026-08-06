"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Download, Ticket, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { OrderFiltersBar, type OrderFilters } from "@/components/orders/order-filters";
import { OrderList } from "@/components/orders/order-list";
import { OrderTableSkeleton } from "@/components/orders/order-table-skeleton";
import { isValidOrderStatus } from "@/lib/validations/order";
import { formatCurrency } from "@/lib/utils";
import type { OrderListItem } from "@/types/orders";

interface OrdersClientProps {
  initialOrders: OrderListItem[];
  currency: string;
}

const defaultFilters: OrderFilters = {
  status: "all",
  dateFrom: "",
  dateTo: "",
  search: "",
};

function filtersFromSearchParams(params: URLSearchParams): OrderFilters {
  const statusParam = params.get("status")?.trim() ?? "";
  const status =
    statusParam && statusParam !== "all" && isValidOrderStatus(statusParam)
      ? statusParam
      : "all";
  return {
    status,
    dateFrom: params.get("dateFrom")?.trim() ?? "",
    dateTo: params.get("dateTo")?.trim() ?? "",
    search: params.get("search")?.trim() ?? "",
  };
}

async function openEtickets(orderIds: string[]) {
  const res = await fetch("/api/orders/etickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderIds }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? "Failed to generate e-tickets");
  }

  const html = await res.text();
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    URL.revokeObjectURL(url);
    throw new Error("Allow pop-ups to print e-tickets");
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function OrdersClient({ initialOrders, currency }: OrdersClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState(initialOrders);
  const [filters, setFilters] = useState<OrderFilters>(() =>
    filtersFromSearchParams(new URLSearchParams(searchParams.toString()))
  );
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const pendingCount = useMemo(
    () => initialOrders.filter((o) => o.status === "pending").length,
    [initialOrders]
  );
  const codOutstanding = useMemo(
    () =>
      initialOrders
        .filter(
          (o) =>
            o.paymentMethod === "cod" &&
            o.paymentStatus === "unpaid" &&
            !["cancelled", "returned", "refunded"].includes(o.status)
        )
        .reduce((sum, o) => sum + o.total, 0),
    [initialOrders]
  );
  const paidRevenue = useMemo(
    () =>
      initialOrders
        .filter((o) => o.paymentStatus === "paid")
        .reduce((sum, o) => sum + o.total, 0),
    [initialOrders]
  );

  const syncUrl = useCallback(
    (f: OrderFilters) => {
      const params = new URLSearchParams();
      if (f.status !== "all") params.set("status", f.status);
      if (f.dateFrom) params.set("dateFrom", f.dateFrom);
      if (f.dateTo) params.set("dateTo", f.dateTo);
      if (f.search) params.set("search", f.search);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const handleFiltersChange = useCallback(
    (next: OrderFilters) => {
      setFilters(next);
      syncUrl(next);
    },
    [syncUrl]
  );

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
      if (res.ok) {
        setOrders(data.orders);
        setSelectedIds([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fromUrl = filtersFromSearchParams(new URLSearchParams(searchParams.toString()));
    setFilters((prev) => {
      if (
        prev.status === fromUrl.status &&
        prev.dateFrom === fromUrl.dateFrom &&
        prev.dateTo === fromUrl.dateTo &&
        prev.search === fromUrl.search
      ) {
        return prev;
      }
      return fromUrl;
    });
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasFilters =
        filters.status !== "all" || filters.dateFrom || filters.dateTo || filters.search;
      if (hasFilters) fetchOrders(filters);
      else {
        setOrders(initialOrders);
        setSelectedIds([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, fetchOrders, initialOrders]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (filters.status !== "all") params.set("status", filters.status);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);
      if (filters.search) params.set("search", filters.search);

      const res = await fetch(`/api/orders/export?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Export failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Orders exported");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handlePrintEtickets = async (orderIds: string[]) => {
    if (orderIds.length === 0) {
      toast.error("Select at least one order");
      return;
    }
    setPrinting(true);
    try {
      await openEtickets(orderIds);
      toast.success(
        orderIds.length === 1
          ? "E-tickets ready to print"
          : `E-tickets for ${orderIds.length} orders ready`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Print failed");
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="space-y-3">
      {(pendingCount > 0 || codOutstanding > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-amber-200/80 bg-amber-50/80 px-3 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/10">
          <div className="min-w-0">
            {pendingCount > 0 ? (
              <p className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
                {pendingCount} order{pendingCount === 1 ? "" : "s"} need confirmation
              </p>
            ) : (
              <p className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
                COD still outstanding
              </p>
            )}
            <p className="text-[10px] text-amber-800/80 dark:text-amber-200/70">
              Collected {formatCurrency(paidRevenue, currency)}
              {codOutstanding > 0
                ? ` · COD outstanding ${formatCurrency(codOutstanding, currency)}`
                : ""}
            </p>
          </div>
          {pendingCount > 0 && filters.status !== "pending" ? (
            <Button
              variant="outline"
              className="h-7 rounded-md border-amber-300/80 bg-white px-2.5 text-[11px] text-amber-900 hover:bg-amber-50 dark:border-amber-500/30 dark:bg-transparent dark:text-amber-100"
              onClick={() => handleFiltersChange({ ...filters, status: "pending" })}
            >
              Show pending
            </Button>
          ) : null}
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-black/[0.06] bg-white px-3 py-2 dark:border-white/10 dark:bg-[#1C1C1E]">
          <span className="text-[12px] font-medium text-neutral-700 dark:text-neutral-200">
            {selectedIds.length} selected
          </span>
          <Button
            className="h-7 rounded-md bg-neutral-900 px-2.5 text-[11px] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
            loading={printing}
            onClick={() => void handlePrintEtickets(selectedIds)}
          >
            <Ticket className="mr-1.5 h-3 w-3" />
            Print e-tickets
          </Button>
          <Button
            variant="ghost"
            className="h-7 rounded-md px-2 text-[11px] text-neutral-500"
            onClick={() => setSelectedIds([])}
          >
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        </div>
      )}

      {loading ? (
        <OrderTableSkeleton />
      ) : (
        <OrderList
          orders={orders}
          currency={currency}
          title="Orders"
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onPrintEtickets={(ids) => void handlePrintEtickets(ids)}
          toolbar={
            <div className="flex flex-wrap items-center gap-1.5">
              <OrderFiltersBar filters={filters} onChange={handleFiltersChange} compact />
              <Button
                variant="outline"
                className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] dark:border-white/10"
                loading={exporting}
                onClick={handleExport}
              >
                <Download className="mr-1.5 h-3 w-3" />
                Export
              </Button>
            </div>
          }
        />
      )}
    </div>
  );
}
