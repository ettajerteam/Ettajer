"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Package,
  AlertTriangle,
  CircleOff,
  X,
  Pencil,
  Truck,
  Warehouse,
  Download,
  Briefcase,
  MoreHorizontal,
  Minus,
  Plus,
  SquarePen,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductsEmptyState } from "@/components/products/products-empty-state";
import { ProductsSectionNav } from "@/components/products/products-section-nav";
import { ProductTableSkeleton } from "@/components/products/product-table-skeleton";
import { cn, formatCurrency } from "@/lib/utils";
import {
  dashboardCard,
  dashboardKicker,
  dashboardMetric,
  dashboardPill,
  dashboardPillActive,
  dashboardPillGroup,
  dashboardPillInactive,
  dashboardStack,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import type { InventoryItem, StockFilter } from "@/lib/inventory";
import type { ProductsSectionCounts } from "@/types/products-stats";
import type { ProductType } from "@/lib/product-types";

interface InventorySummary {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
  totalCost?: number;
  totalProfit?: number;
  units?: number;
  needsAttention?: number;
}

interface InventoryClientProps {
  initialItems: InventoryItem[];
  summary: InventorySummary;
  currency: string;
  counts?: ProductsSectionCounts;
  reviewsCount?: number;
}

const FILTERS: { value: StockFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in_stock", label: "In stock" },
  { value: "low_stock", label: "Low stock" },
  { value: "out_of_stock", label: "Out of stock" },
];

const TYPE_META: Record<ProductType, { label: string; icon: typeof Package }> = {
  physical: { label: "Physical", icon: Package },
  digital: { label: "Digital", icon: Download },
  service: { label: "Service", icon: Briefcase },
  dropshipping: { label: "Dropshipping", icon: Truck },
};

function catalogTitle(title: string, maxChars = 44): string {
  const cleaned = title
    .replace(/\s*[-–—]\s*AliExpress(?:\s*\d+)?\s*\/?\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length <= maxChars) return cleaned;
  const slice = cleaned.slice(0, maxChars);
  const cut = slice.replace(/\s+\S*$/, "").trimEnd();
  return `${(cut.length > 18 ? cut : slice).trimEnd()}…`;
}

function formatRelative(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days}d ago`;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(t));
}

function withUpdatedStock(item: InventoryItem, inventory: number): InventoryItem {
  const qty = Math.max(0, Math.floor(inventory));
  const status =
    qty <= 0 ? "out_of_stock" : qty <= item.lowStockAlert ? "low_stock" : "in_stock";
  return {
    ...item,
    inventory: qty,
    status,
    stockValue: qty * item.price,
    costValue: typeof item.costPrice === "number" ? qty * item.costPrice : 0,
    potentialProfit:
      typeof item.costPrice === "number"
        ? Math.round((item.price - item.costPrice) * qty * 100) / 100
        : null,
    updatedAt: new Date().toISOString(),
  };
}

export function InventoryClient({
  initialItems,
  summary,
  currency,
  counts,
  reviewsCount = 0,
}: InventoryClientProps) {
  const [items, setItems] = useState(initialItems);
  const [liveSummary, setLiveSummary] = useState(summary);
  const [filter, setFilter] = useState<StockFilter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [stockItem, setStockItem] = useState<InventoryItem | null>(null);
  const [draftQty, setDraftQty] = useState(0);
  const [saving, setSaving] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const skipFirstFetch = useRef(true);

  useEffect(() => {
    setItems(initialItems);
    setLiveSummary(summary);
  }, [initialItems, summary]);

  const fetchItems = useCallback(async (f: StockFilter, q: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const params = new URLSearchParams({ filter: f });
      if (q.trim()) params.set("search", q.trim());
      const res = await fetch(`/api/inventory?${params}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load inventory");
      const data = await res.json();
      if (controller.signal.aborted) return;
      setItems(data.items ?? []);
      if (data.summary) setLiveSummary(data.summary);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error(error instanceof Error ? error.message : "Failed to load inventory");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }
    const t = setTimeout(() => {
      void fetchItems(filter, search);
    }, 250);
    return () => clearTimeout(t);
  }, [filter, search, fetchItems]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const displaySummary = useMemo(() => {
    if (!search.trim() && filter === "all") return liveSummary;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let units = 0;
    let totalValue = 0;
    for (const item of items) {
      if (item.status === "in_stock") inStock++;
      else if (item.status === "low_stock") lowStock++;
      else outOfStock++;
      units += Math.max(0, item.inventory);
      totalValue += item.stockValue;
    }
    return {
      ...liveSummary,
      totalProducts: items.length,
      inStock,
      lowStock,
      outOfStock,
      units,
      totalValue,
      needsAttention: lowStock + outOfStock,
    };
  }, [items, liveSummary, search, filter]);

  const filterCounts = useMemo(
    () => ({
      all: displaySummary.totalProducts,
      in_stock: displaySummary.inStock,
      low_stock: displaySummary.lowStock,
      out_of_stock: displaySummary.outOfStock,
    }),
    [displaySummary]
  );

  function openStockDialog(item: InventoryItem) {
    setStockItem(item);
    setDraftQty(item.inventory);
  }

  function closeStockDialog() {
    if (saving) return;
    setStockItem(null);
  }

  async function saveStock() {
    if (!stockItem) return;
    const next = Math.max(0, draftQty);
    if (!Number.isFinite(next) || next < 0) {
      toast.error("Enter a valid stock quantity");
      return;
    }
    const productId = stockItem.id;
    setSaving(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, inventory: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          typeof data.message === "string" ? data.message : "Failed to update stock"
        );
      }
      toast.success("Stock updated");
      setItems((prev) => {
        const updated = prev.map((item) =>
          item.id === productId ? withUpdatedStock(item, next) : item
        );
        let inStock = 0;
        let lowStock = 0;
        let outOfStock = 0;
        let units = 0;
        for (const item of updated) {
          if (item.status === "in_stock") inStock++;
          else if (item.status === "low_stock") lowStock++;
          else outOfStock++;
          units += Math.max(0, item.inventory);
        }
        setLiveSummary((s) => ({
          ...s,
          inStock,
          lowStock,
          outOfStock,
          units,
          needsAttention: lowStock + outOfStock,
        }));
        return updated;
      });
      setStockItem(null);
      void fetchItems(filter, search);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update stock");
    } finally {
      setSaving(false);
    }
  }

  const hasFilters = Boolean(search.trim()) || filter !== "all";
  const attention =
    displaySummary.needsAttention ?? displaySummary.lowStock + displaySummary.outOfStock;

  const statItems = [
    {
      label: "Products",
      value: displaySummary.totalProducts.toLocaleString(),
    },
    {
      label: "Units",
      value: (displaySummary.units ?? 0).toLocaleString(),
    },
    {
      label: "Needs attention",
      value: attention.toLocaleString(),
      hint:
        displaySummary.outOfStock > 0
          ? `${displaySummary.outOfStock} out of stock`
          : undefined,
    },
    {
      label: "Stock value",
      value: formatCurrency(displaySummary.totalValue, currency),
    },
  ];

  return (
    <div className={dashboardStack}>
      <ProductsSectionNav
        counts={counts}
        inventoryCount={displaySummary.totalProducts}
        reviewsCount={reviewsCount}
      />

      {attention > 0 && filter === "all" && !search.trim() ? (
        <div
          className={cn(
            dashboardCard,
            "flex flex-wrap items-start gap-3 border-amber-500/20 bg-amber-500/[0.06] px-4 py-3"
          )}
        >
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-amber-600">
            <AlertTriangle className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
              {attention} product{attention === 1 ? "" : "s"} need stock attention
            </p>
            <p className="mt-0.5 text-[11px] text-neutral-400">
              Click a row or use ··· to edit stock.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {displaySummary.outOfStock > 0 ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] dark:border-white/10"
                onClick={() => setFilter("out_of_stock")}
              >
                Out of stock
              </Button>
            ) : null}
            {displaySummary.lowStock > 0 ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] dark:border-white/10"
                onClick={() => setFilter("low_stock")}
              >
                Low stock
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {statItems.map((stat) => (
          <div key={stat.label} className={cn(dashboardCard, "px-3.5 py-3")}>
            <p className={dashboardKicker}>{stat.label}</p>
            <p className={cn(dashboardMetric, "mt-1 truncate")}>{stat.value}</p>
            {stat.hint ? (
              <p className="mt-0.5 text-[10px] text-neutral-400">{stat.hint}</p>
            ) : null}
          </div>
        ))}
      </div>

      {loading && items.length === 0 ? (
        <ProductTableSkeleton />
      ) : items.length === 0 ? (
        <ProductsEmptyState
          icon={CircleOff}
          title={hasFilters ? "No matches" : "No stock to track yet"}
          description={
            hasFilters
              ? "Try another filter or clear search."
              : "Physical and dropshipping products appear here once you add them to your catalog."
          }
          action={
            hasFilters ? (
              <Button
                type="button"
                variant="outline"
                className="h-8 rounded-md border-black/[0.06] px-3 text-[12px] dark:border-white/10"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button
                asChild
                className="h-8 rounded-md bg-neutral-900 px-3 text-[12px] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
              >
                <Link href="/dashboard/products/new">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add product
                </Link>
              </Button>
            )
          }
          tips={
            hasFilters
              ? undefined
              : [
                  {
                    step: "01",
                    title: "Add a physical product",
                    body: "Inventory tracks physical and dropshipping items.",
                  },
                  {
                    step: "02",
                    title: "Scan or search",
                    body: "Find products by name, SKU, or barcode.",
                  },
                  {
                    step: "03",
                    title: "Adjust stock",
                    body: "Click a row or use ··· → Edit stock.",
                  },
                ]
          }
        />
      ) : (
        <div className={cn(dashboardCard, "overflow-hidden")}>
          <div className="flex flex-col gap-2.5 border-b border-black/[0.05] px-4 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className={dashboardTitle}>
                Stock levels
                <span className="ml-1.5 font-normal text-neutral-400">
                  {loading ? "Updating…" : items.length}
                </span>
              </h2>
              <p className={dashboardSubtitle}>Click a row to edit stock</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <div className={dashboardPillGroup}>
                {FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFilter(f.value)}
                    className={cn(
                      dashboardPill,
                      filter === f.value ? dashboardPillActive : dashboardPillInactive
                    )}
                  >
                    {f.label}
                    <span className="ml-1 text-neutral-300 dark:text-neutral-500">
                      {filterCounts[f.value]}
                    </span>
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search or scan barcode…"
                  className="h-7 w-44 rounded-md border border-black/[0.06] bg-[#F5F5F7] pl-7 pr-7 text-[12px] outline-none focus:ring-1 focus:ring-[#007AFF]/30 sm:w-52 dark:border-white/10 dark:bg-white/[0.05]"
                />
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-1.5 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-neutral-400 hover:bg-black/[0.05]"
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Mobile */}
          <div className="divide-y divide-black/[0.04] dark:divide-white/5 md:hidden">
            {items.map((item) => {
              const type = TYPE_META[item.productType] ?? TYPE_META.physical;
              return (
                <div
                  key={item.id}
                  className="px-4 py-3 transition-colors hover:bg-[#F5F5F7]/80 dark:hover:bg-white/[0.03]"
                  onClick={() => openStockDialog(item)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-black/[0.06] bg-[#F5F5F7] dark:border-white/10 dark:bg-white/[0.05]">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          sizes="44px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-4 w-4 text-neutral-400" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p
                            className="truncate text-[12px] font-medium text-neutral-900 dark:text-white"
                            title={item.title}
                          >
                            {catalogTitle(item.title, 36)}
                          </p>
                          <p className="mt-0.5 text-[10px] text-neutral-400">
                            {[item.sku || item.barcode, type.label]
                              .filter(Boolean)
                              .join(" · ") || "No SKU"}
                          </p>
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          <ItemActions item={item} onStock={openStockDialog} />
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-semibold tabular-nums text-neutral-900 dark:text-white">
                          {item.inventory}
                        </span>
                        <StockBadge item={item} />
                        <LocationChip item={item} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-black/[0.05] text-left text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10">
                  <th className="px-4 py-2.5">Product</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Location</th>
                  <th className="px-4 py-2.5">Stock</th>
                  <th className="px-4 py-2.5">Price</th>
                  <th className="px-4 py-2.5">Updated</th>
                  <th className="px-4 py-2.5 text-right"> </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const type = TYPE_META[item.productType] ?? TYPE_META.physical;
                  const TypeIcon = type.icon;
                  const unitMargin =
                    typeof item.costPrice === "number"
                      ? Math.round((item.price - item.costPrice) * 100) / 100
                      : null;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => openStockDialog(item)}
                      className="cursor-pointer border-b border-black/[0.04] last:border-0 transition-colors duration-150 hover:bg-[#F5F5F7]/80 dark:border-white/5 dark:hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-black/[0.06] bg-[#F5F5F7] dark:border-white/10 dark:bg-white/[0.05]">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt=""
                                fill
                                sizes="36px"
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package className="h-3.5 w-3.5 text-neutral-400" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p
                              className="truncate text-[12px] font-medium text-neutral-900 dark:text-white"
                              title={item.title}
                            >
                              {catalogTitle(item.title)}
                            </p>
                            <p className="truncate text-[10px] text-neutral-400">
                              {[item.sku, item.barcode, item.categoryName]
                                .filter(Boolean)
                                .join(" · ") || "No SKU"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-500">
                          <TypeIcon className="h-3 w-3" />
                          {type.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <LocationChip item={item} />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="space-y-1">
                          <p className="text-[12px] font-semibold tabular-nums text-neutral-900 dark:text-white">
                            {item.inventory}
                          </p>
                          <StockBadge item={item} />
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="font-medium tabular-nums text-neutral-900 dark:text-white">
                          {formatCurrency(item.price, currency)}
                        </p>
                        {typeof item.costPrice === "number" ? (
                          <p className="text-[10px] tabular-nums text-neutral-400">
                            Cost {formatCurrency(item.costPrice, currency)}
                            {unitMargin != null ? (
                              <span
                                className={cn(
                                  "ml-1",
                                  unitMargin >= 0 ? "text-emerald-600" : "text-red-600"
                                )}
                              >
                                · {unitMargin >= 0 ? "+" : ""}
                                {formatCurrency(unitMargin, currency)}
                              </span>
                            ) : null}
                          </p>
                        ) : (
                          <p className="text-[10px] text-neutral-400">No cost set</p>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-neutral-400">
                        <span suppressHydrationWarning>{formatRelative(item.updatedAt)}</span>
                      </td>
                      <td
                        className="px-4 py-2.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ItemActions item={item} onStock={openStockDialog} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={Boolean(stockItem)} onOpenChange={(open) => !open && closeStockDialog()}>
        <DialogContent className="max-w-md gap-0 overflow-hidden p-0 sm:rounded-[12px]">
          <DialogHeader className="space-y-1 border-b border-black/[0.05] px-4 py-3.5 text-left dark:border-white/10">
            <DialogTitle className="text-[14px] font-semibold tracking-[-0.01em]">
              Edit stock
            </DialogTitle>
            <DialogDescription className="text-[12px]">
              Set the exact stock quantity.
            </DialogDescription>
          </DialogHeader>

          {stockItem ? (
            <div className="space-y-4 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-black/[0.06] bg-[#F5F5F7] dark:border-white/10 dark:bg-white/[0.05]">
                  {stockItem.image ? (
                    <Image
                      src={stockItem.image}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-4 w-4 text-neutral-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className="truncate text-[12px] font-medium text-neutral-900 dark:text-white"
                    title={stockItem.title}
                  >
                    {catalogTitle(stockItem.title, 48)}
                  </p>
                  <p className="mt-0.5 text-[10px] text-neutral-400">
                    {[stockItem.sku || stockItem.barcode, TYPE_META[stockItem.productType]?.label]
                      .filter(Boolean)
                      .join(" · ") || "No SKU"}
                  </p>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    Current{" "}
                    <span className="font-semibold tabular-nums text-neutral-900 dark:text-white">
                      {stockItem.inventory}
                    </span>
                  </p>
                </div>
              </div>

              <div className="rounded-[10px] border border-black/[0.06] bg-[#F5F5F7]/80 px-3 py-3.5 dark:border-white/10 dark:bg-white/[0.04]">
                <p className="mb-2.5 text-center text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400">
                  New stock
                </p>
                <div className="flex items-center justify-center gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-md border-black/[0.06] dark:border-white/10"
                    disabled={saving || draftQty <= 0}
                    onClick={() => setDraftQty((q) => Math.max(0, q - 1))}
                    aria-label="Decrease"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={draftQty}
                    disabled={saving}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      setDraftQty(Number.isFinite(n) && n >= 0 ? n : 0);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void saveStock();
                      if (e.key === "Escape") closeStockDialog();
                    }}
                    className="h-10 w-20 rounded-md border border-black/[0.06] bg-white text-center text-[18px] font-semibold tabular-nums outline-none focus:ring-1 focus:ring-[#007AFF]/30 dark:border-white/10 dark:bg-white/[0.06]"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-md border-black/[0.06] dark:border-white/10"
                    disabled={saving}
                    onClick={() => setDraftQty((q) => q + 1)}
                    aria-label="Increase"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-1.5 border-t border-black/[0.05] px-4 py-3 dark:border-white/10 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-md border-black/[0.06] px-3 text-[12px] dark:border-white/10"
              disabled={saving}
              onClick={closeStockDialog}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-8 rounded-md bg-neutral-900 px-3 text-[12px] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
              loading={saving}
              onClick={() => void saveStock()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ItemActions({
  item,
  onStock,
}: {
  item: InventoryItem;
  onStock: (item: InventoryItem) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-neutral-400"
          aria-label="Actions"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={() => onStock(item)}>
          <Pencil className="mr-2 h-3.5 w-3.5" />
          Edit stock
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/products/${item.id}/edit`}>
            <SquarePen className="mr-2 h-3.5 w-3.5" />
            Edit product
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StockBadge({ item }: { item: InventoryItem }) {
  if (item.status === "out_of_stock") {
    return (
      <span className="inline-flex rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
        Out of stock
      </span>
    );
  }
  if (item.status === "low_stock") {
    return (
      <span className="inline-flex rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
        Low · ≤ {item.lowStockAlert}
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
      Healthy
    </span>
  );
}

function LocationChip({ item }: { item: InventoryItem }) {
  if (item.inventoryLocation === "supplier" || item.productType === "dropshipping") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
        <Truck className="h-3 w-3" />
        {item.supplier || "Supplier"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
      <Warehouse className="h-3 w-3" />
      Warehouse
    </span>
  );
}
