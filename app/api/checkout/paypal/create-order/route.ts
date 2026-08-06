import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkoutSchema } from "@/lib/validations/checkout";
import {
  calculateShippingCost,
  isPaypalConnected,
  parsePaymentGateways,
  parseShippingZones,
} from "@/lib/store-settings";
import { parseShopPreferences } from "@/lib/shop-preferences";
import { calculateOrderTax } from "@/lib/tax";
import { validateCheckoutFields } from "@/lib/payments/checkout-field-rules";
import { validateCouponForCheckout } from "@/lib/marketing";
import { createPaypalOrder, getPaypalMode } from "@/lib/payments/paypal";
import { isPaypalCurrencySupported, paypalCurrencyHint } from "@/lib/payments/paypal-currency";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Create a PayPal order for storefront checkout (merchant credentials). */
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
    if (input.paymentMethod !== "paypal") {
      return NextResponse.json(
        { message: "Payment method must be PayPal" },
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
    if (!gateways.paypal || !isPaypalConnected(gateways)) {
      return NextResponse.json(
        {
          message:
            "PayPal is not connected for this store. Ask the merchant to add Client ID and Secret in Settings → Payments.",
        },
        { status: 400 }
      );
    }

    if (!isPaypalCurrencySupported(store.currency)) {
      return NextResponse.json(
        { message: paypalCurrencyHint(store.currency) },
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
    const fieldError = validateCheckoutFields(input, shop.checkoutFields);
    if (fieldError) {
      return NextResponse.json({ message: fieldError }, { status: 400 });
    }
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
        { message: "Order total must be greater than zero for PayPal" },
        { status: 400 }
      );
    }

    const paypalOrder = await createPaypalOrder({
      clientId: gateways.paypalClientId!,
      clientSecret: gateways.paypalClientSecret!,
      mode: getPaypalMode(gateways),
      amount: total,
      currency: store.currency,
      description: `${store.name} order`,
      customId: store.slug,
    });

    return NextResponse.json({
      id: paypalOrder.id,
      mode: getPaypalMode(gateways),
    });
  } catch (error) {
    console.error("PayPal create-order failed:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Could not start PayPal payment",
      },
      { status: 502 }
    );
  }
}
