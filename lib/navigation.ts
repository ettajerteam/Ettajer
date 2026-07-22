import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { EDITOR_MANAGED_STORE_PAGES } from "@/lib/editor-pages-config";
import { getStorefrontCopy } from "@/lib/storefront/storefront-i18n";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  children?: NavItem[];
}

/** Built-in destinations merchants can put in the storefront header menu. */
export interface StoreMenuDestination {
  id: string;
  label: string;
  href: string;
  group: "core" | "shop" | "content" | "discover" | "legal" | "custom";
  description?: string;
}

export const STORE_MENU_CORE: StoreMenuDestination[] = [
  { id: "home", label: "Home", href: "/", group: "core", description: "Store homepage" },
];

function managedHref(slug: string): string {
  if (slug === "products" || slug === "collections" || slug === "search" || slug === "blog") {
    return `/${slug}`;
  }
  return `/${slug}`;
}

export const STORE_MENU_MANAGED: StoreMenuDestination[] = EDITOR_MANAGED_STORE_PAGES.map((page) => ({
  id: `managed-${page.slug}`,
  label: page.label,
  href: managedHref(page.slug),
  group: page.group === "shop" ? "shop" : page.group === "legal" ? "legal" : page.group === "discover" ? "discover" : "content",
  description: page.subtitle,
}));

/** Full catalog of built-in menu destinations (Home + managed store pages). */
export function getBuiltInStoreMenuDestinations(): StoreMenuDestination[] {
  return [...STORE_MENU_CORE, ...STORE_MENU_MANAGED];
}

export function parseNavigation(data: unknown, locale?: string): NavItem[] {
  if (!Array.isArray(data) || data.length === 0) return defaultNavigation(locale);
  return data
    .filter(
      (item): item is NavItem =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        "label" in item &&
        "href" in item
    )
    .map((item) => ({
      id: String(item.id),
      label: String(item.label),
      href: String(item.href),
      children: item.children ? parseNavigationChildren(item.children) : undefined,
    }));
}

function parseNavigationChildren(data: unknown): NavItem[] | undefined {
  if (!Array.isArray(data) || data.length === 0) return undefined;
  const children = data
    .filter(
      (item): item is NavItem =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        "label" in item &&
        "href" in item
    )
    .map((item) => ({
      id: String(item.id),
      label: String(item.label),
      href: String(item.href),
    }));
  return children.length > 0 ? children : undefined;
}

/** Default header menu: everything merchants typically control on a new store. */
export function defaultNavigation(locale?: string): NavItem[] {
  const t = getStorefrontCopy(locale).nav;
  return [
    { id: "home", label: t.home, href: "/" },
    {
      id: "shop",
      label: t.shop,
      href: "/products",
      children: [
        { id: "shop-all", label: t.allProducts, href: "/products" },
        { id: "shop-collections", label: t.collections, href: "/collections" },
      ],
    },
    { id: "collections", label: t.collections, href: "/collections" },
  ];
}

function normalizeHref(href: string): string {
  const trimmed = href.trim() || "/";
  if (trimmed === "/") return "/";
  return trimmed.replace(/\/+$/, "") || "/";
}

/** Flatten menu items (including children) for “already added” checks. */
export function flattenNavHrefs(items: NavItem[]): Set<string> {
  const hrefs = new Set<string>();
  for (const item of items) {
    hrefs.add(normalizeHref(item.href));
    if (item.children) {
      for (const child of item.children) {
        hrefs.add(normalizeHref(child.href));
      }
    }
  }
  return hrefs;
}

export function isDestinationInMenu(items: NavItem[], href: string): boolean {
  return flattenNavHrefs(items).has(normalizeHref(href));
}

export async function getStoreNavigation(storeId: string): Promise<NavItem[]> {
  const settings = await prisma.storeSettings.findUnique({ where: { storeId } });
  return parseNavigation(settings?.navigation);
}

export async function saveStoreNavigation(storeId: string, items: NavItem[]) {
  const settings = await prisma.storeSettings.findUnique({ where: { storeId } });
  if (!settings) {
    return prisma.storeSettings.create({
      data: { storeId, navigation: items as unknown as Prisma.InputJsonValue },
    });
  }
  return prisma.storeSettings.update({
    where: { storeId },
    data: { navigation: items as unknown as Prisma.InputJsonValue },
  });
}

/** Destinations for the Navigation UI: built-ins + published custom pages. */
export async function getStoreMenuDestinations(storeId: string): Promise<StoreMenuDestination[]> {
  const builtIn = getBuiltInStoreMenuDestinations();
  const customPages = await prisma.storePage.findMany({
    where: {
      storeId,
      slug: { notIn: EDITOR_MANAGED_STORE_PAGES.map((p) => p.slug) },
    },
    select: { id: true, title: true, slug: true, status: true },
    orderBy: { title: "asc" },
  });

  const custom: StoreMenuDestination[] = customPages.map((page) => ({
    id: `page-${page.id}`,
    label: page.title,
    href: `/${page.slug}`,
    group: "custom",
    description: page.status === "published" ? `/${page.slug}` : `/${page.slug} · draft`,
  }));

  return [...builtIn, ...custom];
}
