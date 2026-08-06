import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedStore } from "@/lib/products";
import {
  getOrderForStore,
  serializeOrderDetail,
  recordStatusChange,
  restockOrderInventory,
  shouldRestockForStatus,
} from "@/lib/orders";
import { updateOrderSchema } from "@/lib/validations/order";
import { sendOrderStatusEmail } from "@/lib/email";
import { getNextStatuses, getStatusLabel } from "@/types/orders";
import type { OrderStatus } from "@/types";
import { createStoreNotification } from "@/lib/notifications/create-store-notification";

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

async function updateOrder(request: Request, orderId: string) {
  const store = await getAuthenticatedStore();
  if (!store) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const existing = await getOrderForStore(orderId, store.id);
  if (!existing) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { status, note, notifyCustomer, paymentStatus, refundedAmount, merchantNote } =
    parsed.data;
  const currentStatus = existing.status as OrderStatus;

  if (status && status === currentStatus && paymentStatus === undefined && merchantNote === undefined && refundedAmount === undefined) {
    return NextResponse.json({ message: "Status unchanged" }, { status: 400 });
  }

  if (status && status !== currentStatus) {
    const allowed = getNextStatuses(currentStatus);
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { message: `Cannot transition from ${currentStatus} to ${status}` },
        { status: 400 }
      );
    }
    if (status === "shipped" && !note?.trim()) {
      return NextResponse.json(
        { message: "Add a delivery note (courier or tracking) before shipping" },
        { status: 400 }
      );
    }
  }

  let emailSent = false;
  let restocked = false;

  await prisma.$transaction(async (tx) => {
    const data: {
      status?: string;
      paymentStatus?: string;
      refundedAmount?: number;
      merchantNote?: string | null;
    } = {};

    if (status && status !== currentStatus) {
      data.status = status;

      // COD collected on delivery
      if (status === "delivered" && existing.paymentMethod === "cod" && existing.paymentStatus === "unpaid") {
        data.paymentStatus = "paid";
      }

      // Terminal refund status syncs payment
      if (status === "refunded") {
        data.paymentStatus = "refunded";
        data.refundedAmount =
          refundedAmount ??
          (existing.refundedAmount > 0 ? existing.refundedAmount : existing.total);
      }
    }

    if (paymentStatus !== undefined) {
      data.paymentStatus = paymentStatus;
      if (paymentStatus === "refunded" && !data.status && currentStatus !== "refunded") {
        const allowed = getNextStatuses(currentStatus);
        if (allowed.includes("refunded")) {
          data.status = "refunded";
        }
      }
      if (paymentStatus === "refunded" || paymentStatus === "partially_refunded") {
        data.refundedAmount =
          refundedAmount ??
          (existing.refundedAmount > 0 ? existing.refundedAmount : existing.total);
      }
    }

    if (refundedAmount !== undefined) {
      data.refundedAmount = refundedAmount;
    }

    if (merchantNote !== undefined) {
      data.merchantNote = merchantNote;
    }

    if (Object.keys(data).length > 0) {
      await tx.order.update({
        where: { id: existing.id },
        data,
      });
    }

    const nextStatus = (data.status ?? currentStatus) as OrderStatus;

    if (status && status !== currentStatus) {
      await recordStatusChange(existing.id, status, note, tx);
    } else if (data.status === "refunded" && currentStatus !== "refunded") {
      await recordStatusChange(existing.id, "refunded", note ?? "Marked as refunded", tx);
    } else if (paymentStatus && paymentStatus !== existing.paymentStatus) {
      await recordStatusChange(
        existing.id,
        nextStatus,
        note ?? `Payment status: ${paymentStatus}`,
        tx
      );
    }

    if (shouldRestockForStatus(nextStatus)) {
      restocked = await restockOrderInventory(
        existing.id,
        existing.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        existing.inventoryRestored,
        tx
      );
    }
  });

  const refreshed = await getOrderForStore(orderId, store.id);
  if (!refreshed) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  const detail = serializeOrderDetail(refreshed);
  const statusChanged = Boolean(status && status !== currentStatus);
  const becameRefunded =
    detail.status === "refunded" && currentStatus !== "refunded";

  if (statusChanged || becameRefunded) {
    void createStoreNotification({
      storeId: store.id,
      kind: "order_status",
      title: `Order ${existing.orderNumber} updated`,
      body: `Status: ${getStatusLabel(detail.status)}`,
      href: `/dashboard/orders/${existing.id}`,
      entityType: "order",
      entityId: existing.id,
    });
  }

  if (notifyCustomer && (statusChanged || becameRefunded)) {
    emailSent = await sendOrderStatusEmail({
      to: existing.customerEmail,
      customerName: existing.customerName,
      orderNumber: existing.orderNumber,
      status: detail.status,
      storeName: store.name,
      total: existing.total,
      currency: store.currency,
      note,
      locale: store.language,
      storeId: store.id,
    });
  }

  return NextResponse.json({
    order: detail,
    emailSent,
    restocked,
  });
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    return await updateOrder(request, params.id);
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json({ message: "Failed to update order" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    return await updateOrder(request, params.id);
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json({ message: "Failed to update order" }, { status: 500 });
  }
}
