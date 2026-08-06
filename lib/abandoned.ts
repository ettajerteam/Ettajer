import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { createStoreNotification } from "@/lib/notifications/create-store-notification";

export interface AbandonedItem {
  productId: string;
  title: string;
  quantity: number;
  price: number;
}

export interface AbandonedCheckoutRow {
  id: string;
  email: string | null;
  customerName: string | null;
  phone: string | null;
  items: AbandonedItem[];
  subtotal: number;
  recoveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function listAbandonedCheckouts(storeId: string, search?: string) {
  const where: Record<string, unknown> = {
    storeId,
    recoveredAt: null,
  };

  if (search?.trim()) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
    ];
  }

  return prisma.abandonedCheckout.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });
}

export function serializeAbandoned(row: {
  id: string;
  email: string | null;
  customerName: string | null;
  phone: string | null;
  items: unknown;
  subtotal: number;
  recoveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): AbandonedCheckoutRow {
  const items = Array.isArray(row.items) ? (row.items as AbandonedItem[]) : [];
  return {
    id: row.id,
    email: row.email,
    customerName: row.customerName,
    phone: row.phone,
    items,
    subtotal: row.subtotal,
    recoveredAt: row.recoveredAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function saveAbandonedCheckout(
  storeId: string,
  data: {
    email?: string;
    customerName?: string;
    phone?: string;
    items: AbandonedItem[];
    subtotal: number;
  }
) {
  if (!data.email && !data.customerName) return null;
  if (data.items.length === 0) return null;

  const existing = data.email
    ? await prisma.abandonedCheckout.findFirst({
        where: { storeId, email: data.email, recoveredAt: null },
        orderBy: { updatedAt: "desc" },
      })
    : null;

  if (existing) {
    return prisma.abandonedCheckout.update({
      where: { id: existing.id },
      data: {
        customerName: data.customerName ?? existing.customerName,
        phone: data.phone ?? existing.phone,
        items: data.items as unknown as Prisma.InputJsonValue,
        subtotal: data.subtotal,
      },
    });
  }

  const created = await prisma.abandonedCheckout.create({
    data: {
      storeId,
      email: data.email ?? null,
      customerName: data.customerName ?? null,
      phone: data.phone ?? null,
      items: data.items as unknown as Prisma.InputJsonValue,
      subtotal: data.subtotal,
    },
  });

  const who =
    created.customerName?.trim() || created.email?.trim() || "A shopper";
  void createStoreNotification({
    storeId,
    kind: "abandoned",
    title: "Abandoned checkout",
    body: `${who} · ${created.subtotal.toLocaleString()}`,
    href: "/dashboard/orders/abandoned",
    entityType: "abandoned",
    entityId: created.id,
  });

  if (created.email?.trim()) {
    void import("@/lib/email-marketing/automations").then(({ runEmailMarketingAutomation }) =>
      runEmailMarketingAutomation({
        storeId,
        trigger: "abandoned_cart",
        to: created.email!.trim(),
        context: {
          cartId: created.id,
        },
      })
    );
  }

  return created;
}

export async function markAbandonedRecovered(storeId: string, email: string) {
  await prisma.abandonedCheckout.updateMany({
    where: { storeId, email, recoveredAt: null },
    data: { recoveredAt: new Date() },
  });
}

export async function deleteAbandonedCheckout(id: string, storeId: string) {
  const row = await prisma.abandonedCheckout.findFirst({ where: { id, storeId } });
  if (!row) throw new Error("Not found");
  await prisma.abandonedCheckout.delete({ where: { id } });
}

export async function createDraftFromAbandoned(storeId: string, abandonedId: string) {
  const { createDraft } = await import("@/lib/drafts");

  const row = await prisma.abandonedCheckout.findFirst({
    where: { id: abandonedId, storeId, recoveredAt: null },
  });
  if (!row) throw new Error("Abandoned checkout not found");

  const items = Array.isArray(row.items) ? (row.items as unknown as AbandonedItem[]) : [];
  if (items.length === 0) throw new Error("Cart has no items");

  const draft = await createDraft(storeId, {
    customerName: row.customerName ?? "",
    customerEmail: row.email ?? "",
    customerPhone: row.phone,
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    items: items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
    shipping: 0,
    tax: 0,
    discount: 0,
    paymentMethod: "cod",
  });

  await prisma.abandonedCheckout.delete({ where: { id: row.id } });

  return draft;
}
