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

export type ProductStatus = "draft" | "active";
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
  createdAt: Date;
  updatedAt: Date;
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
}

export type OrderStatus = "draft" | "pending" | "processing" | "shipped" | "delivered" | "returned" | "cancelled";

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
  businessModel: "physical" | "digital" | "dropshipping";
  websiteTemplateId: "aura" | "tech" | "paper";
  storeName: string;
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
