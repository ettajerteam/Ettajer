import { prisma } from "@/lib/db";
import { parseProductImages, parseProductVariants } from "@/lib/products";
import {
  parsePaymentGateways,
  parseShippingZones,
  parseMarketingIntegrations,
} from "@/lib/store-settings";
import { toPublicMarketingIntegrations } from "@/lib/marketing-integrations";
import { parseNavigation } from "@/lib/navigation";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/checkout";
import {
  serializePublicCategory,
  serializePublicCollection,
} from "@/lib/catalog";
import type { PublicProduct, PublicStore } from "@/types/storefront";

export function serializePublicStore(
  store: {
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
  },
  settings?: {
    shippingZones?: unknown;
    paymentGateways?: unknown;
    marketingIntegrations?: unknown;
    navigation?: unknown;
  } | null
): PublicStore {
  const zones = parseShippingZones(settings?.shippingZones);
  const gateways = parsePaymentGateways(settings?.paymentGateways);
  const marketing = toPublicMarketingIntegrations(
    parseMarketingIntegrations(settings?.marketingIntegrations)
  );
  const freeShippingThreshold =
    zones[0]?.freeShippingThreshold ?? FREE_SHIPPING_THRESHOLD;

  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    logo: store.logo,
    description: store.description,
    currency: store.currency,
    primaryColor: store.primaryColor,
    secondaryColor: store.secondaryColor,
    font: store.font,
    theme: store.theme,
    checkout: {
      cashOnDelivery: gateways.cashOnDelivery,
      stripe: gateways.stripe,
      freeShippingThreshold,
    },
    marketing,
    navigation: parseNavigation(settings?.navigation),
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
  tags: string[];
}): PublicProduct {
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
      products: { orderBy: { createdAt: "desc" } },
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
      products: { orderBy: { createdAt: "desc" } },
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
        where: { slug: productSlug },
        take: 1,
      },
    },
  });

  if (!store || !store.products[0]) return null;

  return { store, product: store.products[0] };
}

export function getFontFamily(font: string): string {
  const families: Record<string, string> = {
    Inter: "var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif",
    Poppins: "var(--font-poppins), sans-serif",
    Outfit: "var(--font-outfit), sans-serif",
    "Space Grotesk": "var(--font-space), sans-serif",
    "Playfair Display": "var(--font-playfair), serif",
  };
  return families[font] ?? families.Inter;
}
