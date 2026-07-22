import type { BlockDefinition } from "../types";
import type { SettingFieldSchema } from "../block-schema";
import type { PageTemplateType } from "@/lib/sections/types";
import {
  BASIC_BACKGROUND_STYLE,
  BASIC_SPACING_STYLES,
  BASIC_TYPOGRAPHY_STYLES,
  RICH_TEXT_CONTENT_FIELDS,
  STANDARD_ADVANCED_FIELDS,
  TITLE_CONTENT_FIELD,
} from "./shared-schemas";

function productBlock(
  id: string,
  legacySectionType: string,
  name: string,
  description: string,
  icon: string,
  gradient: string,
  defaultContent: Record<string, unknown> = {},
  contentFields = [] as BlockDefinition["settingsSchema"]["content"],
  layoutFields: SettingFieldSchema[] = BASIC_SPACING_STYLES
): Omit<BlockDefinition, "component"> {
  return {
    id,
    category: "commerce",
    name,
    description,
    icon,
    legacySectionType: legacySectionType as BlockDefinition["legacySectionType"],
    implemented: true,
    pageTemplates: ["product"],
    thumbnail: { type: "gradient", value: gradient },
    defaultContent,
    defaultStyles: {
      desktop: { padding: "1.5rem" },
    },
    settingsSchema: {
      focuses: ["section", "text"],
      content: contentFields,
      styles: [BASIC_BACKGROUND_STYLE, ...BASIC_TYPOGRAPHY_STYLES],
      layout: layoutFields,
      advanced: STANDARD_ADVANCED_FIELDS,
    },
  };
}

const LAYOUT_SPACING = BASIC_SPACING_STYLES;

export const productGalleryBlock = productBlock(
  "product-gallery",
  "product-gallery",
  "Gallery",
  "Product image gallery",
  "images",
  "from-slate-50 to-gray-100",
  { showThumbnails: true, layout: "stack" },
  [
    {
      key: "showThumbnails",
      type: "toggle",
      label: "Show thumbnails",
      group: "images",
      focus: ["image", "section"],
    },
    {
      key: "layout",
      type: "select",
      label: "Design layout",
      group: "layout",
      focus: "section",
      options: [
        { value: "stack", label: "Stack (thumbs below)" },
        { value: "side", label: "Side thumbs" },
        { value: "carousel", label: "Carousel" },
        { value: "single", label: "Single image" },
      ],
    },
  ],
  LAYOUT_SPACING
);

export const productInfoBlock = productBlock(
  "product-info",
  "product-info",
  "Product information",
  "Title and description",
  "type",
  "from-blue-50 to-indigo-50",
  { showDescription: true, showBrand: true, layout: "default" },
  [
    {
      key: "layout",
      type: "select",
      label: "Design layout",
      group: "layout",
      focus: "section",
      options: [
        { value: "default", label: "Default" },
        { value: "compact", label: "Compact" },
        { value: "editorial", label: "Editorial" },
      ],
    },
    {
      key: "showBrand",
      type: "toggle",
      label: "Show store name",
      group: "text",
      focus: ["text", "section"],
    },
    {
      key: "showDescription",
      type: "toggle",
      label: "Show description",
      group: "text",
      focus: ["text", "section"],
    },
  ]
);

export const productPriceBlock = productBlock(
  "product-price",
  "product-price",
  "Price",
  "Product price display",
  "tag",
  "from-emerald-50 to-teal-50",
  { showComparePrice: true, layout: "default" },
  [
    {
      key: "layout",
      type: "select",
      label: "Design layout",
      group: "layout",
      focus: "section",
      options: [
        { value: "default", label: "Inline" },
        { value: "stacked", label: "Stacked" },
        { value: "badge", label: "Price badge" },
      ],
    },
    {
      key: "showComparePrice",
      type: "toggle",
      label: "Show compare-at price",
      group: "text",
      focus: ["text", "section"],
    },
  ]
);

export const productVariantsBlock = productBlock(
  "product-variants",
  "product-variants",
  "Variants",
  "Size, color, and option selectors",
  "grid",
  "from-violet-50 to-purple-50",
  { label: "Options", layout: "outline" },
  [
    {
      key: "layout",
      type: "select",
      label: "Design layout",
      group: "layout",
      focus: "section",
      options: [
        { value: "outline", label: "Outlined" },
        { value: "pills", label: "Pills" },
        { value: "underline", label: "Underline" },
      ],
    },
    {
      key: "label",
      type: "text",
      label: "Options label",
      group: "text",
      focus: ["text", "section"],
      placeholder: "Options",
    },
  ]
);

