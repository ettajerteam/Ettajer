"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, FolderOpen, Package, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryList } from "@/components/categories/category-list";
import { CategorySheet } from "@/components/categories/category-sheet";
import { CatalogSectionNav } from "@/components/catalog/catalog-section-nav";
import { OrdersStatGrid } from "@/components/orders/orders-stat-grid";
import type { Category } from "@/types/catalog";

interface CategoriesClientProps {
  initialCategories: Category[];
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const fetchCategories = useCallback(async (query?: string) => {
    setLoading(true);
    try {
      const params = query ? `?search=${encodeURIComponent(query)}` : "";
      const res = await fetch(`/api/categories${params}`);
      const data = await res.json();
      if (res.ok) setCategories(data.categories);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) fetchCategories(search);
      else setCategories(initialCategories);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchCategories, initialCategories]);

  const display = search ? categories : initialCategories;

  const stats = useMemo(() => {
    const list = search ? categories : initialCategories;
    return {
      total: list.length,
      active: list.filter((c) => c.status === "active").length,
      products: list.reduce((sum, c) => sum + c.productCount, 0),
    };
  }, [categories, initialCategories, search]);

  const openAdd = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-4">
      <CatalogSectionNav />
      <OrdersStatGrid
        stats={[
          { icon: FolderOpen, label: "Categories", value: stats.total.toLocaleString() },
          { icon: CheckCircle2, label: "Active", value: stats.active.toLocaleString() },
          { icon: Package, label: "Products assigned", value: stats.products.toLocaleString() },
        ]}
        columns={3}
      />

      {loading ? (
        <div className="premium-card p-12 text-center text-sm text-muted-foreground">
          Loading categories...
        </div>
      ) : (
        <CategoryList
          categories={display}
          onEdit={openEdit}
          onAdd={openAdd}
          onRefresh={() => fetchCategories(search || undefined)}
          toolbar={
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search categories..."
                  className="h-9 w-44 rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/30 sm:w-56"
                />
              </div>
              <Button
                onClick={openAdd}
                size="sm"
                className="h-9 rounded-lg bg-[#007AFF] hover:bg-[#007AFF]/90"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add category
              </Button>
            </div>
          }
        />
      )}

      <CategorySheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditing(null);
        }}
        category={editing}
        onSuccess={() => fetchCategories(search || undefined)}
      />
    </div>
  );
}
