import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAuthenticatedStore } from "@/lib/products";
import { getOrderForStore, serializeOrderDetail } from "@/lib/orders";
import { buildEticketPrintHtml } from "@/lib/eticket-print";
import { ensureProductCodes } from "@/lib/product-codes";
import { parseShopPreferences } from "@/lib/shop-preferences";

const bodySchema = z.object({
  orderIds: z.array(z.string().min(1)).min(1).max(50),
  itemIds: z.array(z.string().min(1)).max(100).optional(),
  /** Print one ticket per line item instead of one per quantity unit */
  singlePerItem: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ message: "Select at least one order" }, { status: 400 });
    }

    const uniqueIds = Array.from(new Set(parsed.data.orderIds));
    const orders = [];

    for (const id of uniqueIds) {
      const order = await getOrderForStore(id, store.id);
      if (!order || order.status === "draft") continue;

      // Backfill missing SKU / barcode so printed tickets are scannable
      for (const item of order.items) {
        const product = item.product;
        if (!product) continue;
        if (product.sku && product.barcode) continue;

        const codes = await ensureProductCodes(
          store.id,
          { sku: product.sku, barcode: product.barcode },
          item.productId
        );

        await prisma.product.update({
          where: { id: item.productId },
          data: {
            sku: product.sku || codes.sku,
            barcode: product.barcode || codes.barcode,
          },
        });

        product.sku = product.sku || codes.sku;
        product.barcode = product.barcode || codes.barcode;
      }

      orders.push({
        order: serializeOrderDetail(order),
        currency: store.currency,
      });
    }

    if (orders.length === 0) {
      return NextResponse.json({ message: "No valid orders found" }, { status: 404 });
    }

    const settings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id },
      select: { seo: true },
    });
    const shop = parseShopPreferences(settings?.seo);

    const html = buildEticketPrintHtml({
      orders,
      storeName: store.name,
      storeSlug: store.slug,
      currency: store.currency,
      ...(parsed.data.singlePerItem !== undefined && {
        singlePerItem: parsed.data.singlePerItem,
      }),
      itemIds: parsed.data.itemIds,
      preferences: shop.eticket,
    });

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("E-ticket print error:", error);
    return NextResponse.json({ message: "Failed to generate e-tickets" }, { status: 500 });
  }
}
