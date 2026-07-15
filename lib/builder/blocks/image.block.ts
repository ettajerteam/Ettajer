import type { BlockDefinition } from "../types";
import {
  IMAGE_LAYOUT_FIELDS,
  IMAGE_STYLE_FIELDS,
  STANDARD_ADVANCED_FIELDS,
} from "./shared-schemas";

export const imageBlock: Omit<BlockDefinition, "component"> = {
  id: "image",
  category: "media",
  name: "Image",
  description: "Full-width or contained image",
  icon: "image",
  legacySectionType: "image",
  implemented: true,
  thumbnail: { type: "gradient", value: "from-sky-50 to-blue-100" },
  defaultContent: {
    imageUrl: "",
    alt: "",
  },
  defaultStyles: {
    desktop: {
      padding: "2rem 1.5rem",
      alignment: "center",
    },
  },
  settingsSchema: {
    focuses: ["image", "section"],
    content: [
      {
        key: "imageUrl",
        type: "media",
        label: "Replace image",
        group: "images",
        focus: ["image", "section"],
        altKey: "alt",
      },
    ],
    styles: IMAGE_STYLE_FIELDS,
    layout: IMAGE_LAYOUT_FIELDS,
    advanced: STANDARD_ADVANCED_FIELDS,
  },
};
