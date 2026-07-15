"use client";

import type { ProductVariantsSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

export function ProductVariantsSection({ store, product, settings }: BlockRenderProps) {
  const s = settings as ProductVariantsSectionSettings;
  const isBold = store.theme === "bold";
  const variants = product?.variants ?? [];

  if (variants.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6">
        <p className={cn("text-sm", isBold ? "text-white/40" : "text-gray-400")}>
          No variants for this product
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 space-y-4">
      {variants.map((variant) => (
        <div key={variant.id}>
          <p className={cn("text-sm font-medium mb-2", isBold ? "text-white/80" : "text-gray-700")}>
            {s.label ?? variant.name}
          </p>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((value) => (
              <button
                key={value}
                type="button"
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                  isBold
                    ? "border-white/20 text-white hover:border-[var(--store-primary)]"
                    : "border-gray-200 text-gray-700 hover:border-[var(--store-primary)]"
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
