import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkoutSchema } from "@/lib/validations/checkout";
import { z } from "zod";
import {
  createStoreOrder,
  serializeOrderDetail,
  recordMerchantNotifyFailure,
} from "@/lib/orders";
import {
  isPaypalConnected,
  parsePaymentGateways,
} from "@/lib/store-settings";
import { parseShopPreferences } from "@/lib/shop-preferences";
import { validateCheckoutFields } from "@/lib/payments/checkout-field-rules";
import { capturePaypalOrder, getPaypalMode } from "@/lib/payments/paypal";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { sendMerchantNewOrderEmail } from "@/lib/email/automations";
import { merchantWantsNewOrderEmail } from "@/lib/merchant-alerts";
import { clearServerCart } from "@/lib/cart-server";
import { markAbandonedRecovered } from "@/lib/abandoned";
import { purchaseEventId } from "@/lib/marketing-event-id";
import {
  extractRequestClientHints,
  getMetaCapiConfig,
  isMetaCapiEventEnabled,
  sendMetaCapiEvent,
} from "@/lib/meta-capi";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const captureSchema = checkoutSchema.extend({
  paypalOrderId: z.string().min(1),
});

/** Capture PayPal payment and create the Ettajer order as paid. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = captureSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid checkout data", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;
    if (input.paymentMethod !== "paypal") {
      return NextResponse.json(
        { message: "Payment method must be PayPal" },
        { status: 400 }
      );
    }

    const store = await prisma.store.findUnique({
      where: { slug: input.storeSlug },
      include: { settings: true },
    });

    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    const gateways = parsePaymentGateways(store.settings?.paymentGateways);
    if (!gateways.paypal || !isPaypalConnected(gateways)) {
      return NextResponse.json(
        { message: "PayPal is not connected for this store" },
        { status: 400 }
      );
    }

    const shop = parseShopPreferences(store.settings?.seo);
    const fieldError = validateCheckoutFields(input, shop.checkoutFields);
    if (fieldError) {
      return NextResponse.json({ message: fieldError }, { status: 400 });
    }

    const capture = await capturePaypalOrder({
      clientId: gateways.paypalClientId!,
      clientSecret: gateways.paypalClientSecret!,
      mode: getPaypalMode(gateways),
      orderId: input.paypalOrderId,
    });

    if (capture.status !== "COMPLETED" && capture.status !== "PENDING") {
      return NextResponse.json(
        { message: `PayPal payment status: ${capture.status}` },
        { status: 402 }
      );
    }

    const { paypalOrderId: _pid, ...orderInput } = input;
    const order = await createStoreOrder(
      orderInput,
      {
        paymentMethod: "paypal",
        shippingMethod: input.shippingMethod,
        paymentStatus: "paid",
        isTest: getPaypalMode(gateways) !== "live",
      }
    );

    await prisma.orderStatusHistory
      .create({
        data: {
          orderId: order.id,
          status: order.status,
          note: `PayPal capture ${capture.id} (${capture.status})`,
        },
      })
      .catch(() => {});

    const detail = serializeOrderDetail(order);

    await sendOrderConfirmationEmail({
      to: detail.customerEmail,
      customerName: detail.customerName,
      orderNumber: detail.orderNumber,
      storeName: store.name,
      currency: store.currency,
      subtotal: detail.subtotal,
      shipping: detail.shipping,
      tax: detail.tax,
      total: detail.total,
      items: detail.items.map((i) => ({
        title: i.title,
        quantity: i.quantity,
        price: i.price,
      })),
      shippingAddress: detail.shippingAddress,
      locale: store.language,
      storeId: store.id,
    }).catch((err) => console.error("Order confirmation email failed:", err));

    const storeOwner = await prisma.store.findUnique({
      where: { id: store.id },
      select: {
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
        orderNumber: detail.orderNumber,
        customerName: detail.customerName,
        total: detail.total,
        currency: store.currency,
        orderId: detail.id,
        locale: store.language,
      }).catch((err) => {
        console.error("[paypal] merchant notify failed:", err);
        return false;
      });
      if (!notified) {
        await recordMerchantNotifyFailure(detail.id, detail.status);
      }
    }

    await clearServerCart().catch(() => {});
    await markAbandonedRecovered(store.id, detail.customerEmail).catch(() => {});

    void (async () => {
      try {
        const config = getMetaCapiConfig(store.settings?.marketingIntegrations);
        if (!config || !isMetaCapiEventEnabled(config, "Purchase")) return;

        const hints = extractRequestClientHints(request);
        const contentIds = detail.items.map((item) => item.productId).filter(Boolean);
        const numItems = detail.items.reduce((sum, item) => sum + item.quantity, 0);
        const referer = request.headers.get("referer");

        await sendMetaCapiEvent({
          pixelId: config.pixelId,
          accessToken: config.accessToken,
          eventName: "Purchase",
          eventId: purchaseEventId(detail.orderNumber),
          eventSourceUrl: referer,
          testEventCode: config.testMode ? config.testEventCode : null,
          diagnostics: {
            storeId: store.id,
            source: "checkout",
            testMode: config.testMode,
          },
          userData: {
            email: detail.customerEmail,
            phone: detail.customerPhone,
            firstName: detail.customerName?.split(/\s+/)[0] ?? null,
            lastName: detail.customerName?.split(/\s+/).slice(1).join(" ") || null,
            city: detail.shippingAddress?.city ?? null,
            country: detail.shippingAddress?.country ?? null,
            zip: detail.shippingAddress?.postalCode ?? null,
            clientIpAddress: hints.clientIpAddress,
            clientUserAgent: hints.clientUserAgent,
            fbp: hints.fbp,
            fbc: hints.fbc,
            externalId: detail.customerEmail,
          },
          customData: {
            currency: store.currency,
            value: detail.total,
            contentIds,
            numItems,
            orderId: detail.orderNumber,
          },
        });
      } catch {
        /* non-blocking */
      }
    })();

    return NextResponse.json({
      order: {
        id: detail.id,
        orderNumber: detail.orderNumber,
        total: detail.total,
        status: detail.status,
        paymentStatus: detail.paymentStatus,
      },
    });
  } catch (error) {
    console.error("PayPal capture failed:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "PayPal payment failed",
      },
      { status: 502 }
    );
  }
}
