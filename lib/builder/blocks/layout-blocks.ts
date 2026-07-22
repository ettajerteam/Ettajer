import type { BlockDefinition } from "../types";
import {
  BASIC_BACKGROUND_STYLE,
  BASIC_SPACING_STYLES,
  STANDARD_ADVANCED_FIELDS,
} from "./shared-schemas";

export const spacerBlock: Omit<BlockDefinition, "component"> = {
  id: "spacer",
  category: "layout",
  name: "Spacer",
  description: "Add vertical breathing room",
  icon: "space",
  legacySectionType: "spacer",
  implemented: true,
  pageTemplates: ["home", "product", "collection"],
  thumbnail: { type: "gradient", value: "from-neutral-100 to-neutral-200" },
  defaultContent: {
    height: "4rem",
  },
  defaultStyles: {
    desktop: {},
  },
  settingsSchema: {
    focuses: ["section"],
    content: [
      {
        key: "height",
        type: "spacing",
        label: "Height",
        group: "layout",
        focus: "section",
        placeholder: "4rem",
        description: "Vertical space between sections",
      },
    ],
    styles: [BASIC_BACKGROUND_STYLE],
    layout: BASIC_SPACING_STYLES,
    advanced: STANDARD_ADVANCED_FIELDS,
  },
};

export const dividerBlock: Omit<BlockDefinition, "component"> = {
  id: "divider",
  category: "layout",
  name: "Divider",
  description: "Horizontal rule between sections",
  icon: "minus",
  legacySectionType: "divider",
  implemented: true,
  pageTemplates: ["home", "product", "collection"],
  thumbnail: { type: "gradient", value: "from-gray-100 to-gray-200" },
  defaultContent: {
    thickness: "1px",
    width: "100%",
    color: "#e5e5e5",
    alignment: "center",
  },
  defaultStyles: {
    desktop: {
      padding: "1.5rem 1.5rem",
    },
  },
  settingsSchema: {
    focuses: ["section"],
    content: [
      {
        key: "color",
        type: "color",
        label: "Line color",
        group: "style",
        focus: "section",
      },
      {
        key: "thickness",
        type: "text",
        label: "Thickness",
        group: "layout",
        focus: "section",
        placeholder: "1px",
      },
      {
        key: "width",
        type: "text",
        label: "Width",
        group: "layout",
        focus: "section",
        placeholder: "100%",
      },
      {
        key: "alignment",
        type: "select",
        label: "Alignment",
        group: "layout",
        focus: "section",
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
        ],
      },
    ],
    styles: [BASIC_BACKGROUND_STYLE],
    layout: BASIC_SPACING_STYLES,
    advanced: STANDARD_ADVANCED_FIELDS,
  },
};

