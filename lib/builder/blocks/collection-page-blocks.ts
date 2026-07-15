import type { BlockDefinition } from "../types";
import {
  BASIC_BACKGROUND_STYLE,
  BASIC_SPACING_STYLES,
  BASIC_TYPOGRAPHY_STYLES,
  PRODUCT_GRID_LAYOUT_FIELDS,
  RICH_TEXT_CONTENT_FIELDS,
  STANDARD_ADVANCED_FIELDS,
  TITLE_CONTENT_FIELD,
} from "./shared-schemas";

function collectionBlock(
  id: string,
  legacySectionType: string,
  name: string,
  description: string,
  icon: string,
  gradient: string,
  defaultContent: Record<string, unknown> = {},
  contentFields = [] as BlockDefinition["settingsSchema"]["content"],
  layoutFields = BASIC_SPACING_STYLES
): Omit<BlockDefinition, "component"> {
  return {
    id,
    category: "commerce",
    name,
    description,
    icon,
    legacySectionType: legacySectionType as BlockDefinition["legacySectionType"],
    implemented: true,
    pageTemplates: ["collection"],
    thumbnail: { type: "gradient", value: gradient },
    defaultContent,
    defaultStyles: {
      desktop: { padding: "1.5rem" },
    },
    settingsSchema: {
      focuses: ["section", "text", "image"],
      content: contentFields,
      styles: [BASIC_BACKGROUND_STYLE, ...BASIC_TYPOGRAPHY_STYLES],
      layout: layoutFields,
      advanced: STANDARD_ADVANCED_FIELDS,
    },
  };
}

export const collectionPageBannerBlock = collectionBlock(
  "collection-page-banner",
  "collection-page-banner",
  "Banner",
  "Collection hero image banner",
  "image",
  "from-indigo-50 to-blue-100",
  { showBreadcrumb: true },
  [
    {
      key: "imageUrl",
      type: "image",
      label: "Banner image",
      group: "images",
      focus: ["image", "section"],
      description: "Uses collection image if empty",
    },
    {
      key: "showBreadcrumb",
      type: "toggle",
      label: "Show breadcrumb",
      group: "text",
      focus: ["text", "section"],
    },
  ]
);

export const collectionDescriptionBlock = collectionBlock(
  "collection-description",
  "collection-description",
  "Description",
  "Collection title and description",
  "type",
  "from-slate-50 to-gray-100",
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

export const collectionFiltersBlock = collectionBlock(
  "collection-filters",
  "collection-filters",
  "Filters",
  "Category and tag filters",
  "filter",
  "from-violet-50 to-purple-50",
  { title: "Filter" },
  [TITLE_CONTENT_FIELD]
);

export const collectionProductGridBlock = collectionBlock(
  "collection-product-grid",
  "collection-product-grid",
  "Product grid",
  "Products in this collection",
  "shopping-bag",
  "from-blue-50 to-slate-100",
  {},
  [],
  PRODUCT_GRID_LAYOUT_FIELDS
);

export const collectionNewsletterBlock = collectionBlock(
  "collection-newsletter",
  "collection-newsletter",
  "Newsletter",
  "Email signup for collection visitors",
  "mail",
  "from-emerald-50 to-teal-50",
  {
    title: "Stay in the loop",
    description: "Get updates on new arrivals and offers.",
    buttonText: "Subscribe",
  },
  [
    TITLE_CONTENT_FIELD,
    {
      key: "description",
      type: "textarea",
      label: "Description",
      group: "text",
      focus: ["text", "section"],
    },
    {
      key: "buttonText",
      type: "text",
      label: "Button text",
      group: "buttons",
      focus: ["button", "section"],
      placeholder: "Subscribe",
    },
  ]
);

export const collectionPaginationBlock = collectionBlock(
  "collection-pagination",
  "collection-pagination",
  "Pagination",
  "Navigate between product pages",
  "list",
  "from-neutral-50 to-stone-100",
  { pageSize: 12 },
  [
    {
      key: "pageSize",
      type: "number",
      label: "Products per page",
      group: "layout",
      focus: "section",
      placeholder: "12",
    },
  ]
);

export const COLLECTION_PAGE_BLOCKS: Omit<BlockDefinition, "component">[] = [
  collectionPageBannerBlock,
  collectionDescriptionBlock,
  collectionFiltersBlock,
  collectionProductGridBlock,
  collectionNewsletterBlock,
  collectionPaginationBlock,
];
