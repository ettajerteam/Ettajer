import type { SectionType } from "@/lib/sections/types";
import type { BlockSettingsSchema } from "./block-schema";
import { blockRegistry, BlockRegistry } from "./block-registry-service";
import { registerAllBlocks } from "./blocks/register";
import { syncSectionRegistry } from "@/lib/sections/registry";
import type { BlockCategoryDefinition, BlockComponent, BlockDefinition } from "./types";

export { BlockRegistry, blockRegistry } from "./block-registry-service";

export const BLOCK_CATEGORIES: BlockCategoryDefinition[] = [
  { id: "layout", label: "Layout", description: "Structure and spacing" },
  { id: "marketing", label: "Marketing", description: "Storytelling and conversion" },
  { id: "commerce", label: "Commerce", description: "Products and collections" },
  { id: "media", label: "Media", description: "Images, video, and galleries" },
  { id: "forms", label: "Forms", description: "Capture leads and search" },
  { id: "advanced", label: "Advanced", description: "Custom code and embeds" },
];

registerAllBlocks(blockRegistry);
syncSectionRegistry();

/** Mutable view kept in sync with blockRegistry for legacy imports */
export const BLOCK_REGISTRY: BlockDefinition[] = blockRegistry.getAll();

function syncBlockRegistryArray(): void {
  BLOCK_REGISTRY.length = 0;
  BLOCK_REGISTRY.push(...blockRegistry.getAll());
}

// --- Backward-compatible function API (delegates to blockRegistry) ---

export function registerBlock(def: BlockDefinition): void {
  blockRegistry.register(def);
  syncBlockRegistryArray();
  syncSectionRegistry();
}

export function unregisterBlock(id: string): boolean {
  const removed = blockRegistry.unregister(id);
  if (removed) {
    syncBlockRegistryArray();
    syncSectionRegistry();
  }
  return removed;
}

export function getBlock(id: string): BlockDefinition | undefined {
  return blockRegistry.get(id);
}

export function getAllBlocks(): BlockDefinition[] {
  return blockRegistry.getAll();
}

export function getBlocksByCategory(
  category: BlockCategoryDefinition["id"]
): BlockDefinition[] {
  return blockRegistry.getByCategory(category);
}

export function getImplementedBlocks(): BlockDefinition[] {
  return blockRegistry.getImplemented();
}

export function getBlockComponent(id: string): BlockComponent | undefined {
  return blockRegistry.getComponent(id);
}

export function getBlockSchema(id: string): BlockSettingsSchema | undefined {
  return blockRegistry.getSchema(id);
}

/** Registry API aliases */
export const register = registerBlock;
export const unregister = unregisterBlock;
export const get = getBlock;
export const getAll = getAllBlocks;
export const getByCategory = getBlocksByCategory;

export function getBlockBySectionType(type: SectionType): BlockDefinition | undefined {
  return blockRegistry.getBySectionType(type);
}

export function getBlockThumbnailClasses(block: BlockDefinition): string {
  if (block.thumbnail.type === "gradient") {
    return block.thumbnail.value;
  }
  return block.previewGradient ?? "from-neutral-100 to-neutral-200";
}

export const BUILDER_DRAG_MIME = "application/x-ettajer-block";
