/**
 * Snapshot merchant activation after first-product / share-store nudges.
 *
 * Usage: npx tsx scripts/measure-activation-nudges.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const REAL = { NOT: { email: { endsWith: "@example.com" } } };

async function main() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const stores = await prisma.store.findMany({
    where: { user: REAL },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      user: {
        select: {
          email: true,
          lastLoginAt: true,
        },
      },
      _count: { select: { products: true } },
    },
  });

  const activeCounts = await prisma.product.groupBy({
    by: ["storeId"],
    where: { status: "active" },
    _count: true,
  });
  const activeMap = Object.fromEntries(
    activeCounts.map((r) => [r.storeId, r._count]),
  );

  const realOrders = await prisma.order.groupBy({
    by: ["storeId"],
    where: { isTest: false },
    _count: true,
  });
  const orderMap = Object.fromEntries(
    realOrders.map((r) => [r.storeId, r._count]),
  );

  let empty = 0;
  let emptyHot = 0;
  let listedNoOrders = 0;
  let hasOrders = 0;
  let withActive = 0;

  for (const s of stores) {
    const active = activeMap[s.id] ?? 0;
    const orders = orderMap[s.id] ?? 0;
    if (active === 0 && s._count.products === 0) {
      empty += 1;
      const recentLogin =
        s.user.lastLoginAt != null && s.user.lastLoginAt >= weekAgo;
      const recentStore = s.createdAt >= weekAgo;
      if (recentLogin || recentStore) emptyHot += 1;
    } else if (active > 0 && orders === 0) {
      listedNoOrders += 1;
      withActive += 1;
    } else if (orders > 0) {
      hasOrders += 1;
      withActive += 1;
    } else if (active > 0) {
      withActive += 1;
    }
  }

  const snapshot = {
    at: new Date().toISOString(),
    totalStores: stores.length,
    emptyStores: empty,
    hotEmpty: emptyHot,
    listedNoOrders,
    withActiveProducts: withActive,
    storesWithOrders: hasOrders,
    note: "Compare hotEmpty / listedNoOrders / storesWithOrders over days after nudges.",
  };

  console.log(JSON.stringify(snapshot, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
