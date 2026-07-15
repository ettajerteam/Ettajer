import type { BlockRegistry } from "../block-registry-service";
import type { BlockDefinition } from "../types";
import { withBlockComponent } from "./components";
import { CORE_BLOCK_DEFINITIONS } from "./core-blocks";
import { imageBlock } from "./image.block";
import {
  featuresBlock,
  testimonialsBlock,
  faqBlock,
  ctaBlock,
  newsletterBlock,
} from "./marketing-blocks";
import { featuredProductsBlock } from "./product-grid.block";
import { PRODUCT_PAGE_BLOCKS } from "./product-page-blocks";
import { COLLECTION_PAGE_BLOCKS } from "./collection-page-blocks";
import {
  layoutStubBlocks,
  commerceStubBlocks,
  mediaStubBlocks,
  formsStubBlocks,
  advancedStubBlocks,
} from "./stub-blocks";

const EXTENSION_DEFINITIONS: Omit<BlockDefinition, "component">[] = [
  ...layoutStubBlocks,
  imageBlock,
  featuresBlock,
  testimonialsBlock,
  faqBlock,
  ctaBlock,
  newsletterBlock,
  featuredProductsBlock,
  ...PRODUCT_PAGE_BLOCKS,
  ...COLLECTION_PAGE_BLOCKS,
  ...commerceStubBlocks,
  ...mediaStubBlocks,
  ...formsStubBlocks,
  ...advancedStubBlocks,
];

/** All block definitions in registration order (core blocks first). */
const ALL_DEFINITIONS: Omit<BlockDefinition, "component">[] = [
  ...CORE_BLOCK_DEFINITIONS,
  ...EXTENSION_DEFINITIONS,
];

function toFullDefinition(
  def: Omit<BlockDefinition, "component">
): BlockDefinition {
  return withBlockComponent(def);
}

/**
 * Populate the registry with all built-in blocks.
 * Call once at module init — safe to call register() for new blocks later.
 */
export function registerAllBlocks(registry: BlockRegistry): void {
  for (const def of ALL_DEFINITIONS) {
    registry.register(toFullDefinition(def));
  }
}

/** @deprecated Use blockRegistry.getAll() */
export const ALL_BLOCKS: BlockDefinition[] = ALL_DEFINITIONS.map(toFullDefinition);
