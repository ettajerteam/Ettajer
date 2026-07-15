import { NextResponse } from "next/server";
import { addToCartSchema } from "@/lib/validations/checkout";
import { getCartForStore, addToServerCart } from "@/lib/cart-server";

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

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Cart POST error:", error);
    return NextResponse.json({ message: "Failed to add item to cart" }, { status: 500 });
  }
}
