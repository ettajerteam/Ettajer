import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedStore } from "@/lib/products";
import {
  serializeOrderListItem,
  serializeOrderDetail,
  createStoreOrder,
} from "@/lib/orders";
import { sendMerchantNewOrderEmail } from "@/lib/email/automations";
import { createOrderSchema, isValidOrderStatus } from "@/lib/validations/order";

export async function GET(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const search = searchParams.get("search")?.trim();

    const where: Record<string, unknown> = {
      storeId: store.id,
      status: { not: "draft" },
    };

    if (status && status !== "all" && isValidOrderStatus(status)) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        (where.createdAt as Record<string, Date>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        (where.createdAt as Record<string, Date>).lte = end;
      }
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      orders: orders.map(serializeOrderListItem),
      currency: store.currency,
    });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }
}

/** Create order from storefront checkout */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const order = await createStoreOrder(parsed.data);

    const storeOwner = await prisma.store.findUnique({
      where: { slug: parsed.data.storeSlug },
      select: {
        currency: true,
        language: true,
        user: { select: { email: true, name: true } },
      },
    });

    if (storeOwner?.user.email) {
      void sendMerchantNewOrderEmail({
        to: storeOwner.user.email,
        merchantName: storeOwner.user.name ?? "Merchant",
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        total: order.total,
        currency: storeOwner.currency,
        orderId: order.id,
        locale: storeOwner.language,
      }).catch((err) => console.error("[orders] merchant notify failed:", err));
    }

    return NextResponse.json(
      { order: serializeOrderDetail(order) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order create error:", error);
    const message = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json({ message }, { status: 400 });
  }
}
