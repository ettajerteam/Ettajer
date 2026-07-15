import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import {
  calculateShippingCost,
  parseShippingZones,
} from "@/lib/store-settings";
import { calculateCheckoutShipping } from "@/lib/checkout";
import { validateCouponForCheckout } from "@/lib/marketing";
import type { ShippingMethod } from "@/types/cart";
import { parseProductImages } from "@/lib/products";
import type { OrderStatus, ShippingAddress } from "@/types";
import type { OrderDetail, OrderListItem, OrderItemDetail, OrderStatusEvent } from "@/types/orders";
import type { CreateOrderInput } from "@/lib/validations/order";
import { isValidOrderStatus } from "@/lib/validations/order";
export function parseShippingAddress(address: unknown): ShippingAddress {
  if (typeof address === "object" && address !== null) {
    const a = address as Record<string, unknown>;
    return {
      street: String(a.street ?? ""),
      city: String(a.city ?? ""),
      state: a.state ? String(a.state) : undefined,
      postalCode: String(a.postalCode ?? ""),
      country: String(a.country ?? ""),
    };
  }
  return { street: "", city: "", postalCode: "", country: "" };
}

export function parseVariant(variant: unknown): Record<string, string> | null {
  if (typeof variant === "object" && variant !== null && !Array.isArray(variant)) {
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(variant)) {
      if (typeof v === "string") result[k] = v;
    }
    return Object.keys(result).length ? result : null;
  }
  return null;
}

type OrderWithRelations = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  discount?: number;
  couponCode?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  customerEmail: string;
  customerName: string;
  customerPhone: string | null;
  shippingAddress: unknown;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    variant: unknown;
    product: {
      title: string;
      images: unknown;
      ticketPrinterId?: string | null;
    };
  }[];
  statusHistory?: {
    id: string;
    status: string;
    note: string | null;
    createdAt: Date;
  }[];
};

export function serializeOrderItem(item: OrderWithRelations["items"][0]): OrderItemDetail {
  const images = parseProductImages(item.product.images);
  return {
    id: item.id,
    productId: item.productId,
    title: item.product.title,
    image: images[0] ?? null,
    quantity: item.quantity,
    price: item.price,
    variant: parseVariant(item.variant),
    ticketPrinterId: item.product.ticketPrinterId ?? null,
  };
}

export function serializeOrderListItem(
  order: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    customerName: string;
    customerEmail: string;
    createdAt: Date;
    items?: unknown[];
    _count?: { items: number };
  }
): OrderListItem {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: isValidOrderStatus(order.status) ? order.status : "pending",
    total: order.total,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    itemCount: order._count?.items ?? order.items?.length ?? 0,
    createdAt: order.createdAt.toISOString(),
  };
}

export function serializeOrderDetail(order: OrderWithRelations): OrderDetail {
  const history: OrderStatusEvent[] = (order.statusHistory ?? []).map((h) => ({
    id: h.id,
    status: isValidOrderStatus(h.status) ? h.status : "pending",
    note: h.note,
    createdAt: h.createdAt.toISOString(),
  }));

  if (history.length === 0) {
    history.push({
      id: "initial",
      status: isValidOrderStatus(order.status) ? order.status : "pending",
      note: "Order placed",
      createdAt: order.createdAt.toISOString(),
    });
  }

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: isValidOrderStatus(order.status) ? order.status : "pending",
    total: order.total,
    subtotal: order.subtotal,
    shipping: order.shipping,
    tax: order.tax,
    discount: order.discount ?? 0,
    couponCode: order.couponCode ?? null,
    utmSource: order.utmSource ?? null,
    utmMedium: order.utmMedium ?? null,
    utmCampaign: order.utmCampaign ?? null,
    utmTerm: order.utmTerm ?? null,
    utmContent: order.utmContent ?? null,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    shippingAddress: parseShippingAddress(order.shippingAddress),
    items: order.items.map(serializeOrderItem),
    statusHistory: history.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ),
    storeId: order.storeId,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export const orderInclude = {
  items: {
    include: {
      product: {
        select: { title: true, images: true, ticketPrinterId: true },
      },
    },
  },
  statusHistory: {
    orderBy: { createdAt: "asc" as const },
  },
};

