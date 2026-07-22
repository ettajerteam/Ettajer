import type { EditorPageTarget } from "@/lib/builder/editor-types";
import {
  getStoreBlogPostUrl,
  getStoreBlogUrl,
  getStoreCollectionUrl,
  getStoreCollectionsUrl,
  getStorePageUrl,
  getStoreProductUrl,
  getStoreProductsUrl,
  getStoreSearchUrl,
  getStoreUrl,
} from "@/lib/storefront-urls";
import { PREVIEW_BLOG_POST_SLUG } from "@/lib/storefront-preview-blog-post";
import { PREVIEW_COLLECTION_SLUG } from "@/lib/storefront-preview-collection";
import { PREVIEW_PRODUCT_SLUG } from "@/lib/storefront-preview-product";

/** Store pages with a dedicated editor entry (hidden from generic custom list). */
export const EDITOR_MANAGED_STORE_PAGE_SLUGS = [
  "products",
  "collections",
  "search",
  "blog",
  "about",
  "contact",
  "lookbook",
  "shipping",
  "privacy",
  "terms",
] as const;

export type EditorManagedStorePageSlug = (typeof EDITOR_MANAGED_STORE_PAGE_SLUGS)[number];

/** Reserved slugs hidden from the custom pages list. */
export const EDITOR_HIDDEN_PAGE_SLUGS = [
  ...EDITOR_MANAGED_STORE_PAGE_SLUGS,
  "collection",
] as const;

export function isEditorHiddenPageSlug(slug: string): boolean {
  return (EDITOR_HIDDEN_PAGE_SLUGS as readonly string[]).includes(slug);
}

/** @deprecated Use isEditorHiddenPageSlug */
export function isEditorSystemPageSlug(slug: string): boolean {
  return isEditorHiddenPageSlug(slug);
}

/** @deprecated Route pages are now editable StorePages — kept for type compatibility. */
export type EditorRoutePageId = "collections" | "search" | "blog";

export interface EditorManagedStorePageDef {
  slug: EditorManagedStorePageSlug;
  label: string;
  subtitle: string;
  defaultTitle: string;
  group: "shop" | "content" | "legal" | "discover";
}

export const EDITOR_MANAGED_STORE_PAGES: EditorManagedStorePageDef[] = [
  {
    slug: "products",
    label: "Shop catalog",
    subtitle: "All products · /products",
    defaultTitle: "Products",
    group: "shop",
  },
  {
    slug: "collections",
    label: "Collections list",
    subtitle: "All collections · /collections",
    defaultTitle: "Collections",
    group: "shop",
  },
  {
    slug: "search",
    label: "Search",
    subtitle: "Product search · /search",
    defaultTitle: "Search",
    group: "discover",
  },
  {
    slug: "blog",
    label: "Journal",
    subtitle: "Blog listing · /blog",
    defaultTitle: "Journal",
    group: "discover",
  },
  {
    slug: "about",
    label: "About",
    subtitle: "Brand story · /pages/about",
    defaultTitle: "About",
    group: "content",
  },
  {
    slug: "contact",
    label: "Contact",
    subtitle: "Get in touch · /pages/contact",
    defaultTitle: "Contact",
    group: "content",
  },
  {
    slug: "lookbook",
    label: "Lookbook",
    subtitle: "Editorial gallery · /pages/lookbook",
    defaultTitle: "Lookbook",
    group: "content",
  },
  {
    slug: "shipping",
    label: "Shipping & returns",
    subtitle: "Policies · /pages/shipping",
    defaultTitle: "Shipping & Returns",
    group: "legal",
  },
  {
    slug: "privacy",
    label: "Privacy policy",
    subtitle: "Legal · /pages/privacy",
    defaultTitle: "Privacy Policy",
    group: "legal",
  },
  {
    slug: "terms",
    label: "Terms of service",
    subtitle: "Legal · /pages/terms",
    defaultTitle: "Terms of Service",
    group: "legal",
  },
];

/** @deprecated Use EDITOR_MANAGED_STORE_PAGES with group shop/discover */
export const EDITOR_ROUTE_PAGES: { id: EditorRoutePageId; label: string; subtitle: string; group: "shop" | "discover" }[] =
  [];

export interface EditorPreviewSlugs {
  productSlug?: string;
  collectionSlug?: string;
  blogPostSlug?: string;
}

const DEDICATED_ROUTE_SLUGS = new Set(["products", "collections", "search", "blog"]);

export function getEditorPagePreviewPath(
  storeSlug: string,
  target: EditorPageTarget,
  previews?: EditorPreviewSlugs
): string {
  switch (target.type) {
    case "home":
      return getStoreUrl(storeSlug);
    case "product":
      return getStoreProductUrl(storeSlug, previews?.productSlug ?? PREVIEW_PRODUCT_SLUG);
    case "collection":
      return getStoreCollectionUrl(storeSlug, previews?.collectionSlug ?? PREVIEW_COLLECTION_SLUG);
    case "blog-post":
      return getStoreBlogPostUrl(storeSlug, previews?.blogPostSlug ?? PREVIEW_BLOG_POST_SLUG);
    case "route":
      if (target.route === "collections") return getStoreCollectionsUrl(storeSlug);
      if (target.route === "search") return getStoreSearchUrl(storeSlug);
      if (target.route === "blog") return getStoreBlogUrl(storeSlug);
      return getStoreUrl(storeSlug);
    case "custom":
      return resolveManagedStorePageUrl(storeSlug, target.page.slug);
    default:
      return getStoreUrl(storeSlug);
  }
}

export function isEditorPreviewOnlyTarget(target: EditorPageTarget): boolean {
  // Blog post template stays preview-only until a section builder exists for articles.
  return target.type === "blog-post" || target.type === "route";
}

export function getEditorPageLabel(target: EditorPageTarget): string {
  switch (target.type) {
    case "home":
      return "Home";
    case "product":
      return "Product template";
    case "collection":
      return "Collection template";
    case "blog-post":
      return "Blog post";
    case "route": {
      const managed = EDITOR_MANAGED_STORE_PAGES.find((page) => page.slug === target.route);
      return managed?.label ?? "Page";
    }
    case "custom": {
      const managed = EDITOR_MANAGED_STORE_PAGES.find((page) => page.slug === target.page.slug);
      return managed?.label ?? target.page.title;
    }
    default:
      return "Page";
  }
}

export function resolveManagedStorePageUrl(storeSlug: string, slug: string): string {
  if (slug === "products") return getStoreProductsUrl(storeSlug);
  if (slug === "collections") return getStoreCollectionsUrl(storeSlug);
  if (slug === "search") return getStoreSearchUrl(storeSlug);
  if (slug === "blog") return getStoreBlogUrl(storeSlug);
  return getStorePageUrl(storeSlug, slug);
}

export function isDedicatedStorefrontRouteSlug(slug: string): boolean {
  return DEDICATED_ROUTE_SLUGS.has(slug);
}
