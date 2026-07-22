"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Banknote, ShieldCheck, Truck } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/utils";
import { calculateCheckoutShipping } from "@/lib/checkout";
import { getStoreCheckoutUrl, getStoreProductsUrl, getStoreUrl } from "@/lib/storefront-urls";
import { CartLineItem } from "@/components/storefront/cart/cart-line-item";
import { StorefrontQuietState } from "@/components/storefront/storefront-quiet-state";
import { getStorefrontCopy, isStorefrontRtl } from "@/lib/storefront/storefront-i18n";
import type { PublicStore } from "@/types/storefront";

interface CartDrawerProps {
  store: PublicStore;
}

const overlayTransition = { duration: 0.28, ease: [0.32, 0.72, 0, 1] as const };
const panelTransition = { type: "spring" as const, damping: 34, stiffness: 380, mass: 0.85 };

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 28, stiffness: 360 },
  },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18 } },
};

export function CartDrawer({ store }: CartDrawerProps) {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const [mounted, setMounted] = useState(false);

  const freeThreshold = store.checkout.freeShippingThreshold;
  const shipping = calculateCheckoutShipping(subtotal, "standard", freeThreshold);
  const total = subtotal + shipping;
  const qualifiesForFreeShipping = subtotal >= freeThreshold && freeThreshold > 0;
  const remainingForFree =
    freeThreshold > 0 && !qualifiesForFreeShipping
      ? Math.max(freeThreshold - subtotal, 0)
      : 0;
  const freeProgress =
    freeThreshold > 0 ? Math.min((subtotal / freeThreshold) * 100, 100) : 0;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const primary = "var(--store-primary)";
  const t = getStorefrontCopy(store.language);
  const rtl = isStorefrontRtl(store.language);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeCart]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen ? (
        <div className="fixed inset-0 z-[100]">
          <motion.button
            type="button"
            aria-label={t.cart.closeAria}
            className="absolute inset-0 bg-black/40 backdrop-blur-[4px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayTransition}
            onClick={closeCart}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={t.cart.title}
            className={`absolute inset-y-0 flex w-full max-w-md flex-col bg-white ${
              rtl
                ? "left-0 shadow-[8px_0_40px_rgba(0,0,0,0.1)]"
                : "right-0 shadow-[-8px_0_40px_rgba(0,0,0,0.1)]"
            }`}
            initial={{ x: rtl ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: rtl ? "-100%" : "100%" }}
            transition={panelTransition}
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-neutral-900 sm:text-lg">
                  {t.cart.title}
                </h2>
                {items.length > 0 ? (
                  <p className="mt-0.5 text-[12px] tabular-nums text-neutral-500">
                    {itemCount} {itemCount === 1 ? t.cart.piece : t.cart.pieces}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
                aria-label={t.cart.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6">
              <AnimatePresence mode="wait">
                {items.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <StorefrontQuietState
                      compact
                      eyebrow={t.cart.emptyEyebrow}
                      title={t.cart.emptyTitle}
                      description={t.cart.emptyDescription}
                      primaryAction={{
                        label: t.cart.shopCatalog,
                        href: getStoreProductsUrl(store.slug),
                        onClick: closeCart,
                      }}
                      secondaryAction={{
                        label: t.cart.keepBrowsing,
                        href: getStoreUrl(store.slug),
                        onClick: closeCart,
                      }}
                      isModern={store.theme === "modern"}
                      isBold={store.theme === "bold"}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="items"
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                    className="divide-y divide-neutral-100"
                  >
                    <AnimatePresence initial={false}>
                      {items.map((item) => (
                        <motion.div key={item.id} variants={itemVariants} layout exit="exit">
                          <CartLineItem item={item} store={store} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {items.length > 0 ? (
                <motion.div
                  key="footer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  className="border-t border-neutral-100 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-6"
                >
                  {freeThreshold > 0 ? (
                    <div className="mb-4">
                      {qualifiesForFreeShipping ? (
                        <p className="text-[12px] font-medium text-emerald-700">
                          {t.cart.freeShippingUnlocked}
                        </p>
                      ) : (
                        <p className="text-[12px] text-neutral-500">
                          {t.cart.addForFreeShipping(
                            formatCurrency(remainingForFree, store.currency)
                          )}
                        </p>
                      )}
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${freeProgress}%`,
                            backgroundColor: primary,
                          }}
                        />
                      </div>
                    </div>
                  ) : null}

                  <div className="space-y-2 text-[13px]">
                    <div className="flex justify-between text-neutral-500">
                      <span>{t.cart.subtotal}</span>
                      <span className="tabular-nums text-neutral-800">
                        {formatCurrency(subtotal, store.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-neutral-500">
                      <span>{t.cart.shipping}</span>
                      <span className="tabular-nums text-neutral-800">
                        {shipping === 0
                          ? t.cart.free
                          : t.cart.fromAmount(formatCurrency(shipping, store.currency))}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-neutral-100 pt-2.5 text-[15px] font-semibold text-neutral-900">
                      <span>{t.cart.estimatedTotal}</span>
                      <span className="tabular-nums" style={{ color: primary }}>
                        {formatCurrency(total, store.currency)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={getStoreCheckoutUrl(store.slug)}
                    onClick={closeCart}
                    className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[13px] font-semibold text-white transition hover:opacity-95 active:scale-[0.99]"
                    style={{ backgroundColor: primary }}
                  >
                    {t.cart.checkout}
                    <ArrowRight className={`h-4 w-4 ${rtl ? "rotate-180" : ""}`} />
                  </Link>

                  <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-neutral-400">
                    {store.checkout.cashOnDelivery ? (
                      <li className="inline-flex items-center gap-1">
                        <Banknote className="h-3 w-3" />
                        {t.cart.cashOnDelivery}
                      </li>
                    ) : null}
                    <li className="inline-flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      {t.cart.secureCheckout}
                    </li>
                    <li className="inline-flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      {t.cart.trackedDelivery}
                    </li>
                  </ul>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
