"use client";

import { useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import { ProductSectionShell } from "@/components/storefront/product-section-shell";
import { averageReviewRating, parseProductReviews } from "@/lib/product-reviews";
import type { ProductInfoSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

export function ProductInfoSection({ store, product, settings }: BlockRenderProps) {
  const s = settings as ProductInfoSectionSettings;
  const isBold = store.theme === "bold";
  const title = product?.title ?? "Product title";
  const layout = s.layout ?? "default";
  const showBrand = s.showBrand !== false;
  const details = product?.details?.filter((d) => d.label && d.value) ?? [];
  const reviews = parseProductReviews(product?.reviews);
  const average = averageReviewRating(reviews);
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <ProductSectionShell className="space-y-5">
      {showBrand ? (
        <p
          className={cn(
            "text-[11px] font-medium uppercase tracking-[0.18em]",
            isBold ? "text-white/40" : "text-neutral-400"
          )}
        >
          {store.name}
        </p>
      ) : null}

      <div className="space-y-3">
        <h1
          className={cn(
            "text-balance font-medium tracking-[-0.035em]",
            layout === "compact" && "text-xl sm:text-2xl",
            layout === "editorial" &&
              "text-[1.9rem] leading-[1.05] sm:text-[2.35rem]",
            layout === "default" &&
              "text-[1.75rem] leading-[1.08] sm:text-[2.1rem]",
            isBold && "text-white"
          )}
        >
          {title}
        </h1>

        {average != null && reviews.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-0.5" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < Math.round(average)
                      ? "fill-amber-400 text-amber-400"
                      : isBold
                        ? "text-white/20"
                        : "text-neutral-200"
                  )}
                />
              ))}
            </div>
            <p
              className={cn(
                "text-[13px] tabular-nums",
                isBold ? "text-white/55" : "text-neutral-500"
              )}
            >
              <span className={cn("font-medium", isBold ? "text-white/85" : "text-neutral-800")}>
                {average.toFixed(1)}
              </span>
              <span className="opacity-70">
                {" "}
                · {reviews.length} review{reviews.length === 1 ? "" : "s"}
              </span>
            </p>
          </div>
        ) : null}
      </div>

      {s.showDescription !== false && product?.description ? (
        <div
          className={cn(
            "prose prose-sm max-w-none text-[15px] leading-[1.7]",
            layout === "compact" && "line-clamp-3",
            isBold ? "prose-invert text-white/60" : "prose-neutral text-neutral-500"
          )}
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      ) : null}

      {(product?.highlights?.length ?? 0) > 0 ? (
        <ul className="space-y-2">
          {product!.highlights!.map((item) => (
            <li
              key={item}
              className={cn(
                "flex items-start gap-2 text-[14px] leading-snug",
                isBold ? "text-white/75" : "text-neutral-700"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                  isBold ? "bg-white/15 text-white" : "bg-emerald-500/15 text-emerald-700"
                )}
                aria-hidden
              >
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {details.length > 0 ? (
        <div
          className={cn(
            "overflow-hidden rounded-2xl backdrop-blur-md",
            isBold
              ? "border border-white/10 bg-white/[0.04]"
              : "border border-white/70 bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
          )}
        >
          <button
            type="button"
            onClick={() => setDetailsOpen((open) => !open)}
            className={cn(
              "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-[13px] font-medium tracking-[-0.01em] transition duration-300",
              isBold
                ? "text-white hover:bg-white/[0.04]"
                : "text-neutral-900 hover:bg-white/40"
            )}
            aria-expanded={detailsOpen}
          >
            <span>Product details</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-300",
                detailsOpen && "rotate-180",
                isBold ? "text-white/40" : "text-neutral-400"
              )}
            />
          </button>
          {detailsOpen ? (
            <dl>
              {details.map((row) => (
                <div
                  key={row.id}
                  className={cn(
                    "grid grid-cols-[0.85fr_1.15fr] gap-3 border-t px-4 py-3 text-[13px]",
                    isBold ? "border-white/10" : "border-black/[0.05]"
                  )}
                >
                  <dt className={cn(isBold ? "text-white/45" : "text-neutral-400")}>{row.label}</dt>
                  <dd className={cn("font-medium", isBold ? "text-white/90" : "text-neutral-800")}>
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      ) : null}

      {product?.copyrightNotice || product?.copyrightOwner ? (
        <p
          className={cn(
            "text-[11px] leading-relaxed",
            isBold ? "text-white/35" : "text-neutral-400"
          )}
        >
          {product.copyrightNotice?.trim()
            ? product.copyrightNotice
            : `© ${product.copyrightOwner}. All rights reserved.`}
        </p>
      ) : null}

      {!product ? (
        <p className={cn("text-sm", isBold ? "text-white/45" : "text-neutral-400")}>
          Product description preview
        </p>
      ) : null}
    </ProductSectionShell>
  );
}
