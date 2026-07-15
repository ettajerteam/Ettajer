"use client";

import { CatalogProductGrid } from "@/components/storefront/catalog-product-grid";
import type { CollectionProductGridSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import type { ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";

export function CollectionProductGridSection({
  store,
  products = [],
  settings,
}: BlockRenderProps) {
  const themeId = (store.theme in { minimal: 1, modern: 1, bold: 1 } ? store.theme : "minimal") as ThemeId;
  const isBold = themeId === "bold";

  return (
    <div
      className={cn(
        "mx-auto px-6 pb-10",
        themeId === "modern" ? "max-w-7xl" : "max-w-6xl"
      )}
    >
      {products.length === 0 ? (
        <p className={cn("text-center py-16", isBold ? "text-white/40" : "text-gray-400")}>
          No products found.
        </p>
      ) : (
        <CatalogProductGrid store={store} products={products} themeId={themeId} />
      )}
    </div>
  );
}
