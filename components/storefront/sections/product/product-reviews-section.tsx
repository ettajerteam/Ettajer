"use client";

import { Star } from "lucide-react";
import type { ProductReviewsSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

const SAMPLE_REVIEWS = [
  { author: "Alex M.", rating: 5, text: "Great quality and fast shipping." },
  { author: "Jordan K.", rating: 4, text: "Exactly as described. Would buy again." },
];

export function ProductReviewsSection({ store, settings }: BlockRenderProps) {
  const s = settings as ProductReviewsSectionSettings;
  const isBold = store.theme === "bold";
  const title = s.title ?? "Customer reviews";

  return (
    <div className="max-w-6xl mx-auto px-6">
      <h2
        className={cn(
          "text-lg font-semibold mb-6",
          isBold ? "text-white uppercase tracking-widest text-sm" : "text-gray-900"
        )}
      >
        {title}
      </h2>
      <div className="space-y-4">
        {SAMPLE_REVIEWS.map((review) => (
          <div
            key={review.author}
            className={cn(
              "rounded-xl border p-4",
              isBold ? "border-white/10 bg-white/5" : "border-gray-100 bg-gray-50/50"
            )}
          >
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                  )}
                />
              ))}
              <span className={cn("ml-2 text-xs", isBold ? "text-white/50" : "text-gray-500")}>
                {review.author}
              </span>
            </div>
            <p className={cn("text-sm", isBold ? "text-white/70" : "text-gray-600")}>{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
