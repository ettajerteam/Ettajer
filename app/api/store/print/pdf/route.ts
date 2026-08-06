import { NextResponse } from "next/server";
import { z } from "zod";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/db";
import { getAuthenticatedStore } from "@/lib/products";
import { buildSampleOrderDetail } from "@/lib/print-sample-order";
import { InvoiceDocument } from "@/components/orders/invoice-document";
import { EticketPdfDocument } from "@/components/orders/eticket-pdf-document";
import { getAppUrl } from "@/lib/app-url";
import {
  parseEticketPreferences,
  parseInvoicePreferences,
  parseShopPreferences,
} from "@/lib/shop-preferences";
import type { ReactElement } from "react";

const eticketPrefsSchema = z
  .object({
    template: z.enum(["classic", "compact", "bold"]).optional(),
    size: z.enum(["80x100", "58x40", "40x30"]).optional(),
    onePerUnit: z.boolean().optional(),
    showCustomer: z.boolean().optional(),
    showPrice: z.boolean().optional(),
    showBarcode: z.boolean().optional(),
    showStoreQr: z.boolean().optional(),
    footerNote: z.string().max(80).optional(),
  })
  .optional();

const invoicePrefsSchema = z
  .object({
    template: z.enum(["classic", "minimal", "branded"]).optional(),
    documentTitle: z.string().max(40).optional(),
    footerNote: z.string().max(160).optional(),
    showLogo: z.boolean().optional(),
    showPaymentStatus: z.boolean().optional(),
    companyDetails: z.string().max(280).optional(),
  })
  .optional();

const bodySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("eticket"),
    eticket: eticketPrefsSchema,
  }),
  z.object({
    type: z.literal("invoice"),
    invoice: invoicePrefsSchema,
  }),
]);

export async function POST(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const settings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id },
      select: { seo: true },
    });
    const shop = parseShopPreferences(settings?.seo);
    const sampleOrder = buildSampleOrderDetail(store.name, store.id);

    if (parsed.data.type === "eticket") {
      const eticket = parseEticketPreferences({
        ...shop.eticket,
        ...parsed.data.eticket,
      });
      const firstItem = sampleOrder.items[0];

      const buffer = await renderToBuffer(
        EticketPdfDocument({
          order: sampleOrder,
          item: firstItem,
          storeName: store.name,
          currency: store.currency,
          preferences: eticket,
        }) as ReactElement
      );

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="sample-eticket.pdf"',
          "Cache-Control": "no-store",
        },
      });
    }

    const invoice = parseInvoicePreferences({
      ...shop.invoice,
      ...parsed.data.invoice,
    });

    const baseUrl = getAppUrl();
    const logoUrl = store.logo
      ? store.logo.startsWith("http")
        ? store.logo
        : `${baseUrl}${store.logo}`
      : null;

    const buffer = await renderToBuffer(
      InvoiceDocument({
        order: sampleOrder,
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
        "Content-Disposition": 'attachment; filename="sample-invoice.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Print PDF error:", error);
    return NextResponse.json({ message: "Failed to generate PDF" }, { status: 500 });
  }
}
