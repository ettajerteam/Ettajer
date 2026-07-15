import type { BuilderElement } from "./element";
import type { BuilderPage } from "./page";
import type { BuilderSection } from "./section";

/** Persisted Builder V2 document — not yet written to production stores. */
export interface BuilderDocumentV2 {
  version: 2;
  pages: BuilderPage[];
  sections: Record<string, BuilderSection>;
  elements: Record<string, BuilderElement>;
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    migratedFromV1?: boolean;
    sourceLayoutVersion?: 1;
  };
}
