import type { BlockDefinition } from "../types";
import {
  RICH_TEXT_CONTENT_FIELDS,
  SECTION_LAYOUT_GROUPS,
  SECTION_STYLE_GROUPS,
  STANDARD_ADVANCED_FIELDS,
} from "./shared-schemas";

export const richTextBlock: Omit<BlockDefinition, "component"> = {
  id: "rich-text",
  category: "layout",
  name: "Rich text",
  description: "Custom text content block",
  icon: "type",
  legacySectionType: "rich-text",
  implemented: true,
  pageTemplates: ["home", "product"],
  thumbnail: { type: "gradient", value: "from-neutral-50 to-neutral-100" },
  defaultContent: {
    title: "About us",
    content: "Tell your brand story here.",
    alignment: "center",
    layout: "default",
  },
  defaultStyles: {
    desktop: {
      padding: "3rem 1.5rem",
      alignment: "center",
    },
  },
  settingsSchema: {
    focuses: ["text", "section"],
    content: RICH_TEXT_CONTENT_FIELDS,
    styles: SECTION_STYLE_GROUPS,
    layout: SECTION_LAYOUT_GROUPS,
    advanced: STANDARD_ADVANCED_FIELDS,
  },
};
