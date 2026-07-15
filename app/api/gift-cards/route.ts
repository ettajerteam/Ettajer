import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import { createGiftCard, deactivateGiftCard, listGiftCards } from "@/lib/gift-cards";

export async function GET() {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const cards = await listGiftCards(store.id);
    return NextResponse.json({ giftCards: cards, currency: store.currency });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const balance = Number(body.balance);
    if (!balance || balance <= 0) {
      return NextResponse.json({ message: "Invalid balance" }, { status: 400 });
    }

    const card = await createGiftCard(store.id, {
      balance,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    });

    return NextResponse.json({ giftCard: card }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ message: "id required" }, { status: 400 });

    await deactivateGiftCard(id, store.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ message }, { status: 400 });
  }
}
