import type { HomeSectionType, SectionType } from "@/lib/sections/types";
import {
  PRODUCT_SECTION_TYPES,
  COLLECTION_SECTION_TYPES,
} from "@/lib/sections/types";

export type InspectorElementFocus = "text" | "image" | "link" | "button" | "section";

export type InspectorContentGroup = "text" | "images" | "links" | "buttons";

export interface InspectorProfile {
  sectionType: SectionType;
  label: string;
  elementLabel: string;
  focuses: InspectorElementFocus[];
  contentGroups: InspectorContentGroup[];
  styleGroups: {
    typography: boolean;
    colors: boolean;
    background: boolean;
    spacing: boolean;
    size: boolean;
    borderRadius: boolean;
    shadows: boolean;
  };
  advanced: {
    visibility: boolean;
    responsive: boolean;
    animation: boolean;
    customClass: boolean;
  };
}

const HOME_INSPECTOR_PROFILES: Record<HomeSectionType, InspectorProfile> = {
  hero: {
    sectionType: "hero",
    label: "Hero banner",
    elementLabel: "Hero · Text, Image & Button",
    focuses: ["text", "image", "button", "link"],
    contentGroups: ["text", "images", "links", "buttons"],
    styleGroups: {
      typography: true,
      colors: true,
      background: true,
      spacing: true,
      size: true,
      borderRadius: true,
      shadows: true,
    },
    advanced: { visibility: true, responsive: true, animation: true, customClass: true },
  },
  "rich-text": {
    sectionType: "rich-text",
    label: "Rich text",
    elementLabel: "Text block",
    focuses: ["text", "link"],
    contentGroups: ["text", "links"],
    styleGroups: {
      typography: true,
      colors: true,
      background: true,
      spacing: true,
      size: false,
      borderRadius: true,
      shadows: false,
    },
    advanced: { visibility: true, responsive: true, animation: true, customClass: true },
  },
  "product-grid": {
    sectionType: "product-grid",
    label: "Product grid",
    elementLabel: "Commerce grid",
    focuses: ["section", "text", "button"],
    contentGroups: ["text", "buttons"],
    styleGroups: {
      typography: true,
      colors: true,
      background: true,
      spacing: true,
      size: false,
      borderRadius: false,
      shadows: false,
    },
    advanced: { visibility: true, responsive: true, animation: true, customClass: true },
  },
  "featured-collections": {
    sectionType: "featured-collections",
    label: "Featured collections",
    elementLabel: "Collection banner",
    focuses: ["section", "text"],
    contentGroups: ["text"],
    styleGroups: {
      typography: true,
      colors: true,
      background: true,
      spacing: true,
      size: false,
      borderRadius: false,
      shadows: false,
    },
    advanced: { visibility: true, responsive: true, animation: true, customClass: true },
  },
  footer: {
    sectionType: "footer",
    label: "Footer",
    elementLabel: "Footer",
    focuses: ["section"],
    contentGroups: ["text"],
    styleGroups: {
      typography: false,
      colors: true,
      background: true,
      spacing: true,
      size: false,
      borderRadius: false,
      shadows: false,
    },
    advanced: { visibility: true, responsive: false, animation: false, customClass: true },
  },
  image: {
    sectionType: "image",
    label: "Image",
    elementLabel: "Image block",
    focuses: ["image", "section"],
    contentGroups: ["images"],
    styleGroups: {
      typography: false,
      colors: false,
      background: true,
      spacing: true,
      size: true,
      borderRadius: true,
      shadows: false,
    },
    advanced: { visibility: true, responsive: true, animation: true, customClass: true },
  },
  gallery: {
    sectionType: "gallery",
    label: "Gallery",
    elementLabel: "Image gallery",
    focuses: ["image", "section", "text"],
    contentGroups: ["images", "text"],
    styleGroups: {
      typography: true,
      colors: false,
      background: true,
      spacing: true,
      size: false,
      borderRadius: true,
      shadows: false,
    },
    advanced: { visibility: true, responsive: true, animation: true, customClass: true },
  },
  video: {
    sectionType: "video",
    label: "Video",
    elementLabel: "Video embed",
    focuses: ["section", "text", "image"],
    contentGroups: ["text", "images", "links"],
    styleGroups: {
      typography: true,
      colors: false,
      background: true,
      spacing: true,
      size: false,
      borderRadius: true,
      shadows: false,
    },
    advanced: { visibility: true, responsive: true, animation: true, customClass: true },
  },
  "contact-form": {
    sectionType: "contact-form",
    label: "Contact form",
    elementLabel: "Contact form",
    focuses: ["text", "section", "button"],
    contentGroups: ["text", "buttons"],
    styleGroups: {
      typography: true,
      colors: true,
      background: true,
      spacing: true,
      size: false,
      borderRadius: false,
      shadows: false,
    },
    advanced: { visibility: true, responsive: true, animation: true, customClass: true },
  },
  faq: {
    sectionType: "faq",
    label: "FAQ",
    elementLabel: "Q&A list",
    focuses: ["text", "section"],
    contentGroups: ["text"],
    styleGroups: {
      typography: true,
      colors: true,
      background: true,
      spacing: true,
      size: false,
      borderRadius: false,
      shadows: false,
    },
    advanced: { visibility: true, responsive: true, animation: true, customClass: true },
  },
  testimonials: {
    sectionType: "testimonials",
    label: "Testimonials",
    elementLabel: "Quote cards",
    focuses: ["text", "section"],
    contentGroups: ["text"],
    styleGroups: {
      typography: true,
      colors: true,
      background: true,
      spacing: true,
      size: false,
      borderRadius: true,
      shadows: false,
    },
    advanced: { visibility: true, responsive: true, animation: true, customClass: true },
  },
  spacer: {
    sectionType: "spacer",
    label: "Spacer",
    elementLabel: "Vertical space",
    focuses: ["section"],
    contentGroups: [],
    styleGroups: {
      typography: false,
      colors: false,
      background: true,
      spacing: true,
      size: true,
      borderRadius: false,
      shadows: false,
    },
    advanced: { visibility: true, responsive: true, animation: false, customClass: true },
  },
  divider: {
    sectionType: "divider",
    label: "Divider",
    elementLabel: "Horizontal rule",
    focuses: ["section"],
    contentGroups: [],
    styleGroups: {
      typography: false,
      colors: true,
      background: true,
      spacing: true,
      size: false,
      borderRadius: false,
      shadows: false,
    },
    advanced: { visibility: true, responsive: true, animation: false, customClass: true },
  },
  columns: {
    sectionType: "columns",
    label: "Columns",
    elementLabel: "Multi-column content",
    focuses: ["text", "image", "button", "link", "section"],
    contentGroups: ["text", "images", "buttons", "links"],
    styleGroups: {
      typography: true,
      colors: true,
      background: true,
      spacing: true,
      size: false,
      borderRadius: false,
      shadows: false,
    },
    advanced: { visibility: true, responsive: true, animation: true, customClass: true },
  },
  "logo-wall": {
    sectionType: "logo-wall",
    label: "Logo wall",
    elementLabel: "Partner logos",
    focuses: ["image", "section", "text"],
    contentGroups: ["images", "text"],
    styleGroups: {
      typography: true,
      colors: true,
      background: true,
      spacing: true,
      size: false,
      borderRadius: false,
      shadows: false,
    },
    advanced: { visibility: true, responsive: true, animation: true, customClass: true },
  },
  "product-card": {
    sectionType: "product-card",
    label: "Product card",
    elementLabel: "Product spotlight",
    focuses: ["section", "text", "image", "button"],
    contentGroups: ["text", "images", "buttons"],
    styleGroups: {
      typography: true,
      colors: true,
      background: true,
      spacing: true,
      size: false,
      borderRadius: true,
      shadows: false,
    },
    advanced: { visibility: true, responsive: true, animation: true, customClass: true },
  },
  countdown: {
    sectionType: "countdown",
    label: "Countdown",
    elementLabel: "Sale timer",
    focuses: ["text", "section", "button", "link"],
    contentGroups: ["text", "buttons", "links"],
    styleGroups: {
      typography: true,
      colors: true,
      background: true,
      spacing: true,
      size: false,
      borderRadius: false,
      shadows: false,
    },
    advanced: { visibility: true, responsive: true, animation: true, customClass: true },
  },
  cta: {
    sectionType: "cta",
    label: "CTA",
    elementLabel: "Call to action",
    focuses: ["text", "button", "link", "section"],
    contentGroups: ["text", "buttons", "links"],
    styleGroups: {
      typography: true,
      colors: true,
      background: true,
      spacing: true,
      size: false,
      borderRadius: false,
      shadows: false,
    },
    advanced: { visibility: true, responsive: true, animation: true, customClass: true },
  },
  features: {
    sectionType: "features",
    label: "Features",
    elementLabel: "Feature grid",
    focuses: ["text", "section"],
    contentGroups: ["text"],
    styleGroups: {
      typography: true,
      colors: true,
      background: true,
      spacing: true,
      size: false,
      borderRadius: true,
      shadows: false,
    },
    advanced: { visibility: true, responsive: true, animation: true, customClass: true },
  },
  search: {
    sectionType: "search",
    label: "Search",
    elementLabel: "Search bar",
    focuses: ["text", "section"],
    contentGroups: ["text", "buttons"],
    styleGroups: {
      typography: true,
      colors: true,
      background: true,
      spacing: true,
      size: false,
      borderRadius: false,
      shadows: false,
    },
    advanced: { visibility: true, responsive: true, animation: false, customClass: true },
  },
  embed: {
    sectionType: "embed",
    label: "Embed",
    elementLabel: "Embedded media",
    focuses: ["section", "text"],
    contentGroups: ["text"],
    styleGroups: {
      typography: true,
      colors: false,
      background: true,
      spacing: true,
      size: false,
      borderRadius: true,
      shadows: false,
    },
    advanced: { visibility: true, responsive: true, animation: false, customClass: true },
  },
};

