import { prisma } from "@/lib/db";
import { USER_STATUS } from "@/lib/founder/constants";
import {
  SUPPORT_MESSAGE_DIRECTION,
  SUPPORT_MESSAGE_STATUS,
} from "@/lib/admin/constants";
import { getPlatformAppErrors } from "@/lib/admin/platform-errors";
import { getAdminAuditLog } from "@/lib/admin/audit";
import { getPlatformMessages as loadSupportMessages } from "@/lib/admin/support-inbox";

export async function getPlatformOverview() {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const realUserWhere = {
    NOT: { email: { endsWith: "@example.com" as const } },
  };

  const [
    totalUsers,
    activeUsers,
    waitingUsers,
    totalStores,
    totalOrders,
    revenueAgg,
    newUsers24h,
    newStores7d,
    newMessages,
    failedLogins24h,
    recentUsers,
    recentMessages,
  ] = await Promise.all([
    prisma.user.count({ where: realUserWhere }),
    prisma.user.count({ where: { status: USER_STATUS.ACTIVE, ...realUserWhere } }),
    prisma.user.count({ where: { status: USER_STATUS.WAITING, ...realUserWhere } }),
    prisma.store.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.user.count({ where: { createdAt: { gte: dayAgo }, ...realUserWhere } }),
    prisma.store.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.supportMessage.count({
      where: {
        status: {
          in: [SUPPORT_MESSAGE_STATUS.NEW, SUPPORT_MESSAGE_STATUS.REVIEWING],
        },
        NOT: { direction: SUPPORT_MESSAGE_DIRECTION.OUTBOUND },
      },
    }),
    prisma.loginAttempt.count({
      where: { success: false, createdAt: { gte: dayAgo } },
    }),
    prisma.user.findMany({
      where: realUserWhere,
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        founderNumber: true,
        role: true,
        createdAt: true,
        _count: { select: { stores: true } },
      },
    }),
    prisma.supportMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      where: {
        NOT: { direction: SUPPORT_MESSAGE_DIRECTION.OUTBOUND },
      },
    }),
  ]);

  return {
    totalUsers,
    activeUsers,
    waitingUsers,
    totalStores,
    totalOrders,
    totalRevenue: revenueAgg._sum.total ?? 0,
    newUsers24h,
    newStores7d,
    newMessages,
    failedLogins24h,
    recentUsers,
    recentMessages,
  };
}

export async function getPlatformUsers() {
  return prisma.user.findMany({
    where: {
      NOT: { email: { endsWith: "@example.com" } },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      role: true,
      founderNumber: true,
      emailVerified: true,
      lastLoginAt: true,
      createdAt: true,
      _count: { select: { stores: true, loginAttempts: true } },
    },
  });
}

export async function getPlatformStores() {
  return prisma.store.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      currency: true,
      createdAt: true,
      user: { select: { email: true, name: true, founderNumber: true } },
      _count: { select: { products: true, orders: true } },
    },
  });
}

export async function getPlatformMessages() {
  return loadSupportMessages();
}

export async function getPlatformAnalytics() {
  const now = new Date();
  const ranges = [7, 30, 90] as const;

  const signupsByDay = await prisma.user.groupBy({
    by: ["createdAt"],
    _count: true,
    where: {
      createdAt: { gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) },
    },
  });

  const ordersByStatus = await prisma.order.groupBy({
    by: ["status"],
    _count: true,
    _sum: { total: true },
  });

  const storeCount = await prisma.store.count();
  const productCount = await prisma.product.count();
  const customerCount = await prisma.customer.count();

  const ordersLast30 = await prisma.order.findMany({
    where: {
      createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
    },
    select: { total: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return {
    ranges,
    signupsByDay,
    ordersByStatus,
    storeCount,
    productCount,
    customerCount,
    ordersLast30,
  };
}

export async function getPlatformErrors() {
  const [loginErrors, appErrors] = await Promise.all([
    prisma.loginAttempt.findMany({
      where: { success: false },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        email: true,
        action: true,
        reason: true,
        ipAddress: true,
        createdAt: true,
        user: { select: { name: true, founderNumber: true } },
      },
    }),
    getPlatformAppErrors(50),
  ]);

  return { loginErrors, appErrors };
}

export async function getPlatformActivity() {
  return getAdminAuditLog(100);
}

export async function getPlatformPayments() {
  const ordersByStatus = await prisma.order.groupBy({
    by: ["status"],
    _count: true,
    _sum: { total: true, subtotal: true, shipping: true },
  });

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      customerName: true,
      customerEmail: true,
      createdAt: true,
      store: { select: { name: true, slug: true, currency: true } },
    },
  });

  const totalRevenue = await prisma.order.aggregate({
    _sum: { total: true },
    _avg: { total: true },
    _count: true,
  });

  return { ordersByStatus, recentOrders, totalRevenue };
}
