import type { StoreSection } from "@/lib/sections/types";
import { getBlock, getBlockBySectionType } from "./block-registry";
import { mergeSectionSettings } from "./blocks/components";
import type { BlockDefinition } from "./types";

export interface ResolvedSectionBlock {
  block: BlockDefinition | undefined;
  blockId: string | undefined;
  hasComponent: boolean;
  settings: Record<string, unknown>;
}

/**
 * Resolve the registry block for a V1 store section.
 * Tries section type index first, then section id as block id.
 * Returns merged settings (block defaults + section overrides).
 */
export function resolveSectionBlock(section: StoreSection): ResolvedSectionBlock {
  const sectionSettings = section.settings as Record<string, unknown>;

  const byType = getBlockBySectionType(section.type);
  if (byType) {
    return {
      block: byType,
      blockId: byType.id,
      hasComponent: Boolean(byType.component),
      settings: mergeSectionSettings(byType, sectionSettings),
    };
  }

  const byId = getBlock(section.id);
  if (byId) {
    return {
      block: byId,
      blockId: byId.id,
      hasComponent: Boolean(byId.component),
      settings: mergeSectionSettings(byId, sectionSettings),
    };
  }

  return {
    block: undefined,
    blockId: undefined,
    hasComponent: false,
    settings: sectionSettings,
  };
}

export function getSectionTypeLabel(type: StoreSection["type"]): string {
  const block = getBlockBySectionType(type);
  if (block) return block.name;
  return type.replace(/-/g, " ");
}
