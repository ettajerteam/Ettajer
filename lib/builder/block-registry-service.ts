import type { SectionType } from "@/lib/sections/types";
import type { BlockSettingsSchema } from "./block-schema";
import type {
  BlockCategoryId,
  BlockComponent,
  BlockDefinition,
} from "./types";

/**
 * Central registry for builder blocks.
 * New blocks register here — no changes to renderer or add-panel core code required.
 */
export class BlockRegistry {
  private readonly blocks = new Map<string, BlockDefinition>();
  private readonly sectionTypeIndex = new Map<SectionType, BlockDefinition>();

  /** Register or replace a block definition. */
  register(def: BlockDefinition): void {
    this.blocks.set(def.id, def);
    if (def.legacySectionType && def.implemented) {
      if (!this.sectionTypeIndex.has(def.legacySectionType)) {
        this.sectionTypeIndex.set(def.legacySectionType, def);
      }
    }
  }

  /** Remove a block by id. Re-indexes section type if the canonical block was removed. */
  unregister(id: string): boolean {
    const existing = this.blocks.get(id);
    if (!existing) return false;

    this.blocks.delete(id);

    if (existing.legacySectionType) {
      const canonical = this.sectionTypeIndex.get(existing.legacySectionType);
      if (canonical?.id === id) {
        this.sectionTypeIndex.delete(existing.legacySectionType);
        const remaining = this.getAll();
        for (let i = 0; i < remaining.length; i++) {
          const block = remaining[i];
          if (
            block.legacySectionType === existing.legacySectionType &&
            block.implemented
          ) {
            this.sectionTypeIndex.set(existing.legacySectionType, block);
            break;
          }
        }
      }
    }

    return true;
  }

  get(id: string): BlockDefinition | undefined {
    return this.blocks.get(id);
  }

  getAll(): BlockDefinition[] {
    return Array.from(this.blocks.values());
  }

  getByCategory(category: BlockCategoryId): BlockDefinition[] {
    return this.getAll().filter((b) => b.category === category);
  }

  getImplemented(): BlockDefinition[] {
    return this.getAll().filter((b) => b.implemented && b.legacySectionType);
  }

  getComponent(id: string): BlockComponent | undefined {
    return this.get(id)?.component;
  }

  getSchema(id: string): BlockSettingsSchema | undefined {
    return this.get(id)?.settingsSchema;
  }

  /** Canonical block for a V1 section type (first registered wins). */
  getBySectionType(type: SectionType): BlockDefinition | undefined {
    return this.sectionTypeIndex.get(type);
  }

  has(id: string): boolean {
    return this.blocks.has(id);
  }

  size(): number {
    return this.blocks.size;
  }
}

/** Process-wide singleton — populated at module load via registerAllBlocks(). */
export const blockRegistry = new BlockRegistry();
