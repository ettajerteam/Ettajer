export interface Store {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  description?: string | null;
  category?: string | null;
  businessModel?: string | null;
  websiteTemplateId?: string | null;
  currency: string;
  primaryColor: string;
  secondaryColor: string;
  font: string;
  theme: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDetail {
  id: string;
  label: string;
  value: string;
}

export type ProductStatus = "draft" | "active" | "archived";
export type ProductType = "physical" | "digital" | "service" | "dropshipping";

export interface ProductImageAsset {
  url: string;
  width?: number | null;
  height?: number | null;
  sizeBytes?: number | null;
  alt?: string | null;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  price: number;
  comparePrice?: number | null;
  costPrice?: number | null;
  inventory: number;
  sku?: string | null;
  barcode?: string | null;
  status: ProductStatus;
  productType: ProductType;
  copyrightOwner?: string | null;
  copyrightNotice?: string | null;
  images: string[];
  imageAssets: ProductImageAsset[];
  digitalFiles: ProductDigitalFile[];
  variants: ProductVariant[];
  details: ProductDetail[];
  tags: string[];
  reviews: ProductReview[];
  ticketPrinterId?: string | null;
  storeId: string;
  categoryId?: string | null;
  categoryName?: string | null;
  collectionIds: string[];
  collectionNames: string[];
  seo: ProductSeo;
  commerce: ProductCommerce;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSeo {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface ProductCommerce {
  vendor?: string;
  supplier?: string;
  brand?: string;
  trackQuantity?: boolean;
  continueSellingWhenOutOfStock?: boolean;
  lowStockAlert?: number | null;
  inventoryLocation?: "warehouse" | "supplier";
  requiresShipping?: boolean;
  freeShipping?: boolean;
  packageWeight?: number | null;
  chargeTax?: boolean;
  taxIncluded?: boolean;
  shippingProfile?: "standard" | "express";
  hsCode?: string;
  countryOfOrigin?: string;
  highlights?: string[];
  videos?: string[];
  models3d?: string[];
  dropshippingProvider?: "aliexpress" | "cj" | "bigbuy" | "";
  dropshippingUrl?: string;
  customFields?: { id: string; key: string; value: string }[];
  metafields?: { id: string; namespace: string; key: string; value: string }[];
  visibility?: {
    onlineStore: boolean;
    facebook: boolean;
    instagram: boolean;
    tiktok: boolean;
    google: boolean;
  };
  publishMode?: "now" | "schedule";
  publishAt?: string | null;
  relatedProductIds?: string[];
  upsellProductIds?: string[];
  frequentlyBoughtIds?: string[];
}

export interface ProductDigitalFile {
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface ProductReview {
  id: string;
  author: string;
  location?: string;
  rating: number;
  text: string;
  createdAt?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: string[];
  /** Maps option value → image URL (e.g. Red → red photo). */
  optionImages?: Record<string, string>;
}

export type OrderStatus =
  | "draft"
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "returned"
  | "cancelled"
  | "refunded";

export type OrderPaymentMethod = "cod" | "stripe" | "paypal" | "other";
export type OrderPaymentStatus = "unpaid" | "paid" | "refunded" | "partially_refunded";

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  customerEmail: string;
  customerName: string;
  customerPhone?: string | null;
  shippingAddress: ShippingAddress;
  storeId: string;
  createdAt: Date;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface OnboardingData {
  businessModels: Array<"physical" | "digital" | "dropshipping">;
  /** @deprecated Prefer businessModels — kept for localStorage migrate */
  businessModel?: "physical" | "digital" | "dropshipping";
  websiteTemplateId: "aura" | "tech" | "paper";
  storeName: string;
  description?: string;
  phone?: string;
  language?: string;
  category: string;
  currency: "MAD" | "DZD" | "TND" | "USD" | "EUR";
}

export interface AnalyticsData {
  totalSales: number;
  orders: number;
  visitors: number;
  conversionRate: number;
}

export const STORE_CATEGORIES = [
  { value: "fashion", label: "Fashion & Apparel" },
  { value: "electronics", label: "Electronics" },
  { value: "food", label: "Food & Beverages" },
  { value: "beauty", label: "Beauty & Cosmetics" },
  { value: "home", label: "Home & Garden" },
  { value: "handmade", label: "Handmade & Crafts" },
  { value: "other", label: "Other" },
] as const;

export const CURRENCIES = [
  { value: "MAD", label: "Moroccan Dirham (MAD)", symbol: "د.م." },
  { value: "DZD", label: "Algerian Dinar (DZD)", symbol: "د.ج" },
  { value: "TND", label: "Tunisian Dinar (TND)", symbol: "د.ت" },
  { value: "USD", label: "US Dollar (USD)", symbol: "$" },
  { value: "EUR", label: "Euro (EUR)", symbol: "€" },
] as const;

export const PRICING_PLANS = [
  {
    name: "Starter",
    price: 99,
    currency: "MAD",
    period: "month",
    description: "Perfect for new merchants",
    features: [
      "Up to 50 products",
      "Basic analytics",
      "1 store template",
      "Email support",
      "Cash on delivery",
    ],
    highlighted: false,
  },
  {
    name: "Growth",
    price: 249,
    currency: "MAD",
    period: "month",
    description: "For growing businesses",
    features: [
      "Unlimited products",
      "Advanced analytics",
      "All 3 templates",
      "Priority support",
      "Stripe + COD",
      "Custom domain",
    ],
    highlighted: true,
  },
  {
    name: "Pro",
    price: 499,
    currency: "MAD",
    period: "month",
    description: "For established brands",
    features: [
      "Everything in Growth",
      "Multi-store support",
      "API access",
      "Dedicated account manager",
      "White-label options",
      "Advanced SEO tools",
    ],
    highlighted: false,
  },
] as const;
