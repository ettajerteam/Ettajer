import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { generateOrderNumber } from "@/lib/utils";
import {
  calculateShippingCost,
  parsePaymentGateways,
  parseShippingZones,
} from "@/lib/store-settings";
import { validateCouponForCheckout } from "@/lib/marketing";
import type { ShippingMethod } from "@/types/cart";
import { parseProductImages } from "@/lib/product-images";
import type {
  OrderPaymentMethod,
  OrderPaymentStatus,
  OrderStatus,
  ShippingAddress,
} from "@/types";
import type {
  OrderDetail,
  OrderListItem,
  OrderItemDetail,
  OrderStatusEvent,
} from "@/types/orders";
import { RESTOCK_STATUSES } from "@/types/orders";
import type { CreateOrderInput } from "@/lib/validations/order";
import {
  isValidOrderStatus,
  isValidPaymentMethod,
  isValidPaymentStatus,
} from "@/lib/validations/order";
import { isProductType, productTracksInventory } from "@/lib/product-types";
import { parseShopPreferences } from "@/lib/shop-preferences";
import { calculateOrderTax } from "@/lib/tax";
import { isStripeTestMode } from "@/lib/payments/stripe";
import { createStoreNotification } from "@/lib/notifications/create-store-notification";

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

function parsePaymentMethod(value: unknown): OrderPaymentMethod | null {
  if (typeof value === "string" && isValidPaymentMethod(value)) return value;
  return null;
}

function parsePaymentStatus(value: unknown): OrderPaymentStatus {
  if (typeof value === "string" && isValidPaymentStatus(value)) return value;
  return "unpaid";
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
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  refundedAmount?: number;
  merchantNote?: string | null;
  inventoryRestored?: boolean;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  customerEmail: string;
  customerName: string;
  customerPhone: string | null;
  customerId?: string | null;
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
      barcode?: string | null;
      sku?: string | null;
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
    barcode: item.product.barcode ?? null,
    sku: item.product.sku ?? null,
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
    customerPhone?: string | null;
    paymentMethod?: string | null;
    paymentStatus?: string | null;
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
    customerPhone: order.customerPhone ?? null,
    itemCount: order._count?.items ?? order.items?.length ?? 0,
    paymentMethod: parsePaymentMethod(order.paymentMethod),
    paymentStatus: parsePaymentStatus(order.paymentStatus),
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
    paymentMethod: parsePaymentMethod(order.paymentMethod),
    paymentStatus: parsePaymentStatus(order.paymentStatus),
    refundedAmount: order.refundedAmount ?? 0,
    merchantNote: order.merchantNote ?? null,
    inventoryRestored: order.inventoryRestored ?? false,
    utmSource: order.utmSource ?? null,
    utmMedium: order.utmMedium ?? null,
    utmCampaign: order.utmCampaign ?? null,
    utmTerm: order.utmTerm ?? null,
    utmContent: order.utmContent ?? null,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerId: order.customerId ?? null,
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
        select: {
          title: true,
          images: true,
          ticketPrinterId: true,
          barcode: true,
          sku: true,
        },
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
  note?: string,
  tx?: Prisma.TransactionClient
) {
  const client = tx ?? prisma;
  return client.orderStatusHistory.create({
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

/** Upsert a store-scoped customer and return their id + whether newly created. */
export async function upsertOrderCustomer(
  storeId: string,
  input: {
    email: string;
    name: string;
    phone?: string | null;
    address?: ShippingAddress;
  },
  tx?: Prisma.TransactionClient
): Promise<{ id: string; created: boolean } | null> {
  const client = tx ?? prisma;
  const email = input.email.trim().toLowerCase();
  if (!email) return null;

  const addressJson = input.address
    ? (JSON.parse(JSON.stringify(input.address)) as Prisma.InputJsonValue)
    : undefined;

  const existing = await client.customer.findUnique({
    where: { storeId_email: { storeId, email } },
    select: { id: true },
  });

  if (existing) {
    await client.customer.update({
      where: { id: existing.id },
      data: {
        name: input.name.trim() || undefined,
        phone: input.phone?.trim() || undefined,
        ...(addressJson ? { address: addressJson } : {}),
      },
    });
    return { id: existing.id, created: false };
  }

  const customer = await client.customer.create({
    data: {
      storeId,
      email,
      name: input.name.trim() || null,
      phone: input.phone?.trim() || null,
      address: addressJson,
    },
  });

  return { id: customer.id, created: true };
}

type OrderItemForRestock = { productId: string; quantity: number };

/** Restore inventory for order items once. Returns whether restock happened. */
export async function restockOrderInventory(
  orderId: string,
  items: OrderItemForRestock[],
  alreadyRestored: boolean,
  tx: Prisma.TransactionClient
): Promise<boolean> {
  if (alreadyRestored || items.length === 0) return false;

  const products = await tx.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
    select: { id: true, productType: true },
  });
  const typeById = new Map(products.map((p) => [p.id, p.productType]));

  let restoredAny = false;
  for (const item of items) {
    const rawType = typeById.get(item.productId);
    const type = isProductType(rawType) ? rawType : "physical";
    if (!productTracksInventory(type)) continue;
    await tx.product.update({
      where: { id: item.productId },
      data: { inventory: { increment: item.quantity } },
    });
    restoredAny = true;
  }

  await tx.order.update({
    where: { id: orderId },
    data: { inventoryRestored: true },
  });

  return restoredAny;
}

export function shouldRestockForStatus(status: OrderStatus): boolean {
  return RESTOCK_STATUSES.includes(status);
}

/** Visible on order timeline when merchant new-order email fails. */
export async function recordMerchantNotifyFailure(orderId: string, status = "pending") {
  try {
    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        status,
        note: "Merchant notify failed",
      },
    });
  } catch (err) {
    console.error("[orders] failed to record merchant notify failure:", err);
  }
}

