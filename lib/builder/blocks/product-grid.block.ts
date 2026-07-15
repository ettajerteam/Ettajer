import type { BlockDefinition } from "../types";
import {
  BASIC_BACKGROUND_STYLE,
  BASIC_TYPOGRAPHY_STYLES,
  PRODUCT_GRID_LAYOUT_FIELDS,
  STANDARD_ADVANCED_FIELDS,
  TITLE_CONTENT_FIELD,
} from "./shared-schemas";

export const productGridBlock: Omit<BlockDefinition, "component"> = {
  id: "product-grid",
  category: "commerce",
  name: "Product grid",
  description: "Grid of products from your catalog",
  icon: "shopping-bag",
  legacySectionType: "product-grid",
  implemented: true,
  thumbnail: { type: "gradient", value: "from-blue-50 to-slate-100" },
  defaultContent: {
    title: "Products",
  },
  defaultStyles: {
    desktop: {
      padding: "2rem 1.5rem",
    },
  },
  settingsSchema: {
    focuses: ["text", "section"],
    content: [TITLE_CONTENT_FIELD],
    styles: [
      BASIC_BACKGROUND_STYLE,
      ...BASIC_TYPOGRAPHY_STYLES.filter((f) => f.key !== "fontSize"),
    ],
    layout: PRODUCT_GRID_LAYOUT_FIELDS,
    advanced: STANDARD_ADVANCED_FIELDS,
  },
};

export const featuredProductsBlock: Omit<BlockDefinition, "component"> = {
  id: "featured-products",
  category: "commerce",
  name: "Featured products",
  description: "Hand-picked product highlights",
  icon: "star",
  legacySectionType: "product-grid",
  implemented: true,
  thumbnail: { type: "gradient", value: "from-yellow-50 to-amber-100" },
  defaultContent: {
    title: "Featured products",
  },
  defaultStyles: {
    desktop: {
      padding: "2rem 1.5rem",
    },
  },
  settingsSchema: {
    focuses: ["text", "section"],
    content: [TITLE_CONTENT_FIELD],
    styles: [BASIC_BACKGROUND_STYLE],
    layout: PRODUCT_GRID_LAYOUT_FIELDS.filter((f) => f.key !== "columns"),
    advanced: STANDARD_ADVANCED_FIELDS,
  },
};
