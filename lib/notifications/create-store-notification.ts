import { prisma } from "@/lib/db";
import { parseShopPreferences } from "@/lib/shop-preferences";
import type { NotificationAlerts } from "@/lib/shop-preferences";

export type StoreNotificationKind =
  | "order"
  | "order_status"
  | "message"
  | "stock"
  | "abandoned";

const KIND_TO_ALERT: Record<StoreNotificationKind, keyof NotificationAlerts> = {
  order: "orders",
  order_status: "orderStatus",
  message: "messages",
  stock: "stock",
  abandoned: "abandoned",
};

const DEDUPE_MS = 2 * 60 * 1000;

export type CreateStoreNotificationInput = {
  storeId: string;
  kind: StoreNotificationKind;
  title: string;
  body: string;
  href?: string | null;
  entityType?: string | null;
  entityId?: string | null;
};

/**
 * Persist an in-app merchant notification when the matching alert pref is on.
 * Never throws — safe to call from checkout / order paths.
 */
export async function createStoreNotification(
  input: CreateStoreNotificationInput
): Promise<string | null> {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { storeId: input.storeId },
      select: { seo: true },
    });
    const alerts = parseShopPreferences(settings?.seo).alerts;
    const alertKey = KIND_TO_ALERT[input.kind];
    if (!alerts[alertKey]) return null;

    if (input.entityId) {
      const since = new Date(Date.now() - DEDUPE_MS);
      const existing = await prisma.notification.findFirst({
        where: {
          storeId: input.storeId,
          kind: input.kind,
          entityId: input.entityId,
          createdAt: { gte: since },
          dismissedAt: null,
        },
        select: { id: true },
      });
      if (existing) return existing.id;
    }

    const row = await prisma.notification.create({
      data: {
        storeId: input.storeId,
        kind: input.kind,
        title: input.title.slice(0, 200),
        body: input.body.slice(0, 500),
        href: input.href ?? null,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
      },
      select: { id: true },
    });
    return row.id;
  } catch (err) {
    console.error("[notifications] createStoreNotification failed", err);
    return null;
  }
}
