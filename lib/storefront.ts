import { prisma } from "@/lib/db";
import { parseProductImages } from "@/lib/product-images";
import { parseProductVariants } from "@/lib/product-variants";
import { parseProductReviews } from "@/lib/product-reviews";
import { parseProductDetails } from "@/lib/product-details";
import { parseProductCommerce } from "@/lib/product-commerce";
import {
  parsePaymentGateways,
  parseShippingZones,
  parseMarketingIntegrations,
  getDefaultFreeShippingThreshold,
  getShippableCountryCodes,
  isPaypalConnected,
} from "@/lib/store-settings";
import { isPaypalCurrencySupported } from "@/lib/payments/paypal-currency";
import { isStripePaymentsAvailable } from "@/lib/payments/stripe-availability";
import { countryCodeToName } from "@/lib/shipping-destinations";
import { toPublicMarketingIntegrations } from "@/lib/marketing-integrations";
import { parseNavigation } from "@/lib/navigation";
import {
  serializePublicCategory,
  serializePublicCollection,
} from "@/lib/catalog";
import { parseDesignTokens, resolveDesignTokens } from "@/lib/design-tokens";
import { parseShopPreferences } from "@/lib/shop-preferences";
import type { PublicProduct, PublicStore } from "@/types/storefront";

export function serializePublicStore(
  store: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    description: string | null;
    currency: string;
    language?: string | null;
    contactEmail?: string | null;
    phone?: string | null;
    address?: string | null;
    primaryColor: string;
    secondaryColor: string;
    font: string;
    theme: string;
  },
  settings?: {
    shippingZones?: unknown;
    paymentGateways?: unknown;
    marketingIntegrations?: unknown;
    navigation?: unknown;
    seo?: unknown;
  } | null
): PublicStore {
  const zones = parseShippingZones(settings?.shippingZones);
  const gateways = parsePaymentGateways(settings?.paymentGateways);
  const marketing = toPublicMarketingIntegrations(
    parseMarketingIntegrations(settings?.marketingIntegrations)
  );
  const shop = parseShopPreferences(settings?.seo);
  const freeShippingThreshold = getDefaultFreeShippingThreshold(zones);
  const tokens = resolveDesignTokens(store.theme, parseDesignTokens(settings?.seo));
  const language = store.language?.trim() || "en";
  const shippableCodes = getShippableCountryCodes(zones);

  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    logo: store.logo,
    description: store.description,
    currency: store.currency,
    language,
    primaryColor: store.primaryColor,
    secondaryColor: store.secondaryColor,
    font: store.font,
    theme: store.theme,
    textColor: tokens.textColor,
    mutedColor: tokens.mutedColor,
    borderColor: tokens.borderColor,
    buttonRadius: tokens.buttonRadius,
    checkout: {
      cashOnDelivery: gateways.cashOnDelivery,
      stripe: isStripePaymentsAvailable()
        ? Boolean(gateways.stripe && gateways.stripeAccountId)
        : false,
      paypal:
        gateways.paypal &&
        isPaypalConnected(gateways) &&
        isPaypalCurrencySupported(store.currency),
      paypalClientId:
        gateways.paypal &&
        isPaypalConnected(gateways) &&
        isPaypalCurrencySupported(store.currency)
          ? gateways.paypalClientId ?? null
          : null,
      paypalMode: gateways.paypalMode === "live" ? "live" : "sandbox",
      freeShippingThreshold,
      minOrderAmount: shop.minOrderAmount,
      checkoutNote: shop.checkoutNote,
      codMessage: shop.codMessage,
      paypalMessage: shop.paypalMessage,
      codTitle: shop.codTitle,
      paypalTitle: shop.paypalTitle,
      codFee: shop.codFee,
      taxEnabled: shop.tax.enabled,
      taxRatePercent: shop.tax.ratePercent,
      taxPricesIncludeTax: shop.tax.pricesIncludeTax,
      taxLabel: shop.tax.label,
      taxShowOnCheckout: shop.tax.showOnCheckout,
      checkoutTheme: shop.checkoutTheme,
      checkoutLayout: shop.checkoutLayout,
      showProgress: shop.showProgress,
      showCoupon: shop.showCoupon,
      summaryOpenByDefault: shop.summaryOpenByDefault,
      continueLabel: shop.continueLabel,
      placeOrderLabel: shop.placeOrderLabel,
      successMessage: shop.successMessage,
      requireTerms: shop.requireTerms,
      phonePlaceholder: shop.phonePlaceholder,
      phoneHint: shop.phoneHint,
      fields: { ...shop.checkoutFields },
      shippingZones: zones.map((z) => ({
        id: z.id,
        name: z.name,
        countries: z.countries,
        cities: z.cities,
        rate: z.rate,
        freeShippingThreshold: z.freeShippingThreshold,
      })),
      shippableCountries: shippableCodes.map((code) => ({
        code,
        name: countryCodeToName(code),
      })),
    },
    contact: {
      email: store.contactEmail ?? null,
      phone: store.phone ?? null,
      address: store.address ?? null,
      whatsapp: shop.whatsapp,
      showOnStorefront: shop.showContactOnStorefront,
    },
    announceBarEnabled: shop.announceBarEnabled,
    announceBarText: shop.announceBarText,
    marketing,
    navigation: parseNavigation(settings?.navigation, language),
  };
}

