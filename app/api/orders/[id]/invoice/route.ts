import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/db";
import { getAuthenticatedStore } from "@/lib/products";
import { getOrderForStore, serializeOrderDetail } from "@/lib/orders";
import { InvoiceDocument } from "@/components/orders/invoice-document";
import { getAppUrl } from "@/lib/app-url";
import { parseShopPreferences } from "@/lib/shop-preferences";
import type { ReactElement } from "react";

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

    const serialized = serializeOrderDetail(order);
    const baseUrl = getAppUrl();
    const logoUrl = store.logo
      ? store.logo.startsWith("http")
        ? store.logo
        : `${baseUrl}${store.logo}`
      : null;

    const settings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id },
      select: { seo: true },
    });
    const shop = parseShopPreferences(settings?.seo);
    const invoice = shop.invoice;

    const buffer = await renderToBuffer(
      InvoiceDocument({
        order: serialized,
        storeName: store.name,
        storeLogo: logoUrl,
        currency: store.currency,
        documentTitle: invoice.documentTitle,
        footerNote: invoice.footerNote,
        showLogo: invoice.showLogo,
        showPaymentStatus: invoice.showPaymentStatus,
        companyDetails: invoice.companyDetails,
        template: invoice.template,
        showTax: shop.tax.showOnInvoice,
        taxLabel: shop.tax.label,
      }) as ReactElement
    );
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Invoice generation error:", error);
    return NextResponse.json({ message: "Failed to generate invoice" }, { status: 500 });
  }
}
