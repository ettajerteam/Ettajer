"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, Layers, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollectionList } from "@/components/collections/collection-list";
import { CollectionSheet } from "@/components/collections/collection-sheet";
import { CatalogSectionNav } from "@/components/catalog/catalog-section-nav";
import { OrdersStatGrid } from "@/components/orders/orders-stat-grid";
import type { Collection } from "@/types/catalog";
import type { Product } from "@/types";

interface CollectionsClientProps {
  initialCollections: Collection[];
  products: Product[];
}

export function CollectionsClient({ initialCollections, products }: CollectionsClientProps) {
  const [collections, setCollections] = useState(initialCollections);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);

  const fetchCollections = useCallback(async (query?: string) => {
    setLoading(true);
    try {
      const params = query ? `?search=${encodeURIComponent(query)}` : "";
      const res = await fetch(`/api/collections${params}`);
      const data = await res.json();
      if (res.ok) setCollections(data.collections);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) fetchCollections(search);
      else setCollections(initialCollections);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchCollections, initialCollections]);

  const display = search ? collections : initialCollections;

  const stats = useMemo(() => {
    const list = search ? collections : initialCollections;
    return {
      total: list.length,
      featured: list.filter((c) => c.featured).length,
      products: list.reduce((sum, c) => sum + c.productCount, 0),
    };
  }, [collections, initialCollections, search]);

  const openAdd = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (c: Collection) => {
    setEditing(c);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-4">
      <CatalogSectionNav />
      <OrdersStatGrid
        stats={[
          { icon: Layers, label: "Collections", value: stats.total.toLocaleString() },
          { icon: Star, label: "Featured", value: stats.featured.toLocaleString() },
          { icon: Package, label: "Products linked", value: stats.products.toLocaleString() },
        ]}
        columns={3}
      />

      {loading ? (
        <div className="premium-card p-12 text-center text-sm text-muted-foreground">
          Loading collections...
        </div>
      ) : (
        <CollectionList
          collections={display}
          onEdit={openEdit}
          onAdd={openAdd}
          onRefresh={() => fetchCollections(search || undefined)}
          toolbar={
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search collections..."
                  className="h-9 w-44 rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/30 sm:w-56"
                />
              </div>
              <Button
                onClick={openAdd}
                size="sm"
                className="h-9 rounded-lg bg-[#007AFF] hover:bg-[#007AFF]/90"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add collection
              </Button>
            </div>
          }
        />
      )}

      <CollectionSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditing(null);
        }}
        collection={editing}
        products={products}
        onSuccess={() => fetchCollections(search || undefined)}
      />
    </div>
  );
}
