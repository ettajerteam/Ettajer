import type { SectionSettings, SectionType } from "@/lib/sections/types";

export interface BuilderSectionMetadata {
  /** Block registry id (e.g. "hero", "product-grid") */
  blockId?: string;
  /** Human-readable label for layers panel */
  label?: string;
  /** Traceability during V1 → V2 migration */
  migratedFromV1?: boolean;
  legacySectionId?: string;
  [key: string]: unknown;
}

/**
 * Section-level view over the element tree.
 * In V1 parity mode each section maps 1:1 to a single root BuilderElement.
 * `settings` preserves the V1 blob for lossless adapter round-trips.
 */
export interface BuilderSection {
  id: string;
  /** V1 section type — required for storefront rendering during coexistence */
  type: SectionType;
  /** Ordered child element ids (empty in V1 parity mode) */
  elements: string[];
  /** V1-compatible settings blob */
  settings: SectionSettings;
  visible: boolean;
  metadata: BuilderSectionMetadata;
  /** Root element id in the V2 elements map */
  rootElementId: string;
  /** Section ordering index within the parent page */
  sortOrder: number;
}
