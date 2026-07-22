"use client";

import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { getStoreProductUrl } from "@/lib/storefront-urls";
import { getProductImage } from "@/lib/storefront-assets";
import type { ProductRelatedSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

export function ProductRelatedSection({ store, product, products = [], settings }: BlockRenderProps) {
  const s = settings as ProductRelatedSectionSettings;
  const isBold = store.theme === "bold";
  const isModern = store.theme === "modern";
  const title = s.title ?? "You may also like";
  const limit = typeof s.limit === "number" ? s.limit : 4;
  const layout = s.layout ?? "grid";
  const related = products.filter((p) => p.id !== product?.id).slice(0, limit);

  return (
    <div className={cn("mx-auto max-w-6xl px-6 py-16 sm:py-20", isModern && "max-w-7xl")}>
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
      {related.length === 0 ? (
        <p className={cn("text-sm", isBold ? "text-white/40" : "text-gray-400")}>
          Related products will appear here
        </p>
      ) : layout === "carousel" ? (
        <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-2 scroll-smooth snap-x snap-mandatory">
          {related.map((item) => (
            <Link
              key={item.id}
              href={getStoreProductUrl(store.slug, item.slug)}
              className="group w-[42vw] max-w-[220px] shrink-0 snap-start block sm:w-[180px]"
            >
              <RelatedCard item={item} store={store} isBold={isBold} isModern={isModern} />
            </Link>
          ))}
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-x-4 gap-y-10 md:gap-x-6",
            layout === "compact"
              ? "grid-cols-3 md:grid-cols-5"
              : "grid-cols-2 md:grid-cols-4"
          )}
        >
          {related.map((item) => (
            <Link
              key={item.id}
              href={getStoreProductUrl(store.slug, item.slug)}
              className="group block"
            >
              <RelatedCard item={item} store={store} isBold={isBold} isModern={isModern} compact={layout === "compact"} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function RelatedCard({
  item,
  store,
  isBold,
  isModern,
  compact,
}: {
  item: { id: string; title: string; slug: string; price: number; images: string[] };
  store: { slug: string; theme: string; currency: string };
  isBold: boolean;
  isModern: boolean;
  compact?: boolean;
}) {
  return (
    <>
      <div
        className={cn(
          "relative mb-3 overflow-hidden",
          compact ? "aspect-square" : "aspect-[3/4]",
          isModern ? "rounded-sm bg-stone-100" : "rounded-xl",
          isBold ? "bg-zinc-900" : "bg-gray-50"
        )}
      >
        <Image
          src={getProductImage(store.theme as "minimal" | "modern" | "bold", item.images, item.id)}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>
      <p className={cn("text-[13px] font-medium tracking-tight", isBold && "text-white", compact && "truncate")}>
        {item.title}
      </p>
      <p className="text-[13px] text-neutral-600" style={{ color: isBold ? undefined : "var(--store-primary)" }}>
        {formatCurrency(item.price, store.currency)}
      </p>
    </>
  );
}
