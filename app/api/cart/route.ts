import { NextResponse } from "next/server";
import { addToCartSchema } from "@/lib/validations/checkout";
import { getCartForStore, addToServerCart } from "@/lib/cart-server";
import { prisma } from "@/lib/db";
import { createMarketingEventId } from "@/lib/marketing-event-id";
import {
  extractRequestClientHints,
  getMetaCapiConfig,
  isMetaCapiEventEnabled,
  sendMetaCapiEvent,
} from "@/lib/meta-capi";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeSlug = searchParams.get("storeSlug");

    if (!storeSlug) {
      return NextResponse.json({ message: "storeSlug is required" }, { status: 400 });
    }

    const cart = await getCartForStore(storeSlug);
    return NextResponse.json(cart);
  } catch (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json({ message: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = addToCartSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.inventory <= 0) {
      return NextResponse.json({ message: "Product is out of stock" }, { status: 400 });
    }

    const cart = await addToServerCart(data.storeSlug, data.currency, {
      productId: data.productId,
      title: data.title,
      slug: data.slug,
      image: data.image ?? null,
      price: data.price,
      quantity: data.quantity,
      variant: data.variant ?? null,
      inventory: data.inventory,
    });

    // Meta CAPI AddToCart (deduped with browser via eventId)
    void (async () => {
      try {
        const store = await prisma.store.findUnique({
          where: { slug: data.storeSlug },
          include: { settings: true },
        });
        const config = getMetaCapiConfig(store?.settings?.marketingIntegrations);
        if (!store || !config || !isMetaCapiEventEnabled(config, "AddToCart")) return;

        const eventId = data.eventId ?? createMarketingEventId("cart");
        const hints = extractRequestClientHints(request);
        const referer = request.headers.get("referer");

        await sendMetaCapiEvent({
          pixelId: config.pixelId,
          accessToken: config.accessToken,
          eventName: "AddToCart",
          eventId,
          eventSourceUrl: referer,
          testEventCode: config.testMode ? config.testEventCode : null,
          diagnostics: {
            storeId: store.id,
            source: "cart",
            testMode: config.testMode,
          },
          userData: {
            clientIpAddress: hints.clientIpAddress,
            clientUserAgent: hints.clientUserAgent,
            fbp: hints.fbp,
            fbc: hints.fbc,
          },
          customData: {
            value: data.price * data.quantity,
            currency: data.currency,
            contentName: data.title,
            contentIds: [data.productId],
            contentType: "product",
            numItems: data.quantity,
            contents: [
              {
                id: data.productId,
                quantity: data.quantity,
                itemPrice: data.price,
              },
            ],
          },
        });
      } catch (err) {
        console.error("[cart] Meta CAPI AddToCart failed:", err);
      }
    })();

    void (async () => {
      try {
        const store = await prisma.store.findUnique({
          where: { slug: data.storeSlug },
          include: { settings: true },
        });
        if (!store) return;
        const { maybeSendPinterestCapi } = await import(
          "@/lib/pinterest-capi-send"
        );
        const { createMarketingEventId } = await import(
          "@/lib/marketing-event-id"
        );
        const eventId = data.eventId ?? createMarketingEventId("cart");
        const referer = request.headers.get("referer");
        await maybeSendPinterestCapi({
          marketingIntegrations: store.settings?.marketingIntegrations,
          storeId: store.id,
          request,
          eventName: "AddToCart",
          eventId,
          source: "cart",
          eventSourceUrl: referer,
          customData: {
            value: data.price * data.quantity,
            currency: data.currency,
            contentName: data.title,
            contentIds: [data.productId],
            contentType: "product",
            numItems: data.quantity,
            contents: [
              {
                id: data.productId,
                quantity: data.quantity,
                itemPrice: data.price,
              },
            ],
          },
        });
      } catch (err) {
        console.error("[cart] Pinterest CAPI AddToCart failed:", err);
      }
    })();

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Cart POST error:", error);
    return NextResponse.json({ message: "Failed to add item to cart" }, { status: 500 });
  }
}
