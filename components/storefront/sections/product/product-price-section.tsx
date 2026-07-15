"use client";

import { formatCurrency } from "@/lib/utils";
import type { ProductPriceSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

export function ProductPriceSection({ store, product, settings }: BlockRenderProps) {
  const s = settings as ProductPriceSectionSettings;
  const isBold = store.theme === "bold";
  const price = product?.price ?? 29.99;
  const comparePrice = product?.comparePrice;

  return (
    <div className="max-w-6xl mx-auto px-6">
      <div className="flex items-center gap-3">
        <span
          className={cn("text-2xl font-semibold", isBold && "text-3xl font-bold")}
          style={{ color: "var(--store-primary)" }}
        >
          {formatCurrency(price, store.currency)}
        </span>
        {s.showComparePrice !== false && comparePrice && comparePrice > price && (
          <span className={cn("text-lg line-through", isBold ? "text-white/40" : "text-gray-400")}>
            {formatCurrency(comparePrice, store.currency)}
          </span>
        )}
      </div>
    </div>
  );
}
