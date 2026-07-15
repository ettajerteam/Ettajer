"use client";

import type { ProductInfoSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

export function ProductInfoSection({ store, product, settings }: BlockRenderProps) {
  const s = settings as ProductInfoSectionSettings;
  const isBold = store.theme === "bold";
  const isModern = store.theme === "modern";
  const title = product?.title ?? "Product title";

  return (
    <div className="max-w-6xl mx-auto px-6">
      <h1
        className={cn(
          "text-3xl font-bold tracking-tight mb-4",
          isModern && "uppercase font-black tracking-tighter text-4xl",
          isBold && "uppercase text-white"
        )}
      >
        {title}
      </h1>
      {s.showDescription !== false && product?.description && (
        <div
          className={cn(
            "prose prose-sm max-w-none",
            isBold ? "prose-invert text-white/70" : "text-gray-600"
          )}
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      )}
      {!product && (
        <p className={cn("text-sm", isBold ? "text-white/50" : "text-gray-400")}>
          Product description preview
        </p>
      )}
    </div>
  );
}
