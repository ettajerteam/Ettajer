"use client";

import {
  Home,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Megaphone,
  Store,
  MessageSquare,
  Code2,
  GraduationCap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavLink {
  id: string;
  label: string;
  href: string;
  icon?: LucideIcon;
  external?: boolean;
  comingSoon?: boolean;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: NavLink[];
  /** Show lock / Coming soon for merchants (e.g. Academy) */
  comingSoon?: boolean;
}

export interface NavSection {
  id: string;
  title?: string;
  items: NavGroup[];
}

export const mainNav: NavSection = {
  id: "main",
  items: [
    { id: "home", label: "Home", icon: Home, href: "/dashboard" },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingBag,
      children: [
        { id: "orders-all", label: "All orders", href: "/dashboard/orders" },
        { id: "orders-drafts", label: "Drafts", href: "/dashboard/orders/drafts" },
        { id: "orders-abandoned", label: "Abandoned checkouts", href: "/dashboard/orders/abandoned" },
        { id: "orders-returns", label: "Returns", href: "/dashboard/orders/returns" },
      ],
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
      children: [
        { id: "products-all", label: "All products", href: "/dashboard/products" },
        { id: "products-inventory", label: "Inventory", href: "/dashboard/products/inventory" },
        { id: "products-collections", label: "Collections", href: "/dashboard/collections" },
        { id: "products-categories", label: "Categories", href: "/dashboard/categories" },
        { id: "products-gift-cards", label: "Gift cards", href: "/dashboard/gift-cards" },
        { id: "products-etsy", label: "Etsy", href: "/dashboard/channels/etsy" },
      ],
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
      href: "/dashboard/customers",
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageSquare,
      href: "/dashboard/messages",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      children: [
        { id: "analytics-reports", label: "Reports", href: "/dashboard/analytics/reports" },
        { id: "analytics-live", label: "Live view", href: "/dashboard/analytics/live" },
      ],
    },
    {
      id: "marketing",
      label: "Marketing",
      icon: Megaphone,
      children: [
        { id: "marketing-integrations", label: "Integrations", href: "/dashboard/marketing" },
        { id: "marketing-discounts", label: "Discounts", href: "/dashboard/marketing/discounts" },
        { id: "marketing-email", label: "Email", href: "/dashboard/marketing/email" },
      ],
    },
    {
      id: "online-store",
      label: "Online Store",
      icon: Store,
      children: [
        { id: "store-themes", label: "Themes", href: "/dashboard/themes" },
        { id: "store-domains", label: "Domains", href: "/dashboard/domains" },
        { id: "store-blog", label: "Blog posts", href: "/dashboard/blog" },
        { id: "store-pages", label: "Pages", href: "/dashboard/pages" },
        { id: "store-navigation", label: "Navigation", href: "/dashboard/navigation" },
      ],
    },
    {
      id: "developer",
      label: "Developers",
      icon: Code2,
      children: [
        { id: "developer-apps", label: "Console", href: "/dashboard/developer" },
        { id: "developer-activity", label: "Activity", href: "/dashboard/developer/activity" },
        { id: "developer-docs", label: "Docs", href: "/developers", external: true },
      ],
    },
    {
      id: "academy",
      label: "Academy",
      icon: GraduationCap,
      href: "/dashboard/academy",
      comingSoon: true,
    },
  ],
};

export const allNavSections = [mainNav];

/**
 * When an index nav link (e.g. /dashboard/marketing) has sibling routes under it
 * (e.g. /dashboard/marketing/discounts), those first segments must not keep the
 * index link active — otherwise Discounts + Integrations both look selected.
 */
function buildReservedChildSegmentsByBase(): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();

  for (const section of allNavSections) {
    for (const group of section.items) {
      const hrefs = (group.children ?? []).map((c) => c.href.split("?")[0]!);
      for (const href of hrefs) {
        for (const other of hrefs) {
          if (href === other) continue;
          if (!other.startsWith(`${href}/`)) continue;
          const segment = other.slice(href.length + 1).split("/")[0];
          if (!segment) continue;
          const set = map.get(href) ?? new Set<string>();
          set.add(segment);
          map.set(href, set);
        }
      }
    }
  }

  return map;
}

const reservedChildSegmentsByBase = buildReservedChildSegmentsByBase();

export function isNavLinkActive(
  pathname: string,
  href: string | undefined,
  search = ""
): boolean {
  if (!href || href === "#") return false;
  const [pathPart, queryPart] = href.split("?");
  const base = pathPart!;

  if (queryPart) {
    const want = new URLSearchParams(queryPart);
    const have = new URLSearchParams(search);
    for (const [k, v] of Array.from(want.entries())) {
      if (have.get(k) !== v) return false;
    }
    return pathname === base || pathname.startsWith(`${base}/`);
  }

  if (pathname === base) return true;
  if (!pathname.startsWith(`${base}/`)) return false;

  const reserved = reservedChildSegmentsByBase.get(base);
  if (!reserved?.size) return true;

  const nextSegment = pathname.slice(base.length + 1).split("/")[0];
  if (nextSegment && reserved.has(nextSegment)) return false;
  return true;
}

export function sectionHasActiveChild(
  pathname: string,
  search: string,
  group: NavGroup
): boolean {
  if (group.href && isNavLinkActive(pathname, group.href, search)) return true;
  return (group.children ?? []).some((c) =>
    isNavLinkActive(pathname, c.href, search)
  );
}
