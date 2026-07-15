"use client";

import type { ProductFaqSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

export function ProductFaqSection({ store, settings }: BlockRenderProps) {
  const s = settings as ProductFaqSectionSettings;
  const isBold = store.theme === "bold";
  const title = s.title ?? "Frequently asked questions";
  const content = s.content ?? "Add product FAQ content here.";

  return (
    <div className="max-w-6xl mx-auto px-6">
      <h2
        className={cn(
          "text-lg font-semibold mb-4",
          isBold ? "text-white uppercase tracking-widest text-sm" : "text-gray-900"
        )}
      >
        {title}
      </h2>
      <div
        className={cn(
          "prose prose-sm max-w-none",
          isBold ? "prose-invert text-white/70" : "text-gray-600"
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
