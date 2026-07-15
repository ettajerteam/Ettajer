"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CollectionPaginationSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

export function CollectionPaginationSection({ store, settings }: BlockRenderProps) {
  const s = settings as CollectionPaginationSectionSettings;
  const isBold = store.theme === "bold";
  const pageSize = typeof s.pageSize === "number" ? s.pageSize : 12;

  return (
    <div className="max-w-6xl mx-auto px-6 pb-16">
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm",
            isBold
              ? "border-white/20 text-white/50"
              : "border-gray-200 text-gray-400"
          )}
          disabled
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <span className={cn("text-sm", isBold ? "text-white/60" : "text-gray-500")}>
          Page 1 · {pageSize} per page
        </span>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm",
            isBold
              ? "border-white/20 text-white/70 hover:border-white/40"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
          )}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
