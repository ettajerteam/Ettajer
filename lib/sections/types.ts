import type { SectionVisualStyles } from "@/lib/builder/types";

/** Home page section types */
export type HomeSectionType =
  | "hero"
  | "featured-collections"
  | "product-grid"
  | "rich-text"
  | "image"
  | "gallery"
  | "video"
  | "contact-form"
  | "faq"
  | "testimonials"
  | "spacer"
  | "divider"
  | "columns"
  | "logo-wall"
  | "product-card"
  | "countdown"
  | "cta"
  | "features"
  | "search"
  | "embed"
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
  /** Optional secondary link under / beside primary CTA (overlay heroes). */
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageAlt?: string;
  alignment?: "left" | "center" | "right";
  showStoreDescription?: boolean;
  /** Full-bleed image with text overlay (editorial / Aura style). */
  overlay?: boolean;
  /** Show store name as the hero brand signal (default true for overlay). */
  showBrand?: boolean;
  /** Small label above the headline when brand is hidden. */
  eyebrow?: string;
  /** stack = image above text; split = TechNova product card; editorial = Paper clean split. */
  layout?: "stack" | "split" | "editorial";
  /** Secondary accent line under/beside the headline (e.g. "Up to 25% Off"). */
  accentHeadline?: string;
}

export interface ProductGridSectionSettings extends SectionVisualFields {
  title?: string;
  /** Short line under the section title */
  subtitle?: string;
  /** latest = newest catalog items; manual = productIds order */
  productSource?: "latest" | "manual";
  /** Real product IDs when productSource is manual */
  productIds?: string[];
  /** Max products to show (1–24) */
  limit?: number;
  /** Skip first N products when productSource is latest (differentiate grids) */
  offset?: number;
  /** Show link to full catalog */
  showViewAll?: boolean;
  /** Presentation layout */
  layout?: "grid" | "carousel" | "list" | "spotlight" | "dense";
  /** Product card chrome */
  cardStyle?: "minimal" | "bordered" | "overlay";
  /** Show CTA on each product card */
  showCardButton?: boolean;
  cardButtonText?: string;
  /** primary | secondary | outline | ghost */
  cardButtonStyle?: "" | "secondary" | "outline" | "ghost";
  /** Style for the section “View all” control */
  viewAllStyle?: "" | "secondary" | "outline" | "ghost" | "link";
}

export interface FeaturedCollectionsSectionSettings extends SectionVisualFields {
  title?: string;
  /** Short line under the section title */
  subtitle?: string;
  /** featured = store featured flag; all = every collection; manual = collectionIds */
  collectionSource?: "featured" | "all" | "manual";
  collectionIds?: string[];
  limit?: number;
  /**
   * Presentation layout:
   * - grid: equal collection cards (default)
   * - carousel: horizontal swipe strip
   * - editorial: large lead + stacked side cards
   * - mosaic: asymmetric spotlight mosaic
   * - overlay: tall centered overlay cards
   * - list: compact horizontal rows
   */
  layout?: "grid" | "carousel" | "editorial" | "mosaic" | "overlay" | "list";
  /** How text sits on/near the image */
  cardStyle?: "overlay" | "below" | "bordered";
  columns?: 2 | 3 | 4;
  showViewAll?: boolean;
  showDescription?: boolean;
}

export interface RichTextSectionSettings extends SectionVisualFields {
  title?: string;
  content?: string;
  alignment?: "left" | "center" | "right";
  /** default | strip | testimonials | newsletter | stats | intro (centered manifesto) */
  layout?: "default" | "strip" | "testimonials" | "newsletter" | "stats" | "intro";
}

export interface ImageSectionSettings extends SectionVisualFields {
  alt?: string;
  caption?: string;
  linkUrl?: string;
  alignment?: "left" | "center" | "right";
  /** contained = card; editorial = wide magazine; cinematic = tall full-bleed */
  layout?: "contained" | "editorial" | "cinematic";
  objectFit?: "cover" | "contain" | "fill";
}

