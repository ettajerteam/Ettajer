import type { ThemeId } from "@/lib/themes";
import type { HomeLayout, StoreSection } from "./types";
import { createSectionFromBlock } from "@/lib/builder/legacy-adapter";
import { getBlock, getBlockBySectionType } from "@/lib/builder/block-registry";

function newSectionId(type: string): string {
  return `${type}-${Math.random().toString(36).slice(2, 10)}`;
}

function section(type: StoreSection["type"], settings?: Record<string, unknown>): StoreSection {
  const block = getBlockBySectionType(type) ?? getBlock(type);
  if (block) {
    const created = createSectionFromBlock(block.id, { settings });
    if (created) return created;
  }
  return {
    id: newSectionId(type),
    type,
    settings: settings ?? {},
    visible: true,
  };
}

export function getDefaultHomeLayout(_theme: ThemeId = "minimal"): HomeLayout {
  return {
    version: 1,
    sections: [
      section("hero"),
      section("featured-collections"),
      section("product-grid"),
      section("footer"),
    ],
  };
}

export function getDefaultProductLayout(_theme: ThemeId = "minimal"): HomeLayout {
  return {
    version: 1,
    sections: [
      section("product-gallery"),
      section("product-info"),
      section("product-price"),
      section("product-variants"),
      section("product-buy-button"),
      section("product-reviews"),
      section("product-faq"),
      section("product-related"),
      section("product-recently-viewed"),
    ],
  };
}

export function getDefaultCollectionLayout(_theme: ThemeId = "minimal"): HomeLayout {
  return {
    version: 1,
    sections: [
      section("collection-page-banner"),
      section("collection-description"),
      section("collection-filters"),
      section("collection-product-grid"),
      section("collection-newsletter"),
      section("collection-pagination"),
    ],
  };
}
