import type { BuilderElement } from "./element";
import type { BuilderSection } from "./section";

/**
 * In-memory clipboard for copy/paste — mirrors V1 clipboard but supports subtrees.
 * Not persisted; separate from V1 website-layout-store clipboard until unified.
 */
export interface BuilderClipboard {
  section: BuilderSection | null;
  element: BuilderElement | null;
  /** Element + all descendants for subtree paste */
  subtree: Record<string, BuilderElement> | null;
  copiedAt: number | null;
}

export const EMPTY_BUILDER_CLIPBOARD: BuilderClipboard = {
  section: null,
  element: null,
  subtree: null,
  copiedAt: null,
};
