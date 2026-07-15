/**
 * Builder Core V2 — element-tree architecture.
 *
 * Coexists with V1 section-based layout. Import via:
 *   import { BuilderCore } from "@/lib/builder";
 *   import type { BuilderElement } from "@/lib/builder/v2";
 */

// Types
export type {
  BuilderAlignment,
  BuilderStyle,
  ResponsiveStyle,
  ResponsiveStyleValue,
  BuilderElement,
  BuilderElementAnimation,
  BuilderElementKind,
  BuilderElementMetadata,
  BuilderElementType,
  BuilderSection,
  BuilderSectionMetadata,
  BuilderPage,
  BuilderPageType,
  BuilderDocumentV2,
  BuilderSelection,
  InspectorFocus,
  BuilderSelectionFocus,
  BuilderHistory,
  BuilderHistoryEntry,
  BuilderHistoryPushResult,
  BuilderHistoryUndoResult,
  BuilderHistoryRedoResult,
  BuilderClipboard,
} from "./types";

export {
  EMPTY_BUILDER_SELECTION,
  EMPTY_BUILDER_CLIPBOARD,
  DEFAULT_HISTORY_LIMIT,
  createEmptyHistory,
  pushHistory,
  undoHistory,
  redoHistory,
} from "./types";

// Constants
export {
  BUILDER_V2_DOCUMENT_VERSION,
  BUILDER_V1_LAYOUT_VERSION,
  BUILDER_V2_HOME_PAGE_ID,
  BUILDER_SECTION_KIND,
} from "./constants";

// Adapters (V1 ↔ V2, non-destructive)
export {
  homeLayoutToV2,
  createEmptyV2Document,
  createV2SectionShell,
  v2ToHomeLayout,
  isV2V1Compatible,
  homeLayoutToBuilderDocument,
  builderDocumentToHomeLayout,
  isV1V2Compatible,
  validateHomeLayoutRoundTrip,
  validateDocumentRoundTrip,
} from "./adapters";

// Utilities
export {
  generateElementId,
  generateSectionId,
  generateHistoryEntryId,
  cloneDocument,
} from "./utils/ids";

export {
  validateBuilderDocumentV2,
  collectSubtree,
  findSectionForElement,
} from "./utils/validate";

export type { BuilderValidationIssue } from "./utils/validate";
