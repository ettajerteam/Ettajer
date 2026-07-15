"use client";

import type { CollectionDescriptionSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import type { ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";

export function CollectionDescriptionSection({
  store,
  collection,
  settings,
}: BlockRenderProps) {
  const s = settings as CollectionDescriptionSectionSettings;
  const themeId = (store.theme in { minimal: 1, modern: 1, bold: 1 } ? store.theme : "minimal") as ThemeId;
  const isBold = themeId === "bold";
  const title = collection?.name ?? "Collection title";
  const description = collection?.description;

  return (
    <div
      className={cn(
        "mx-auto px-6 mb-6",
        themeId === "modern" ? "max-w-7xl" : "max-w-6xl"
      )}
    >
      <h1
        className={cn(
          "text-3xl sm:text-4xl font-bold tracking-tight mb-3",
          themeId === "modern" && "uppercase font-black tracking-tighter",
          themeId === "bold" && "uppercase"
        )}
      >
        {title}
      </h1>
      {s.showDescription !== false && description && (
        <p className={cn("text-lg max-w-2xl", isBold ? "text-white/60" : "text-gray-500")}>
          {description}
        </p>
      )}
    </div>
  );
}
