import { NextResponse } from "next/server";
import { updateCartSchema } from "@/lib/validations/checkout";
import { updateServerCartItem, removeServerCartItem } from "@/lib/cart-server";

interface RouteParams {
  params: { id: string };
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const parsed = updateCartSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const cart = await updateServerCartItem(
      parsed.data.storeSlug,
      params.id,
      parsed.data.quantity
    );

    return NextResponse.json(cart);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update cart";
    const status = message === "Item not found in cart" ? 404 : 500;
    console.error("Cart PUT error:", error);
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(request.url);
    const storeSlug = searchParams.get("storeSlug");

    if (!storeSlug) {
      return NextResponse.json({ message: "storeSlug is required" }, { status: 400 });
    }

    const cart = await removeServerCartItem(storeSlug, params.id);
    return NextResponse.json(cart);
  } catch (error) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json({ message: "Failed to remove item" }, { status: 500 });
  }
}
