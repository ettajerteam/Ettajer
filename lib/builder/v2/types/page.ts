export type BuilderPageType = "home" | "custom" | "product" | "collection";

/**
 * A logical page in the builder document.
 * `sections` preserves V1-ordered section list for compatibility adapters.
 */
export interface BuilderPage {
  id: string;
  slug: string;
  title: string;
  /** Ordered section ids (BuilderSection.id) */
  sections: string[];
  pageType: BuilderPageType;
  metadata?: Record<string, unknown>;
}
