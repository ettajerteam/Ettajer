import { prisma } from "@/lib/db";
import { scoreMerchantHealth } from "@/lib/admin/merchant-health";

export type SupportMerchantContext = {
  email: string;
  userId: string | null;
  storeId: string | null;
  storeName: string | null;
  storeSlug: string | null;
  healthScore: number | null;
  healthBand: string | null;
  realOrders: number;
  realGmv: number;
  lastActivity: string | null;
  storeStatus: string | null;
};

export async function getSupportMerchantContexts(
  emails: string[]
): Promise<Record<string, SupportMerchantContext>> {
  const unique = Array.from(
    new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))
  );
  if (unique.length === 0) return {};

  const users = await prisma.user.findMany({
    where: {
      OR: unique.map((email) => ({
        email: { equals: email, mode: "insensitive" as const },
      })),
    },
    select: {
      id: true,
      email: true,
      lastLoginAt: true,
      stores: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: {
          id: true,
          name: true,
          slug: true,
          primaryColor: true,
          theme: true,
          websiteTemplateId: true,
          createdAt: true,
          settings: { select: { customDomain: true } },
          _count: { select: { products: true } },
        },
      },
    },
  });

  const storeIds = users.flatMap((u) => u.stores.map((s) => s.id));
  const [activeCounts, realAggs] = await Promise.all([
    storeIds.length
      ? prisma.product.groupBy({
          by: ["storeId"],
          where: { storeId: { in: storeIds }, status: "active" },
          _count: true,
        })
      : Promise.resolve([]),
    storeIds.length
      ? prisma.order.groupBy({
          by: ["storeId"],
          where: { storeId: { in: storeIds }, isTest: false },
          _count: true,
          _sum: { total: true },
        })
      : Promise.resolve([]),
  ]);

  const activeMap = Object.fromEntries(
    activeCounts.map((r) => [r.storeId, r._count])
  );
  const orderMap = Object.fromEntries(
    realAggs.map((r) => [
      r.storeId,
      { count: r._count, gmv: r._sum.total ?? 0 },
    ])
  );

  const out: Record<string, SupportMerchantContext> = {};

  for (const user of users) {
    const key = user.email.trim().toLowerCase();
    const store = user.stores[0] ?? null;
    const active = store ? activeMap[store.id] ?? 0 : 0;
    const orders = store ? orderMap[store.id] ?? { count: 0, gmv: 0 } : { count: 0, gmv: 0 };
    const health = store
      ? scoreMerchantHealth({
          hasStore: true,
          storeCreatedAt: store.createdAt,
          lastLoginAt: user.lastLoginAt,
          productCount: store._count.products,
          activeProductCount: active,
          hasThemeCustomized: Boolean(
            store.primaryColor || store.theme || store.websiteTemplateId
          ),
          hasCustomDomain: Boolean(store.settings?.customDomain),
          realOrders: orders.count,
          realGmv: orders.gmv,
        })
      : null;

    const lastActivity = user.lastLoginAt
      ? user.lastLoginAt.toDateString() === new Date().toDateString()
        ? "Today"
        : user.lastLoginAt.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          })
      : null;

    out[key] = {
      email: user.email,
      userId: user.id,
      storeId: store?.id ?? null,
      storeName: store?.name ?? null,
      storeSlug: store?.slug ?? null,
      healthScore: health?.score ?? null,
      healthBand: health?.bandLabel ?? null,
      realOrders: orders.count,
      realGmv: orders.gmv,
      lastActivity,
      storeStatus: active > 0 ? "Live" : store ? "Not live" : null,
    };
  }

  return out;
}