const COMMERCE_STYLE_GROUPS: InspectorProfile["styleGroups"] = {
  typography: true,
  colors: true,
  background: true,
  spacing: true,
  size: false,
  borderRadius: false,
  shadows: false,
};

const COMMERCE_ADVANCED: InspectorProfile["advanced"] = {
  visibility: true,
  responsive: true,
  animation: true,
  customClass: true,
};

function commerceProfile(
  sectionType: SectionType,
  label: string,
  elementLabel: string,
  focuses: InspectorElementFocus[] = ["section", "text"],
  contentGroups: InspectorContentGroup[] = ["text"]
): InspectorProfile {
  return {
    sectionType,
    label,
    elementLabel,
    focuses,
    contentGroups,
    styleGroups: COMMERCE_STYLE_GROUPS,
    advanced: COMMERCE_ADVANCED,
  };
}

const PRODUCT_INSPECTOR_PROFILES: Record<
  (typeof PRODUCT_SECTION_TYPES)[number],
  InspectorProfile
> = {
  "product-gallery": commerceProfile(
    "product-gallery",
    "Gallery",
    "Product gallery",
    ["section", "image"],
    ["images"]
  ),
  "product-info": commerceProfile("product-info", "Product information", "Product info"),
  "product-price": commerceProfile("product-price", "Price", "Product price"),
  "product-variants": commerceProfile("product-variants", "Variants", "Variant picker"),
  "product-buy-button": commerceProfile(
    "product-buy-button",
    "Buy button",
    "Add to cart",
    ["section", "button"],
    ["buttons"]
  ),
  "product-reviews": commerceProfile("product-reviews", "Reviews", "Product reviews"),
  "product-faq": commerceProfile("product-faq", "FAQ", "Product FAQ"),
  "product-related": commerceProfile("product-related", "Related products", "Related products"),
  "product-recently-viewed": commerceProfile(
    "product-recently-viewed",
    "Recently viewed",
    "Recently viewed"
  ),
};

