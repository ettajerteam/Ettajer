import { prisma } from "@/lib/db";

export interface OrdersSectionCounts {
  orders: number;
  drafts: number;
  abandoned: number;
  returns: number;
}

export interface OrdersListStats {
  total: number;
  pending: number;
  inProgress: number;
  revenue: number;
}

export interface DraftsListStats {
  count: number;
  totalValue: number;
  totalItems: number;
}

export interface AbandonedListStats {
  count: number;
  totalValue: number;
  avgValue: number;
}

export interface ReturnsListStats {
  count: number;
  totalValue: number;
  thisMonth: number;
}

export const EMPTY_ORDERS_SECTION_COUNTS: OrdersSectionCounts = {
  orders: 0,
  drafts: 0,
  abandoned: 0,
  returns: 0,
};

export const EMPTY_ORDERS_LIST_STATS: OrdersListStats = {
  total: 0,
  pending: 0,
  inProgress: 0,
  revenue: 0,
};

export const EMPTY_DRAFTS_LIST_STATS: DraftsListStats = {
  count: 0,
  totalValue: 0,
  totalItems: 0,
};

export const EMPTY_ABANDONED_LIST_STATS: AbandonedListStats = {
  count: 0,
  totalValue: 0,
  avgValue: 0,
};

export const EMPTY_RETURNS_LIST_STATS: ReturnsListStats = {
  count: 0,
  totalValue: 0,
  thisMonth: 0,
};

export async function getOrdersSectionCounts(storeId: string): Promise<OrdersSectionCounts> {
  const [orders, drafts, abandoned, returns] = await Promise.all([
    prisma.order.count({ where: { storeId, status: { not: "draft" } } }),
    prisma.order.count({ where: { storeId, status: "draft" } }),
    prisma.abandonedCheckout.count({ where: { storeId, recoveredAt: null } }),
    prisma.order.count({ where: { storeId, status: "returned" } }),
  ]);
  return { orders, drafts, abandoned, returns };
}

export async function getOrdersListStats(storeId: string): Promise<OrdersListStats> {
  const orders = await prisma.order.findMany({
    where: { storeId, status: { not: "draft" } },
    select: { status: true, total: true },
  });

  const pending = orders.filter((o) => o.status === "pending").length;
  const inProgress = orders.filter((o) => o.status === "processing" || o.status === "shipped").length;
  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  return { total: orders.length, pending, inProgress, revenue };
}

export async function getDraftsListStats(storeId: string): Promise<DraftsListStats> {
  const drafts = await prisma.order.findMany({
    where: { storeId, status: "draft" },
    select: { total: true, _count: { select: { items: true } } },
  });

  return {
    count: drafts.length,
    totalValue: drafts.reduce((sum, d) => sum + d.total, 0),
    totalItems: drafts.reduce((sum, d) => sum + d._count.items, 0),
  };
}

export async function getAbandonedListStats(storeId: string): Promise<AbandonedListStats> {
  const rows = await prisma.abandonedCheckout.findMany({
    where: { storeId, recoveredAt: null },
    select: { subtotal: true },
  });

  const totalValue = rows.reduce((sum, r) => sum + r.subtotal, 0);
  return {
    count: rows.length,
    totalValue,
    avgValue: rows.length > 0 ? totalValue / rows.length : 0,
  };
}

export async function getReturnsListStats(storeId: string): Promise<ReturnsListStats> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { storeId, status: "returned" },
    select: { total: true, updatedAt: true },
  });

  return {
    count: orders.length,
    totalValue: orders.reduce((sum, o) => sum + o.total, 0),
    thisMonth: orders.filter((o) => o.updatedAt >= startOfMonth).length,
  };
}
