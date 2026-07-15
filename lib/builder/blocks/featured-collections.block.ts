import type { BlockDefinition } from "../types";
import {
  BASIC_BACKGROUND_STYLE,
  BASIC_SPACING_STYLES,
  BASIC_TYPOGRAPHY_STYLES,
  STANDARD_ADVANCED_FIELDS,
  TITLE_CONTENT_FIELD,
} from "./shared-schemas";

export const featuredCollectionsBlock: Omit<BlockDefinition, "component"> = {
  id: "collection-banner",
  category: "commerce",
  name: "Collection banner",
  description: "Showcase a featured collection",
  icon: "grid",
  legacySectionType: "featured-collections",
  implemented: true,
  thumbnail: { type: "gradient", value: "from-indigo-50 to-blue-100" },
  defaultContent: {
    title: "Featured Collections",
  },
  defaultStyles: {
    desktop: {
      padding: "2rem 1.5rem",
    },
  },
  settingsSchema: {
    focuses: ["text", "section"],
    content: [TITLE_CONTENT_FIELD],
    styles: [
      BASIC_BACKGROUND_STYLE,
      ...BASIC_TYPOGRAPHY_STYLES.filter((f) => f.key !== "fontSize"),
    ],
    layout: BASIC_SPACING_STYLES,
    advanced: STANDARD_ADVANCED_FIELDS,
  },
};
