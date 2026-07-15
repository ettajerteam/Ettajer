import { prisma } from "@/lib/db";
import { parseShippingAddress } from "@/lib/orders";
import { isValidOrderStatus } from "@/lib/validations/order";
import type {
  CustomerDetail,
  CustomerListItem,
  CustomerOrderSummary,
  CustomerSort,
} from "@/types/customers";

export function encodeCustomerId(email: string): string {
  return Buffer.from(email.toLowerCase(), "utf-8").toString("base64url");
}

export function decodeCustomerId(id: string): string {
  try {
    return Buffer.from(id, "base64url").toString("utf-8");
  } catch {
    return "";
  }
}

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: unknown;
  createdAt: Date;
  _count: { items: number };
};

const orderSelect = {
  id: true,
  orderNumber: true,
  status: true,
  total: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  shippingAddress: true,
  createdAt: true,
  _count: { select: { items: true } },
};

function toSummary(order: OrderRow): CustomerOrderSummary {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: isValidOrderStatus(order.status) ? order.status : "pending",
    total: order.total,
    itemCount: order._count.items,
    createdAt: order.createdAt.toISOString(),
  };
}

export async function listCustomers(
  storeId: string,
  options: { search?: string; sort?: CustomerSort } = {}
): Promise<CustomerListItem[]> {
  const orders = (await prisma.order.findMany({
    where: { storeId, status: { not: "draft" }, customerEmail: { not: "" } },
    select: orderSelect,
    orderBy: { createdAt: "desc" },
  })) as OrderRow[];

  const map = new Map<string, CustomerListItem>();

  for (const order of orders) {
    const email = order.customerEmail.toLowerCase();
    if (!email) continue;

    const existing = map.get(email);
    const createdAtIso = order.createdAt.toISOString();

    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += order.total;
      if (createdAtIso > existing.lastOrderAt) existing.lastOrderAt = createdAtIso;
      if (createdAtIso < existing.firstOrderAt) existing.firstOrderAt = createdAtIso;
      if (!existing.phone && order.customerPhone) existing.phone = order.customerPhone;
    } else {
      map.set(email, {
        id: encodeCustomerId(email),
        name: order.customerName || "Guest",
        email: order.customerEmail,
        phone: order.customerPhone,
        orderCount: 1,
        totalSpent: order.total,
        lastOrderAt: createdAtIso,
        firstOrderAt: createdAtIso,
      });
    }
  }

  let customers = Array.from(map.values());

  const search = options.search?.trim().toLowerCase();
  if (search) {
    customers = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search)
    );
  }

  const sort = options.sort ?? "recent";
  customers.sort((a, b) => {
    switch (sort) {
      case "spent":
        return b.totalSpent - a.totalSpent;
      case "orders":
        return b.orderCount - a.orderCount;
      case "name":
        return a.name.localeCompare(b.name);
      case "recent":
      default:
        return b.lastOrderAt.localeCompare(a.lastOrderAt);
    }
  });

  return customers;
}

export async function getCustomerByEmail(
  storeId: string,
  email: string
): Promise<CustomerDetail | null> {
  if (!email) return null;

  const orders = (await prisma.order.findMany({
    where: {
      storeId,
      status: { not: "draft" },
      customerEmail: { equals: email, mode: "insensitive" },
    },
    select: orderSelect,
    orderBy: { createdAt: "desc" },
  })) as OrderRow[];

  if (orders.length === 0) return null;

  const latest = orders[0];
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const timestamps = orders.map((o) => o.createdAt.toISOString());
  const phone = orders.find((o) => o.customerPhone)?.customerPhone ?? null;
  const address =
    latest.shippingAddress != null ? parseShippingAddress(latest.shippingAddress) : null;

  return {
    id: encodeCustomerId(email),
    name: latest.customerName || "Guest",
    email: latest.customerEmail,
    phone,
    address,
    orderCount: orders.length,
    totalSpent,
    averageOrderValue: totalSpent / orders.length,
    lastOrderAt: timestamps.reduce((a, b) => (a > b ? a : b)),
    firstOrderAt: timestamps.reduce((a, b) => (a < b ? a : b)),
    orders: orders.map(toSummary),
  };
}
