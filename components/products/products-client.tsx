"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Search, Package, Boxes, AlertTriangle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductList } from "@/components/products/product-list";
import { ProductTableSkeleton } from "@/components/products/product-table-skeleton";
import { ProductsSectionNav } from "@/components/products/products-section-nav";
import { OrdersStatGrid } from "@/components/orders/orders-stat-grid";
import { formatCurrency } from "@/lib/utils";
import type { ProductsListStats, ProductsSectionCounts } from "@/types/products-stats";
import {
  EMPTY_PRODUCTS_LIST_STATS,
  EMPTY_PRODUCTS_SECTION_COUNTS,
} from "@/types/products-stats";
import type { Product } from "@/types";

interface ProductsClientProps {
  initialProducts: Product[];
  currency: string;
  counts?: ProductsSectionCounts;
  stats?: ProductsListStats;
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
  counts = EMPTY_PRODUCTS_SECTION_COUNTS,
  stats = EMPTY_PRODUCTS_LIST_STATS,
}: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">("all");
  const [loading, setLoading] = useState(false);

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

  const displayStats = useMemo(() => {
    if (search || statusFilter !== "all") return computeProductStats(filteredProducts);
    return stats;
  }, [search, statusFilter, filteredProducts, stats]);

  const openAdd = () => {
    router.push("/dashboard/products/new");
  };

  const openEdit = (product: Product) => {
    router.push(`/dashboard/products/${product.id}/edit`);
  };

  const statusChips: { id: "all" | "active" | "draft"; label: string }[] = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "draft", label: "Drafts" },
  ];

  const statItems = [
    { icon: Package, label: "Total products", value: displayStats.total.toLocaleString() },
    { icon: Boxes, label: "In stock", value: displayStats.inStock.toLocaleString() },
    { icon: AlertTriangle, label: "Low stock", value: displayStats.lowStock.toLocaleString() },
    {
      icon: DollarSign,
      label: "Inventory value",
      value: formatCurrency(displayStats.catalogValue, currency),
      hint: displayStats.outOfStock > 0 ? `${displayStats.outOfStock} out of stock` : undefined,
    },
  ];

  return (
    <div className="space-y-4">
      <ProductsSectionNav counts={counts} />
      <OrdersStatGrid stats={statItems} />

      {loading ? (
        <ProductTableSkeleton />
      ) : (
        <ProductList
          products={filteredProducts}
          currency={currency}
          onEdit={openEdit}
          onAdd={openAdd}
          onRefresh={() => fetchProducts(search || undefined, statusFilter)}
          toolbar={
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-lg border border-border p-0.5">
                {statusChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setStatusFilter(chip.id)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                      statusFilter === chip.id
                        ? "bg-neutral-900 text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="h-9 w-44 rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/30 sm:w-56"
                />
              </div>
              <Button
                onClick={openAdd}
                size="sm"
                className="h-9 rounded-lg bg-[#007AFF] hover:bg-[#007AFF]/90"
              >
                <Plus className="mr-1.5 h-4 w-4" />
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
    <div className="space-y-4">
      <Skeleton className="premium-skeleton h-12 w-full" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="premium-skeleton h-28 rounded-2xl" />
        ))}
      </div>
      <ProductTableSkeleton />
    </div>
  );
}
