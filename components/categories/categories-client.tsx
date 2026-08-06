"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CategoryList } from "@/components/categories/category-list";
import { CategorySheet } from "@/components/categories/category-sheet";
import { cn } from "@/lib/utils";
import {
  dashboardCard,
  dashboardKicker,
  dashboardMetric,
  dashboardPrimaryBtn,
  dashboardStack,
} from "@/lib/dashboard-ui";
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
  const abortRef = useRef<AbortController | null>(null);
  const skipFirstFetch = useRef(true);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const fetchCategories = useCallback(async (query?: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const params = query?.trim()
        ? `?search=${encodeURIComponent(query.trim())}`
        : "";
      const res = await fetch(`/api/categories${params}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      if (controller.signal.aborted) return;
      setCategories(data.categories ?? []);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error(error instanceof Error ? error.message : "Failed to load categories");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }
    const timer = setTimeout(() => {
      void fetchCategories(search || undefined);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, fetchCategories]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const hasFilters = Boolean(search.trim());

  const stats = useMemo(() => {
    let active = 0;
    let inactive = 0;
    let productLinks = 0;
    for (const c of categories) {
      if (c.status === "active") active += 1;
      else inactive += 1;
      productLinks += c.productCount;
    }
    return {
      total: categories.length,
      active,
      inactive,
      productLinks,
    };
  }, [categories]);

  const openAdd = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setSheetOpen(true);
  };

  const statItems = [
    { label: "Categories", value: stats.total.toLocaleString() },
    { label: "Active", value: stats.active.toLocaleString() },
    { label: "Inactive", value: stats.inactive.toLocaleString() },
    { label: "Product links", value: stats.productLinks.toLocaleString() },
  ];

  return (
    <div className={dashboardStack}>
      {categories.length > 0 || hasFilters ? (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {statItems.map((stat) => (
            <div key={stat.label} className={cn(dashboardCard, "px-3.5 py-3")}>
              <p className={dashboardKicker}>{stat.label}</p>
              <p className={cn(dashboardMetric, "mt-1 truncate")}>{stat.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <CategoryList
        categories={categories}
        loading={loading}
        hasFilters={hasFilters}
        onEdit={openEdit}
        onAdd={openAdd}
        onRefresh={() => void fetchCategories(search || undefined)}
        onClearFilters={() => setSearch("")}
        toolbar={
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories…"
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
              Add category
            </Button>
          </div>
        }
      />

      <CategorySheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditing(null);
        }}
        category={editing}
        onSuccess={() => void fetchCategories(search || undefined)}
      />
    </div>
  );
}