export function ordersToCsv(
  orders: Array<{
    orderNumber: string;
    status: string;
    paymentMethod: string | null;
    paymentStatus: string;
    total: number;
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    couponCode: string | null;
    refundedAmount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    createdAt: Date | string;
    itemCount: number;
  }>,
  currency: string
): string {
  const headers = [
    "Order Number",
    "Status",
    "Payment Method",
    "Payment Status",
    "Customer Name",
    "Customer Email",
    "Customer Phone",
    "Items",
    "Subtotal",
    "Shipping",
    "Tax",
    "Discount",
    "Coupon",
    "Total",
    "Refunded",
    "Currency",
    "Created At",
  ];

  const escape = (value: string | number | null | undefined) => {
    const raw = value == null ? "" : String(value);
    if (/[",\n]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
    return raw;
  };

  const rows = orders.map((o) =>
    [
      o.orderNumber,
      o.status,
      o.paymentMethod ?? "",
      o.paymentStatus,
      o.customerName,
      o.customerEmail,
      o.customerPhone ?? "",
      o.itemCount,
      o.subtotal,
      o.shipping,
      o.tax,
      o.discount,
      o.couponCode ?? "",
      o.total,
      o.refundedAmount,
      currency,
      typeof o.createdAt === "string" ? o.createdAt : o.createdAt.toISOString(),
    ]
      .map(escape)
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export async function createStoreOrder(
  input: CreateOrderInput,
  options?: {
    paymentMethod?: string;
    shippingMethod?: ShippingMethod;
    paymentStatus?: OrderPaymentStatus;
    /** Force test flag (sandbox checkout, admin seed, etc.) */
    isTest?: boolean;
  }
) {
  const store = await prisma.store.findUnique({
    where: { slug: input.storeSlug },
    include: {
      products: {
        where: { id: { in: input.items.map((i) => i.productId) } },
      },
      settings: true,
      user: { select: { email: true } },
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
    if (product.status !== "active") {
      throw new Error(`${product.title} is not available for purchase`);
    }
    const type = isProductType(product.productType) ? product.productType : "physical";
    if (productTracksInventory(type) && product.inventory < item.quantity) {
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
  const zoneShipping = calculateShippingCost(
    subtotal,
    {
      city: input.shippingAddress.city,
      country: input.shippingAddress.country,
    },
    shippingZones
  );
  if (zoneShipping === null && input.shipping == null) {
    throw new Error("Shipping is not available for this destination");
  }
  const shipping = input.shipping ?? zoneShipping ?? 0;

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

  const paymentMethod = parsePaymentMethod(options?.paymentMethod) ?? "cod";
  const paymentStatus: OrderPaymentStatus =
    options?.paymentStatus ??
    (paymentMethod === "stripe" ? "paid" : "unpaid");
  const shopPrefs = parseShopPreferences(store.settings?.seo);
  const taxCalc = calculateOrderTax(shopPrefs.tax, subtotal, discount);
  const merchandiseTax = taxCalc.tax;
  const taxAddToTotal = taxCalc.addToTotal;
  const codFee =
    paymentMethod === "cod" && shopPrefs.codFee > 0 ? shopPrefs.codFee : 0;
  const taxWithFee = merchandiseTax + codFee;
  const total = Math.max(subtotal - discount + shipping + taxAddToTotal + codFee, 0);
  const customerEmail =
    input.customerEmail?.trim() || `guest@${store.slug}.local`;
  const customerNote = input.customerNote?.trim() || null;

  const gateways = parsePaymentGateways(store.settings?.paymentGateways);
  const ownerEmail = (store.user?.email ?? "").toLowerCase();
  const isTestOrder =
    options?.isTest === true ||
    ownerEmail.endsWith("@example.com") ||
    customerEmail.toLowerCase().endsWith("@example.com") ||
    (paymentMethod === "paypal" && gateways.paypalMode !== "live") ||
    (paymentMethod === "stripe" && isStripeTestMode());

  const order = await prisma.$transaction(async (tx) => {
    for (const item of input.items) {
      const product = productMap.get(item.productId)!;
      const type = isProductType(product.productType) ? product.productType : "physical";
      if (!productTracksInventory(type)) continue;

      const updated = await tx.product.updateMany({
        where: { id: item.productId, inventory: { gte: item.quantity } },
        data: { inventory: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        throw new Error(`Insufficient inventory for ${product.title}`);
      }
    }

    if (couponCode) {
      await tx.coupon.updateMany({
        where: { storeId: store.id, code: couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    const customer = await upsertOrderCustomer(
      store.id,
      {
        email: customerEmail,
        name: input.customerName,
        phone: input.customerPhone,
        address: input.shippingAddress,
      },
      tx
    );

    return tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        status: "pending",
        total,
        subtotal,
        shipping,
        tax: taxWithFee,
        discount,
        couponCode,
        paymentMethod,
        paymentStatus,
        isTest: isTestOrder,
        merchantNote: customerNote ? `Customer: ${customerNote}` : null,
        utmSource: input.utmSource?.trim() || null,
        utmMedium: input.utmMedium?.trim() || null,
        utmCampaign: input.utmCampaign?.trim() || null,
        utmTerm: input.utmTerm?.trim() || null,
        utmContent: input.utmContent?.trim() || null,
        customerEmail,
        customerName: input.customerName,
        customerPhone: input.customerPhone ?? null,
        customerId: customer?.id ?? null,
        shippingAddress: input.shippingAddress,
        storeId: store.id,
        items: { create: orderItems },
        statusHistory: {
          create: {
            status: "pending",
            note: [
              "Order placed",
              couponCode ? `Coupon ${couponCode} (-${discount})` : null,
              paymentMethod
                ? `Payment: ${
                    paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : paymentMethod === "stripe"
                        ? "Credit Card"
                        : paymentMethod === "paypal"
                          ? "PayPal"
                          : "Other"
                  }`
                : null,
              options?.shippingMethod
                ? `Shipping: delivery`
                : null,
              codFee > 0 ? `COD fee: ${codFee}` : null,
              isTestOrder ? "Test order" : null,
              customerNote ? `Note: ${customerNote}` : null,
            ]
              .filter(Boolean)
              .join(" · "),
          },
        },
      },
      include: orderInclude,
    });
  });

  void createStoreNotification({
    storeId: store.id,
    kind: "order",
    title: `New order ${order.orderNumber}`,
    body: `${order.customerName} · ${order.total.toLocaleString()} ${store.currency}`,
    href: `/dashboard/orders/${order.id}`,
    entityType: "order",
    entityId: order.id,
  });

  // Stock alerts after inventory decrement
  void (async () => {
    try {
      for (const item of input.items) {
        const product = productMap.get(item.productId);
        if (!product) continue;
        const type = isProductType(product.productType)
          ? product.productType
          : "physical";
        if (!productTracksInventory(type)) continue;
        const updated = await prisma.product.findUnique({
          where: { id: product.id },
          select: { id: true, title: true, inventory: true, status: true },
        });
        if (!updated || updated.status !== "active") continue;
        if (updated.inventory <= 0) {
          await createStoreNotification({
            storeId: store.id,
            kind: "stock",
            title: "Out of stock",
            body: `${updated.title} has 0 left`,
            href: `/dashboard/products/${updated.id}/edit`,
            entityType: "product",
            entityId: updated.id,
          });
        } else if (updated.inventory <= 5) {
          await createStoreNotification({
            storeId: store.id,
            kind: "stock",
            title: "Low stock",
            body: `${updated.title} has ${updated.inventory} left`,
            href: `/dashboard/products/${updated.id}/edit`,
            entityType: "product",
            entityId: updated.id,
          });
        }
      }
    } catch (err) {
      console.error("[notifications] stock check failed", err);
    }
  })();

  return order;
}
