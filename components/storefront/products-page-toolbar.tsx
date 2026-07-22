"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { PublicCategory } from "@/types/catalog";
import { getStoreProductsUrl, getStoreSearchUrl } from "@/lib/storefront-urls";
import type { ProductSort } from "@/lib/storefront-products-page";
import { cn } from "@/lib/utils";

interface ProductsPageToolbarProps {
  storeSlug: string;
  categories: PublicCategory[];
  activeCategory?: string;
  activeSort: ProductSort;
  productCount: number;
  variant?: "minimal" | "modern" | "bold";
}

export function ProductsPageToolbar({
  storeSlug,
  categories,
  activeCategory,
  activeSort,
  productCount,
  variant = "minimal",
}: ProductsPageToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isModern = variant === "modern";
  const isBold = variant === "bold";

  const buildUrl = (next: { category?: string; sort?: ProductSort }) => {
    const params = new URLSearchParams(searchParams.toString());
    // Drop preview chrome from live filter links
    params.delete("preview");
    params.delete("layout");
    params.delete("section");
    params.delete("device");
    if (next.category) params.set("category", next.category);
    else params.delete("category");
    if (next.sort) params.set("sort", next.sort);
    else params.delete("sort");
    const q = params.toString();
    return q ? `${getStoreProductsUrl(storeSlug)}?${q}` : getStoreProductsUrl(storeSlug);
  };

  const onSortChange = (sort: ProductSort) => {
    router.push(buildUrl({ category: activeCategory, sort }));
  };

  const tabClass = (active: boolean) =>
    cn(
      "border-b-2 pb-2.5 text-[13px] transition",
      active
        ? isBold
          ? "border-white text-white"
          : "border-neutral-900 text-neutral-900"
        : cn(
            "border-transparent",
            isBold
              ? "text-white/45 hover:text-white"
              : "text-neutral-500 hover:text-neutral-900"
          )
    );

  return (
    <div className="space-y-5">
      <div
        className={cn(
          "flex flex-col gap-4 border-b pb-1 sm:flex-row sm:items-end sm:justify-between",
          isBold ? "border-white/10" : "border-neutral-200"
        )}
      >
        <div className="min-w-0 flex-1">
          {categories.length > 0 ? (
            <nav
              aria-label="Filter by category"
              className="-mb-px flex gap-5 overflow-x-auto pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <Link
                href={buildUrl({ sort: activeSort })}
                className={cn(tabClass(!activeCategory), "shrink-0")}
                aria-current={!activeCategory ? "page" : undefined}
              >
                All
              </Link>
              {categories.map((cat) => {
                const active = activeCategory === cat.slug;
                return (
                  <Link
                    key={cat.id}
                    href={buildUrl({ category: cat.slug, sort: activeSort })}
                    className={cn(tabClass(active), "shrink-0")}
                    aria-current={active ? "page" : undefined}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </nav>
          ) : (
            <p
              className={cn(
                "pb-2.5 text-[13px] font-medium",
                isBold ? "text-white/70" : "text-neutral-700"
              )}
            >
              Catalog
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3 pb-2.5">
          <p
            className={cn(
              "text-[12px] tabular-nums",
              isBold ? "text-white/40" : "text-neutral-400"
            )}
          >
            {productCount} {productCount === 1 ? "piece" : "pieces"}
            {activeCategory ? " · filtered" : ""}
          </p>

          <label className="sr-only" htmlFor="product-sort">
            Sort products
          </label>
          <select
            id="product-sort"
            value={activeSort}
            onChange={(e) => onSortChange(e.target.value as ProductSort)}
            className={cn(
              "h-9 border bg-transparent px-3 text-[12px] outline-none transition",
              isModern
                ? "rounded-sm border-neutral-200 uppercase tracking-[0.08em]"
                : "rounded-lg border-neutral-200",
              isBold
                ? "border-white/20 text-white/80"
                : "text-neutral-700 hover:border-neutral-400"
            )}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price · low to high</option>
            <option value="price-desc">Price · high to low</option>
            <option value="name">Name · A–Z</option>
          </select>

          <Link
            href={getStoreSearchUrl(storeSlug)}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center border transition",
              isModern ? "rounded-sm" : "rounded-lg",
              isBold
                ? "border-white/20 text-white/70 hover:border-white/40"
                : "border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-800"
            )}
            aria-label="Search products"
          >
            <Search className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
