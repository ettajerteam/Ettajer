"use client";

import { useEffect } from "react";
import type { PublicStore } from "@/types/storefront";
import { useCartStore } from "@/lib/cart-store";
import { CartDrawer } from "@/components/storefront/cart/cart-drawer";

interface StorefrontCartProviderProps {
  store: PublicStore;
  children: React.ReactNode;
}

export function StorefrontCartProvider({ store, children }: StorefrontCartProviderProps) {
  const setStore = useCartStore((s) => s.setStore);
  const hydrateFromServer = useCartStore((s) => s.hydrateFromServer);

  useEffect(() => {
    setStore(store.slug, store.currency);

    fetch(`/api/cart?storeSlug=${encodeURIComponent(store.slug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.items) {
          hydrateFromServer(store.slug, data.currency ?? store.currency, data.items);
        }
      })
      .catch(() => {});
  }, [store.slug, store.currency, setStore, hydrateFromServer]);

  return (
    <>
      {children}
      <CartDrawer store={store} />
    </>
  );
}
