"use client";

import { CatalogProductGrid } from "@/components/storefront/catalog-product-grid";
import { StorefrontQuietState } from "@/components/storefront/storefront-quiet-state";
import type { CollectionProductGridSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import type { ThemeId } from "@/lib/themes";
import { getStoreProductsUrl, getStoreCollectionsUrl } from "@/lib/storefront-urls";
import { cn } from "@/lib/utils";

export function CollectionProductGridSection({
  store,
  products = [],
  settings,
}: BlockRenderProps) {
  const s = settings as CollectionProductGridSectionSettings;
  const themeId = (store.theme in { minimal: 1, modern: 1, bold: 1 } ? store.theme : "minimal") as ThemeId;
  const isBold = themeId === "bold";
  const isModern = themeId === "modern";
  const columns = Math.min(4, Math.max(2, Number(s.columns) || 3));
  const density = s.density ?? (s.layout === "dense" ? "dense" : "comfortable");

  return (
    <div
      className={cn(
        "mx-auto px-6 pb-6 pt-4 sm:pt-6",
        themeId === "modern" ? "max-w-7xl" : "max-w-6xl"
      )}
    >
      {products.length === 0 ? (
        <StorefrontQuietState
          eyebrow="Collection"
          title="Nothing here yet"
          description="This collection is between edits. Browse the full catalog while new pieces arrive."
          primaryAction={{
            label: "Shop all products",
            href: getStoreProductsUrl(store.slug),
          }}
          secondaryAction={{
            label: "All collections",
            href: getStoreCollectionsUrl(store.slug),
          }}
          isBold={isBold}
          isModern={isModern}
        />
      ) : (
        <CatalogProductGrid
          store={store}
          products={products}
          themeId={themeId}
          columns={columns}
          density={density}
        />
      )}
    </div>
  );
}
