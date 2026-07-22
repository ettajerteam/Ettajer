"use client";

import { formatCurrency, cn } from "@/lib/utils";
import { ProductSectionShell } from "@/components/storefront/product-section-shell";
import type { ProductPriceSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";

export function ProductPriceSection({ store, product, settings }: BlockRenderProps) {
  const s = settings as ProductPriceSectionSettings;
  const isBold = store.theme === "bold";
  const isModern = store.theme === "modern";
  const price = product?.price ?? 29.99;
  const comparePrice = product?.comparePrice;
  const layout = s.layout ?? "default";
  const hasCompare =
    s.showComparePrice !== false && comparePrice != null && comparePrice > price;
  const savings = hasCompare ? Math.round(((comparePrice! - price) / comparePrice!) * 100) : 0;
  const savedAmount = hasCompare ? comparePrice! - price : 0;

  if (layout === "badge") {
    return (
      <ProductSectionShell>
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={cn(
              "inline-flex items-center px-3.5 py-1.5 text-sm font-semibold text-white",
              isModern ? "rounded-sm" : "rounded-full"
            )}
            style={{ backgroundColor: "var(--store-primary)" }}
          >
            {formatCurrency(price, store.currency)}
          </span>
          {hasCompare ? (
            <>
              <span className={cn("text-sm line-through", isBold ? "text-white/35" : "text-neutral-400")}>
                {formatCurrency(comparePrice!, store.currency)}
              </span>
              {savings > 0 ? (
                <span
                  className={cn(
                    "px-2 py-0.5 text-[11px] font-semibold",
                    isModern ? "rounded-sm" : "rounded-full",
                    isBold ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-50 text-emerald-800"
                  )}
                >
                  −{savings}%
                </span>
              ) : null}
            </>
          ) : null}
        </div>
      </ProductSectionShell>
    );
  }

  if (layout === "stacked") {
    return (
      <ProductSectionShell>
        <div className="space-y-1.5">
          {hasCompare ? (
            <span className={cn("block text-sm line-through", isBold ? "text-white/35" : "text-neutral-400")}>
              {formatCurrency(comparePrice!, store.currency)}
            </span>
          ) : null}
          <span
            className={cn(
              "block text-3xl font-semibold tabular-nums tracking-tight sm:text-[2.15rem]",
              isModern && "font-medium",
              isBold && "font-bold text-white"
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
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className={cn(
              "text-[1.85rem] font-semibold tabular-nums tracking-tight sm:text-[2rem]",
              isModern && "font-medium",
              isBold && "font-bold text-white"
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
          {hasCompare && savings > 0 ? (
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 text-[11px] font-semibold",
                isModern ? "rounded-sm" : "rounded-full",
                isBold ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-50 text-emerald-800"
              )}
            >
              −{savings}%
            </span>
          ) : null}
        </div>
        {hasCompare && savedAmount > 0 ? (
          <p className={cn("text-[12px]", isBold ? "text-white/45" : "text-neutral-500")}>
            You save {formatCurrency(savedAmount, store.currency)} vs original price
          </p>
        ) : (
          <p className={cn("text-[12px]", isBold ? "text-white/40" : "text-neutral-400")}>
            Pay on delivery · No upfront payment
          </p>
        )}
      </div>
    </ProductSectionShell>
  );
}