export interface GallerySectionSettings extends SectionVisualFields {
  title?: string;
  /** Newline-separated URLs or array of { url, alt } / string URLs */
  images?: string | Array<string | { url: string; alt?: string }>;
  columns?: number;
  gap?: string;
  layout?: "grid" | "masonry" | "carousel" | "lookbook";
}

export interface VideoSectionSettings extends SectionVisualFields {
  title?: string;
  /** url = YouTube/Vimeo; file = uploaded MP4/WebM */
  videoSource?: "url" | "file";
  videoUrl?: string;
  posterUrl?: string;
  aspectRatio?: string;
}

export interface ContactFormSectionSettings extends SectionVisualFields {
  title?: string;
  description?: string;
  buttonText?: string;
  showPhone?: boolean;
  /**
   * - centered: title + form stack (default)
   * - split: details / map beside the form
   */
  layout?: "centered" | "split";
  /** Detail panel — shown when layout is split (or when any detail is set) */
  detailEmail?: string;
  detailPhone?: string;
  detailHours?: string;
  detailAddress?: string;
  /** Google Maps embed URL (https://www.google.com/maps/embed?…) */
  mapEmbedUrl?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSectionSettings extends SectionVisualFields {
  title?: string;
  subtitle?: string;
  items?: FaqItem[];
  /**
   * - accordion: classic expandable list (default)
   * - two-column: Q&A split across two columns
   * - stacked: always-open Q&A blocks
   * - compact: tighter single-column accordion
   */
  layout?: "accordion" | "two-column" | "stacked" | "compact";
  /** Open the first item by default (accordion / compact) */
  openFirst?: boolean;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role?: string;
}

export interface TestimonialsSectionSettings extends SectionVisualFields {
  title?: string;
  subtitle?: string;
  items?: TestimonialItem[];
  /**
   * - cards: responsive quote grid (default)
   * - spotlight: one featured quote
   * - carousel: horizontal swipe strip
   * - stacked: vertical list
   * - minimal: light quotes without heavy cards
   */
  layout?: "cards" | "spotlight" | "carousel" | "stacked" | "minimal";
  cardStyle?: "bordered" | "soft" | "plain";
  columns?: 2 | 3;
}

export interface SpacerSectionSettings extends SectionVisualFields {
  height?: string;
}

export interface DividerSectionSettings extends SectionVisualFields {
  thickness?: string;
  width?: string;
  color?: string;
  alignment?: "left" | "center" | "right";
}

export interface ColumnItem {
  /** text | image-text | cta | image — defaults to text */
  cellType?: "text" | "image-text" | "cta" | "image";
  title?: string;
  content?: string;
  imageUrl?: string;
  imageAlt?: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface ColumnsSectionSettings extends SectionVisualFields {
  columnCount?: number | string;
  gap?: string;
  columns?: ColumnItem[];
  /**
   * - plain: flat text columns (default)
   * - cards: each cell in a card
   * - media: image-forward cells
   * - cta: CTA-forward cells with prominent buttons
   */
  layout?: "plain" | "cards" | "media" | "cta";
  cardStyle?: "plain" | "bordered" | "soft";
  alignment?: "left" | "center";
}

export interface LogoWallItem {
  url: string;
  alt?: string;
  href?: string;
}

export interface LogoWallSectionSettings extends SectionVisualFields {
  title?: string;
  grayscale?: boolean;
  columns?: number | string;
  logos?: LogoWallItem[];
}

export interface ProductCardSectionSettings extends SectionVisualFields {
  title?: string;
  productSource?: "latest" | "manual";
  productIds?: string[];
  ctaText?: string;
}

export interface CountdownSectionSettings extends SectionVisualFields {
  title?: string;
  subtitle?: string;
  /** ISO datetime string */
  endAt?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface CtaSectionSettings extends SectionVisualFields {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  alignment?: "left" | "center" | "right";
  /**
   * - banner: centered full-width band (default)
   * - split: copy left, actions right
   * - card: contained rounded panel
   * - strip: compact horizontal bar
   * - stacked: large type + full-width button
   */
  layout?: "banner" | "split" | "card" | "strip" | "stacked";
}

export interface FeatureItem {
  icon?: string;
  title?: string;
  body?: string;
}

export interface FeaturesSectionSettings extends SectionVisualFields {
  title?: string;
  /** Short line under the section title */
  subtitle?: string;
  items?: FeatureItem[];
  /**
   * Presentation layout:
   * - cards: bordered benefit cards (default)
   * - minimal: open grid without heavy cards
   * - icon-left: horizontal rows with icon beside copy
   * - numbered: large step numbers
   * - centered: airy centered icons
   * - strip: compact horizontal trust bar
   */
  layout?: "cards" | "minimal" | "icon-left" | "numbered" | "centered" | "strip";
  /** Visual treatment for card layouts */
  cardStyle?: "bordered" | "soft" | "plain" | "accent";
  columns?: 2 | 3 | 4;
  alignment?: "left" | "center";
  showIcons?: boolean;
}

export interface SearchSectionSettings extends SectionVisualFields {
  title?: string;
  placeholder?: string;
  buttonText?: string;
}

export interface EmbedSectionSettings extends SectionVisualFields {
  title?: string;
  url?: string;
  aspectRatio?: string;
}

export interface FooterSectionSettings extends SectionVisualFields {
  showPoweredBy?: boolean;
  tagline?: string;
  showNav?: boolean;
  showClientCare?: boolean;
  showLegal?: boolean;
}

export interface ProductGallerySectionSettings extends SectionVisualFields {
  showThumbnails?: boolean;
  /**
   * - stack: main image + thumbs below (default)
   * - side: thumbs beside the main image
   * - carousel: main image with dots, no thumb strip
   * - single: one large image only
   */
  layout?: "stack" | "side" | "carousel" | "single";
  thumbPosition?: "bottom" | "left";
}

export interface ProductInfoSectionSettings extends SectionVisualFields {
  showDescription?: boolean;
  /** default | compact | editorial */
  layout?: "default" | "compact" | "editorial";
  showBrand?: boolean;
}

export interface ProductPriceSectionSettings extends SectionVisualFields {
  showComparePrice?: boolean;
  /** default | stacked | badge */
  layout?: "default" | "stacked" | "badge";
}

export interface ProductVariantsSectionSettings extends SectionVisualFields {
  label?: string;
  /** pills | outline | underline */
  layout?: "pills" | "outline" | "underline";
}

export interface ProductBuyButtonSectionSettings extends SectionVisualFields {
  buttonText?: string;
  /** solid | outline | full | pill */
  layout?: "solid" | "outline" | "full" | "pill";
}

export interface ProductReviewsSectionSettings extends SectionVisualFields {
  title?: string;
  /** cards | list | compact */
  layout?: "cards" | "list" | "compact";
  /** Max reviews to show (default 6) */
  limit?: number;
  /** Show average rating + count above the list */
  showSummary?: boolean;
}

export interface ProductFaqSectionSettings extends SectionVisualFields {
  title?: string;
  content?: string;
  /** default | strip | intro | accordion */
  layout?: "default" | "strip" | "intro" | "accordion";
}

export interface ProductRelatedSectionSettings extends SectionVisualFields {
  title?: string;
  limit?: number;
  /** grid | carousel | compact */
  layout?: "grid" | "carousel" | "compact";
  columns?: 2 | 3 | 4;
}

export interface ProductRecentlyViewedSectionSettings extends SectionVisualFields {
  title?: string;
  limit?: number;
  /** grid | rail | compact */
  layout?: "grid" | "rail" | "compact";
  columns?: 2 | 3 | 4;
}

export interface CollectionPageBannerSectionSettings extends SectionVisualFields {
  imageUrl?: string;
  showBreadcrumb?: boolean;
  minHeight?: string;
  /**
   * - hero: full-bleed overlay title (default for modern)
   * - contained: rounded banner under breadcrumb
   * - split: image + title panel
   * - minimal: thin image strip
   */
  layout?: "hero" | "contained" | "split" | "minimal";
  showTitle?: boolean;
}

export interface CollectionDescriptionSectionSettings extends SectionVisualFields {
  showDescription?: boolean;
  showTitle?: boolean;
  /** stacked | centered | inline */
  layout?: "stacked" | "centered" | "inline";
}

export interface CollectionFiltersSectionSettings extends SectionVisualFields {
  title?: string;
  /** chips | pills | minimal */
  layout?: "chips" | "pills" | "minimal";
}

export interface CollectionProductGridSectionSettings extends SectionVisualFields {
  columns?: number;
  /** comfortable | dense */
  density?: "comfortable" | "dense";
  layout?: "grid" | "dense";
}

export interface CollectionNewsletterSectionSettings extends SectionVisualFields {
  title?: string;
  description?: string;
  buttonText?: string;
  /** card | banner | strip */
  layout?: "card" | "banner" | "strip";
}

export interface CollectionPaginationSectionSettings extends SectionVisualFields {
  pageSize?: number;
  /** numbered | simple | load-more */
  layout?: "numbered" | "simple" | "load-more";
}

export type SectionSettings =
  | HeroSectionSettings
  | FeaturedCollectionsSectionSettings
  | ProductGridSectionSettings
  | RichTextSectionSettings
  | ImageSectionSettings
  | GallerySectionSettings
  | VideoSectionSettings
  | ContactFormSectionSettings
  | FaqSectionSettings
  | TestimonialsSectionSettings
  | SpacerSectionSettings
  | DividerSectionSettings
  | ColumnsSectionSettings
  | LogoWallSectionSettings
  | ProductCardSectionSettings
  | CountdownSectionSettings
  | CtaSectionSettings
  | FeaturesSectionSettings
  | SearchSectionSettings
  | EmbedSectionSettings
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
  /** Optional merchant-facing name in Layers (persists with layout). */
  label?: string;
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
  "gallery",
  "video",
  "contact-form",
  "faq",
  "testimonials",
  "spacer",
  "divider",
  "columns",
  "logo-wall",
  "product-card",
  "countdown",
  "cta",
  "features",
  "search",
  "embed",
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

/** Shared marketing/layout blocks allowed on the product template (not product-only). */
export const PRODUCT_SHARED_SECTION_TYPES: HomeSectionType[] = [
  "rich-text",
  "footer",
  "faq",
  "testimonials",
  "cta",
  "features",
  "columns",
  "spacer",
  "divider",
];

/** Product template allowlist: commerce blocks + shared below-fold sections. */
export const PRODUCT_ALLOWED_SECTION_TYPES: SectionType[] = [
  ...PRODUCT_SECTION_TYPES,
  ...PRODUCT_SHARED_SECTION_TYPES,
];

export const COLLECTION_SECTION_TYPES: CollectionSectionType[] = [
  "collection-page-banner",
  "collection-description",
  "collection-filters",
  "collection-product-grid",
  "collection-newsletter",
  "collection-pagination",
];

/** Shared blocks allowed on collection templates (templates already ship footer). */
export const COLLECTION_SHARED_SECTION_TYPES: HomeSectionType[] = [
  "footer",
  "rich-text",
  "spacer",
  "divider",
  "cta",
];

export const COLLECTION_ALLOWED_SECTION_TYPES: SectionType[] = [
  ...COLLECTION_SECTION_TYPES,
  ...COLLECTION_SHARED_SECTION_TYPES,
];

export const ALL_SECTION_TYPES: SectionType[] = [
  ...HOME_SECTION_TYPES,
  ...PRODUCT_SECTION_TYPES,
  ...COLLECTION_SECTION_TYPES,
];
