import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import { getOrderForStore, serializeOrderDetail } from "@/lib/orders";
import { prisma } from "@/lib/db";
import { parseTicketPrinters } from "@/lib/ticket-printers";
import { buildTicketPrintHtml } from "@/lib/ticket-print";

interface RouteParams {
  params: { id: string };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const order = await getOrderForStore(params.id, store.id);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const settings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id },
      select: { ticketPrinters: true },
    });
    const printers = parseTicketPrinters(settings?.ticketPrinters);

    const { searchParams } = new URL(request.url);
    const printerId = searchParams.get("printer");
    const printAll = searchParams.get("all") === "1";

    const serialized = serializeOrderDetail(order);
    const html = buildTicketPrintHtml({
      order: serialized,
      storeName: store.name,
      printers,
      printerId: printAll ? undefined : printerId,
      printAll,
    });

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Ticket print error:", error);
    return NextResponse.json({ message: "Failed to generate ticket" }, { status: 500 });
  }
}
