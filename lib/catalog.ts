import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { parseProductImages } from "@/lib/products";
import type {
  Category,
  CategoryDetail,
  CategoryProduct,
  CategoryStatus,
  Collection,
  PublicCategory,
  PublicCollection,
} from "@/types/catalog";

export async function ensureUniqueSlug(
  model: "category" | "collection",
  storeId: string,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing =
      model === "category"
        ? await prisma.category.findFirst({
            where: {
              storeId,
              slug,
              ...(excludeId ? { NOT: { id: excludeId } } : {}),
            },
          })
        : await prisma.collection.findFirst({
            where: {
              storeId,
              slug,
              ...(excludeId ? { NOT: { id: excludeId } } : {}),
            },
          });

    if (!existing) return slug;
    slug = `${baseSlug}-${counter++}`;
  }
}

export function isCategoryStatus(status: string): status is CategoryStatus {
  return status === "active" || status === "inactive";
}

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  status: string;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: { products: number };
};

export function serializeCategory(category: CategoryRow): Category {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    status: isCategoryStatus(category.status) ? category.status : "active",
    storeId: category.storeId,
    productCount: category._count?.products ?? 0,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

export function serializeCategoryDetail(
  category: CategoryRow & {
    products: {
      id: string;
      title: string;
      slug: string;
      price: number;
      inventory: number;
      images: unknown;
    }[];
  }
): CategoryDetail {
  const products: CategoryProduct[] = category.products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    inventory: p.inventory,
    image: parseProductImages(p.images)[0] ?? null,
  }));

  return {
    ...serializeCategory(category),
    products,
  };
}

type CollectionRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  featured: boolean;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: { products: number };
  products?: { id: string }[];
};

export function serializeCollection(collection: CollectionRow): Collection {
  return {
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    description: collection.description,
    image: collection.image,
    featured: collection.featured,
    storeId: collection.storeId,
    productCount: collection._count?.products ?? collection.products?.length ?? 0,
    productIds: collection.products?.map((p) => p.id) ?? [],
    createdAt: collection.createdAt.toISOString(),
    updatedAt: collection.updatedAt.toISOString(),
  };
}

export function serializePublicCategory(category: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}): PublicCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
  };
}

export function serializePublicCollection(collection: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  featured: boolean;
}): PublicCollection {
  return {
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    description: collection.description,
    image: collection.image,
    featured: collection.featured,
  };
}

export function slugFromName(name: string): string {
  return slugify(name) || "item";
}

export async function validateProductIds(storeId: string, productIds: string[]) {
  if (productIds.length === 0) return true;
  const count = await prisma.product.count({
    where: { storeId, id: { in: productIds } },
  });
  return count === productIds.length;
}
