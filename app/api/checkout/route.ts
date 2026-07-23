import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkoutSchema } from "@/lib/validations/checkout";
import { createStoreOrder, serializeOrderDetail } from "@/lib/orders";
import { parsePaymentGateways } from "@/lib/store-settings";
import { parseShopPreferences } from "@/lib/shop-preferences";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { clearServerCart } from "@/lib/cart-server";
import { markAbandonedRecovered } from "@/lib/abandoned";
import { formatCurrency } from "@/lib/utils";

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
        { message: "Stripe payments are coming soon. Please use Cash on Delivery." },
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

    const order = await createStoreOrder(
      {
        ...input,
        tax: 0,
      },
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
      total: detail.total,
      items: detail.items.map((i) => ({
        title: i.title,
        quantity: i.quantity,
        price: i.price,
      })),
      shippingAddress: detail.shippingAddress,
      locale: store.language,
    }).catch((err) => console.error("Order confirmation email failed:", err));

    await clearServerCart();

    await markAbandonedRecovered(store.id, detail.customerEmail).catch(() => {});

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
