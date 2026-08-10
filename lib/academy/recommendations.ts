import { prisma } from "@/lib/db";

export type AcademyRecommendation = {
  id: string;
  title: string;
  body: string;
  href: string;
  cta: string;
};

/** One lightweight contextual nudge — never blocking. */
export async function getAcademyRecommendations(
  storeId: string,
): Promise<AcademyRecommendation[]> {
  const [productCount, orderCount, themeCount, store] = await Promise.all([
    prisma.product.count({ where: { storeId } }),
    prisma.order.count({ where: { storeId, isTest: false } }),
    prisma.storeTheme.count({ where: { storeId } }),
    prisma.store.findUnique({
      where: { id: storeId },
      select: { name: true, logo: true },
    }),
  ]);

  if (productCount === 0) {
    return [
      {
        id: "no-products",
        title: "Your store is waiting for its first product.",
        body: "Learn how to structure a listing, then add it in your store.",
        href: "/dashboard/academy/platform/first-product",
        cta: "Learn how",
      },
    ];
  }

  if (productCount > 0 && orderCount === 0) {
    return [
      {
        id: "first-sale",
        title: "You've added products. Now let's work on your first sale.",
        body: "Offers, acquisition, and closing — step by step.",
        href: "/dashboard/academy/ecommerce",
        cta: "Start learning",
      },
    ];
  }

  const looksDefault =
    !store?.logo ||
    !store.name ||
    store.name.trim().toLowerCase() === "my store";
  if (themeCount === 0 || looksDefault) {
    return [
      {
        id: "customize-store",
        title: "Your storefront is ready to make it yours.",
        body: "Themes and identity that feel trustworthy on mobile.",
        href: "/dashboard/academy/platform/choose-theme",
        cta: "Customize your store",
      },
    ];
  }

  return [];
}
