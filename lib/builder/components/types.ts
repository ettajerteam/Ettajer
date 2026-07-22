import type { BuilderElement } from "@/lib/builder/v2/types/element";
import type { BuilderSection } from "@/lib/builder/v2/types/section";
import type { StoreSection } from "@/lib/sections/types";

/** Marketplace-ready metadata for future publishing. */
export interface BuilderComponentMetadata {
  author?: string;
  tags?: string[];
  isPublic?: boolean;
  marketplaceId?: string;
  price?: number;
}

/** @alias BuilderComponentMetadata */
export type ComponentMetadata = BuilderComponentMetadata;

/** V2-compatible root — sections (V1 parity) or element subtree. */
export type ComponentRoot =
  | { kind: "sections"; sections: StoreSection[] }
  | {
      kind: "element";
      root: BuilderElement;
      elements: Record<string, BuilderElement>;
      sections?: BuilderSection[];
    };

export interface BuilderComponent {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  category?: string;
  thumbnail?: string;
  root: ComponentRoot;
  version: number;
  createdAt: string;
  updatedAt: string;
  metadata?: BuilderComponentMetadata;
}

/** Reference embedded in section.settings._componentRef */
export interface ComponentInstanceRef {
  componentId: string;
  instanceId: string;
  /** Index within component root sections (for multi-section components). */
  sectionIndex: number;
  detached?: boolean;
  /** Instance-specific setting overrides merged on resolve. */
  overrides?: Record<string, unknown>;
  /** Definition version when this instance was placed / last migrated. */
  pinnedVersion?: number;
}

export interface ComponentInstance extends ComponentInstanceRef {
  /** Resolved section after merging definition + overrides (computed). */
  resolvedSection?: StoreSection;
}

export interface ComponentExportBundle {
  format: "ettajer-component";
  version: 1;
  exportedAt: string;
  component: Omit<BuilderComponent, "storeId">;
}