export function serializePublicProduct(product: {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  inventory: number;
  images: unknown;
  variants: unknown;
  reviews?: unknown;
  details?: unknown;
  tags: string[];
  productType?: string | null;
  copyrightOwner?: string | null;
  copyrightNotice?: string | null;
  commerce?: unknown;
}): PublicProduct {
  const commerce = parseProductCommerce(product.commerce);
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    price: product.price,
    comparePrice: product.comparePrice,
    inventory: product.inventory,
    images: parseProductImages(product.images),
    variants: parseProductVariants(product.variants),
    tags: product.tags,
    details: parseProductDetails(product.details),
    highlights: commerce.highlights?.length ? commerce.highlights : undefined,
    reviews: parseProductReviews(product.reviews),
    productType: product.productType ?? "physical",
    copyrightOwner: product.copyrightOwner ?? null,
    copyrightNotice: product.copyrightNotice ?? null,
  };
}

export async function getStoreBySlug(slug: string) {
  return prisma.store.findUnique({
    where: { slug },
    include: {
      settings: true,
      categories: {
        where: { status: "active" },
        orderBy: { name: "asc" },
      },
      collections: {
        where: { featured: true },
        orderBy: { name: "asc" },
      },
      products: {
        where: { status: "active" },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getStoreCategory(storeSlug: string, categorySlug: string) {
  const store = await prisma.store.findUnique({
    where: { slug: storeSlug },
    include: {
      settings: true,
      categories: {
        where: { status: "active" },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!store) return null;

  const category = await prisma.category.findFirst({
    where: { storeId: store.id, slug: categorySlug, status: "active" },
    include: {
      products: { where: { status: "active" }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!category) return null;

  return { store, category };
}

export async function getStoreCollection(storeSlug: string, collectionSlug: string) {
  const store = await prisma.store.findUnique({
    where: { slug: storeSlug },
    include: {
      settings: true,
      categories: {
        where: { status: "active" },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!store) return null;

  const collection = await prisma.collection.findFirst({
    where: { storeId: store.id, slug: collectionSlug },
    include: {
      products: { where: { status: "active" }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!collection) return null;

  return { store, collection };
}

export async function getStoreProduct(storeSlug: string, productSlug: string) {
  const store = await prisma.store.findUnique({
    where: { slug: storeSlug },
    include: {
      settings: true,
      products: {
        where: { slug: productSlug, status: "active" },
        take: 1,
      },
    },
  });

  if (!store || !store.products[0]) return null;

  return { store, product: store.products[0] };
}

export { getFontFamily } from "@/lib/storefront-fonts";
