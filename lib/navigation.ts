import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  children?: NavItem[];
}

export function parseNavigation(data: unknown): NavItem[] {
  if (!Array.isArray(data)) return defaultNavigation();
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
      children: item.children ? parseNavigation(item.children) : undefined,
    }));
}

export function defaultNavigation(): NavItem[] {
  return [
    { id: "home", label: "Home", href: "/" },
    { id: "products", label: "Products", href: "/products" },
    { id: "collections", label: "Collections", href: "/collections" },
    { id: "about", label: "About", href: "/about" },
    { id: "contact", label: "Contact", href: "/contact" },
  ];
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
