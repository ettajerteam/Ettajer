"use client";

import type { LucideIcon } from "lucide-react";
import {
  Home,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Megaphone,
  Store,
} from "lucide-react";

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
      ],
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
      href: "/dashboard/customers",
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
        { id: "marketing-campaigns", label: "Campaigns", href: "/dashboard/marketing/campaigns" },
        { id: "marketing-newsletter", label: "Newsletter", href: "/dashboard/marketing/newsletter" },
        { id: "marketing-messages", label: "Messages", href: "/dashboard/marketing/messages" },
        { id: "marketing-attribution", label: "Attribution", href: "/dashboard/marketing/attribution" },
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
        { id: "store-preferences", label: "Preferences", href: "/dashboard/settings" },
      ],
    },
  ],
};

export const allNavSections = [mainNav];

const RESERVED_CHILD_SEGMENTS = ["drafts", "abandoned", "returns", "inventory"];

function isReservedChildPath(pathname: string, basePath: string): boolean {
  if (!pathname.startsWith(`${basePath}/`)) return false;
  const remainder = pathname.slice(basePath.length + 1);
  const firstSegment = remainder.split("/")[0];
  return RESERVED_CHILD_SEGMENTS.includes(firstSegment);
}

export function isNavLinkActive(pathname: string, href: string, search = ""): boolean {
  const [path, queryString] = href.split("?");
  const currentParams = new URLSearchParams(search);
  const targetParams = queryString ? new URLSearchParams(queryString) : null;

  const pathMatches =
    pathname === path ||
    (path !== "/dashboard" &&
      pathname.startsWith(`${path}/`) &&
      !isReservedChildPath(pathname, path));

  if (!pathMatches) return false;

  if (path === "/dashboard" && !targetParams) {
    return pathname === "/dashboard";
  }

  if (targetParams) {
    const keys = Array.from(targetParams.keys());
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (currentParams.get(key) !== targetParams.get(key)) return false;
    }
    return pathname === path;
  }

  return true;
}

export function sectionHasActiveChild(
  pathname: string,
  search: string,
  group: NavGroup
): boolean {
  if (group.href && isNavLinkActive(pathname, group.href, search)) {
    return true;
  }
  return group.children?.some((c) => isNavLinkActive(pathname, c.href, search)) ?? false;
}
