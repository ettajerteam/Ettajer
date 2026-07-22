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
  const isModern = themeId === "modern";
  const title = collection?.name ?? "Collection title";
  const description = collection?.description;
  const layout = s.layout ?? "centered";
  const showTitle = s.showTitle === true;
  const showDescription = s.showDescription !== false;

  if (!showTitle && (!showDescription || !description)) return null;

  if (layout === "centered") {
    if (!showDescription || !description) return null;
    return (
      <div className={cn("mx-auto max-w-2xl px-6 py-10 text-center sm:py-12", isModern && "max-w-xl")}>
        {showTitle ? (
          <h1
            className={cn(
              "mb-4 text-2xl font-semibold tracking-tight sm:text-3xl",
              isBold && "uppercase text-white",
              isModern && "font-medium text-neutral-900"
            )}
          >
            {title}
          </h1>
        ) : null}
        <p
          className={cn(
            "text-[15px] leading-relaxed",
            isBold ? "text-white/55" : "text-neutral-500"
          )}
        >
          {description}
        </p>
      </div>
    );
  }

  if (layout === "inline") {
    return (
      <div
        className={cn(
          "mx-auto mb-2 flex flex-col gap-3 px-6 pt-8 sm:flex-row sm:items-end sm:justify-between",
          isModern ? "max-w-7xl" : "max-w-6xl"
        )}
      >
        {showTitle ? (
          <h1
            className={cn(
              "text-2xl font-semibold tracking-tight sm:text-3xl",
              isBold && "uppercase text-white"
            )}
          >
            {title}
          </h1>
        ) : null}
        {showDescription && description ? (
          <p
            className={cn(
              "max-w-md text-sm leading-relaxed sm:text-right",
              isBold ? "text-white/50" : "text-neutral-500"
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("mx-auto px-6 pt-8", isModern ? "max-w-7xl" : "max-w-6xl")}>
      {showTitle ? (
        <h1
          className={cn(
            "mb-3 text-3xl font-semibold tracking-tight sm:text-4xl",
            isBold && "uppercase text-white"
          )}
        >
          {title}
        </h1>
      ) : null}
      {showDescription && description ? (
        <p
          className={cn(
            "max-w-2xl text-[15px] leading-relaxed",
            isBold ? "text-white/55" : "text-neutral-500"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
