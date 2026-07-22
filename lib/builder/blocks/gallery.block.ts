import type { BlockDefinition } from "../types";
import {
  GALLERY_CONTENT_FIELDS,
  GALLERY_LAYOUT_FIELDS,
  GALLERY_STYLE_FIELDS,
  BASIC_BACKGROUND_STYLE,
  BASIC_SPACING_STYLES,
  STANDARD_ADVANCED_FIELDS,
  TITLE_CONTENT_FIELD,
} from "./shared-schemas";

export const galleryBlock: Omit<BlockDefinition, "component"> = {
  id: "gallery",
  category: "media",
  name: "Gallery",
  description: "Image grid or carousel",
  icon: "images",
  legacySectionType: "gallery",
  implemented: true,
  thumbnail: { type: "gradient", value: "from-fuchsia-50 to-pink-100" },
  defaultContent: {
    title: "Gallery",
    layout: "grid",
    columns: 3,
    gap: "0.75rem",
    images: [
      {
        url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
        alt: "Gallery image 1",
      },
      {
        url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80",
        alt: "Gallery image 2",
      },
      {
        url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
        alt: "Gallery image 3",
      },
    ],
  },
  defaultStyles: {
    desktop: {
      padding: "2.5rem 1.5rem",
    },
  },
  settingsSchema: {
    focuses: ["image", "section", "text"],
    content: [TITLE_CONTENT_FIELD, ...GALLERY_CONTENT_FIELDS],
    styles: [...GALLERY_STYLE_FIELDS, BASIC_BACKGROUND_STYLE],
    layout: [...BASIC_SPACING_STYLES, ...GALLERY_LAYOUT_FIELDS],
    advanced: STANDARD_ADVANCED_FIELDS,
  },
};
