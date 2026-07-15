import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/cart";
import { getCartItemId } from "@/lib/checkout";

interface CartStore {
  storeSlug: string | null;
  currency: string;
  items: CartItem[];
  isOpen: boolean;
  setStore: (slug: string, currency: string) => void;
  addItem: (item: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
  hydrateFromServer: (storeSlug: string, currency: string, items: CartItem[]) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      storeSlug: null,
      currency: "MAD",
      items: [],
      isOpen: false,

      setStore: (slug, currency) => {
        const current = get();
        if (current.storeSlug && current.storeSlug !== slug) {
          set({ storeSlug: slug, currency, items: [] });
        } else {
          set({ storeSlug: slug, currency });
        }
      },

      addItem: (item) => {
        const state = get();
        const storeSlug = state.storeSlug ?? item.slug.split("/")[0];
        const id = getCartItemId(item.productId, item.variant);
        const qty = item.quantity ?? 1;
        const existing = state.items.find((i) => i.id === id);

        let items: CartItem[];
        if (existing) {
          items = state.items.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.min(i.quantity + qty, item.inventory) }
              : i
          );
        } else {
          items = [
            ...state.items,
            { ...item, id, quantity: Math.min(qty, item.inventory) },
          ];
        }

        set({ items, isOpen: true });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(quantity, i.inventory) } : i
          ),
        });
      },

      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      hydrateFromServer: (storeSlug, currency, items) =>
        set({ storeSlug, currency, items }),
    }),
    { name: "ettajer-cart" }
  )
);
