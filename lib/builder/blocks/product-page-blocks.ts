import type { BlockDefinition } from "../types";
import type { PageTemplateType } from "@/lib/sections/types";
import {
  BASIC_BACKGROUND_STYLE,
  BASIC_SPACING_STYLES,
  BASIC_TYPOGRAPHY_STYLES,
  PRODUCT_GRID_LAYOUT_FIELDS,
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
  contentFields = [] as BlockDefinition["settingsSchema"]["content"]
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
      layout: BASIC_SPACING_STYLES,
      advanced: STANDARD_ADVANCED_FIELDS,
    },
  };
}

export const productGalleryBlock = productBlock(
  "product-gallery",
  "product-gallery",
  "Gallery",
  "Product image gallery",
  "images",
  "from-slate-50 to-gray-100",
  { showThumbnails: true },
  [
    {
      key: "showThumbnails",
      type: "toggle",
      label: "Show thumbnails",
      group: "images",
      focus: ["image", "section"],
    },
  ]
);

export const productInfoBlock = productBlock(
  "product-info",
  "product-info",
  "Product information",
  "Title and description",
  "type",
  "from-blue-50 to-indigo-50",
  { showDescription: true },
  [
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
  { showComparePrice: true },
  [
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
  { label: "Options" },
  [
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
  { buttonText: "Add to cart" },
  [
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
  "Customer reviews and ratings",
  "star",
  "from-yellow-50 to-amber-50",
  { title: "Customer reviews" },
  [TITLE_CONTENT_FIELD]
);

export const productFaqBlock = productBlock(
  "product-faq",
  "product-faq",
  "FAQ",
  "Product questions and answers",
  "help",
  "from-cyan-50 to-sky-50",
  {
    title: "Frequently asked questions",
    content: "Add product FAQ content here.",
  },
  RICH_TEXT_CONTENT_FIELDS
);

export const productRelatedBlock = productBlock(
  "product-related",
  "product-related",
  "Related products",
  "Products from the same collection or category",
  "package",
  "from-rose-50 to-pink-50",
  { title: "You may also like", limit: 4 },
  [
    TITLE_CONTENT_FIELD,
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
  { title: "Recently viewed", limit: 4 },
  [
    TITLE_CONTENT_FIELD,
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
