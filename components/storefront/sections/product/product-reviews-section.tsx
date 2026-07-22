"use client";

import { Star } from "lucide-react";
import {
  averageReviewRating,
  parseProductReviews,
} from "@/lib/product-reviews";
import type { ProductReviewsSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import type { PublicProductReview } from "@/types/storefront";
import { cn } from "@/lib/utils";

function StarRow({
  rating,
  size = "md",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const cls = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            cls,
            i < rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
          )}
        />
      ))}
    </div>
  );
}

function ReviewAttribution({
  review,
  isBold,
}: {
  review: PublicProductReview;
  isBold: boolean;
}) {
  return (
    <p
      className={cn(
        "mt-2 text-[11px] font-semibold uppercase tracking-[0.12em]",
        isBold ? "text-white/40" : "text-neutral-400"
      )}
    >
      {review.author}
      {review.location ? ` · ${review.location}` : ""}
    </p>
  );
}

export function ProductReviewsSection({
  store,
  product,
  settings,
  builderMode,
}: BlockRenderProps) {
  const s = settings as ProductReviewsSectionSettings;
  const isBold = store.theme === "bold";
  const isModern = store.theme === "modern";
  const title = s.title ?? "Customer reviews";
  const layout = s.layout ?? "cards";
  const limit = Math.min(24, Math.max(1, Number(s.limit) || 6));
  const showSummary = s.showSummary !== false;
  const reviews = parseProductReviews(product?.reviews).slice(0, limit);
  const average = averageReviewRating(reviews);

  if (reviews.length === 0) {
    if (!builderMode) return null;
    return (
      <div className={cn("mx-auto max-w-6xl px-6", isModern && "max-w-4xl")}>
        <h2
          className={cn(
            "mb-4",
            isModern && "text-xs font-semibold uppercase tracking-[0.22em] text-neutral-900",
            isBold
              ? "text-sm font-bold uppercase tracking-[0.4em] text-white"
              : "text-lg font-semibold text-gray-900"
          )}
        >
          {title}
        </h2>
        <div
          className={cn(
            "rounded-xl border border-dashed px-4 py-8 text-center",
            isBold ? "border-white/20 text-white/50" : "border-neutral-200 text-neutral-500"
          )}
        >
          <p className="text-sm font-medium">No reviews on this product yet</p>
          <p className="mt-1 text-xs leading-relaxed opacity-80">
            Add real customer reviews in Products → edit product. The live storefront will not show sample quotes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("mx-auto max-w-6xl px-6 py-16 sm:py-20", isModern && "max-w-4xl")}>
      <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2
          className={cn(
            isModern && "text-xs font-semibold uppercase tracking-[0.22em] text-neutral-900",
            isBold
              ? "text-sm font-bold uppercase tracking-[0.28em] text-white"
              : "text-xl font-semibold tracking-tight text-neutral-900"
          )}
        >
          {title}
        </h2>
        {showSummary && average != null ? (
          <div className="flex items-center gap-2.5">
            <StarRow rating={Math.round(average)} />
            <span
              className={cn(
                "text-sm tabular-nums",
                isBold ? "text-white/50" : "text-neutral-500"
              )}
            >
              {average.toFixed(1)} · {reviews.length}{" "}
              {reviews.length === 1 ? "review" : "reviews"}
            </span>
          </div>
        ) : null}
      </div>

      {layout === "list" || layout === "compact" ? (
        <div className={cn("flex flex-col", layout === "compact" ? "gap-4" : "gap-0")}>
          {reviews.map((review) => (
            <div
              key={review.id}
              className={cn(
                "flex gap-4",
                layout === "compact"
                  ? "border-b pb-4 last:border-0"
                  : "border-b py-6 first:pt-0 last:border-0",
                isBold ? "border-white/10" : "border-neutral-100"
              )}
            >
              <div className="flex shrink-0 pt-0.5">
                <StarRow rating={review.rating} size="sm" />
              </div>
              <div className="min-w-0">
                <p className={cn("text-[15px] leading-relaxed", isBold ? "text-white/70" : "text-neutral-600")}>
                  {review.text}
                </p>
                <ReviewAttribution review={review} isBold={isBold} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={cn(
                "py-1",
                isModern && "border-t border-neutral-100 pt-5",
                !isModern && !isBold && "border-t border-neutral-100 pt-5",
                isBold && "border-t border-white/10 pt-5"
              )}
            >
              <div className="mb-3">
                <StarRow rating={review.rating} />
              </div>
              <p className={cn("text-[15px] leading-relaxed", isBold ? "text-white/70" : "text-neutral-600")}>
                {review.text}
              </p>
              <ReviewAttribution review={review} isBold={isBold} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
