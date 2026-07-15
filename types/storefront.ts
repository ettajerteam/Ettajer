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
  primaryColor: string;
  secondaryColor: string;
  font: string;
  theme: string;
  checkout: PublicCheckoutSettings;
  marketing: PublicMarketingIntegrations;
  navigation?: NavItem[];
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
}
