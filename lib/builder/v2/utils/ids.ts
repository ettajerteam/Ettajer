import type { BuilderDocumentV2 } from "../types";

/** Generate a stable-prefixed unique element id. */
export function generateElementId(prefix = "el"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function generateSectionId(legacyType: string): string {
  return `${legacyType}-${Math.random().toString(36).slice(2, 10)}`;
}

export function generateHistoryEntryId(): string {
  return `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Deep-clone a V2 document for history snapshots. */
export function cloneDocument(doc: BuilderDocumentV2): BuilderDocumentV2 {
  return JSON.parse(JSON.stringify(doc)) as BuilderDocumentV2;
}
