/**
 * Builder Adapters — V1 ↔ V2 ↔ legacy section conversion.
 * Prefer adapters over destructive migrations; production persists V1 JSON.
 */

export {
  sectionToBlockId,
  sectionToBuilderElement,
  builderElementToSection,
  homeLayoutToBuilderDocument,
  builderDocumentToHomeLayout,
  createSectionFromBlock,
  blockIdToSectionType,
  mergeSectionSettings,
} from "./legacy-adapter";

export {
  homeLayoutToV2,
  v2ToHomeLayout,
  isV2V1Compatible,
  homeLayoutToBuilderDocument as homeLayoutToDocumentV2,
  builderDocumentToHomeLayout as documentV2ToHomeLayout,
  isV1V2Compatible,
  validateHomeLayoutRoundTrip,
  validateDocumentRoundTrip,
  createEmptyV2Document,
  createV2SectionShell,
} from "./v2/adapters";
