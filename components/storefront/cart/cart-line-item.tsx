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
  /** denser layout for checkout summary */
  compact?: boolean;
  /** read-only in checkout review */
  readOnly?: boolean;
}

export function formatCartVariant(variant: Record<string, string> | null): string | null {
  if (!variant) return null;
  const entries = Object.entries(variant).filter(([, v]) => Boolean(v?.trim()));
  if (entries.length === 0) return null;
  return entries.map(([key, value]) => `${key} ${value}`).join(" · ");
}

export function CartLineItem({ item, store, compact = false, readOnly = false }: CartLineItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const [loading, setLoading] = useState(false);
  const variantLabel = formatCartVariant(item.variant);
  const lineTotal = item.price * item.quantity;

  async function syncQuantity(quantity: number) {
    if (readOnly) return;
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
    if (readOnly) return;
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
    <div
      className={cn(
        "flex gap-3.5 sm:gap-4",
        compact ? "py-3" : "py-5",
        loading && "pointer-events-none opacity-55"
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-neutral-100",
          compact ? "h-16 w-16 rounded-lg" : "h-[4.5rem] w-[4.5rem] rounded-xl sm:h-20 sm:w-20"
        )}
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            sizes={compact ? "64px" : "80px"}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-neutral-400">
            No image
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="truncate text-[13px] font-medium tracking-tight text-neutral-900 sm:text-sm">
              {item.title}
            </h4>
            {variantLabel ? (
              <p className="mt-0.5 text-[12px] leading-snug text-neutral-500">{variantLabel}</p>
            ) : null}
            <p className="mt-1 text-[12px] tabular-nums text-neutral-500">
              {formatCurrency(item.price, store.currency)}
              {item.quantity > 1 ? (
                <span className="text-neutral-400"> each</span>
              ) : null}
            </p>
          </div>
          <p className="shrink-0 text-[13px] font-semibold tabular-nums text-neutral-900 sm:text-sm">
            {formatCurrency(lineTotal, store.currency)}
          </p>
        </div>

        {!readOnly ? (
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="inline-flex items-center rounded-lg border border-neutral-200">
              <button
                type="button"
                onClick={() => syncQuantity(item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="inline-flex h-8 w-8 items-center justify-center text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-35"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[1.75rem] text-center text-[13px] font-medium tabular-nums">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => syncQuantity(item.quantity + 1)}
                disabled={item.quantity >= item.inventory}
                className="inline-flex h-8 w-8 items-center justify-center text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-35"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1.5 text-[12px] text-neutral-400 transition hover:text-red-600"
              aria-label={`Remove ${item.title}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Remove</span>
            </button>
          </div>
        ) : (
          <p className="mt-2 text-[12px] text-neutral-400">Qty {item.quantity}</p>
        )}
      </div>
    </div>
  );
}
