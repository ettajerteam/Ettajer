import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import { prisma } from "@/lib/db";
import type { AbandonedItem } from "@/lib/abandoned";
import { sendAbandonedCartEmail } from "@/lib/email/automations";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const row = await prisma.abandonedCheckout.findFirst({
      where: { id: params.id, storeId: store.id, recoveredAt: null },
    });

    if (!row) {
      return NextResponse.json({ message: "Abandoned checkout not found" }, { status: 404 });
    }

    if (!row.email?.trim()) {
      return NextResponse.json({ message: "No email on this cart" }, { status: 400 });
    }

    const items = Array.isArray(row.items)
      ? (row.items as unknown as AbandonedItem[])
      : [];
    if (items.length === 0) {
      return NextResponse.json({ message: "Cart has no items" }, { status: 400 });
    }

    const ok = await sendAbandonedCartEmail({
      to: row.email.trim(),
      customerName: row.customerName?.trim() || "",
      storeName: store.name,
      storeSlug: store.slug,
      currency: store.currency,
      subtotal: row.subtotal,
      items: items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
      locale: store.language,
    });

    if (!ok) {
      return NextResponse.json({ message: "Failed to send email" }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send recovery email";
    return NextResponse.json({ message }, { status: 500 });
  }
}
