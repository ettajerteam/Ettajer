"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatCurrency, cn } from "@/lib/utils";
import type { PublicStore } from "@/types/storefront";
import type { CartItem } from "@/types/cart";

interface CartLineItemProps {
  item: CartItem;
  store: PublicStore;
}

export function CartLineItem({ item, store }: CartLineItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const [loading, setLoading] = useState(false);

  async function syncQuantity(quantity: number) {
    setLoading(true);
    const prev = item.quantity;
    updateQuantity(item.id, quantity);

    try {
      const res = await fetch(`/api/cart/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeSlug: store.slug, quantity }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const data = await res.json();
      useCartStore.getState().hydrateFromServer(store.slug, data.currency, data.items);
    } catch {
      updateQuantity(item.id, prev);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    setLoading(true);
    removeItem(item.id);

    try {
      const res = await fetch(
        `/api/cart/${item.id}?storeSlug=${encodeURIComponent(store.slug)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to remove");
      const data = await res.json();
      useCartStore.getState().hydrateFromServer(store.slug, data.currency, data.items);
    } catch {
      useCartStore.getState().addItem({ ...item, quantity: item.quantity });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex gap-4 py-4", loading && "opacity-60 pointer-events-none")}>
      <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-gray-100">
        {item.image ? (
          <Image src={item.image} alt={item.title} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">No image</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{item.title}</h4>
        <p className="text-sm text-gray-500 mt-0.5">
          {formatCurrency(item.price, store.currency)}
        </p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => syncQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <button
              type="button"
              onClick={() => syncQuantity(item.quantity + 1)}
              disabled={item.quantity >= item.inventory}
              className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">
              {formatCurrency(item.price * item.quantity, store.currency)}
            </span>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
