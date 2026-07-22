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
    caption: "",
    layout: "contained",
    objectFit: "cover",
  },
  defaultStyles: {
    desktop: {
      padding: "2rem 1.5rem",
      alignment: "center",
    },
  },
  settingsSchema: {
    focuses: ["image", "section", "link"],
    content: [
      {
        key: "imageUrl",
        type: "media",
        label: "Replace image",
        group: "images",
        focus: ["image", "section"],
        altKey: "alt",
      },
      {
        key: "caption",
        type: "text",
        label: "Caption",
        group: "text",
        focus: ["image", "section"],
        placeholder: "Optional caption",
      },
      {
        key: "linkUrl",
        type: "link",
        label: "Link when clicked",
        group: "links",
        focus: ["link", "image"],
        placeholder: "/products",
      },
      {
        key: "layout",
        type: "variant",
        label: "Layout",
        group: "layout",
        focus: ["image", "section"],
        tab: "layout",
        options: [
          { value: "contained", label: "Contained" },
          { value: "editorial", label: "Editorial" },
          { value: "cinematic", label: "Cinematic" },
        ],
      },
    ],
    styles: IMAGE_STYLE_FIELDS,
    layout: IMAGE_LAYOUT_FIELDS,
    advanced: STANDARD_ADVANCED_FIELDS,
  },
};
