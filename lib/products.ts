import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { parseProductImages } from "@/lib/product-images";
import type { Product, ProductVariant } from "@/types";

export async function getAuthenticatedStore() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });

  return store;
}

export { parseProductImages } from "@/lib/product-images";

export function parseProductVariants(variants: unknown): ProductVariant[] {
  if (!Array.isArray(variants)) return [];
  return variants.filter(
    (v): v is ProductVariant =>
      typeof v === "object" &&
      v !== null &&
      "id" in v &&
      "name" in v &&
      "options" in v &&
      Array.isArray((v as ProductVariant).options)
  );
}

export function serializeProduct(product: {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  inventory: number;
  sku: string | null;
  images: unknown;
  variants: unknown;
  tags: string[];
  ticketPrinterId?: string | null;
  storeId: string;
  categoryId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: { id: string; name: string } | null;
  collections?: { id: string; name: string }[];
}): Product {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    price: product.price,
    comparePrice: product.comparePrice,
    inventory: product.inventory,
    sku: product.sku,
    images: parseProductImages(product.images),
    variants: parseProductVariants(product.variants),
    tags: product.tags,
    ticketPrinterId: product.ticketPrinterId ?? null,
    storeId: product.storeId,
    categoryId: product.categoryId ?? null,
    categoryName: product.category?.name ?? null,
    collectionIds: product.collections?.map((c) => c.id) ?? [],
    collectionNames: product.collections?.map((c) => c.name) ?? [],
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export const productInclude = {
  category: { select: { id: true, name: true } },
  collections: { select: { id: true, name: true } },
};
