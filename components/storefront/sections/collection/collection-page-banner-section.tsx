"use client";

import Image from "next/image";
import { StorefrontBreadcrumb } from "@/components/storefront/storefront-breadcrumb";
import { getThemeAssets } from "@/lib/storefront-assets";
import { getStoreUrl } from "@/lib/storefront-urls";
import type { CollectionPageBannerSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import type { ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";

export function CollectionPageBannerSection({
  store,
  collection,
  settings,
}: BlockRenderProps) {
  const s = settings as CollectionPageBannerSectionSettings;
  const themeId = (store.theme in { minimal: 1, modern: 1, bold: 1 } ? store.theme : "minimal") as ThemeId;
  const assets = getThemeAssets(store.theme);
  const coverImage = s.imageUrl || collection?.image || assets.categoryCover;
  const label = collection?.name ?? "Collection";

  return (
    <div
      className={cn(
        "mx-auto px-6",
        themeId === "modern" ? "max-w-7xl" : "max-w-6xl"
      )}
    >
      {s.showBreadcrumb !== false && (
        <StorefrontBreadcrumb
          variant={themeId}
          items={[
            { label: store.name, href: getStoreUrl(store.slug) },
            { label },
          ]}
        />
      )}
      <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden mb-6 mt-4">
        <Image
          src={coverImage}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1152px"
        />
      </div>
    </div>
  );
}
