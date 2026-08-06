import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedStore } from "@/lib/products";
import { convertDraftToOrder } from "@/lib/drafts";
import {
  serializeOrderDetail,
  parseShippingAddress,
  recordMerchantNotifyFailure,
} from "@/lib/orders";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { sendMerchantNewOrderEmail } from "@/lib/email/automations";
import { merchantWantsNewOrderEmail } from "@/lib/merchant-alerts";
import { z } from "zod";

interface RouteContext {
  params: { id: string };
}

const completeSchema = z.object({
  paymentStatus: z.enum(["unpaid", "paid"]).optional().default("unpaid"),
  notifyCustomer: z.boolean().optional().default(false),
});

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = completeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid options" }, { status: 400 });
    }

    const order = await convertDraftToOrder(params.id, store.id, {
      paymentStatus: parsed.data.paymentStatus,
    });

    let emailSent = false;
    if (parsed.data.notifyCustomer && order.customerEmail) {
      const addr = parseShippingAddress(order.shippingAddress);
      emailSent = await sendOrderConfirmationEmail({
        to: order.customerEmail,
        customerName: order.customerName,
        orderNumber: order.orderNumber,
        storeName: store.name,
        currency: store.currency,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        items: order.items.map((item) => ({
          title: item.product.title,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: {
          street: addr.street,
          city: addr.city,
          postalCode: addr.postalCode,
          country: addr.country,
        },
        storeId: store.id,
      });
    }

    const storeOwner = await prisma.store.findUnique({
      where: { id: store.id },
      select: {
        language: true,
        user: { select: { email: true, name: true } },
      },
    });

    if (
      storeOwner?.user.email &&
      (await merchantWantsNewOrderEmail(store.id))
    ) {
      const notified = await sendMerchantNewOrderEmail({
        to: storeOwner.user.email,
        merchantName: storeOwner.user.name ?? "Merchant",
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        total: order.total,
        currency: store.currency,
        orderId: order.id,
        locale: storeOwner.language,
      }).catch((err) => {
        console.error("[drafts] merchant notify failed:", err);
        return false;
      });
      if (!notified) {
        await recordMerchantNotifyFailure(order.id, order.status);
      }
    }

    return NextResponse.json({
      order: serializeOrderDetail(order),
      emailSent,
    });
  } catch (error) {
    console.error("Draft convert error:", error);
    const message = error instanceof Error ? error.message : "Failed to complete draft";
    const status = message === "Draft not found" ? 404 : 400;
    return NextResponse.json({ message }, { status });
  }
}