export async function getOrderForStore(orderId: string, storeId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, storeId },
    include: orderInclude,
  });
}

export async function recordStatusChange(
  orderId: string,
  status: OrderStatus,
  note?: string
) {
  return prisma.orderStatusHistory.create({
    data: { orderId, status, note: note ?? null },
  });
}

export async function getPublicOrder(storeSlug: string, orderNumber: string) {
  return prisma.order.findFirst({
    where: {
      orderNumber,
      store: { slug: storeSlug },
    },
    include: orderInclude,
  });
}

export async function createStoreOrder(
  input: CreateOrderInput,
  options?: { paymentMethod?: string; shippingMethod?: ShippingMethod }
) {
  const store = await prisma.store.findUnique({
    where: { slug: input.storeSlug },
    include: {
      products: {
        where: { id: { in: input.items.map((i) => i.productId) } },
      },
      settings: true,
    },
  });

  if (!store) {
    throw new Error("Store not found");
  }

  if (store.products.length !== input.items.length) {
    throw new Error("One or more products are invalid");
  }

  const productMap = new Map(store.products.map((p) => [p.id, p]));
  let subtotal = 0;

  const orderItems = input.items.map((item) => {
    const product = productMap.get(item.productId)!;
    if (product.inventory < item.quantity) {
      throw new Error(`Insufficient inventory for ${product.title}`);
    }
    subtotal += product.price * item.quantity;
    return {
      productId: product.id,
      quantity: item.quantity,
      price: product.price,
      variant: item.variant ?? undefined,
    };
  });

  const shippingZones = parseShippingZones(store.settings?.shippingZones);
  const city = input.shippingAddress.city;
  const shipping =
    input.shipping ??
    (options?.shippingMethod
      ? calculateCheckoutShipping(subtotal, options.shippingMethod)
      : calculateShippingCost(subtotal, city, shippingZones));
  const tax = input.tax ?? 0;

  let discount = 0;
  let couponCode: string | null = null;
  if (input.couponCode?.trim()) {
    const { coupon, discount: couponDiscount } = await validateCouponForCheckout(
      store.id,
      input.couponCode,
      subtotal
    );
    discount = couponDiscount;
    couponCode = coupon.code;
  }

  const total = Math.max(subtotal - discount + shipping + tax, 0);

  const order = await prisma.$transaction(async (tx) => {
    for (const item of input.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { inventory: { decrement: item.quantity } },
      });
    }

    if (couponCode) {
      await tx.coupon.updateMany({
        where: { storeId: store.id, code: couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    return tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        status: "pending",
        total,
        subtotal,
        shipping,
        tax,
        discount,
        couponCode,
        utmSource: input.utmSource?.trim() || null,
        utmMedium: input.utmMedium?.trim() || null,
        utmCampaign: input.utmCampaign?.trim() || null,
        utmTerm: input.utmTerm?.trim() || null,
        utmContent: input.utmContent?.trim() || null,
        customerEmail: input.customerEmail,
        customerName: input.customerName,
        customerPhone: input.customerPhone ?? null,
        shippingAddress: input.shippingAddress,
        storeId: store.id,
        items: { create: orderItems },
        statusHistory: {
          create: {
            status: "pending",
            note: [
              "Order placed",
              couponCode ? `Coupon ${couponCode} (-${discount})` : null,
              options?.paymentMethod
                ? `Payment: ${options.paymentMethod === "cod" ? "Cash on Delivery" : "Credit Card"}`
                : null,
              options?.shippingMethod
                ? `Shipping: ${options.shippingMethod === "express" ? "Express" : "Standard"}`
                : null,
            ]
              .filter(Boolean)
              .join(" · "),
          },
        },
      },
      include: orderInclude,
    });
  });

  return order;
}