export const productBuyButtonBlock = productBlock(
  "product-buy-button",
  "product-buy-button",
  "Buy button",
  "Add to cart call to action",
  "shopping-bag",
  "from-orange-50 to-amber-50",
  { buttonText: "Add to cart", layout: "solid" },
  [
    {
      key: "layout",
      type: "select",
      label: "Design layout",
      group: "layout",
      focus: "section",
      options: [
        { value: "solid", label: "Solid" },
        { value: "outline", label: "Outline" },
        { value: "full", label: "Full width" },
        { value: "pill", label: "Pill" },
      ],
    },
    {
      key: "buttonText",
      type: "text",
      label: "Button text",
      group: "buttons",
      focus: ["button", "section"],
      placeholder: "Add to cart",
    },
  ]
);

export const productReviewsBlock = productBlock(
  "product-reviews",
  "product-reviews",
  "Reviews",
  "Real customer reviews from the selected product",
  "star",
  "from-yellow-50 to-amber-50",
  { title: "Customer reviews", layout: "cards", showSummary: true, limit: 6 },
  [
    TITLE_CONTENT_FIELD,
    {
      key: "layout",
      type: "select",
      label: "Design layout",
      group: "layout",
      focus: "section",
      options: [
        { value: "cards", label: "Cards" },
        { value: "list", label: "List" },
        { value: "compact", label: "Compact" },
      ],
    },
    {
      key: "showSummary",
      type: "toggle",
      label: "Show rating summary",
      group: "layout",
      focus: "section",
    },
    {
      key: "limit",
      type: "number",
      label: "Max reviews",
      group: "layout",
      focus: "section",
      placeholder: "6",
    },
  ]
);

export const productFaqBlock = productBlock(
  "product-faq",
  "product-faq",
  "FAQ",
  "Product questions and answers",
  "help",
  "from-cyan-50 to-sky-50",
  {
    title: "Details & care",
    content:
      "<p><strong>Shipping</strong> — tracked delivery in 2–5 business days.</p><p><strong>Returns</strong> — unused items within 30 days.</p><p><strong>Support</strong> — reply to your order email for the fastest help.</p>",
    layout: "accordion",
  },
  [
    ...RICH_TEXT_CONTENT_FIELDS,
    {
      key: "layout",
      type: "select",
      label: "Design layout",
      group: "layout",
      focus: "section",
      options: [
        { value: "accordion", label: "Accordion" },
        { value: "default", label: "Stacked" },
        { value: "strip", label: "Side-by-side strip" },
        { value: "intro", label: "Centered intro" },
      ],
    },
  ]
);

export const productRelatedBlock = productBlock(
  "product-related",
  "product-related",
  "Related products",
  "Products from the same collection or category",
  "package",
  "from-rose-50 to-pink-50",
  { title: "You may also like", limit: 4, layout: "grid" },
  [
    TITLE_CONTENT_FIELD,
    {
      key: "layout",
      type: "select",
      label: "Design layout",
      group: "layout",
      focus: "section",
      options: [
        { value: "grid", label: "Grid" },
        { value: "carousel", label: "Carousel" },
        { value: "compact", label: "Compact grid" },
      ],
    },
    {
      key: "limit",
      type: "number",
      label: "Max products",
      group: "layout",
      focus: "section",
      placeholder: "4",
    },
  ]
);

export const productRecentlyViewedBlock = productBlock(
  "product-recently-viewed",
  "product-recently-viewed",
  "Recently viewed",
  "Products the shopper viewed recently",
  "clock",
  "from-neutral-50 to-stone-100",
  { title: "Recently viewed", limit: 4, layout: "grid" },
  [
    TITLE_CONTENT_FIELD,
    {
      key: "layout",
      type: "select",
      label: "Design layout",
      group: "layout",
      focus: "section",
      options: [
        { value: "grid", label: "Grid" },
        { value: "rail", label: "Horizontal rail" },
        { value: "compact", label: "Compact grid" },
      ],
    },
    {
      key: "limit",
      type: "number",
      label: "Max products",
      group: "layout",
      focus: "section",
      placeholder: "4",
    },
  ]
);

export const PRODUCT_PAGE_BLOCKS: Omit<BlockDefinition, "component">[] = [
  productGalleryBlock,
  productInfoBlock,
  productPriceBlock,
  productVariantsBlock,
  productBuyButtonBlock,
  productReviewsBlock,
  productFaqBlock,
  productRelatedBlock,
  productRecentlyViewedBlock,
];

export function blockAllowedOnPage(
  block: BlockDefinition,
  page: PageTemplateType
): boolean {
  if (!block.pageTemplates || block.pageTemplates.length === 0) return page === "home";
  return block.pageTemplates.includes(page);
}
