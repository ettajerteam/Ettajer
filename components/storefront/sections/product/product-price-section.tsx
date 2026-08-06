"use client";

import { formatCurrency, cn } from "@/lib/utils";
import { ProductSectionShell } from "@/components/storefront/product-section-shell";
import type { ProductPriceSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";

export function ProductPriceSection({ store, product, settings }: BlockRenderProps) {
  const s = settings as ProductPriceSectionSettings;
  const isBold = store.theme === "bold";
  const price = product?.price ?? 29.99;
  const comparePrice = product?.comparePrice;
  const layout = s.layout ?? "default";
  const hasCompare =
    s.showComparePrice !== false && comparePrice != null && comparePrice > price;
  const savings = hasCompare ? Math.round(((comparePrice! - price) / comparePrice!) * 100) : 0;
  const savedAmount = hasCompare ? comparePrice! - price : 0;

  const saveBadge = (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-md",
        isBold
          ? "border border-emerald-400/20 bg-emerald-400/15 text-emerald-200"
          : "border border-emerald-500/15 bg-emerald-50/80 text-emerald-800"
      )}
    >
      −{savings}%
    </span>
  );

  if (layout === "badge") {
    return (
      <ProductSectionShell>
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className="inline-flex items-center rounded-full px-4 py-2 text-[15px] font-medium text-white shadow-[0_10px_28px_-14px_rgba(0,0,0,0.35)]"
            style={{ backgroundColor: "var(--store-primary)" }}
          >
            {formatCurrency(price, store.currency)}
          </span>
          {hasCompare ? (
            <>
              <span className={cn("text-sm line-through", isBold ? "text-white/35" : "text-neutral-400")}>
                {formatCurrency(comparePrice!, store.currency)}
              </span>
              {savings > 0 ? saveBadge : null}
            </>
          ) : null}
        </div>
      </ProductSectionShell>
    );
  }

  if (layout === "stacked") {
    return (
      <ProductSectionShell>
        <div className="space-y-2">
          {hasCompare ? (
            <span className={cn("block text-sm line-through", isBold ? "text-white/35" : "text-neutral-400")}>
              {formatCurrency(comparePrice!, store.currency)}
            </span>
          ) : null}
          <span
            className={cn(
              "block text-[2rem] font-medium tabular-nums tracking-[-0.03em] sm:text-[2.25rem]",
              isBold && "text-white"
            )}
            style={isBold ? undefined : { color: "var(--store-primary)" }}
          >
            {formatCurrency(price, store.currency)}
          </span>
          {hasCompare && savings > 0 ? (
            <p className={cn("text-[13px] font-medium", isBold ? "text-emerald-300/90" : "text-emerald-700")}>
              Save {formatCurrency(savedAmount, store.currency)} (−{savings}%)
            </p>
          ) : null}
        </div>
      </ProductSectionShell>
    );
  }

  return (
    <ProductSectionShell>
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <span
            className={cn(
              "text-[2rem] font-medium tabular-nums tracking-[-0.03em] sm:text-[2.15rem]",
              isBold && "text-white"
            )}
            style={isBold ? undefined : { color: "var(--store-primary)" }}
          >
            {formatCurrency(price, store.currency)}
          </span>
          {hasCompare ? (
            <span className={cn("text-[15px] line-through", isBold ? "text-white/35" : "text-neutral-400")}>
              {formatCurrency(comparePrice!, store.currency)}
            </span>
          ) : null}
          {hasCompare && savings > 0 ? saveBadge : null}
        </div>
        {hasCompare && savedAmount > 0 ? (
          <p className={cn("text-[13px]", isBold ? "text-white/45" : "text-neutral-500")}>
            You save {formatCurrency(savedAmount, store.currency)} vs original price
          </p>
        ) : (
          <p className={cn("text-[13px]", isBold ? "text-white/40" : "text-neutral-500")}>
            Pay on delivery · No upfront payment
          </p>
        )}
      </div>
    </ProductSectionShell>
  );
}
