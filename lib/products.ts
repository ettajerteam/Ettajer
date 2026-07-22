import { parseProductImages, parseProductImageAssets } from "@/lib/product-images";
import { parseProductVariants } from "@/lib/product-variants";
import { parseProductReviews } from "@/lib/product-reviews";
import { parseProductDetails } from "@/lib/product-details";
import { isProductStatus, isProductType } from "@/lib/product-types";
import type { Product } from "@/types";

export { parseProductImages, parseProductImageAssets } from "@/lib/product-images";
export { parseProductVariants } from "@/lib/product-variants";
export { parseProductReviews } from "@/lib/product-reviews";
export { parseProductDetails } from "@/lib/product-details";

export function serializeProduct(product: {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  costPrice?: number | null;
  inventory: number;
  sku: string | null;
  barcode?: string | null;
  status?: string | null;
  productType?: string | null;
  copyrightOwner?: string | null;
  copyrightNotice?: string | null;
  images: unknown;
  variants: unknown;
  reviews?: unknown;
  details?: unknown;
  tags: string[];
  ticketPrinterId?: string | null;
  storeId: string;
  categoryId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: { id: string; name: string } | null;
  collections?: { id: string; name: string }[];
}): Product {
  const imageAssets = parseProductImageAssets(product.images);
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    price: product.price,
    comparePrice: product.comparePrice,
    costPrice: product.costPrice ?? null,
    inventory: product.inventory,
    sku: product.sku,
    barcode: product.barcode ?? null,
    status: isProductStatus(product.status) ? product.status : "active",
    productType: isProductType(product.productType) ? product.productType : "physical",
    copyrightOwner: product.copyrightOwner ?? null,
    copyrightNotice: product.copyrightNotice ?? null,
    images: imageAssets.map((asset) => asset.url),
    imageAssets,
    variants: parseProductVariants(product.variants),
    details: parseProductDetails(product.details),
    reviews: parseProductReviews(product.reviews),
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

/** Server-only helper — prefer importing from `@/lib/get-authenticated-store`. */
export { getAuthenticatedStore } from "@/lib/get-authenticated-store";
