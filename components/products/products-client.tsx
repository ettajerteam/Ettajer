"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plus,
  Search,
  X,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductList } from "@/components/products/product-list";
import { ProductTableSkeleton } from "@/components/products/product-table-skeleton";
import { ProductsSectionNav } from "@/components/products/products-section-nav";
import { formatCurrency, cn } from "@/lib/utils";
import {
  dashboardCard,
  dashboardKicker,
  dashboardMetric,
  dashboardPill,
  dashboardPillActive,
  dashboardPillGroup,
  dashboardPillInactive,
  dashboardPrimaryBtn,
  dashboardStack,
} from "@/lib/dashboard-ui";
import {
  consumeProductPublishedFlash,
  type ProductPublishedFlash,
} from "@/lib/product-published-flash";
import type { ProductsListStats, ProductsSectionCounts } from "@/types/products-stats";
import { EMPTY_PRODUCTS_LIST_STATS } from "@/types/products-stats";
import type { Product } from "@/types";
import { toast } from "sonner";

interface ProductsClientProps {
  initialProducts: Product[];
  currency: string;
  counts?: ProductsSectionCounts;
  stats?: ProductsListStats;
  reviewsCount?: number;
}

function computeProductStats(products: Product[]): ProductsListStats {
  let inStock = 0;
  let lowStock = 0;
  let outOfStock = 0;
  let catalogValue = 0;

  for (const product of products) {
    if (product.inventory <= 0) outOfStock++;
    else if (product.inventory <= 10) lowStock++;
    else inStock++;
    catalogValue += product.inventory * product.price;
  }

  return {
    total: products.length,
    inStock,
    lowStock,
    outOfStock,
    catalogValue,
  };
}

export function ProductsClient({
  initialProducts,
  currency,
  counts,
  stats = EMPTY_PRODUCTS_LIST_STATS,
  reviewsCount = 0,
}: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">("all");
  const [loading, setLoading] = useState(false);
  const [publishedFlash, setPublishedFlash] = useState<ProductPublishedFlash | null>(null);

  const fetchProducts = useCallback(async (query?: string, status?: "all" | "active" | "draft") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("search", query);
      if (status && status !== "all") params.set("status", status);
      const qs = params.toString();
      const res = await fetch(`/api/products${qs ? `?${qs}` : ""}`);
      const data = await res.json();
      if (res.ok) setProducts(data.products);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const flash = consumeProductPublishedFlash();
    if (!flash) return;
    setPublishedFlash(flash);
    toast.success("Product uploaded", {
      description: `${flash.title} is live in your catalog.`,
    });
  }, []);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      router.replace("/dashboard/products/new");
    }
  }, [searchParams, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search || statusFilter !== "all") {
        void fetchProducts(search || undefined, statusFilter);
      } else {
        setProducts(initialProducts);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, fetchProducts, initialProducts]);

  const filteredProducts = useMemo(() => products, [products]);
  const hasFilters = Boolean(search.trim()) || statusFilter !== "all";

  const displayStats = useMemo(() => {
    if (hasFilters) return computeProductStats(filteredProducts);
    return stats;
  }, [hasFilters, filteredProducts, stats]);

  const openAdd = () => router.push("/dashboard/products/new");
  const openEdit = (product: Product) =>
    router.push(`/dashboard/products/${product.id}/edit`);

  const statusChips: { id: "all" | "active" | "draft"; label: string }[] = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "draft", label: "Drafts" },
  ];

  const statItems = [
    {
      label: "Products",
      value: displayStats.total.toLocaleString(),
    },
    {
      label: "In stock",
      value: displayStats.inStock.toLocaleString(),
    },
    {
      label: "Low stock",
      value: displayStats.lowStock.toLocaleString(),
      hint:
        displayStats.outOfStock > 0
          ? `${displayStats.outOfStock} out of stock`
          : undefined,
    },
    {
      label: "Inventory value",
      value: formatCurrency(displayStats.catalogValue, currency),
    },
  ];

  return (
    <div className={dashboardStack}>
      <ProductsSectionNav counts={counts} reviewsCount={reviewsCount} />

      {publishedFlash ? (
        <div
          className={cn(
            dashboardCard,
            "flex items-start gap-3 border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3"
          )}
        >
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
              Product uploaded
            </p>
            <p className="mt-0.5 text-[11px] text-neutral-500">
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                {publishedFlash.title}
              </span>{" "}
              is live in your catalog.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPublishedFlash(null)}
            className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-black/[0.04] hover:text-neutral-700"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
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

      {loading ? (
        <ProductTableSkeleton />
      ) : (
        <ProductList
          products={filteredProducts}
          currency={currency}
          onEdit={openEdit}
          onAdd={openAdd}
          onRefresh={() => fetchProducts(search || undefined, statusFilter)}
          hasFilters={hasFilters}
          onClearFilters={() => {
            setSearch("");
            setStatusFilter("all");
          }}
          toolbar={
            <div className="flex flex-wrap items-center gap-1.5">
              <div className={dashboardPillGroup}>
                {statusChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setStatusFilter(chip.id)}
                    className={cn(
                      dashboardPill,
                      statusFilter === chip.id ? dashboardPillActive : dashboardPillInactive
                    )}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products…"
                  className="h-7 w-40 rounded-md border border-black/[0.06] bg-[#F5F5F7] pl-7 pr-7 text-[12px] outline-none focus:ring-1 focus:ring-[#007AFF]/30 sm:w-52 dark:border-white/10 dark:bg-white/[0.05]"
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

              <Button onClick={openAdd} className={cn(dashboardPrimaryBtn, "h-7 px-2.5")}>
                <Plus className="mr-1 h-3 w-3" />
                Add product
              </Button>
            </div>
          }
        />
      )}
    </div>
  );
}

export function ProductsPageSkeleton() {
  return (
    <div className={dashboardStack}>
      <Skeleton className="h-10 w-full rounded-[12px]" />
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] rounded-[12px]" />
        ))}
      </div>
      <ProductTableSkeleton />
    </div>
  );
}
