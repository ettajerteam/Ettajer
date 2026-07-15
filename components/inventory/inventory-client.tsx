"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search, Package, Boxes, AlertTriangle, CircleOff, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductsSectionNav } from "@/components/products/products-section-nav";
import { OrdersStatGrid } from "@/components/orders/orders-stat-grid";
import { ProductsEmptyState } from "@/components/products/products-empty-state";
import { cn, formatCurrency } from "@/lib/utils";
import {
  dashboardPill,
  dashboardPillActive,
  dashboardPillGroup,
  dashboardPillInactive,
} from "@/lib/dashboard-ui";
import type { ProductsSectionCounts } from "@/types/products-stats";
import { EMPTY_PRODUCTS_SECTION_COUNTS } from "@/types/products-stats";
import type { InventoryItem, StockFilter } from "@/lib/inventory";

interface InventoryClientProps {
  initialItems: InventoryItem[];
  summary: {
    totalProducts: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  };
  currency: string;
  counts?: ProductsSectionCounts;
}

const FILTERS: { value: StockFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in_stock", label: "In stock" },
  { value: "low_stock", label: "Low stock" },
  { value: "out_of_stock", label: "Out of stock" },
];

const STATUS_STYLES = {
  in_stock:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  low_stock: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  out_of_stock: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

export function InventoryClient({
  initialItems,
  summary,
  currency,
  counts = EMPTY_PRODUCTS_SECTION_COUNTS,
}: InventoryClientProps) {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<StockFilter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const fetchItems = useCallback(async (f: StockFilter, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ filter: f });
      if (q) params.set("search", q);
      const res = await fetch(`/api/inventory?${params}`);
      const data = await res.json();
      if (res.ok) setItems(data.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchItems(filter, search), 300);
    return () => clearTimeout(t);
  }, [filter, search, fetchItems]);

  const displaySummary = useMemo(() => {
    if (!search && filter === "all") return summary;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let totalValue = 0;
    for (const item of items) {
      if (item.status === "in_stock") inStock++;
      else if (item.status === "low_stock") lowStock++;
      else outOfStock++;
      totalValue += item.inventory * item.price;
    }
    return {
      totalProducts: items.length,
      inStock,
      lowStock,
      outOfStock,
      totalValue,
    };
  }, [items, summary, search, filter]);

  async function saveInventory(productId: string) {
    const inventory = parseInt(editValue, 10);
    if (isNaN(inventory) || inventory < 0) return;
    const res = await fetch("/api/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, inventory }),
    });
    if (res.ok) {
      toast.success("Stock updated");
      setEditing(null);
      fetchItems(filter, search);
    } else {
      toast.error("Failed to update stock");
    }
  }

  const statItems = [
    { icon: Package, label: "Total SKUs", value: displaySummary.totalProducts.toLocaleString() },
    { icon: Boxes, label: "In stock", value: displaySummary.inStock.toLocaleString() },
    { icon: AlertTriangle, label: "Low stock", value: displaySummary.lowStock.toLocaleString() },
    {
      icon: DollarSign,
      label: "Inventory value",
      value: formatCurrency(displaySummary.totalValue, currency),
      hint:
        displaySummary.outOfStock > 0
          ? `${displaySummary.outOfStock} out of stock`
          : undefined,
    },
  ];

  return (
    <div className="space-y-4">
      <ProductsSectionNav counts={counts} inventoryCount={summary.totalProducts} />
      <OrdersStatGrid stats={statItems} />

      {loading ? (
        <div className="premium-card p-12 text-center text-sm text-muted-foreground">
          Loading inventory...
        </div>
      ) : items.length === 0 ? (
        <ProductsEmptyState
          icon={CircleOff}
          title="No inventory items"
          description="Products you add to your catalog will appear here for stock management."
        />
      ) : (
        <div className="premium-card overflow-hidden">
          <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">Stock levels</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="h-9 w-44 rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/30 sm:w-56"
                />
              </div>
              <div className={dashboardPillGroup}>
                {FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={cn(
                      dashboardPill,
                      filter === f.value ? dashboardPillActive : dashboardPillInactive
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">SKU</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Stock</th>
                  <th className="px-6 py-3 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border/80 transition-colors duration-200 last:border-0 hover:bg-muted/35"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted">
                          {item.image && (
                            <Image
                              src={item.image}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <span className="font-medium text-foreground">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{item.sku ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          STATUS_STYLES[item.status]
                        )}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editing === item.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-8 w-20 rounded-lg"
                            type="number"
                            min="0"
                          />
                          <Button size="sm" className="rounded-lg" onClick={() => saveInventory(item.id)}>
                            Save
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditing(item.id);
                            setEditValue(String(item.inventory));
                          }}
                          className="font-medium text-foreground transition-colors hover:text-[#007AFF]"
                        >
                          {item.inventory}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {formatCurrency(item.inventory * item.price, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
