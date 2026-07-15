"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Search, Package, Boxes, AlertTriangle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductList } from "@/components/products/product-list";
import { ProductTableSkeleton } from "@/components/products/product-table-skeleton";
import { ProductSheet } from "@/components/products/product-sheet";
import { ProductsSectionNav } from "@/components/products/products-section-nav";
import { OrdersStatGrid } from "@/components/orders/orders-stat-grid";
import { formatCurrency } from "@/lib/utils";
import type { ProductsListStats, ProductsSectionCounts } from "@/types/products-stats";
import {
  EMPTY_PRODUCTS_LIST_STATS,
  EMPTY_PRODUCTS_SECTION_COUNTS,
} from "@/types/products-stats";
import type { Product } from "@/types";
import type { TicketPrinter } from "@/lib/ticket-printers";

interface ProductsClientProps {
  initialProducts: Product[];
  currency: string;
  ticketPrinters?: TicketPrinter[];
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
  ticketPrinters = [],
  counts = EMPTY_PRODUCTS_SECTION_COUNTS,
  stats = EMPTY_PRODUCTS_LIST_STATS,
}: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async (query?: string) => {
    setLoading(true);
    try {
      const params = query ? `?search=${encodeURIComponent(query)}` : "";
      const res = await fetch(`/api/products${params}`);
      const data = await res.json();
      if (res.ok) setProducts(data.products);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setEditingProduct(null);
      setSheetOpen(true);
      router.replace("/dashboard/products", { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) fetchProducts(search);
      else setProducts(initialProducts);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchProducts, initialProducts]);

  const displayStats = useMemo(() => {
    if (search) return computeProductStats(products);
    return stats;
  }, [search, products, stats]);

  const openAddSheet = () => {
    setEditingProduct(null);
    setSheetOpen(true);
  };

  const openEditSheet = (product: Product) => {
    setEditingProduct(product);
    setSheetOpen(true);
  };

  const handleSheetClose = (open: boolean) => {
    setSheetOpen(open);
    if (!open) setEditingProduct(null);
  };

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
          products={products}
          currency={currency}
          onEdit={openEditSheet}
          onAdd={openAddSheet}
          onRefresh={() => fetchProducts(search || undefined)}
          toolbar={
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
              <Button
                onClick={openAddSheet}
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

      <ProductSheet
        open={sheetOpen}
        onOpenChange={handleSheetClose}
        currency={currency}
        ticketPrinters={ticketPrinters}
        product={editingProduct}
        onSuccess={() => fetchProducts(search || undefined)}
      />
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
