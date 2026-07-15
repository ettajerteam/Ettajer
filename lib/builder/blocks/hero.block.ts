import type { BlockDefinition } from "../types";
import {
  BUTTON_VARIANT_OPTIONS,
  HERO_LAYOUT_GROUPS,
  HERO_STYLE_GROUPS,
  STANDARD_ADVANCED_FIELDS,
} from "./shared-schemas";

export const heroBlock: Omit<BlockDefinition, "component"> = {
  id: "hero",
  category: "marketing",
  name: "Hero",
  description: "Large banner with headline and CTA",
  icon: "image",
  legacySectionType: "hero",
  implemented: true,
  thumbnail: { type: "gradient", value: "from-blue-50 to-indigo-100" },
  defaultContent: {
    showStoreDescription: true,
  },
  defaultStyles: {
    desktop: {
      padding: "3rem 1.5rem",
      alignment: "center",
    },
  },
  settingsSchema: {
    focuses: ["text", "image", "button", "link"],
    content: [
      {
        key: "headline",
        type: "text",
        label: "Headline",
        group: "text",
        focus: ["text", "section"],
        placeholder: "Uses store name if empty",
      },
      {
        key: "subheadline",
        type: "textarea",
        label: "Subtitle",
        group: "text",
        focus: ["text", "section"],
        placeholder: "Uses store description if empty",
      },
      {
        key: "showStoreDescription",
        type: "toggle",
        label: "Use store description as subtitle",
        group: "text",
        focus: ["text", "section"],
        description: "When subtitle is empty, show the store description",
      },
      {
        key: "imageUrl",
        type: "image",
        label: "Hero image",
        group: "images",
        focus: ["image", "section"],
        altKey: "imageAlt",
      },
      {
        key: "ctaText",
        type: "text",
        label: "Button text",
        group: "buttons",
        focus: "button",
        placeholder: "Shop now",
      },
      {
        key: "ctaLink",
        type: "link",
        label: "Button link",
        group: "links",
        focus: "link",
        placeholder: "/collections or https://...",
      },
    ],
    styles: [
      ...HERO_STYLE_GROUPS,
      {
        key: "ctaVariant",
        type: "variant",
        label: "Button style",
        group: "buttons",
        focus: "button",
        options: BUTTON_VARIANT_OPTIONS,
      },
    ],
    layout: HERO_LAYOUT_GROUPS,
    advanced: STANDARD_ADVANCED_FIELDS,
  },
};
