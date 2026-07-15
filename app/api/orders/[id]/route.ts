import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedStore } from "@/lib/products";
import {
  getOrderForStore,
  serializeOrderDetail,
  recordStatusChange,
} from "@/lib/orders";
import { updateOrderStatusSchema } from "@/lib/validations/order";
import { sendOrderStatusEmail } from "@/lib/email";
import { getNextStatuses } from "@/types/orders";
import type { OrderStatus } from "@/types";

interface RouteParams {
  params: { id: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const order = await getOrderForStore(params.id, store.id);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      order: serializeOrderDetail(order),
      currency: store.currency,
    });
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch order" }, { status: 500 });
  }
}

async function updateOrderStatus(request: Request, orderId: string) {
  const store = await getAuthenticatedStore();
  if (!store) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const existing = await getOrderForStore(orderId, store.id);
  if (!existing) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateOrderStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { status, note, notifyCustomer } = parsed.data;
  const currentStatus = existing.status as OrderStatus;

  if (status === currentStatus) {
    return NextResponse.json({ message: "Status unchanged" }, { status: 400 });
  }

  const allowed = getNextStatuses(currentStatus);
  if (!allowed.includes(status)) {
    return NextResponse.json(
      { message: `Cannot transition from ${currentStatus} to ${status}` },
      { status: 400 }
    );
  }

  await prisma.order.update({
    where: { id: existing.id },
    data: { status },
  });

  await recordStatusChange(existing.id, status, note);

  let emailSent = false;
  if (notifyCustomer) {
    emailSent = await sendOrderStatusEmail({
      to: existing.customerEmail,
      customerName: existing.customerName,
      orderNumber: existing.orderNumber,
      status,
      storeName: store.name,
      total: existing.total,
      currency: store.currency,
      note,
      locale: store.language,
    });
  }

  const refreshed = await getOrderForStore(orderId, store.id);

  return NextResponse.json({
    order: serializeOrderDetail(refreshed!),
    emailSent,
  });
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    return await updateOrderStatus(request, params.id);
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json({ message: "Failed to update order" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    return await updateOrderStatus(request, params.id);
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json({ message: "Failed to update order" }, { status: 500 });
  }
}
