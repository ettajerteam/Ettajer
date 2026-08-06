import { prisma } from "@/lib/db";
import { normalizeSubscriberEmail } from "@/lib/newsletter";
import {
  PREDICTIVE_LABELS,
  type PredictiveLabel,
} from "@/lib/email-marketing/atlas/types";

const MODEL_VERSION = "atlas-v1";

export interface CustomerIntelligenceRow {
  email: string;
  lifetimeValue: number;
  averageOrderValue: number;
  totalOrders: number;
  lastOrderAt: string | null;
  daysSinceLastOrder: number | null;
  churnRisk: number;
  purchasePropensity: number;
  predictedNextPurchaseAt: string | null;
  emailEngagementScore: number;
  openRate: number;
  clickRate: number;
  favoriteCategoryIds: string[];
  favoriteProductIds: string[];
  predictiveLabels: PredictiveLabel[];
  preferredLanguage: string | null;
  optimalSendHour: number | null;
  optimalSendDow: number | null;
  revenueFromEmail: number;
  scoredAt: string;
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function serializeIntel(row: {
  email: string;
  lifetimeValue: number;
  averageOrderValue: number;
  totalOrders: number;
  lastOrderAt: Date | null;
  daysSinceLastOrder: number | null;
  churnRisk: number;
  purchasePropensity: number;
  predictedNextPurchaseAt: Date | null;
  emailEngagementScore: number;
  openRate: number;
  clickRate: number;
  favoriteCategoryIds: string[];
  favoriteProductIds: string[];
  predictiveLabels: string[];
  preferredLanguage: string | null;
  optimalSendHour: number | null;
  optimalSendDow: number | null;
  revenueFromEmail: number;
  scoredAt: Date;
}): CustomerIntelligenceRow {
  return {
    email: row.email,
    lifetimeValue: row.lifetimeValue,
    averageOrderValue: row.averageOrderValue,
    totalOrders: row.totalOrders,
    lastOrderAt: row.lastOrderAt?.toISOString() ?? null,
    daysSinceLastOrder: row.daysSinceLastOrder,
    churnRisk: row.churnRisk,
    purchasePropensity: row.purchasePropensity,
    predictedNextPurchaseAt:
      row.predictedNextPurchaseAt?.toISOString() ?? null,
    emailEngagementScore: row.emailEngagementScore,
    openRate: row.openRate,
    clickRate: row.clickRate,
    favoriteCategoryIds: row.favoriteCategoryIds,
    favoriteProductIds: row.favoriteProductIds,
    predictiveLabels: row.predictiveLabels.filter((l) =>
      (PREDICTIVE_LABELS as readonly string[]).includes(l)
    ) as PredictiveLabel[],
    preferredLanguage: row.preferredLanguage,
    optimalSendHour: row.optimalSendHour,
    optimalSendDow: row.optimalSendDow,
    revenueFromEmail: row.revenueFromEmail,
    scoredAt: row.scoredAt.toISOString(),
  };
}

function deriveLabels(input: {
  totalOrders: number;
  lifetimeValue: number;
  daysSinceLastOrder: number | null;
  churnRisk: number;
  purchasePropensity: number;
  couponOrders: number;
  isNew: boolean;
}): PredictiveLabel[] {
  const labels: PredictiveLabel[] = [];
  if (input.purchasePropensity >= 65) labels.push("likely_to_buy");
  if (input.lifetimeValue >= 2000 || input.totalOrders >= 5) labels.push("vip");
  if (input.lifetimeValue >= 1000) labels.push("high_value");
  if (input.totalOrders >= 3) labels.push("frequent_buyers");
  if (
    input.daysSinceLastOrder != null &&
    input.daysSinceLastOrder >= 90 &&
    input.totalOrders > 0
  ) {
    labels.push("inactive");
  }
  if (input.churnRisk >= 70) labels.push("likely_to_churn");
  if (input.couponOrders >= 2) labels.push("coupon_lovers");
  if (input.totalOrders === 0) labels.push("window_shoppers");
  if (input.isNew) labels.push("new_customers");
  if (input.totalOrders >= 2) labels.push("returning_customers");
  // Holiday affinity: recent order in Nov–Dec or high LTV with seasonal gaps
  if (
    input.daysSinceLastOrder != null &&
    input.daysSinceLastOrder < 60 &&
    input.totalOrders >= 1
  ) {
    const month = new Date().getUTCMonth();
    if (month === 10 || month === 11) labels.push("holiday_buyers");
  }
  return Array.from(new Set(labels));
}

/**
 * Score one contact from orders + email engagement. Store-scoped.
 */
export async function scoreCustomerIntelligence(
  storeId: string,
  emailRaw: string
): Promise<CustomerIntelligenceRow> {
  const email = normalizeSubscriberEmail(emailRaw);
  const now = new Date();

  const [orders, events, customer, subscriber] = await Promise.all([
    prisma.order.findMany({
      where: {
        storeId,
        customerEmail: { equals: email, mode: "insensitive" },
        status: { notIn: ["cancelled"] },
      },
      select: {
        total: true,
        couponCode: true,
        createdAt: true,
        items: { select: { productId: true, product: { select: { categoryId: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.emailEvent.findMany({
      where: { storeId, toEmail: email },
      select: { type: true, occurredAt: true },
      orderBy: { occurredAt: "desc" },
      take: 200,
    }),
    prisma.customer.findUnique({
      where: { storeId_email: { storeId, email } },
      select: { language: true, createdAt: true, tags: true },
    }),
    prisma.newsletterSubscriber.findUnique({
      where: { storeId_email: { storeId, email } },
      select: { language: true, createdAt: true },
    }),
  ]);

  const lifetimeValue = orders.reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders ? lifetimeValue / totalOrders : 0;
  const lastOrderAt = orders[0]?.createdAt ?? null;
  const daysSinceLastOrder = lastOrderAt
    ? Math.floor((now.getTime() - lastOrderAt.getTime()) / 86_400_000)
    : null;

  const sent = events.filter((e) => e.type === "sent" || e.type === "delivered").length;
  const opened = events.filter((e) => e.type === "opened").length;
  const clicked = events.filter((e) => e.type === "clicked").length;
  const openRate = sent ? (opened / sent) * 100 : 0;
  const clickRate = sent ? (clicked / sent) * 100 : 0;
  const emailEngagementScore = clamp(openRate * 0.6 + clickRate * 1.4);

  // Churn: higher when days since purchase grow and engagement drops
  let churnRisk = 20;
  if (totalOrders === 0) churnRisk = 35;
  else if (daysSinceLastOrder != null) {
    churnRisk = clamp(daysSinceLastOrder / 1.5);
  }
  churnRisk = clamp(churnRisk + (100 - emailEngagementScore) * 0.25);

  // Purchase propensity: inverse of churn + engagement + recency of browse/order
  let purchasePropensity = clamp(100 - churnRisk * 0.7 + emailEngagementScore * 0.2);
  if (daysSinceLastOrder != null && daysSinceLastOrder < 30) {
    purchasePropensity = clamp(purchasePropensity + 15);
  }
  if (totalOrders === 0 && emailEngagementScore > 40) {
    purchasePropensity = clamp(purchasePropensity + 10);
  }

  const avgGapDays =
    totalOrders >= 2
      ? Math.max(
          7,
          Math.floor(
            (orders[0].createdAt.getTime() -
              orders[orders.length - 1].createdAt.getTime()) /
              (totalOrders - 1) /
              86_400_000
          )
        )
      : 45;
  const predictedNextPurchaseAt =
    lastOrderAt != null
      ? new Date(lastOrderAt.getTime() + avgGapDays * 86_400_000)
      : purchasePropensity >= 60
        ? new Date(now.getTime() + 7 * 86_400_000)
        : null;

  const categoryCounts = new Map<string, number>();
  const productCounts = new Map<string, number>();
  for (const order of orders) {
    for (const item of order.items) {
      productCounts.set(
        item.productId,
        (productCounts.get(item.productId) || 0) + 1
      );
      if (item.product.categoryId) {
        categoryCounts.set(
          item.product.categoryId,
          (categoryCounts.get(item.product.categoryId) || 0) + 1
        );
      }
    }
  }
  const favoriteCategoryIds = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);
  const favoriteProductIds = Array.from(productCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id]) => id);

  const couponOrders = orders.filter((o) => o.couponCode).length;
  const createdAt = customer?.createdAt || subscriber?.createdAt || now;
  const isNew =
    (now.getTime() - createdAt.getTime()) / 86_400_000 <= 30 && totalOrders <= 1;

  const predictiveLabels = deriveLabels({
    totalOrders,
    lifetimeValue,
    daysSinceLastOrder,
    churnRisk,
    purchasePropensity,
    couponOrders,
    isNew,
  });

  // Send-time: use open/click hour distribution
  const hourScores: Record<string, number> = {};
  const dowScores: Record<string, number> = {};
  for (const ev of events) {
    if (ev.type !== "opened" && ev.type !== "clicked") continue;
    const h = ev.occurredAt.getUTCHours();
    const d = ev.occurredAt.getUTCDay();
    hourScores[String(h)] = (hourScores[String(h)] || 0) + 1;
    dowScores[String(d)] = (dowScores[String(d)] || 0) + 1;
  }
  const bestHour = Object.entries(hourScores).sort((a, b) => b[1] - a[1])[0];
  const bestDow = Object.entries(dowScores).sort((a, b) => b[1] - a[1])[0];
  const optimalSendHour = bestHour ? Number(bestHour[0]) : 10;
  const optimalSendDow = bestDow ? Number(bestDow[0]) : null;

  const preferredLanguage =
    customer?.language || subscriber?.language || null;

  const row = await prisma.customerIntelligence.upsert({
    where: { storeId_email: { storeId, email } },
    create: {
      storeId,
      email,
      lifetimeValue,
      averageOrderValue,
      totalOrders,
      lastOrderAt,
      daysSinceLastOrder,
      churnRisk,
      purchasePropensity,
      predictedNextPurchaseAt,
      emailEngagementScore,
      openRate,
      clickRate,
      favoriteCategoryIds,
      favoriteProductIds,
      predictiveLabels,
      preferredLanguage,
      optimalSendHour,
      optimalSendDow,
      modelVersion: MODEL_VERSION,
      scoredAt: now,
    },
    update: {
      lifetimeValue,
      averageOrderValue,
      totalOrders,
      lastOrderAt,
      daysSinceLastOrder,
      churnRisk,
      purchasePropensity,
      predictedNextPurchaseAt,
      emailEngagementScore,
      openRate,
      clickRate,
      favoriteCategoryIds,
      favoriteProductIds,
      predictiveLabels,
      preferredLanguage,
      optimalSendHour,
      optimalSendDow,
      modelVersion: MODEL_VERSION,
      scoredAt: now,
    },
  });

  // Mirror send-time profile
  await prisma.sendTimeProfile.upsert({
    where: { storeId_email: { storeId, email } },
    create: {
      storeId,
      email,
      hourScores,
      dowScores,
      bestHour: optimalSendHour,
      bestDow: optimalSendDow,
      sampleSize: Object.values(hourScores).reduce((a, b) => a + b, 0),
    },
    update: {
      hourScores,
      dowScores,
      bestHour: optimalSendHour,
      bestDow: optimalSendDow,
      sampleSize: Object.values(hourScores).reduce((a, b) => a + b, 0),
    },
  });

  return serializeIntel(row);
}

/** Batch score active subscribers (cron-friendly). */
export async function scoreStoreIntelligence(
  storeId: string,
  limit = 200
): Promise<{ scored: number }> {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { storeId, status: "active" },
    select: { email: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
  let scored = 0;
  for (const sub of subscribers) {
    await scoreCustomerIntelligence(storeId, sub.email);
    scored += 1;
  }
  return { scored };
}

export async function getCustomerIntelligence(
  storeId: string,
  email: string
): Promise<CustomerIntelligenceRow | null> {
  const row = await prisma.customerIntelligence.findUnique({
    where: {
      storeId_email: {
        storeId,
        email: normalizeSubscriberEmail(email),
      },
    },
  });
  return row ? serializeIntel(row) : null;
}

export async function listIntelligenceByLabel(
  storeId: string,
  label: PredictiveLabel,
  take = 50
) {
  const rows = await prisma.customerIntelligence.findMany({
    where: { storeId, predictiveLabels: { has: label } },
    orderBy: { purchasePropensity: "desc" },
    take,
  });
  return rows.map(serializeIntel);
}
