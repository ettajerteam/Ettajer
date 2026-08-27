import { prisma } from "@/lib/db";

const REAL_USER = {
  NOT: { email: { endsWith: "@example.com" as const } },
};

export type ActivationStoreRow = {
  storeId: string;
  storeName: string;
  slug: string;
  category: string | null;
  createdAt: Date;
  ageDays: number;
  activeProducts: number;
  draftProducts: number;
  realOrders: number;
  customers: number;
  ownerId: string;
  ownerName: string | null;
  ownerEmail: string;
  founderNumber: number | null;
  lastLoginAt: Date | null;
  marketingEmails: boolean;
  emailVerified: boolean;
};

export type ActivationGapData = {
  funnel: {
    totalStores: number;
    noProducts: number;
    draftOnly: number;
    activeNoOrders: number;
    hasOrders: number;
  };
  hotEmpty: ActivationStoreRow[];
  emptyRecent: ActivationStoreRow[];
  /** All empty stores, prioritized by login recency */
  emptyAll: ActivationStoreRow[];
  draftOnly: ActivationStoreRow[];
  activeNoOrders: ActivationStoreRow[];
  hotEmptyCount: number;
  loggedInEmpty7d: number;
};

function ageDays(date: Date, now: number): number {
  return Math.round(((now - date.getTime()) / 86400000) * 10) / 10;
}

export async function getActivationGap(): Promise<ActivationGapData> {
  const now = Date.now();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const stores = await prisma.store.findMany({
    where: { user: REAL_USER },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          founderNumber: true,
          lastLoginAt: true,
          marketingEmails: true,
          emailVerified: true,
        },
      },
      _count: {
        select: { products: true, customers: true },
      },
    },
  });

  const [activeCounts, draftCounts, realOrderCounts] = await Promise.all([
    prisma.product.groupBy({
      by: ["storeId"],
      where: { status: "active" },
      _count: true,
    }),
    prisma.product.groupBy({
      by: ["storeId"],
      where: { status: { not: "active" } },
      _count: true,
    }),
    prisma.order.groupBy({
      by: ["storeId"],
      where: { isTest: false },
      _count: true,
    }),
  ]);

  const activeMap = Object.fromEntries(
    activeCounts.map((r) => [r.storeId, r._count]),
  );
  const draftMap = Object.fromEntries(
    draftCounts.map((r) => [r.storeId, r._count]),
  );
  const orderMap = Object.fromEntries(
    realOrderCounts.map((r) => [r.storeId, r._count]),
  );

  const noProducts: ActivationStoreRow[] = [];
  const draftOnly: ActivationStoreRow[] = [];
  const activeNoOrders: ActivationStoreRow[] = [];
  let hasOrders = 0;

  for (const s of stores) {
    const active = activeMap[s.id] ?? 0;
    const drafts = draftMap[s.id] ?? 0;
    const orders = orderMap[s.id] ?? 0;
    const row: ActivationStoreRow = {
      storeId: s.id,
      storeName: s.name,
      slug: s.slug,
      category: s.category,
      createdAt: s.createdAt,
      ageDays: ageDays(s.createdAt, now),
      activeProducts: active,
      draftProducts: drafts,
      realOrders: orders,
      customers: s._count.customers,
      ownerId: s.user.id,
      ownerName: s.user.name,
      ownerEmail: s.user.email,
      founderNumber: s.user.founderNumber,
      lastLoginAt: s.user.lastLoginAt,
      marketingEmails: s.user.marketingEmails,
      emailVerified: Boolean(s.user.emailVerified),
    };

    if (active === 0 && s._count.products === 0) noProducts.push(row);
    else if (active === 0 && s._count.products > 0) draftOnly.push(row);
    else if (active > 0 && orders === 0) activeNoOrders.push(row);
    else hasOrders += 1;
  }

  const byLoginThenAge = (a: ActivationStoreRow, b: ActivationStoreRow) => {
    const at = a.lastLoginAt?.getTime() ?? 0;
    const bt = b.lastLoginAt?.getTime() ?? 0;
    if (bt !== at) return bt - at;
    return b.createdAt.getTime() - a.createdAt.getTime();
  };

  const hotEmpty = noProducts
    .filter((r) => {
      const recentLogin = r.lastLoginAt != null && r.lastLoginAt >= weekAgo;
      const recentStore = r.createdAt >= weekAgo;
      return recentLogin || recentStore;
    })
    .sort(byLoginThenAge);

  const loggedInEmpty7d = noProducts.filter(
    (r) => r.lastLoginAt != null && r.lastLoginAt >= weekAgo,
  ).length;

  return {
    funnel: {
      totalStores: stores.length,
      noProducts: noProducts.length,
      draftOnly: draftOnly.length,
      activeNoOrders: activeNoOrders.length,
      hasOrders,
    },
    hotEmpty,
    emptyRecent: [...noProducts]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 25),
    emptyAll: [...noProducts].sort(byLoginThenAge),
    draftOnly: [...draftOnly].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    ),
    activeNoOrders: [...activeNoOrders].sort(
      (a, b) =>
        b.activeProducts - a.activeProducts ||
        (b.lastLoginAt?.getTime() ?? 0) - (a.lastLoginAt?.getTime() ?? 0) ||
        b.createdAt.getTime() - a.createdAt.getTime(),
    ),
    hotEmptyCount: hotEmpty.length,
    loggedInEmpty7d,
  };
}

