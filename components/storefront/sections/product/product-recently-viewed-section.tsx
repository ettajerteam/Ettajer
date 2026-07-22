"use client";

import { useEffect, useMemo, useState } from "react";
import { EditorialProductCard } from "@/components/storefront/editorial-product-card";
import {
  pushRecentlyViewed,
  readRecentlyViewed,
  type RecentlyViewedSnapshot,
} from "@/lib/recently-viewed";
import type { ProductRecentlyViewedSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import type { PublicProduct } from "@/types/storefront";
import { cn } from "@/lib/utils";

function toPublicProduct(item: RecentlyViewedSnapshot): PublicProduct {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    description: null,
    price: item.price,
    comparePrice: null,
    inventory: 1,
    images: item.images,
    variants: [],
    tags: [],
    details: [],
    reviews: [],
  };
}

export function ProductRecentlyViewedSection({
  store,
  product,
  products = [],
  settings,
}: BlockRenderProps) {
  const s = settings as ProductRecentlyViewedSectionSettings;
  const isBold = store.theme === "bold";
  const isModern = store.theme === "modern";
  const title = s.title ?? "Recently viewed";
  const limit = typeof s.limit === "number" ? s.limit : 4;
  const layout = s.layout ?? "grid";
  const [history, setHistory] = useState<RecentlyViewedSnapshot[]>([]);

  useEffect(() => {
    if (product) {
      setHistory(pushRecentlyViewed(store.slug, product));
    } else {
      setHistory(readRecentlyViewed(store.slug));
    }
  }, [store.slug, product]);

  const items = useMemo(() => {
    const fromHistory = history
      .filter((item) => item.id !== product?.id)
      .slice(0, limit)
      .map((item) => toPublicProduct(item));

    if (fromHistory.length > 0) return fromHistory;

    // Preview / first visit: fall back to related catalog excluding current product.
    return products.filter((p) => p.id !== product?.id).slice(0, limit);
  }, [history, products, product?.id, limit]);

  return (
    <div className={cn("mx-auto max-w-6xl px-6 py-14 sm:py-16", isModern && "max-w-7xl")}>
      <h2
        className={cn(
          "mb-10",
          isModern && "text-xs font-semibold uppercase tracking-[0.22em] text-neutral-900",
          isBold
            ? "text-sm font-bold uppercase tracking-[0.28em] text-white"
            : "text-xl font-semibold tracking-tight text-neutral-900"
        )}
      >
        {title}
      </h2>
      {items.length === 0 ? (
        <p className={cn("text-sm", isBold ? "text-white/40" : "text-gray-400")}>
          Recently viewed products appear for returning visitors
        </p>
      ) : layout === "rail" ? (
        <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-2 scroll-smooth snap-x snap-mandatory">
          {items.map((item) => (
            <div key={item.id} className="w-[42vw] max-w-[200px] shrink-0 snap-start sm:w-[170px]">
              <EditorialProductCard store={store} product={item} />
            </div>
          ))}
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-x-4 gap-y-10 md:gap-x-6",
            layout === "compact" ? "grid-cols-3 md:grid-cols-5" : "grid-cols-2 md:grid-cols-4"
          )}
        >
          {items.map((item) => (
            <EditorialProductCard key={item.id} store={store} product={item} />
          ))}
        </div>
      )}
    </div>
  );
}
