import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkoutSchema } from "@/lib/validations/checkout";
import { createStoreOrder } from "@/lib/orders";
import {
  parsePaymentGateways,
  parseShippingZones,
  calculateShippingCost,
} from "@/lib/store-settings";
import { parseShopPreferences } from "@/lib/shop-preferences";
import { calculateOrderTax } from "@/lib/tax";
import { formatCurrency } from "@/lib/utils";
import { createStripeCheckoutSession } from "@/lib/payments/stripe-checkout";
import { isStripeConnectConfigured, isStripeTestMode } from "@/lib/payments/stripe";
import {
  isStripePaymentsAvailable,
  STRIPE_COMING_SOON_DETAIL,
} from "@/lib/payments/stripe-availability";
import { validateCouponForCheckout } from "@/lib/marketing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Create unpaid order + Stripe Checkout Session (money → connected account). */
export async function POST(request: Request) {
  try {
    if (!isStripePaymentsAvailable()) {
      return NextResponse.json(
        { message: STRIPE_COMING_SOON_DETAIL },
        { status: 503 }
      );
    }

    if (!isStripeConnectConfigured()) {
      return NextResponse.json(
        { message: "Card payments are not configured on this server yet" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid checkout data", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;
    if (input.paymentMethod !== "stripe") {
      return NextResponse.json(
        { message: "Payment method must be Stripe" },
        { status: 400 }
      );
    }

    const store = await prisma.store.findUnique({
      where: { slug: input.storeSlug },
      include: {
        settings: true,
        products: {
          where: { id: { in: input.items.map((i) => i.productId) } },
          select: { id: true, price: true, status: true, title: true },
        },
      },
    });

    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    const gateways = parsePaymentGateways(store.settings?.paymentGateways);
    if (!gateways.stripe || !gateways.stripeAccountId) {
      return NextResponse.json(
        {
          message:
            "Card payments are not connected for this store. Ask the merchant to connect Stripe in Settings → Payments.",
        },
        { status: 400 }
      );
    }

    const paymentAccount = await prisma.paymentAccount.findFirst({
      where: {
        userId: store.userId,
        provider: "stripe",
        accountId: gateways.stripeAccountId,
      },
    });

    if (!paymentAccount?.chargesEnabled) {
      return NextResponse.json(
        {
          message:
            "Stripe onboarding is not finished yet. The merchant must complete Connect so charges are enabled.",
        },
        { status: 400 }
      );
    }

    if (store.products.length !== input.items.length) {
      return NextResponse.json(
        { message: "One or more products are invalid" },
        { status: 400 }
      );
    }

    const priceById = new Map(store.products.map((p) => [p.id, p]));
    let subtotal = 0;
    for (const item of input.items) {
      const product = priceById.get(item.productId);
      if (!product || product.status !== "active") {
        return NextResponse.json(
          { message: `${product?.title ?? "Product"} is not available` },
          { status: 400 }
        );
      }
      subtotal += product.price * item.quantity;
    }

    const shop = parseShopPreferences(store.settings?.seo);
    if (shop.minOrderAmount > 0 && subtotal < shop.minOrderAmount) {
      return NextResponse.json(
        {
          message: `Minimum order is ${formatCurrency(shop.minOrderAmount, store.currency)}`,
        },
        { status: 400 }
      );
    }

    const zones = parseShippingZones(store.settings?.shippingZones);
    const shipping = calculateShippingCost(
      subtotal,
      {
        city: input.shippingAddress.city,
        country: input.shippingAddress.country,
      },
      zones
    );
    if (shipping === null) {
      return NextResponse.json(
        { message: "Shipping is not available for this destination" },
        { status: 400 }
      );
    }

    let discount = 0;
    if (input.couponCode?.trim()) {
      const result = await validateCouponForCheckout(
        store.id,
        input.couponCode,
        subtotal
      );
      discount = result.discount;
    }

    const taxCalc = calculateOrderTax(shop.tax, subtotal, discount);
    const total = Math.max(subtotal - discount + shipping + taxCalc.addToTotal, 0);
    if (total <= 0) {
      return NextResponse.json(
        { message: "Order total must be greater than zero for card payment" },
        { status: 400 }
      );
    }

    const order = await createStoreOrder(
      input,
      {
        paymentMethod: "stripe",
        shippingMethod: input.shippingMethod,
        paymentStatus: "unpaid",
        isTest: isStripeTestMode(),
      }
    );

    const session = await createStripeCheckoutSession({
      connectedAccountId: gateways.stripeAccountId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      storeSlug: store.slug,
      storeName: store.name,
      currency: store.currency,
      amount: order.total,
      customerEmail: input.customerEmail,
      lineItems: order.items.map((i) => ({
        name: priceById.get(i.productId)?.title ?? "Item",
        quantity: i.quantity,
        unitAmount: i.price,
      })),
    });

    if (!session.url) {
      return NextResponse.json(
        { message: "Could not start Stripe Checkout" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Stripe create-session failed:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Could not start card payment",
      },
      { status: 502 }
    );
  }
}
