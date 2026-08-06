import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkoutSchema } from "@/lib/validations/checkout";
import { createStoreOrder, serializeOrderDetail, recordMerchantNotifyFailure } from "@/lib/orders";
import { parsePaymentGateways } from "@/lib/store-settings";
import { parseShopPreferences } from "@/lib/shop-preferences";
import { validateCheckoutFields } from "@/lib/payments/checkout-field-rules";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { sendMerchantNewOrderEmail } from "@/lib/email/automations";
import { merchantWantsNewOrderEmail } from "@/lib/merchant-alerts";
import { clearServerCart } from "@/lib/cart-server";
import { markAbandonedRecovered } from "@/lib/abandoned";
import { formatCurrency } from "@/lib/utils";
import { purchaseEventId } from "@/lib/marketing-event-id";
import {
  extractRequestClientHints,
  getMetaCapiConfig,
  isMetaCapiEventEnabled,
  sendMetaCapiEvent,
} from "@/lib/meta-capi";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid checkout data", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;

    const store = await prisma.store.findUnique({
      where: { slug: input.storeSlug },
      include: { settings: true },
    });

    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    const gateways = parsePaymentGateways(store.settings?.paymentGateways);
    const shop = parseShopPreferences(store.settings?.seo);

    const fieldError = validateCheckoutFields(input, shop.checkoutFields);
    if (fieldError) {
      return NextResponse.json({ message: fieldError }, { status: 400 });
    }

    if (input.paymentMethod === "cod" && !gateways.cashOnDelivery) {
      return NextResponse.json(
        { message: "Cash on delivery is not available for this store" },
        { status: 400 }
      );
    }

    if (input.paymentMethod === "stripe") {
      if (!gateways.stripe) {
        return NextResponse.json(
          { message: "Credit card payments are not enabled for this store" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          message:
            "Complete payment with Stripe Checkout — use /api/checkout/stripe/create-session.",
        },
        { status: 400 }
      );
    }

    if (input.paymentMethod === "paypal") {
      if (!gateways.paypal) {
        return NextResponse.json(
          { message: "PayPal is not enabled for this store" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          message:
            "Complete payment with the PayPal button on checkout — this endpoint does not charge PayPal.",
        },
        { status: 400 }
      );
    }

    if (shop.minOrderAmount > 0) {
      const productIds = input.items.map((item) => item.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds }, storeId: store.id },
        select: { id: true, price: true },
      });
      const priceById = new Map(products.map((p) => [p.id, p.price]));
      const subtotal = input.items.reduce((sum, item) => {
        const price = priceById.get(item.productId) ?? 0;
        return sum + price * item.quantity;
      }, 0);
      if (subtotal < shop.minOrderAmount) {
        return NextResponse.json(
          {
            message: `Minimum order is ${formatCurrency(shop.minOrderAmount, store.currency)}`,
          },
          { status: 400 }
        );
      }
    }

    const customerEmailNorm = input.customerEmail.trim().toLowerCase();
    const existingCustomer = customerEmailNorm
      ? await prisma.customer.findUnique({
          where: {
            storeId_email: { storeId: store.id, email: customerEmailNorm },
          },
          select: { id: true },
        })
      : null;

    const order = await createStoreOrder(
      input,
      {
        paymentMethod: input.paymentMethod,
        shippingMethod: input.shippingMethod,
      }
    );

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

    // Marketing automations (optional — separate from transactional receipt)
    const { runEmailMarketingAutomation } = await import(
      "@/lib/email-marketing/automations"
    );
    const email = detail.customerEmail?.trim();
    if (email) {
      void runEmailMarketingAutomation({
        storeId: store.id,
        trigger: "order_placed",
        to: email,
        context: {
          orderId: detail.id,
          customerId: detail.customerId,
        },
      });
      if (!existingCustomer) {
        void runEmailMarketingAutomation({
          storeId: store.id,
          trigger: "customer_created",
          to: email,
          context: {
            customerId: detail.customerId,
            orderId: detail.id,
          },
        });
      }
    }

    const storeOwner = await prisma.store.findUnique({
      where: { id: store.id },
      select: {
        user: { select: { email: true, name: true } },
      },
    });

    if (storeOwner?.user.email && (await merchantWantsNewOrderEmail(store.id))) {
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
        console.error("[checkout] merchant notify failed:", err);
        return false;
      });
      if (!notified) {
        await recordMerchantNotifyFailure(detail.id, detail.status);
      }
    }

    await clearServerCart();

    await markAbandonedRecovered(store.id, detail.customerEmail).catch(() => {});

    // Meta Conversions API Purchase — shared event_id with browser Pixel for dedupe
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
            value: detail.total,
            currency: store.currency,
            contentIds: contentIds.length ? contentIds : [detail.orderNumber],
            contentType: "product",
            numItems: numItems || 1,
            orderId: detail.orderNumber,
            contents: detail.items.map((item) => ({
              id: item.productId,
              quantity: item.quantity,
              itemPrice: item.price,
            })),
          },
        });
      } catch (err) {
        console.error("[checkout] Meta CAPI Purchase failed:", err);
      }
    })();

    void (async () => {
      try {
        const { maybeSendPinterestCapi } = await import(
          "@/lib/pinterest-capi-send"
        );
        const contentIds = detail.items
          .map((item) => item.productId)
          .filter(Boolean);
        const numItems = detail.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const referer = request.headers.get("referer");
        await maybeSendPinterestCapi({
          marketingIntegrations: store.settings?.marketingIntegrations,
          storeId: store.id,
          request,
          eventName: "Purchase",
          eventId: purchaseEventId(detail.orderNumber),
          source: "checkout",
          eventSourceUrl: referer,
          userData: {
            email: detail.customerEmail,
            phone: detail.customerPhone,
            firstName: detail.customerName?.split(/\s+/)[0] ?? null,
            lastName:
              detail.customerName?.split(/\s+/).slice(1).join(" ") || null,
            city: detail.shippingAddress?.city ?? null,
            country: detail.shippingAddress?.country ?? null,
            zip: detail.shippingAddress?.postalCode ?? null,
            externalId: detail.customerEmail,
          },
          customData: {
            value: detail.total,
            currency: store.currency,
            contentIds: contentIds.length ? contentIds : [detail.orderNumber],
            contentType: "product",
            numItems: numItems || 1,
            orderId: detail.orderNumber,
            contents: detail.items.map((item) => ({
              id: item.productId,
              quantity: item.quantity,
              itemPrice: item.price,
            })),
          },
        });
      } catch (err) {
        console.error("[checkout] Pinterest CAPI Purchase failed:", err);
      }
    })();

    return NextResponse.json({
      order: {
        orderNumber: detail.orderNumber,
        total: detail.total,
        status: detail.status,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    console.error("Checkout error:", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
