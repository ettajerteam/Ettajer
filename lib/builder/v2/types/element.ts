import type { BuilderStyle, ResponsiveStyle } from "./styles";

/** Element kinds in the V2 element tree. */
export type BuilderElementKind =
  | "page-root"
  | "section"
  | "container"
  | "row"
  | "column"
  | "text"
  | "image"
  | "button"
  | "link"
  | "block";

/**
 * Element type identifier — block catalog id (e.g. "hero") or primitive kind.
 * Extensible via block registry without changing this interface.
 */
export type BuilderElementType = BuilderElementKind | (string & {});

export interface BuilderElementAnimation {
  entrance?: "none" | "fade" | "slide-up" | "slide-down";
  durationMs?: number;
  delayMs?: number;
}

export interface BuilderElementMetadata {
  /** Human-readable label for layers panel */
  label?: string;
  /** Prevent accidental edits in canvas */
  locked?: boolean;
  /** ISO timestamps for audit / collaboration */
  createdAt?: string;
  updatedAt?: string;
  /** Traceability during V1 → V2 migration */
  migratedFromV1?: boolean;
  legacySectionId?: string;
  /** Block registry id when type maps to a catalog block */
  blockId?: string;
  [key: string]: unknown;
}

/**
 * Atomic node in the Builder V2 element tree.
 * Sections, blocks, and primitives share this shape for uniform traversal.
 */
export interface BuilderElement {
  id: string;
  type: BuilderElementType;
  parentId: string | null;
  /** Child element ids (ordered). Nested trees use the elements map + children refs. */
  children: string[];
  content: Record<string, unknown>;
  styles: BuilderStyle;
  responsiveStyles: ResponsiveStyle;
  visibility: boolean;
  animation: BuilderElementAnimation;
  metadata: BuilderElementMetadata;
}
