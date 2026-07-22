import type { ProductVariant } from "./index";
import type { PublicCategory, PublicCollection } from "./catalog";
import type { PublicMarketingIntegrations } from "@/lib/marketing-integrations";
import type { HomeLayout } from "@/lib/sections/types";
import type { NavItem } from "@/lib/navigation";

export type { PublicCategory, PublicCollection };

export interface PublicCheckoutSettings {
  cashOnDelivery: boolean;
  stripe: boolean;
  freeShippingThreshold: number;
}

export interface PublicStore {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  currency: string;
  /** Store UI language: en | fr | ar */
  language?: string;
  primaryColor: string;
  secondaryColor: string;
  font: string;
  theme: string;
  textColor?: string;
  mutedColor?: string;
  borderColor?: string;
  buttonRadius?: string;
  checkout: PublicCheckoutSettings;
  marketing: PublicMarketingIntegrations;
  navigation?: NavItem[];
}

export interface PublicProductDetail {
  id: string;
  label: string;
  value: string;
}

export interface PublicProduct {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  inventory: number;
  images: string[];
  variants: ProductVariant[];
  tags: string[];
  /** Spec rows (brand, material, weight, etc.) shown on the product page. */
  details?: PublicProductDetail[];
  /** Merchant-managed customer reviews for this product. */
  reviews?: PublicProductReview[];
  productType?: string;
  copyrightOwner?: string | null;
  copyrightNotice?: string | null;
}

export interface PublicProductReview {
  id: string;
  author: string;
  location?: string;
  rating: number;
  text: string;
  createdAt?: string;
}

export interface StorefrontProps {
  store: PublicStore;
  products: PublicProduct[];
  categories?: PublicCategory[];
  featuredCollections?: PublicCollection[];
  homeLayout?: HomeLayout | null;
}

export interface StoreThemeSettings {
  theme?: string;
  primaryColor?: string;
  secondaryColor?: string;
  font?: string;
  logo?: string | null;
  /** Extended design tokens (text, muted, border, button radius). */
  textColor?: string;
  mutedColor?: string;
  borderColor?: string;
  buttonRadius?: string;
}