/** Hot empty stores for first-product nudge emails. */
export async function listHotEmptyStoresForNudge(): Promise<
  {
    storeId: string;
    storeName: string;
    slug: string;
    ownerEmail: string;
    ownerName: string | null;
  }[]
> {
  const data = await getActivationGap();
  return data.hotEmpty.map((r) => ({
    storeId: r.storeId,
    storeName: r.storeName,
    slug: r.slug,
    ownerEmail: r.ownerEmail,
    ownerName: r.ownerName,
  }));
}

/**
 * Tier B: listed products, zero real orders.
 * Prefer catalogs with 2+ products, or recent activity (≤14d).
 */
export async function listShareStoreNudgeTargets(): Promise<
  {
    storeId: string;
    storeName: string;
    slug: string;
    ownerEmail: string;
    ownerName: string | null;
    activeProducts: number;
  }[]
> {
  const now = Date.now();
  const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

  // Full Tier B set (not the admin table cap)
  const stores = await prisma.store.findMany({
    where: {
      user: REAL_USER,
      products: { some: { status: "active" } },
      orders: { none: { isTest: false } },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          email: true,
          lastLoginAt: true,
        },
      },
      _count: {
        select: {
          products: { where: { status: "active" } },
        },
      },
    },
  });

  const rows = stores
    .map((s) => ({
      storeId: s.id,
      storeName: s.name,
      slug: s.slug,
      ownerEmail: s.user.email,
      ownerName: s.user.name,
      activeProducts: s._count.products,
      createdAt: s.createdAt,
      lastLoginAt: s.user.lastLoginAt,
    }))
    .filter((r) => {
      const recent =
        r.createdAt >= twoWeeksAgo ||
        (r.lastLoginAt != null && r.lastLoginAt >= twoWeeksAgo);
      return r.activeProducts >= 2 || recent;
    })
    .sort((a, b) => b.activeProducts - a.activeProducts);

  // One email per owner — keep strongest catalog
  const byEmail = new Map<string, (typeof rows)[number]>();
  for (const r of rows) {
    const prev = byEmail.get(r.ownerEmail);
    if (!prev || r.activeProducts > prev.activeProducts) {
      byEmail.set(r.ownerEmail, r);
    }
  }

  return Array.from(byEmail.values()).map(
    ({ storeId, storeName, slug, ownerEmail, ownerName, activeProducts }) => ({
      storeId,
      storeName,
      slug,
      ownerEmail,
      ownerName,
      activeProducts,
    }),
  );
}
