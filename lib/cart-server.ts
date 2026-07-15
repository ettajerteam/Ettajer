import { cookies } from "next/headers";
import type { CartItem, ServerCart } from "@/types/cart";
import { getCartItemId } from "@/lib/checkout";

const CART_COOKIE = "ettajer_cart";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function getServerCart(): Promise<ServerCart | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ServerCart;
  } catch {
    return null;
  }
}

export async function setServerCart(cart: ServerCart | null) {
  const cookieStore = await cookies();
  if (!cart || cart.items.length === 0) {
    cookieStore.delete(CART_COOKIE);
    return;
  }
  cookieStore.set(CART_COOKIE, JSON.stringify(cart), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getCartForStore(storeSlug: string): Promise<ServerCart> {
  const cart = await getServerCart();
  if (cart?.storeSlug === storeSlug) return cart;
  return { storeSlug, currency: "MAD", items: [] };
}

export async function addToServerCart(
  storeSlug: string,
  currency: string,
  item: Omit<CartItem, "id" | "quantity"> & { quantity?: number }
): Promise<ServerCart> {
  const cart = await getCartForStore(storeSlug);
  cart.currency = currency;
  const id = getCartItemId(item.productId, item.variant);
  const qty = item.quantity ?? 1;
  const existing = cart.items.find((i) => i.id === id);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + qty, item.inventory);
  } else {
    cart.items.push({
      ...item,
      id,
      quantity: Math.min(qty, item.inventory),
    });
  }

  await setServerCart(cart);
  return cart;
}

export async function updateServerCartItem(
  storeSlug: string,
  itemId: string,
  quantity: number
): Promise<ServerCart> {
  const cart = await getCartForStore(storeSlug);
  const item = cart.items.find((i) => i.id === itemId);
  if (!item) throw new Error("Item not found in cart");

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.id !== itemId);
  } else {
    item.quantity = Math.min(quantity, item.inventory);
  }

  await setServerCart(cart.items.length ? cart : null);
  return cart;
}

export async function removeServerCartItem(
  storeSlug: string,
  itemId: string
): Promise<ServerCart> {
  const cart = await getCartForStore(storeSlug);
  cart.items = cart.items.filter((i) => i.id !== itemId);
  await setServerCart(cart.items.length ? cart : null);
  return cart;
}

export async function clearServerCart() {
  await setServerCart(null);
}
