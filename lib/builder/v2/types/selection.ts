/** Inspector panel focus target — not persisted in layout JSON. */
export type InspectorFocus = "page" | "section" | "element" | null;

/** @deprecated Use InspectorFocus */
export type BuilderSelectionFocus = InspectorFocus;

/** Runtime editor selection state — not persisted in layout JSON. */
export interface BuilderSelection {
  selectedElementId: string | null;
  selectedSectionId: string | null;
  hoveredElementId: string | null;
  inspectorFocus: InspectorFocus;
  /** Active page context for multi-page editor (future) */
  pageId?: string | null;
  hoveredSectionId?: string | null;
}

export const EMPTY_BUILDER_SELECTION: BuilderSelection = {
  selectedElementId: null,
  selectedSectionId: null,
  hoveredElementId: null,
  inspectorFocus: null,
  pageId: null,
  hoveredSectionId: null,
};
