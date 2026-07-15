import { prisma } from "@/lib/db";

export interface CouponRow {
  id: string;
  code: string;
  type: string;
  value: number;
  minPurchase: number | null;
  maxDiscount: number | null;
  expiresAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  createdAt: string;
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  totalRedemptions: number;
  revenueDiscounted: number;
}

export async function listCoupons(storeId: string) {
  return prisma.coupon.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  });
}

export function serializeCoupon(coupon: {
  id: string;
  code: string;
  type: string;
  value: number;
  minPurchase: number | null;
  maxDiscount: number | null;
  usedCount: number;
  usageLimit: number | null;
  expiresAt: Date | null;
  createdAt: Date;
}): CouponRow {
  return {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    minPurchase: coupon.minPurchase,
    maxDiscount: coupon.maxDiscount,
    expiresAt: coupon.expiresAt?.toISOString() ?? null,
    usageLimit: coupon.usageLimit,
    usedCount: coupon.usedCount,
    createdAt: coupon.createdAt.toISOString(),
  };
}

export function getCouponStatus(coupon: CouponRow): "active" | "expired" | "depleted" {
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return "expired";
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) return "depleted";
  return "active";
}

export async function getCouponStats(storeId: string): Promise<CouponStats> {
  const [coupons, orders] = await Promise.all([
    prisma.coupon.findMany({ where: { storeId } }),
    prisma.order.findMany({
      where: { storeId, couponCode: { not: null } },
      select: { discount: true, couponCode: true },
    }),
  ]);

  const now = new Date();
  const activeCoupons = coupons.filter((coupon) => {
    if (coupon.expiresAt && coupon.expiresAt < now) return false;
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) return false;
    return true;
  }).length;

  return {
    totalCoupons: coupons.length,
    activeCoupons,
    totalRedemptions: orders.length,
    revenueDiscounted: orders.reduce((sum, order) => sum + order.discount, 0),
  };
}

export async function updateCoupon(
  id: string,
  storeId: string,
  data: {
    code?: string;
    type?: "percentage" | "fixed";
    value?: number;
    minPurchase?: number | null;
    maxDiscount?: number | null;
    usageLimit?: number | null;
    expiresAt?: Date | null;
  }
) {
  const coupon = await prisma.coupon.findFirst({ where: { id, storeId } });
  if (!coupon) throw new Error("Coupon not found");

  if (data.code && data.code.toUpperCase() !== coupon.code) {
    const exists = await prisma.coupon.findFirst({
      where: { storeId, code: data.code.toUpperCase() },
    });
    if (exists) throw new Error("Coupon code already exists");
  }

  return prisma.coupon.update({
    where: { id },
    data: {
      code: data.code ? data.code.toUpperCase() : undefined,
      type: data.type,
      value: data.value,
      minPurchase: data.minPurchase === undefined ? undefined : data.minPurchase,
      maxDiscount: data.maxDiscount === undefined ? undefined : data.maxDiscount,
      usageLimit: data.usageLimit === undefined ? undefined : data.usageLimit,
      expiresAt: data.expiresAt === undefined ? undefined : data.expiresAt,
    },
  });
}

export async function createCoupon(
  storeId: string,
  data: {
    code: string;
    type: "percentage" | "fixed";
    value: number;
    minPurchase?: number;
    maxDiscount?: number;
    usageLimit?: number;
    expiresAt?: Date;
  }
) {
  const exists = await prisma.coupon.findFirst({
    where: { storeId, code: data.code.toUpperCase() },
  });
  if (exists) throw new Error("Coupon code already exists");

  return prisma.coupon.create({
    data: {
      storeId,
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      minPurchase: data.minPurchase ?? null,
      maxDiscount: data.maxDiscount ?? null,
      usageLimit: data.usageLimit ?? null,
      expiresAt: data.expiresAt ?? null,
    },
  });
}

export async function deleteCoupon(id: string, storeId: string) {
  const coupon = await prisma.coupon.findFirst({ where: { id, storeId } });
  if (!coupon) throw new Error("Coupon not found");
  await prisma.coupon.delete({ where: { id } });
}

export function calculateCouponDiscount(
  subtotal: number,
  coupon: { type: string; value: number; maxDiscount: number | null }
): number {
  let discount =
    coupon.type === "percentage" ? (subtotal * coupon.value) / 100 : coupon.value;

  if (coupon.maxDiscount != null) {
    discount = Math.min(discount, coupon.maxDiscount);
  }

  return Math.min(Math.max(discount, 0), subtotal);
}

export async function validateCouponForCheckout(
  storeId: string,
  code: string,
  subtotal: number
) {
  const coupon = await prisma.coupon.findFirst({
    where: { storeId, code: code.trim().toUpperCase() },
  });

  if (!coupon) {
    throw new Error("Invalid discount code");
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new Error("This discount code has expired");
  }

  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("This discount code has reached its usage limit");
  }

  if (coupon.minPurchase != null && subtotal < coupon.minPurchase) {
    throw new Error(
      `Minimum order of ${coupon.minPurchase} required for this code`
    );
  }

  const discount = calculateCouponDiscount(subtotal, coupon);

  return { coupon, discount };
}