export const columnsBlock: Omit<BlockDefinition, "component"> = {
  id: "columns",
  category: "layout",
  name: "Columns",
  description: "Split content into responsive columns — text, image+text, or CTA cells",
  icon: "columns",
  legacySectionType: "columns",
  implemented: true,
  pageTemplates: ["home", "product"],
  thumbnail: { type: "gradient", value: "from-zinc-100 to-zinc-200" },
  defaultContent: {
    columnCount: 2,
    gap: "1.5rem",
    layout: "plain",
    cardStyle: "plain",
    alignment: "left",
    columns: [
      { cellType: "text", title: "Column one", content: "<p>Add your content here.</p>" },
      { cellType: "text", title: "Column two", content: "<p>Add your content here.</p>" },
    ],
  },
  defaultStyles: {
    desktop: {
      padding: "3rem 1.5rem",
    },
  },
  settingsSchema: {
    focuses: ["text", "section", "image", "button", "link"],
    content: [
      {
        key: "layout",
        type: "select",
        label: "Design layout",
        group: "layout",
        focus: "section",
        options: [
          { value: "plain", label: "Plain columns" },
          { value: "cards", label: "Cards" },
          { value: "media", label: "Image-forward" },
          { value: "cta", label: "CTA columns" },
        ],
      },
      {
        key: "cardStyle",
        type: "select",
        label: "Card style",
        group: "style",
        focus: "section",
        options: [
          { value: "plain", label: "Plain" },
          { value: "bordered", label: "Bordered" },
          { value: "soft", label: "Soft fill" },
        ],
        showWhen: { key: "layout", in: ["cards", "cta"] },
      },
      {
        key: "alignment",
        type: "select",
        label: "Text alignment",
        group: "layout",
        focus: "section",
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
        ],
      },
      {
        key: "columnCount",
        type: "select",
        label: "Columns",
        group: "layout",
        focus: "section",
        options: [
          { value: "2", label: "2 columns" },
          { value: "3", label: "3 columns" },
          { value: "4", label: "4 columns" },
        ],
      },
      {
        key: "gap",
        type: "spacing",
        label: "Gap",
        group: "layout",
        focus: "section",
        placeholder: "1.5rem",
      },
      {
        key: "columns",
        type: "itemList",
        label: "Column cells",
        itemLabel: "Column",
        maxItems: 4,
        group: "text",
        focus: ["text", "section", "image", "button"],
        description: "Each cell can be text, image+text, CTA, or image only",
        itemFields: [
          {
            key: "cellType",
            type: "select",
            label: "Cell type",
            defaultValue: "text",
            options: [
              { value: "text", label: "Text" },
              { value: "image-text", label: "Image + text" },
              { value: "cta", label: "CTA" },
              { value: "image", label: "Image only" },
            ],
          },
          {
            key: "imageUrl",
            type: "image",
            label: "Image",
            altKey: "imageAlt",
            showWhen: { key: "cellType", in: ["image-text", "cta", "image"] },
          },
          {
            key: "title",
            type: "text",
            label: "Title",
            placeholder: "Column title",
          },
          {
            key: "content",
            type: "textarea",
            label: "Content",
            placeholder: "HTML or plain text",
            showWhen: { key: "cellType", in: ["text", "image-text", "cta"] },
          },
          {
            key: "buttonText",
            type: "text",
            label: "Button text",
            placeholder: "Shop now",
            showWhen: { key: "cellType", in: ["cta", "image-text"] },
          },
          {
            key: "buttonLink",
            type: "text",
            label: "Button link",
            placeholder: "/products",
            showWhen: { key: "cellType", in: ["cta", "image-text"] },
          },
        ],
      },
    ],
    styles: [BASIC_BACKGROUND_STYLE],
    layout: BASIC_SPACING_STYLES,
    advanced: STANDARD_ADVANCED_FIELDS,
  },
};

export const logoWallBlock: Omit<BlockDefinition, "component"> = {
  id: "logo-wall",
  category: "media",
  name: "Logo wall",
  description: "Partner or press logos",
  icon: "badge",
  legacySectionType: "logo-wall",
  implemented: true,
  thumbnail: { type: "gradient", value: "from-gray-50 to-slate-100" },
  defaultContent: {
    title: "Trusted by",
    grayscale: true,
    columns: 4,
    logos: [
      { url: "", alt: "Partner logo", href: "" },
      { url: "", alt: "Partner logo", href: "" },
      { url: "", alt: "Partner logo", href: "" },
      { url: "", alt: "Partner logo", href: "" },
    ],
  },
  defaultStyles: {
    desktop: {
      padding: "3rem 1.5rem",
    },
  },
  settingsSchema: {
    focuses: ["image", "section", "text"],
    content: [
      {
        key: "title",
        type: "text",
        label: "Title",
        group: "text",
        focus: ["text", "section"],
      },
      {
        key: "grayscale",
        type: "toggle",
        label: "Grayscale logos",
        group: "style",
        focus: "section",
      },
      {
        key: "columns",
        type: "select",
        label: "Columns",
        group: "layout",
        focus: "section",
        options: [
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "5", label: "5" },
          { value: "6", label: "6" },
        ],
      },
      {
        key: "logos",
        type: "itemList",
        label: "Logos",
        itemLabel: "Logo",
        maxItems: 12,
        group: "images",
        focus: ["image", "section"],
        itemFields: [
          {
            key: "url",
            type: "media",
            label: "Logo image",
            altKey: "alt",
          },
          {
            key: "alt",
            type: "text",
            label: "Alt text",
            placeholder: "Company name",
          },
          {
            key: "href",
            type: "text",
            label: "Link (optional)",
            placeholder: "https://",
          },
        ],
      },
    ],
    styles: [BASIC_BACKGROUND_STYLE],
    layout: BASIC_SPACING_STYLES,
    advanced: STANDARD_ADVANCED_FIELDS,
  },
};
