import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import {
  deleteAbandonedCheckout,
  listAbandonedCheckouts,
  saveAbandonedCheckout,
  serializeAbandoned,
} from "@/lib/abandoned";

export async function GET(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const search = new URL(request.url).searchParams.get("search")?.trim() ?? "";
    const rows = await listAbandonedCheckouts(store.id, search || undefined);

    return NextResponse.json({
      checkouts: rows.map(serializeAbandoned),
      currency: store.currency,
    });
  } catch (error) {
    console.error("Abandoned error:", error);
    return NextResponse.json({ message: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const storeSlug = body.storeSlug as string;
    if (!storeSlug) return NextResponse.json({ message: "storeSlug required" }, { status: 400 });

    const { prisma } = await import("@/lib/db");
    const store = await prisma.store.findUnique({ where: { slug: storeSlug } });
    if (!store) return NextResponse.json({ message: "Store not found" }, { status: 404 });

    const row = await saveAbandonedCheckout(store.id, {
      email: body.email,
      customerName: body.customerName,
      phone: body.phone,
      items: body.items ?? [],
      subtotal: body.subtotal ?? 0,
    });

    return NextResponse.json({ id: row?.id ?? null });
  } catch (error) {
    console.error("Abandoned save error:", error);
    return NextResponse.json({ message: "Failed to save" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ message: "id required" }, { status: 400 });

    await deleteAbandonedCheckout(id, store.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete";
    return NextResponse.json({ message }, { status: 400 });
  }
}
