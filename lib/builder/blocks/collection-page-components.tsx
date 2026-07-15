import { CollectionPageBannerSection } from "@/components/storefront/sections/collection/collection-page-banner-section";
import { CollectionDescriptionSection } from "@/components/storefront/sections/collection/collection-description-section";
import { CollectionFiltersSection } from "@/components/storefront/sections/collection/collection-filters-section";
import { CollectionProductGridSection } from "@/components/storefront/sections/collection/collection-product-grid-section";
import { CollectionNewsletterSection } from "@/components/storefront/sections/collection/collection-newsletter-section";
import { CollectionPaginationSection } from "@/components/storefront/sections/collection/collection-pagination-section";
import type { BlockComponent } from "../types";

export const COLLECTION_PAGE_COMPONENTS: Record<string, BlockComponent> = {
  "collection-page-banner": CollectionPageBannerSection,
  "collection-description": CollectionDescriptionSection,
  "collection-filters": CollectionFiltersSection,
  "collection-product-grid": CollectionProductGridSection,
  "collection-newsletter": CollectionNewsletterSection,
  "collection-pagination": CollectionPaginationSection,
};
