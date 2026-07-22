"use client";

import { ProductSectionShell } from "@/components/storefront/product-section-shell";
import { useProductVariantSelection } from "@/components/storefront/product-variant-context";
import type { ProductVariantsSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

export function ProductVariantsSection({ store, product, settings }: BlockRenderProps) {
  const s = settings as ProductVariantsSectionSettings;
  const isBold = store.theme === "bold";
  const isModern = store.theme === "modern";
  const layout = s.layout ?? "outline";
  const variants = product?.variants ?? [];
  const { selection, setOption } = useProductVariantSelection();

  if (variants.length === 0) {
    return null;
  }

  return (
    <ProductSectionShell className="space-y-5">
      {variants.map((variant) => {
        const selected = selection[variant.name] ?? variant.options[0];
        return (
          <div key={variant.id}>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <p
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-[0.14em]",
                  isBold ? "text-white/45" : "text-neutral-400"
                )}
              >
                {s.label ?? variant.name}
              </p>
              {selected ? (
                <p
                  className={cn(
                    "text-[13px] font-medium",
                    isBold ? "text-white/75" : "text-neutral-700"
                  )}
                >
                  {selected}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2" role="listbox" aria-label={variant.name}>
              {variant.options.map((value) => {
                const isActive = selected === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => setOption(variant.name, value)}
                    className={cn(
                      "min-w-[3rem] px-3.5 py-2.5 text-[13px] transition duration-150",
                      layout === "pills" &&
                        cn(
                          isModern ? "rounded-sm" : "rounded-full",
                          isActive
                            ? "bg-[var(--store-primary)] text-white shadow-sm"
                            : isBold
                              ? "bg-white/8 text-white hover:bg-white/12"
                              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80"
                        ),
                      layout === "outline" &&
                        cn(
                          "border",
                          isModern ? "rounded-sm" : "rounded-xl",
                          isActive
                            ? "border-[var(--store-primary)] bg-[var(--store-primary)] font-medium text-white shadow-sm"
                            : isBold
                              ? "border-white/15 text-white/75 hover:border-white/35"
                              : "border-neutral-200 text-neutral-700 hover:border-neutral-400"
                        ),
                      layout === "underline" &&
                        cn(
                          "border-b-2 px-1 py-1.5",
                          isActive
                            ? "border-[var(--store-primary)] font-medium"
                            : isBold
                              ? "border-transparent text-white/50 hover:text-white"
                              : "border-transparent text-neutral-500 hover:text-neutral-900"
                        )
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </ProductSectionShell>
  );
}
