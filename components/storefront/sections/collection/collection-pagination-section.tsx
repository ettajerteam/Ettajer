"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CollectionPaginationSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

export function CollectionPaginationSection({
  store,
  products = [],
  settings,
}: BlockRenderProps) {
  const s = settings as CollectionPaginationSectionSettings;
  const isBold = store.theme === "bold";
  const isModern = store.theme === "modern";
  const pageSize = typeof s.pageSize === "number" ? s.pageSize : 12;
  const layout = s.layout ?? "simple";
  const total = products.length;
  const showing = Math.min(pageSize, total);

  // Single page of results — keep chrome quiet.
  if (total > 0 && total <= pageSize && layout !== "load-more") {
    return (
      <div
        className={cn(
          "mx-auto px-6 pb-16 pt-4 text-center",
          isModern ? "max-w-7xl" : "max-w-6xl"
        )}
      >
        <p className={cn("text-[12px] tabular-nums", isBold ? "text-white/35" : "text-neutral-400")}>
          Showing {showing} {showing === 1 ? "product" : "products"}
        </p>
      </div>
    );
  }

  if (layout === "load-more") {
    return (
      <div
        className={cn(
          "mx-auto px-6 pb-20 pt-6 text-center",
          isModern ? "max-w-7xl" : "max-w-6xl"
        )}
      >
        <button
          type="button"
          className={cn(
            "h-11 border px-8 text-[13px] font-semibold transition",
            isModern ? "rounded-sm uppercase tracking-[0.12em]" : "rounded-full",
            isBold
              ? "border-white/25 text-white hover:border-white/50"
              : "border-neutral-300 text-neutral-800 hover:border-neutral-500"
          )}
        >
          Load more
        </button>
        <p className={cn("mt-3 text-[12px]", isBold ? "text-white/35" : "text-neutral-400")}>
          Showing {showing}
          {total > showing ? ` of ${total}` : ""}
        </p>
      </div>
    );
  }

  if (layout === "numbered") {
    return (
      <div
        className={cn(
          "mx-auto px-6 pb-20 pt-8",
          isModern ? "max-w-7xl" : "max-w-6xl"
        )}
      >
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center border text-sm transition",
              isModern ? "rounded-sm" : "rounded-lg",
              isBold
                ? "border-white/15 text-white/35"
                : "border-neutral-200 text-neutral-300"
            )}
            disabled
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center text-[13px] font-medium transition",
                isModern ? "rounded-sm" : "rounded-lg",
                n === 1
                  ? isBold
                    ? "bg-white text-black"
                    : "bg-neutral-900 text-white"
                  : isBold
                    ? "text-white/55 hover:bg-white/8"
                    : "text-neutral-500 hover:bg-neutral-100"
              )}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center border text-sm transition",
              isModern ? "rounded-sm" : "rounded-lg",
              isBold
                ? "border-white/20 text-white/70 hover:border-white/40"
                : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
            )}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <p
          className={cn(
            "mt-4 text-center text-[12px] tabular-nums",
            isBold ? "text-white/35" : "text-neutral-400"
          )}
        >
          {pageSize} per page
        </p>
      </div>
    );
  }

  // simple
  return (
    <div
      className={cn(
        "mx-auto flex items-center justify-between gap-4 px-6 pb-20 pt-8",
        isModern ? "max-w-7xl" : "max-w-6xl"
      )}
    >
      <button
        type="button"
        className={cn(
          "text-[13px] font-medium",
          isBold ? "text-white/30" : "text-neutral-300"
        )}
        disabled
      >
        ← Previous
      </button>
      <span className={cn("text-[12px] tabular-nums", isBold ? "text-white/45" : "text-neutral-400")}>
        Page 1
      </span>
      <button
        type="button"
        className={cn(
          "text-[13px] font-medium transition",
          isBold ? "text-white/80 hover:text-white" : "text-neutral-700 hover:text-neutral-900"
        )}
      >
        Next →
      </button>
    </div>
  );
}
