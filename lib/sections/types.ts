import type { SectionVisualStyles } from "@/lib/builder/types";

/** Home page section types */
export type HomeSectionType =
  | "hero"
  | "featured-collections"
  | "product-grid"
  | "rich-text"
  | "image"
  | "footer";

/** Product page template section types */
export type ProductSectionType =
  | "product-gallery"
  | "product-info"
  | "product-price"
  | "product-variants"
  | "product-buy-button"
  | "product-reviews"
  | "product-faq"
  | "product-related"
  | "product-recently-viewed";

/** Collection page template section types */
export type CollectionSectionType =
  | "collection-page-banner"
  | "collection-description"
  | "collection-filters"
  | "collection-product-grid"
  | "collection-newsletter"
  | "collection-pagination";

export type SectionType = HomeSectionType | ProductSectionType | CollectionSectionType;

export type PageTemplateType = "home" | "product" | "collection";

/** Optional visual/layout fields shared across section types (backward compatible). */
export interface SectionVisualFields {
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
  imageUrl?: string;
  ctaLink?: string;
  animation?: "none" | "fade" | "slide-up" | "slide-down";
  animationDelayMs?: number;
  customClass?: string;
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
  /** Per-device responsive overrides (desktop / tablet / mobile). */
  styles?: SectionVisualStyles;
}

export interface HeroSectionSettings extends SectionVisualFields {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  imageAlt?: string;
  alignment?: "left" | "center" | "right";
  showStoreDescription?: boolean;
}

export interface FeaturedCollectionsSectionSettings extends SectionVisualFields {
  title?: string;
}

export interface ProductGridSectionSettings extends SectionVisualFields {
  title?: string;
}

export interface RichTextSectionSettings extends SectionVisualFields {
  title?: string;
  content?: string;
  alignment?: "left" | "center" | "right";
}

export interface ImageSectionSettings extends SectionVisualFields {
  alt?: string;
  alignment?: "left" | "center" | "right";
}

export interface FooterSectionSettings extends SectionVisualFields {
  showPoweredBy?: boolean;
}

export interface ProductGallerySectionSettings extends SectionVisualFields {
  showThumbnails?: boolean;
}

export interface ProductInfoSectionSettings extends SectionVisualFields {
  showDescription?: boolean;
}

export interface ProductPriceSectionSettings extends SectionVisualFields {
  showComparePrice?: boolean;
}

export interface ProductVariantsSectionSettings extends SectionVisualFields {
  label?: string;
}

export interface ProductBuyButtonSectionSettings extends SectionVisualFields {
  buttonText?: string;
}

export interface ProductReviewsSectionSettings extends SectionVisualFields {
  title?: string;
}

export interface ProductFaqSectionSettings extends SectionVisualFields {
  title?: string;
  content?: string;
}

export interface ProductRelatedSectionSettings extends SectionVisualFields {
  title?: string;
  limit?: number;
}

export interface ProductRecentlyViewedSectionSettings extends SectionVisualFields {
  title?: string;
  limit?: number;
}

export interface CollectionPageBannerSectionSettings extends SectionVisualFields {
  imageUrl?: string;
  showBreadcrumb?: boolean;
}

export interface CollectionDescriptionSectionSettings extends SectionVisualFields {
  showDescription?: boolean;
}

export interface CollectionFiltersSectionSettings extends SectionVisualFields {
  title?: string;
}

export interface CollectionProductGridSectionSettings extends SectionVisualFields {
  columns?: number;
}

export interface CollectionNewsletterSectionSettings extends SectionVisualFields {
  title?: string;
  description?: string;
  buttonText?: string;
}

export interface CollectionPaginationSectionSettings extends SectionVisualFields {
  pageSize?: number;
}

export type SectionSettings =
  | HeroSectionSettings
  | FeaturedCollectionsSectionSettings
  | ProductGridSectionSettings
  | RichTextSectionSettings
  | ImageSectionSettings
  | FooterSectionSettings
  | ProductGallerySectionSettings
  | ProductInfoSectionSettings
  | ProductPriceSectionSettings
  | ProductVariantsSectionSettings
  | ProductBuyButtonSectionSettings
  | ProductReviewsSectionSettings
  | ProductFaqSectionSettings
  | ProductRelatedSectionSettings
  | ProductRecentlyViewedSectionSettings
  | CollectionPageBannerSectionSettings
  | CollectionDescriptionSectionSettings
  | CollectionFiltersSectionSettings
  | CollectionProductGridSectionSettings
  | CollectionNewsletterSectionSettings
  | CollectionPaginationSectionSettings;

export interface StoreSection {
  id: string;
  type: SectionType;
  settings: SectionSettings;
  visible: boolean;
}

export interface HomeLayout {
  version: 1;
  sections: StoreSection[];
}

/** Section layout for custom pages — same shape as HomeLayout. */
export type PageLayout = HomeLayout;

export type EditorPageId = "home" | "product" | "collection";

export const HOME_SECTION_TYPES: HomeSectionType[] = [
  "hero",
  "featured-collections",
  "product-grid",
  "rich-text",
  "image",
  "footer",
];

export const PRODUCT_SECTION_TYPES: ProductSectionType[] = [
  "product-gallery",
  "product-info",
  "product-price",
  "product-variants",
  "product-buy-button",
  "product-reviews",
  "product-faq",
  "product-related",
  "product-recently-viewed",
];

export const COLLECTION_SECTION_TYPES: CollectionSectionType[] = [
  "collection-page-banner",
  "collection-description",
  "collection-filters",
  "collection-product-grid",
  "collection-newsletter",
  "collection-pagination",
];

export const ALL_SECTION_TYPES: SectionType[] = [
  ...HOME_SECTION_TYPES,
  ...PRODUCT_SECTION_TYPES,
  ...COLLECTION_SECTION_TYPES,
];
