import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { parseProductImages } from "@/lib/product-images";
import { parseShippingAddress, orderInclude } from "@/lib/orders";
import type { CreateDraftInput, UpdateDraftInput } from "@/lib/validations/draft";
import type { DraftDetail, DraftItemDetail, DraftListItem } from "@/types/drafts";

function generateDraftNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DRF-${timestamp}-${random}`;
}

type DraftWithItems = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: unknown;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product: {
      title: string;
      images: unknown;
      inventory: number;
    };
  }[];
  _count?: { items: number };
};

function serializeDraftItem(item: DraftWithItems["items"][0]): DraftItemDetail {
  const images = parseProductImages(item.product.images);
  return {
    id: item.id,
    productId: item.productId,
    title: item.product.title,
    image: images[0] ?? null,
    quantity: item.quantity,
    price: item.price,
    inventory: item.product.inventory,
  };
}

export function serializeDraftListItem(draft: DraftWithItems): DraftListItem {
  return {
    id: draft.id,
    orderNumber: draft.orderNumber,
    customerName: draft.customerName || "No customer",
    customerEmail: draft.customerEmail || "—",
    customerPhone: draft.customerPhone,
    total: draft.total,
    itemCount: draft._count?.items ?? draft.items?.length ?? 0,
    createdAt: draft.createdAt.toISOString(),
    updatedAt: draft.updatedAt.toISOString(),
  };
}

export function serializeDraftDetail(draft: DraftWithItems): DraftDetail {
  return {
    id: draft.id,
    orderNumber: draft.orderNumber,
    customerName: draft.customerName,
    customerEmail: draft.customerEmail,
    customerPhone: draft.customerPhone,
    shippingAddress: parseShippingAddress(draft.shippingAddress),
    subtotal: draft.subtotal,
    shipping: draft.shipping,
    tax: draft.tax,
    total: draft.total,
    items: draft.items.map(serializeDraftItem),
    createdAt: draft.createdAt.toISOString(),
    updatedAt: draft.updatedAt.toISOString(),
  };
}

const draftInclude = {
  items: {
    include: {
      product: {
        select: { title: true, images: true, inventory: true },
      },
    },
  },
  _count: { select: { items: true } },
};

async function resolveDraftTotals(
  storeId: string,
  items: { productId: string; quantity: number }[],
  shipping = 0,
  tax = 0
) {
  const products = await prisma.product.findMany({
    where: { storeId, id: { in: items.map((i) => i.productId) } },
    select: { id: true, title: true, price: true, inventory: true },
  });

  if (products.length !== items.length) {
    throw new Error("One or more products are invalid");
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  let subtotal = 0;

  const orderItems = items.map((item) => {
    const product = productMap.get(item.productId)!;
    subtotal += product.price * item.quantity;
    return {
      productId: product.id,
      quantity: item.quantity,
      price: product.price,
    };
  });

  const total = subtotal + shipping + tax;
  return { subtotal, shipping, tax, total, orderItems };
}

export async function listDrafts(storeId: string, search?: string) {
  const where: Record<string, unknown> = { storeId, status: "draft" };

  if (search?.trim()) {
    const q = search.trim();
    where.OR = [
      { orderNumber: { contains: q, mode: "insensitive" } },
      { customerName: { contains: q, mode: "insensitive" } },
      { customerEmail: { contains: q, mode: "insensitive" } },
    ];
  }

  return prisma.order.findMany({
    where,
    include: draftInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getDraftForStore(draftId: string, storeId: string) {
  return prisma.order.findFirst({
    where: { id: draftId, storeId, status: "draft" },
    include: draftInclude,
  });
}

export async function createDraft(storeId: string, input: CreateDraftInput) {
  const { subtotal, shipping, tax, total, orderItems } = await resolveDraftTotals(
    storeId,
    input.items,
    input.shipping,
    input.tax
  );

  return prisma.order.create({
    data: {
      orderNumber: generateDraftNumber(),
      status: "draft",
      total,
      subtotal,
      shipping,
      tax,
      customerName: input.customerName ?? "",
      customerEmail: input.customerEmail ?? "",
      customerPhone: input.customerPhone ?? null,
      shippingAddress: input.shippingAddress ?? {},
      storeId,
      items: { create: orderItems },
      statusHistory: {
        create: { status: "draft", note: "Draft order created" },
      },
    },
    include: draftInclude,
  });
}

export async function updateDraft(draftId: string, storeId: string, input: UpdateDraftInput) {
  const existing = await getDraftForStore(draftId, storeId);
  if (!existing) throw new Error("Draft not found");

  const items =
    input.items ??
    existing.items.map((item) => ({ productId: item.productId, quantity: item.quantity }));

  const { subtotal, shipping, tax, total, orderItems } = await resolveDraftTotals(
    storeId,
    items,
    input.shipping ?? existing.shipping,
    input.tax ?? existing.tax
  );

  return prisma.$transaction(async (tx) => {
    if (input.items) {
      await tx.orderItem.deleteMany({ where: { orderId: draftId } });
    }

    await tx.order.update({
      where: { id: draftId },
      data: {
        customerName: input.customerName ?? existing.customerName,
        customerEmail: input.customerEmail ?? existing.customerEmail,
        customerPhone:
          input.customerPhone !== undefined ? input.customerPhone : existing.customerPhone,
        shippingAddress: (input.shippingAddress ??
          existing.shippingAddress) as Prisma.InputJsonValue,
        subtotal,
        shipping,
        tax,
        total,
        ...(input.items ? { items: { create: orderItems } } : {}),
      },
    });

    const updated = await tx.order.findFirst({
      where: { id: draftId, storeId, status: "draft" },
      include: draftInclude,
    });

    if (!updated) throw new Error("Draft not found");
    return updated;
  });
}

export async function convertDraftToOrder(draftId: string, storeId: string) {
  const draft = await getDraftForStore(draftId, storeId);
  if (!draft) throw new Error("Draft not found");
  if (draft.items.length === 0) throw new Error("Add at least one product before completing");

  return prisma.$transaction(async (tx) => {
    for (const item of draft.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new Error("Product no longer exists");
      if (product.inventory < item.quantity) {
        throw new Error(`Insufficient inventory for ${product.title}`);
      }
      await tx.product.update({
        where: { id: item.productId },
        data: { inventory: { decrement: item.quantity } },
      });
    }

    return tx.order.update({
      where: { id: draftId },
      data: {
        status: "pending",
        statusHistory: {
          create: { status: "pending", note: "Draft completed and converted to order" },
        },
      },
      include: orderInclude,
    });
  });
}

export async function deleteDraft(draftId: string, storeId: string) {
  const draft = await getDraftForStore(draftId, storeId);
  if (!draft) throw new Error("Draft not found");

  await prisma.order.delete({ where: { id: draftId } });
}