const COLLECTION_INSPECTOR_PROFILES: Record<
  (typeof COLLECTION_SECTION_TYPES)[number],
  InspectorProfile
> = {
  "collection-page-banner": commerceProfile(
    "collection-page-banner",
    "Banner",
    "Collection banner",
    ["section", "image", "text"],
    ["images", "text"]
  ),
  "collection-description": commerceProfile(
    "collection-description",
    "Description",
    "Collection description"
  ),
  "collection-filters": commerceProfile("collection-filters", "Filters", "Collection filters"),
  "collection-product-grid": commerceProfile(
    "collection-product-grid",
    "Product grid",
    "Collection product grid"
  ),
  "collection-newsletter": commerceProfile(
    "collection-newsletter",
    "Newsletter",
    "Newsletter signup"
  ),
  "collection-pagination": commerceProfile(
    "collection-pagination",
    "Pagination",
    "Collection pagination"
  ),
};

export const INSPECTOR_PROFILES: Record<SectionType, InspectorProfile> = {
  ...HOME_INSPECTOR_PROFILES,
  ...PRODUCT_INSPECTOR_PROFILES,
  ...COLLECTION_INSPECTOR_PROFILES,
};

const FALLBACK_INSPECTOR_PROFILE: InspectorProfile = {
  sectionType: "hero",
  label: "Section",
  elementLabel: "Section",
  focuses: ["section"],
  contentGroups: [],
  styleGroups: {
    typography: true,
    colors: true,
    background: true,
    spacing: true,
    size: true,
    borderRadius: true,
    shadows: true,
  },
  advanced: {
    visibility: true,
    responsive: true,
    animation: true,
    customClass: true,
  },
};

