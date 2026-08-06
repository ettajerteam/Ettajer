import { prisma } from "@/lib/db";
import { normalizeSubscriberEmail } from "@/lib/newsletter";
import {
  isRecoStrategy,
  type RecoStrategy,
} from "@/lib/email-marketing/atlas/types";
import { parseProductCommerce } from "@/lib/product-commerce";

/**
 * Resolve product IDs for dynamic email recommendation blocks.
 * Always scoped to storeId; prefers live catalog status=active.
 */
export async function recommendProducts(input: {
  storeId: string;
  email?: string | null;
  strategy: RecoStrategy | string;
  limit?: number;
  seedProductId?: string | null;
}): Promise<string[]> {
  const limit = Math.min(12, Math.max(1, input.limit ?? 3));
  const strategy = isRecoStrategy(input.strategy)
    ? input.strategy
    : "best_sellers";
  const email = input.email
    ? normalizeSubscriberEmail(input.email)
    : null;

  switch (strategy) {
    case "purchase_history":
    case "category_affinity": {
      if (!email) return bestSellers(input.storeId, limit);
      const intel = await prisma.customerIntelligence.findUnique({
        where: { storeId_email: { storeId: input.storeId, email } },
        select: { favoriteProductIds: true, favoriteCategoryIds: true },
      });
      if (strategy === "purchase_history" && intel?.favoriteProductIds.length) {
        return filterActive(
          input.storeId,
          intel.favoriteProductIds.slice(0, limit)
        );
      }
      if (intel?.favoriteCategoryIds[0]) {
        const products = await prisma.product.findMany({
          where: {
            storeId: input.storeId,
            status: "active",
            categoryId: intel.favoriteCategoryIds[0],
          },
          orderBy: { updatedAt: "desc" },
          take: limit,
          select: { id: true },
        });
        if (products.length) return products.map((p) => p.id);
      }
      return bestSellers(input.storeId, limit);
    }
    case "browsing_history":
    case "recently_viewed": {
      if (!email) return bestSellers(input.storeId, limit);
      const views = await prisma.productBrowseEvent.findMany({
        where: {
          storeId: input.storeId,
          email,
          productId: { not: null },
        },
        orderBy: { createdAt: "desc" },
        take: 40,
        select: { productId: true },
      });
      const ids = Array.from(
        new Set(
          views
            .map((v) => v.productId)
            .filter((id): id is string => Boolean(id))
        )
      ).slice(0, limit);
      if (ids.length) return filterActive(input.storeId, ids);
      return bestSellers(input.storeId, limit);
    }
    case "related_products":
    case "frequently_bought_together": {
      const seed = input.seedProductId;
      if (seed) {
        const product = await prisma.product.findFirst({
          where: { id: seed, storeId: input.storeId },
          select: { commerce: true, categoryId: true },
        });
        if (product) {
          const commerce = parseProductCommerce(product.commerce);
          const related = (commerce.relatedProductIds || []).slice(0, limit);
          if (related.length) {
            return filterActive(input.storeId, related);
          }
          if (product.categoryId) {
            const siblings = await prisma.product.findMany({
              where: {
                storeId: input.storeId,
                status: "active",
                categoryId: product.categoryId,
                id: { not: seed },
              },
              take: limit,
              select: { id: true },
            });
            return siblings.map((p) => p.id);
          }
        }
      }
      return bestSellers(input.storeId, limit);
    }
    case "new_arrivals": {
      const products = await prisma.product.findMany({
        where: { storeId: input.storeId, status: "active" },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: { id: true },
      });
      return products.map((p) => p.id);
    }
    case "collection_affinity":
    case "best_sellers":
    default:
      return bestSellers(input.storeId, limit);
  }
}

async function bestSellers(storeId: string, limit: number): Promise<string[]> {
  const items = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: { storeId, status: { notIn: ["cancelled"] } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit * 2,
  });
  const ids = items.map((i) => i.productId);
  const active = await filterActive(storeId, ids);
  if (active.length >= limit) return active.slice(0, limit);

  const fallback = await prisma.product.findMany({
    where: { storeId, status: "active" },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: { id: true },
  });
  return Array.from(new Set([...active, ...fallback.map((p) => p.id)])).slice(
    0,
    limit
  );
}

async function filterActive(storeId: string, ids: string[]): Promise<string[]> {
  if (!ids.length) return [];
  const rows = await prisma.product.findMany({
    where: { storeId, id: { in: ids }, status: "active" },
    select: { id: true },
  });
  const set = new Set(rows.map((r) => r.id));
  return ids.filter((id) => set.has(id));
}

/** Choose incentive based on intelligence labels / churn. */
export async function chooseSmartIncentive(input: {
  storeId: string;
  email: string;
}): Promise<{
  type: "percentage" | "fixed" | "free_shipping" | "gift" | "none";
  value: number;
  reason: string;
  couponCode?: string | null;
}> {
  const email = normalizeSubscriberEmail(input.email);
  const intel = await prisma.customerIntelligence.findUnique({
    where: { storeId_email: { storeId: input.storeId, email } },
  });

  const labels = new Set(intel?.predictiveLabels ?? []);
  if (labels.has("vip") || labels.has("high_value")) {
    return {
      type: "none",
      value: 0,
      reason: "High-value customers convert without discounts",
    };
  }
  if (labels.has("likely_to_churn") || labels.has("inactive")) {
    const coupon = await prisma.coupon.findFirst({
      where: { storeId: input.storeId, type: "percentage" },
      orderBy: { value: "desc" },
    });
    return {
      type: "percentage",
      value: coupon?.value ?? 15,
      reason: "Win-back incentive for inactive / churn-risk contacts",
      couponCode: coupon?.code ?? null,
    };
  }
  if (labels.has("coupon_lovers") || labels.has("window_shoppers")) {
    return {
      type: "percentage",
      value: 10,
      reason: "Discount-sensitive segment",
    };
  }
  if (labels.has("likely_to_buy")) {
    return {
      type: "free_shipping",
      value: 0,
      reason: "High intent — light nudge with free shipping",
    };
  }
  return {
    type: "none",
    value: 0,
    reason: "Default — no incentive required",
  };
}
