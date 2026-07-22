import type { ComponentType } from "react";
import type { PublicCategory, PublicCollection, PublicProduct, PublicStore } from "@/types/storefront";
import type {
  PageTemplateType,
  SectionType,
  StoreSection,
  HomeLayout,
} from "@/lib/sections/types";
import type { BlockSettingsSchema, BlockStylesDefaults, BlockThumbnail } from "./block-schema";

/** Unique block identifier in the visual builder catalog */
export type BlockId = string;

export type BlockCategoryId =
  | "layout"
  | "marketing"
  | "commerce"
  | "media"
  | "forms"
  | "advanced";

export type BuilderPanelId =
  | "pages"
  | "add"
  | "sections"
  | "layers"
  | "design"
  | "assets"
  | "inspector";

export type BuilderElementKind = "page" | "section" | "block" | "component";

export type DeviceMode = "desktop" | "tablet" | "mobile";

import type { ElementStyleValues } from "./style-system";

/** Per-device style overrides stored in section.settings.styles */
export type DeviceStyleValues = ElementStyleValues;

export interface SectionVisualStyles {
  desktop?: DeviceStyleValues;
  tablet?: DeviceStyleValues;
  mobile?: DeviceStyleValues;
}

export interface ResponsiveSettings extends SectionVisualStyles {}

export interface AnimationSettings {
  entrance?: "none" | "fade" | "slide-up" | "slide-down";
  durationMs?: number;
  delayMs?: number;
}

/** Future-ready element styles on builder elements */
export type ElementStyles = ElementStyleValues;

/** Future-ready element tree node */
export interface BuilderElement {
  id: string;
  kind: BuilderElementKind;
  type: BlockId | SectionType;
  parentId: string | null;
  children: string[];
  content: Record<string, unknown>;
  styles: ElementStyles;
  responsive: ResponsiveSettings;
  animation: AnimationSettings;
  visible: boolean;
  locked?: boolean;
}

export interface BuilderPage {
  id: string;
  slug: string;
  title: string;
  type: "home" | "custom" | "product" | "collection";
  rootElementIds: string[];
}

export interface BuilderDocument {
  version: 2;
  pages: BuilderPage[];
  elements: Record<string, BuilderElement>;
}

export interface BuilderHistoryEntry {
  timestamp: number;
  label: string;
  snapshot: HomeLayout;
}

export interface BuilderCanvasState {
  zoom: number;
  panX: number;
  panY: number;
  isPanning: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
}

export interface BuilderDragState {
  active: boolean;
  blockId: BlockId | null;
  blockName: string | null;
  source: "add-panel" | "section-list" | "canvas" | null;
  insertIndex: number | null;
  hoverSectionId: string | null;
}

export interface BuilderState {
  /** UI selection — maps to section id today */
  selectedElementId: string | null;
  hoveredElementId: string | null;
  activePageId: string;
  activePanel: BuilderPanelId;
  canvas: BuilderCanvasState;
  drag: BuilderDragState;
  historyPast: BuilderHistoryEntry[];
  historyFuture: BuilderHistoryEntry[];
}

export interface BlockRenderProps {
  store: PublicStore;
  settings: Record<string, unknown>;
  products?: PublicProduct[];
  categories?: PublicCategory[];
  featuredCollections?: PublicCollection[];
  product?: PublicProduct;
  collection?: PublicCollection;
  previewDevice?: DeviceMode;
  /** Present when rendering inside the website editor preview. */
  builderMode?: boolean;
  sectionId?: string;
}

export type BlockComponent = ComponentType<BlockRenderProps>;

export interface BlockDefinition {
  id: BlockId;
  category: BlockCategoryId;
  name: string;
  description: string;
  thumbnail: BlockThumbnail;
  defaultContent: Record<string, unknown>;
  defaultStyles: BlockStylesDefaults;
  settingsSchema: BlockSettingsSchema;
  component?: BlockComponent;
  /** Maps to live storefront section when implemented */
  legacySectionType?: SectionType;
  /** Page templates where this block appears in the add panel (default: home). */
  pageTemplates?: PageTemplateType[];
  implemented: boolean;
  icon: string;
  /** @deprecated Use thumbnail instead */
  previewGradient?: string;
}

export interface BlockCategoryDefinition {
  id: BlockCategoryId;
  label: string;
  description: string;
}

export type { StoreSection, HomeLayout, SectionType };
