/**
 * Canonical storefront blocks — the five core sections every store supports.
 */
import { heroBlock } from "./hero.block";
import { featuredCollectionsBlock } from "./featured-collections.block";
import { productGridBlock } from "./product-grid.block";
import { richTextBlock } from "./rich-text.block";
import { footerBlock } from "./footer.block";
import type { BlockDefinition } from "../types";

export const CORE_BLOCK_IDS = [
  "hero",
  "collection-banner",
  "product-grid",
  "rich-text",
  "footer",
] as const;

export type CoreBlockId = (typeof CORE_BLOCK_IDS)[number];

/** Metadata-only definitions for the five core blocks (components attached at registration). */
export const CORE_BLOCK_DEFINITIONS: Omit<BlockDefinition, "component">[] = [
  heroBlock,
  featuredCollectionsBlock,
  productGridBlock,
  richTextBlock,
  footerBlock,
];
