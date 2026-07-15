import { ProductGallerySection } from "@/components/storefront/sections/product/product-gallery-section";
import { ProductInfoSection } from "@/components/storefront/sections/product/product-info-section";
import { ProductPriceSection } from "@/components/storefront/sections/product/product-price-section";
import { ProductVariantsSection } from "@/components/storefront/sections/product/product-variants-section";
import { ProductBuyButtonSection } from "@/components/storefront/sections/product/product-buy-button-section";
import { ProductReviewsSection } from "@/components/storefront/sections/product/product-reviews-section";
import { ProductFaqSection } from "@/components/storefront/sections/product/product-faq-section";
import { ProductRelatedSection } from "@/components/storefront/sections/product/product-related-section";
import { ProductRecentlyViewedSection } from "@/components/storefront/sections/product/product-recently-viewed-section";
import type { BlockComponent } from "../types";

export const PRODUCT_PAGE_COMPONENTS: Record<string, BlockComponent> = {
  "product-gallery": ProductGallerySection,
  "product-info": ProductInfoSection,
  "product-price": ProductPriceSection,
  "product-variants": ProductVariantsSection,
  "product-buy-button": ProductBuyButtonSection,
  "product-reviews": ProductReviewsSection,
  "product-faq": ProductFaqSection,
  "product-related": ProductRelatedSection,
  "product-recently-viewed": ProductRecentlyViewedSection,
};
