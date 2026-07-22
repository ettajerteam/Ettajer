import { HELP_ARTICLES, HELP_CATEGORIES } from "@/lib/help/help-data";
import { prisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/seo/site-config";
import {
  getStoreBlogPostUrl,
  getStoreBlogUrl,
  getStoreCategoryUrl,
  getStoreCollectionUrl,
  getStoreCollectionsUrl,
  getStorePageUrl,
  getStoreProductUrl,
  getStoreProductsUrl,
  getStoreUrl,
} from "@/lib/storefront-urls";

export const PUBLIC_STATIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/activate",
  "/forgot-password",
  "/reset-password",
  "/privacy",
  "/terms",
  "/cookies",
  "/help",
  "/contact",
  "/founder-card",
] as const;

export function getPublicSitemapEntries(): { url: string; lastModified?: Date }[] {
  const now = new Date();
  const entries: { url: string; lastModified?: Date }[] = PUBLIC_STATIC_PATHS.map(
    (path) => ({
      url: absoluteUrl(path),
      lastModified: now,
    }),
  );

  for (const article of HELP_ARTICLES) {
    entries.push({
      url: absoluteUrl(`/help/${article.slug}`),
      lastModified: now,
    });
  }

  for (const category of HELP_CATEGORIES) {
    entries.push({
      url: absoluteUrl(`/help/category/${category.id}`),
      lastModified: now,
    });
  }

  return entries;
}

/** Merchant storefront URLs for Google/Bing discovery. */
export async function getStorefrontSitemapEntries(): Promise<
  { url: string; lastModified?: Date }[]
> {
  const stores = await prisma.store.findMany({
    select: {
      slug: true,
      updatedAt: true,
      products: {
        where: { status: "active" },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 500,
      },
      collections: {
        select: { slug: true, updatedAt: true },
      },
      categories: {
        where: { status: "active" },
        select: { slug: true, updatedAt: true },
      },
      blogPosts: {
        where: { status: "published" },
        select: { slug: true, updatedAt: true },
      },
      storePages: {
        where: { status: "published" },
        select: { slug: true, updatedAt: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  const entries: { url: string; lastModified?: Date }[] = [];

  for (const store of stores) {
    const storePath = getStoreUrl(store.slug);
    entries.push({ url: absoluteUrl(storePath), lastModified: store.updatedAt });
    entries.push({
      url: absoluteUrl(getStoreProductsUrl(store.slug)),
      lastModified: store.updatedAt,
    });
    entries.push({
      url: absoluteUrl(getStoreCollectionsUrl(store.slug)),
      lastModified: store.updatedAt,
    });
    entries.push({
      url: absoluteUrl(getStoreBlogUrl(store.slug)),
      lastModified: store.updatedAt,
    });

    for (const product of store.products) {
      entries.push({
        url: absoluteUrl(getStoreProductUrl(store.slug, product.slug)),
        lastModified: product.updatedAt,
      });
    }
    for (const collection of store.collections) {
      entries.push({
        url: absoluteUrl(getStoreCollectionUrl(store.slug, collection.slug)),
        lastModified: collection.updatedAt,
      });
    }
    for (const category of store.categories) {
      entries.push({
        url: absoluteUrl(getStoreCategoryUrl(store.slug, category.slug)),
        lastModified: category.updatedAt,
      });
    }
    for (const post of store.blogPosts) {
      entries.push({
        url: absoluteUrl(getStoreBlogPostUrl(store.slug, post.slug)),
        lastModified: post.updatedAt,
      });
    }
    for (const page of store.storePages) {
      // Skip system route slugs that have dedicated app routes if duplicated
      if (["products", "collections", "blog", "search"].includes(page.slug)) continue;
      entries.push({
        url: absoluteUrl(getStorePageUrl(store.slug, page.slug)),
        lastModified: page.updatedAt,
      });
    }
  }

  return entries;
}
