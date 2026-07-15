import type { BlockDefinition } from "../types";
import type { BlockThumbnail } from "../block-schema";
import {
  GALLERY_CONTENT_FIELDS,
  GALLERY_LAYOUT_FIELDS,
  GALLERY_STYLE_FIELDS,
  STANDARD_ADVANCED_FIELDS,
} from "./shared-schemas";

function stubBlock(
  id: string,
  category: BlockDefinition["category"],
  name: string,
  description: string,
  icon: string,
  thumbnail: BlockThumbnail
): Omit<BlockDefinition, "component"> {
  return {
    id,
    category,
    name,
    description,
    icon,
    implemented: false,
    thumbnail,
    defaultContent: {},
    defaultStyles: {},
    settingsSchema: { content: [], styles: [], layout: [] },
  };
}

export const layoutStubBlocks: Omit<BlockDefinition, "component">[] = [
  stubBlock(
    "container",
    "layout",
    "Container",
    "Wrap content in a max-width container",
    "box",
    { type: "gradient", value: "from-slate-100 to-slate-200" }
  ),
  stubBlock(
    "columns",
    "layout",
    "Columns",
    "Split content into responsive columns",
    "columns",
    { type: "gradient", value: "from-zinc-100 to-zinc-200" }
  ),
  stubBlock(
    "spacer",
    "layout",
    "Spacer",
    "Add vertical breathing room",
    "space",
    { type: "gradient", value: "from-neutral-100 to-neutral-200" }
  ),
  stubBlock(
    "divider",
    "layout",
    "Divider",
    "Horizontal rule between sections",
    "minus",
    { type: "gradient", value: "from-gray-100 to-gray-200" }
  ),
];

export const commerceStubBlocks: Omit<BlockDefinition, "component">[] = [
  stubBlock(
    "product-card",
    "commerce",
    "Product card",
    "Single product spotlight",
    "package",
    { type: "gradient", value: "from-stone-100 to-stone-200" }
  ),
];

export const mediaStubBlocks: Omit<BlockDefinition, "component">[] = [
  {
    id: "gallery",
    category: "media",
    name: "Gallery",
    description: "Image grid or carousel",
    icon: "images",
    implemented: false,
    thumbnail: { type: "gradient", value: "from-fuchsia-50 to-pink-100" },
    defaultContent: { layout: "grid", columns: 3, gap: "1rem" },
    defaultStyles: { desktop: { padding: "2rem 1.5rem" } },
    settingsSchema: {
      focuses: ["image", "section"],
      content: GALLERY_CONTENT_FIELDS,
      styles: GALLERY_STYLE_FIELDS,
      layout: GALLERY_LAYOUT_FIELDS,
      advanced: STANDARD_ADVANCED_FIELDS,
    },
  },
  stubBlock(
    "video",
    "media",
    "Video",
    "Embed a video block",
    "video",
    { type: "gradient", value: "from-red-50 to-rose-100" }
  ),
  stubBlock(
    "logo-wall",
    "media",
    "Logo wall",
    "Partner or press logos",
    "badge",
    { type: "gradient", value: "from-gray-50 to-slate-100" }
  ),
];

export const advancedStubBlocks: Omit<BlockDefinition, "component">[] = [
  stubBlock(
    "custom-html",
    "advanced",
    "Custom HTML",
    "Insert raw HTML for custom layouts",
    "type",
    { type: "gradient", value: "from-indigo-50 to-violet-100" }
  ),
  stubBlock(
    "embed",
    "advanced",
    "Embed",
    "Third-party widget or iframe embed",
    "box",
    { type: "gradient", value: "from-purple-50 to-fuchsia-100" }
  ),
  stubBlock(
    "countdown",
    "advanced",
    "Countdown",
    "Timer for launches and promotions",
    "sparkles",
    { type: "gradient", value: "from-orange-50 to-amber-100" }
  ),
];

export const formsStubBlocks: Omit<BlockDefinition, "component">[] = [
  stubBlock(
    "contact-form",
    "forms",
    "Contact form",
    "Let visitors reach you",
    "form",
    { type: "gradient", value: "from-lime-50 to-green-100" }
  ),
  stubBlock(
    "search",
    "forms",
    "Search",
    "Product search bar",
    "search",
    { type: "gradient", value: "from-teal-50 to-cyan-100" }
  ),
  stubBlock(
    "newsletter-form",
    "forms",
    "Newsletter form",
    "Email capture with input",
    "inbox",
    { type: "gradient", value: "from-green-50 to-emerald-100" }
  ),
];
