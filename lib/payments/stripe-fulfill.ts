import { prisma } from "@/lib/db";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { sendMerchantNewOrderEmail } from "@/lib/email/automations";
import { merchantWantsNewOrderEmail } from "@/lib/merchant-alerts";
import { recordMerchantNotifyFailure } from "@/lib/orders";
import { clearServerCart } from "@/lib/cart-server";
import { markAbandonedRecovered } from "@/lib/abandoned";
import { purchaseEventId } from "@/lib/marketing-event-id";
import {
  extractRequestClientHints,
  getMetaCapiConfig,
  isMetaCapiEventEnabled,
  sendMetaCapiEvent,
} from "@/lib/meta-capi";
import { retrieveStripeCheckoutSession } from "@/lib/payments/stripe-checkout";

/**
 * Mark a Stripe-paid order as paid and run post-checkout side effects (idempotent).
 */
export async function fulfillStripePaidOrder(params: {
  orderId: string;
  sessionId: string;
  request?: Request;
}): Promise<{ orderNumber: string; alreadyPaid: boolean } | null> {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      items: { include: { product: { select: { title: true } } } },
      store: { include: { settings: true, user: { select: { email: true, name: true } } } },
    },
  });

  if (!order) return null;

  if (order.paymentStatus === "paid") {
    return { orderNumber: order.orderNumber, alreadyPaid: true };
  }

  if (order.paymentMethod !== "stripe") {
    throw new Error("Order is not a Stripe payment");
  }

  const session = await retrieveStripeCheckoutSession(params.sessionId);
  if (session.payment_status !== "paid" && session.status !== "complete") {
    throw new Error("Stripe payment is not complete yet");
  }

  if (session.metadata?.orderId && session.metadata.orderId !== order.id) {
    throw new Error("Stripe session does not match this order");
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: "paid" },
  });

  await prisma.orderStatusHistory
    .create({
      data: {
        orderId: order.id,
        status: order.status,
        note: `Stripe Checkout ${params.sessionId} paid`,
      },
    })
    .catch(() => {});

  const store = order.store;
  const shippingAddress =
    order.shippingAddress &&
    typeof order.shippingAddress === "object" &&
    order.shippingAddress !== null
      ? (order.shippingAddress as {
          street?: string;
          city?: string;
          postalCode?: string;
          country?: string;
        })
      : {};

  await sendOrderConfirmationEmail({
    to: order.customerEmail,
    customerName: order.customerName,
    orderNumber: order.orderNumber,
    storeName: store.name,
    currency: store.currency,
    subtotal: order.subtotal,
    shipping: order.shipping,
    tax: order.tax,
    total: order.total,
    items: order.items.map((i) => ({
      title: i.product?.title ?? "Item",
      quantity: i.quantity,
      price: i.price,
    })),
    shippingAddress: {
      street: shippingAddress.street ?? "",
      city: shippingAddress.city ?? "",
      postalCode: shippingAddress.postalCode ?? "",
      country: shippingAddress.country ?? "",
    },
    locale: store.language,
    storeId: store.id,
  }).catch((err) => console.error("Order confirmation email failed:", err));

  if (store.user?.email && (await merchantWantsNewOrderEmail(store.id))) {
    const notified = await sendMerchantNewOrderEmail({
      to: store.user.email,
      merchantName: store.user.name ?? "Merchant",
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      total: order.total,
      currency: store.currency,
      orderId: order.id,
      locale: store.language,
    }).catch((err) => {
      console.error("[stripe] merchant notify failed:", err);
      return false;
    });
    if (!notified) {
      await recordMerchantNotifyFailure(order.id, order.status);
    }
  }

  await clearServerCart().catch(() => {});
  await markAbandonedRecovered(store.id, order.customerEmail).catch(() => {});

  if (params.request) {
    const hints = extractRequestClientHints(params.request);
    const metaCfg = getMetaCapiConfig(store.settings);
    if (metaCfg && isMetaCapiEventEnabled(metaCfg, "Purchase")) {
      const contentIds = order.items
        .map((i) => i.productId)
        .filter(Boolean) as string[];
      void sendMetaCapiEvent({
        pixelId: metaCfg.pixelId,
        accessToken: metaCfg.accessToken,
        eventName: "Purchase",
        eventId: purchaseEventId(order.orderNumber),
        testEventCode: metaCfg.testMode ? metaCfg.testEventCode : null,
        diagnostics: {
          storeId: store.id,
          source: "checkout",
          testMode: metaCfg.testMode,
        },
        userData: {
          email: order.customerEmail,
          phone: order.customerPhone,
          firstName: order.customerName?.split(/\s+/)[0] ?? null,
          lastName: order.customerName?.split(/\s+/).slice(1).join(" ") || null,
          city: shippingAddress.city ?? null,
          country: shippingAddress.country ?? null,
          zip: shippingAddress.postalCode ?? null,
          clientIpAddress: hints.clientIpAddress,
          clientUserAgent: hints.clientUserAgent,
          fbp: hints.fbp,
          fbc: hints.fbc,
          externalId: order.customerEmail,
        },
        customData: {
          value: order.total,
          currency: store.currency,
          contentIds: contentIds.length ? contentIds : [order.orderNumber],
          contentType: "product",
          numItems: order.items.reduce((s, i) => s + i.quantity, 0),
        },
      }).catch(() => {});
    }
  }

  return { orderNumber: order.orderNumber, alreadyPaid: false };
}
