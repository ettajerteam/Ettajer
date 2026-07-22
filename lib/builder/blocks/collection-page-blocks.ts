import type { BlockDefinition } from "../types";
import type { SettingFieldSchema } from "../block-schema";
import {
  BASIC_BACKGROUND_STYLE,
  BASIC_SPACING_STYLES,
  BASIC_TYPOGRAPHY_STYLES,
  PRODUCT_GRID_LAYOUT_FIELDS,
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
  { showBreadcrumb: true, showTitle: true, layout: "hero", minHeight: "42vh" },
  [
    {
      key: "layout",
      type: "select",
      label: "Design layout",
      group: "layout",
      focus: "section",
      options: [
        { value: "hero", label: "Full-bleed hero" },
        { value: "contained", label: "Contained banner" },
        { value: "split", label: "Split image + title" },
        { value: "minimal", label: "Thin strip" },
      ],
    },
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
    {
      key: "showTitle",
      type: "toggle",
      label: "Show title on banner",
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
  { showDescription: true, showTitle: false, layout: "centered" },
  [
    {
      key: "layout",
      type: "select",
      label: "Design layout",
      group: "layout",
      focus: "section",
      options: [
        { value: "stacked", label: "Stacked" },
        { value: "centered", label: "Centered" },
        { value: "inline", label: "Title + description row" },
      ],
    },
    {
      key: "showTitle",
      type: "toggle",
      label: "Show title",
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

export const collectionFiltersBlock = collectionBlock(
  "collection-filters",
  "collection-filters",
  "Filters",
  "Category and tag filters",
  "filter",
  "from-violet-50 to-purple-50",
  { title: "Browse", layout: "minimal" },
  [
    TITLE_CONTENT_FIELD,
    {
      key: "layout",
      type: "select",
      label: "Design layout",
      group: "layout",
      focus: "section",
      options: [
        { value: "chips", label: "Chips" },
        { value: "pills", label: "Pills" },
        { value: "minimal", label: "Text tabs" },
      ],
    },
  ]
);

export const collectionProductGridBlock = collectionBlock(
  "collection-product-grid",
  "collection-product-grid",
  "Product grid",
  "Products in this collection",
  "shopping-bag",
  "from-blue-50 to-slate-100",
  { columns: 3, density: "comfortable", layout: "grid" },
  [
    {
      key: "layout",
      type: "select",
      label: "Design layout",
      group: "layout",
      focus: "section",
      options: [
        { value: "grid", label: "Standard grid" },
        { value: "dense", label: "Dense showcase" },
      ],
    },
    {
      key: "density",
      type: "select",
      label: "Density",
      group: "layout",
      focus: "section",
      options: [
        { value: "comfortable", label: "Comfortable" },
        { value: "dense", label: "Dense" },
      ],
    },
  ],
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
    title: "Stay in the edit",
    description: "New arrivals and restocks — quiet updates only.",
    buttonText: "Subscribe",
    layout: "strip",
  },
  [
    {
      key: "layout",
      type: "select",
      label: "Design layout",
      group: "layout",
      focus: "section",
      options: [
        { value: "card", label: "Contained card" },
        { value: "banner", label: "Full banner" },
        { value: "strip", label: "Compact strip" },
      ],
    },
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
  { pageSize: 12, layout: "simple" },
  [
    {
      key: "layout",
      type: "select",
      label: "Design layout",
      group: "layout",
      focus: "section",
      options: [
        { value: "numbered", label: "Numbered pages" },
        { value: "simple", label: "Previous / Next" },
        { value: "load-more", label: "Load more" },
      ],
    },
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
