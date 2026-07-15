"use client";

import type { CollectionFiltersSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

export function CollectionFiltersSection({ store, categories = [], settings }: BlockRenderProps) {
  const s = settings as CollectionFiltersSectionSettings;
  const isBold = store.theme === "bold";
  const title = s.title ?? "Filter";

  return (
    <div className="max-w-6xl mx-auto px-6 mb-6">
      <p className={cn("text-xs font-medium uppercase tracking-widest mb-3", isBold ? "text-white/40" : "text-gray-400")}>
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-full px-4 py-1.5 text-sm font-medium text-white"
          style={{ backgroundColor: "var(--store-primary)" }}
        >
          All
        </button>
        {categories.slice(0, 6).map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              isBold
                ? "border-white/20 text-white/70 hover:border-white/40"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
