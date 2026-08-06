"use client";

import Image from "next/image";
import { ProductSectionShell } from "@/components/storefront/product-section-shell";
import { useProductVariantSelection } from "@/components/storefront/product-variant-context";
import type { ProductVariantsSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

export function ProductVariantsSection({ store, product, settings }: BlockRenderProps) {
  const s = settings as ProductVariantsSectionSettings;
  const isBold = store.theme === "bold";
  const layout = s.layout ?? "outline";
  const variants = product?.variants ?? [];
  const { selection, setOption } = useProductVariantSelection();

  if (variants.length === 0) {
    return null;
  }

  return (
    <ProductSectionShell className="space-y-6">
      {variants.map((variant) => {
        const selected = selection[variant.name] ?? variant.options[0];
        return (
          <div key={variant.id}>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <p
                className={cn(
                  "text-[11px] font-medium uppercase tracking-[0.14em]",
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
                const optionImage = variant.optionImages?.[value];
                return (
                  <button
                    key={value}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => setOption(variant.name, value)}
                    className={cn(
                      "pdp-chip",
                      optionImage && "pl-1.5",
                      layout === "pills" &&
                        (isActive
                          ? "border-transparent text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.35)]"
                          : isBold
                            ? "border-white/12 bg-white/[0.06] text-white/80 hover:bg-white/10"
                            : "border-black/5 bg-white/55 text-neutral-700 hover:bg-white/85"),
                      layout === "outline" &&
                        (isActive
                          ? "border-transparent text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.35)]"
                          : isBold
                            ? "border-white/15 bg-transparent text-white/75 hover:border-white/35"
                            : "border-black/10 bg-white/40 text-neutral-700 hover:border-black/20 hover:bg-white/70"),
                      layout === "underline" &&
                        cn(
                          "rounded-none border-0 border-b-2 bg-transparent px-1 py-1.5 min-h-0 min-w-0",
                          isActive
                            ? "border-[var(--store-primary)] font-medium"
                            : isBold
                              ? "border-transparent text-white/50 hover:text-white"
                              : "border-transparent text-neutral-500 hover:text-neutral-900"
                        ),
                      isActive &&
                        (layout === "pills" || layout === "outline") &&
                        "scale-[1.02]"
                    )}
                    style={
                      isActive && (layout === "pills" || layout === "outline")
                        ? { backgroundColor: "var(--store-primary)" }
                        : undefined
                    }
                  >
                    {optionImage ? (
                      <span className="relative mr-2 inline-block h-6 w-6 overflow-hidden rounded-md align-middle">
                        <Image
                          src={optionImage}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </span>
                    ) : null}
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