export function getInspectorProfile(type: SectionType | string): InspectorProfile {
  const profile = (INSPECTOR_PROFILES as Partial<Record<string, InspectorProfile>>)[type];
  if (profile) return profile;
  return {
    ...FALLBACK_INSPECTOR_PROFILE,
    sectionType: (type as SectionType) || "hero",
    label: typeof type === "string" ? type.replace(/-/g, " ") : "Section",
    elementLabel: typeof type === "string" ? type.replace(/-/g, " ") : "Section",
  };
}

export interface SectionVisualSettings {
  fontSize?: string;
  fontWeight?: string;
  textColor?: string;
  backgroundColor?: string;
  padding?: string;
  margin?: string;
  width?: string;
  height?: string;
  minHeight?: string;
  borderRadius?: string;
  boxShadow?: string;
  alignment?: "left" | "center" | "right";
  imageUrl?: string;
  ctaLink?: string;
  animation?: "none" | "fade" | "slide-up" | "slide-down";
  animationDelayMs?: number;
  customClass?: string;
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
}

export const FONT_SIZE_OPTIONS = [
  { value: "", label: "Default" },
  { value: "0.875rem", label: "Small" },
  { value: "1rem", label: "Base" },
  { value: "1.25rem", label: "Large" },
  { value: "1.5rem", label: "XL" },
  { value: "2rem", label: "2XL" },
];

export const FONT_WEIGHT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
];

export const SHADOW_OPTIONS = [
  { value: "", label: "None" },
  { value: "0 1px 3px rgba(0,0,0,0.08)", label: "Soft" },
  { value: "0 8px 24px rgba(0,0,0,0.12)", label: "Medium" },
  { value: "0 16px 40px rgba(0,0,0,0.18)", label: "Strong" },
];

export const ANIMATION_OPTIONS = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade in" },
  { value: "slide-up", label: "Slide up" },
  { value: "slide-down", label: "Slide down" },
];
