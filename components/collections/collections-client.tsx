"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CollectionList } from "@/components/collections/collection-list";
import { CollectionSheet } from "@/components/collections/collection-sheet";
import { cn } from "@/lib/utils";
import {
  dashboardCard,
  dashboardKicker,
  dashboardMetric,
  dashboardPrimaryBtn,
  dashboardStack,
} from "@/lib/dashboard-ui";
import type { Collection } from "@/types/catalog";
import type { Product } from "@/types";

interface CollectionsClientProps {
  initialCollections: Collection[];
  products: Product[];
  currency?: string;
}

export function CollectionsClient({
  initialCollections,
  products,
  currency = "MAD",
}: CollectionsClientProps) {
  const [collections, setCollections] = useState(initialCollections);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const skipFirstFetch = useRef(true);

  useEffect(() => {
    setCollections(initialCollections);
  }, [initialCollections]);

  const fetchCollections = useCallback(async (query?: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const params = query?.trim()
        ? `?search=${encodeURIComponent(query.trim())}`
        : "";
      const res = await fetch(`/api/collections${params}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load collections");
      const data = await res.json();
      if (controller.signal.aborted) return;
      setCollections(data.collections ?? []);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error(error instanceof Error ? error.message : "Failed to load collections");
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
      void fetchCollections(search || undefined);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, fetchCollections]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const hasFilters = Boolean(search.trim());

  const stats = useMemo(() => {
    let featured = 0;
    let productLinks = 0;
    for (const c of collections) {
      if (c.featured) featured += 1;
      productLinks += c.productCount;
    }
    return {
      total: collections.length,
      featured,
      productLinks,
      products: products.length,
    };
  }, [collections, products.length]);

  const openAdd = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (c: Collection) => {
    setEditing(c);
    setSheetOpen(true);
  };

  const statItems = [
    { label: "Collections", value: stats.total.toLocaleString() },
    { label: "Featured", value: stats.featured.toLocaleString() },
    { label: "Product links", value: stats.productLinks.toLocaleString() },
    { label: "Catalog products", value: stats.products.toLocaleString() },
  ];

  return (
    <div className={dashboardStack}>
      {collections.length > 0 || hasFilters ? (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {statItems.map((stat) => (
            <div key={stat.label} className={cn(dashboardCard, "px-3.5 py-3")}>
              <p className={dashboardKicker}>{stat.label}</p>
              <p className={cn(dashboardMetric, "mt-1 truncate")}>{stat.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <CollectionList
        collections={collections}
        loading={loading}
        hasFilters={hasFilters}
        onEdit={openEdit}
        onAdd={openAdd}
        onRefresh={() => void fetchCollections(search || undefined)}
        onClearFilters={() => setSearch("")}
        toolbar={
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search collections…"
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
              Add collection
            </Button>
          </div>
        }
      />

      <CollectionSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditing(null);
        }}
        collection={editing}
        products={products}
        currency={currency}
        onSuccess={() => void fetchCollections(search || undefined)}
      />
    </div>
  );
}
