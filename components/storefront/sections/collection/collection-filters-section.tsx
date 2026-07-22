"use client";

import Link from "next/link";
import type { CollectionFiltersSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import {
  getStoreCategoryUrl,
  getStoreCollectionUrl,
  getStoreProductsUrl,
} from "@/lib/storefront-urls";
import { cn } from "@/lib/utils";

export function CollectionFiltersSection({
  store,
  collection,
  products = [],
  categories = [],
  settings,
}: BlockRenderProps) {
  const s = settings as CollectionFiltersSectionSettings;
  const isBold = store.theme === "bold";
  const isModern = store.theme === "modern";
  const title = s.title ?? "Browse";
  const layout = s.layout ?? "minimal";
  const count = products.length;
  const allHref = collection?.slug
    ? getStoreCollectionUrl(store.slug, collection.slug)
    : getStoreProductsUrl(store.slug);

  const linkBase = (active = false) =>
    cn(
      "text-sm transition",
      layout === "chips" &&
        cn(
          "border px-4 py-2",
          isModern ? "rounded-sm text-[11px] uppercase tracking-[0.1em]" : "rounded-full",
          active
            ? isBold
              ? "border-white bg-white text-black"
              : "border-neutral-900 bg-neutral-900 text-white"
            : isBold
              ? "border-white/20 text-white/70 hover:border-white/40"
              : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
        ),
      layout === "pills" &&
        cn(
          "rounded-full px-4 py-2",
          active
            ? isBold
              ? "bg-white text-black"
              : "bg-neutral-900 text-white"
            : isBold
              ? "bg-white/10 text-white/70 hover:bg-white/15"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
        ),
      layout === "minimal" &&
        cn(
          "border-b-2 pb-1 text-[13px]",
          active
            ? isBold
              ? "border-white text-white"
              : "border-neutral-900 text-neutral-900"
            : cn(
                "border-transparent",
                isBold
                  ? "text-white/50 hover:text-white"
                  : "text-neutral-500 hover:text-neutral-900"
              )
        )
    );

  return (
    <div
      className={cn(
        "mx-auto px-6",
        isModern ? "max-w-7xl" : "max-w-6xl",
        "pt-6 pb-2 sm:pt-8"
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
          layout === "minimal" && "border-b pb-4",
          layout === "minimal" && (isBold ? "border-white/10" : "border-neutral-200")
        )}
      >
        <div className="min-w-0">
          {layout !== "minimal" ? (
            <p
              className={cn(
                "mb-3 text-[11px] font-semibold uppercase tracking-[0.16em]",
                isBold ? "text-white/40" : "text-neutral-400"
              )}
            >
              {title}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <Link href={allHref} className={linkBase(true)} aria-current="page">
              All
            </Link>
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                href={getStoreCategoryUrl(store.slug, cat.slug)}
                className={linkBase(false)}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        <p
          className={cn(
            "shrink-0 text-[12px] tabular-nums",
            isBold ? "text-white/40" : "text-neutral-400"
          )}
        >
          {count} {count === 1 ? "piece" : "pieces"}
          {collection?.name ? ` in ${collection.name}` : ""}
        </p>
      </div>
    </div>
  );
}
