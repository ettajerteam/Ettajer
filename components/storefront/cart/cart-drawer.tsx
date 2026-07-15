"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/utils";
import { calculateCheckoutShipping } from "@/lib/checkout";
import { getStoreCheckoutUrl } from "@/lib/storefront-urls";
import { CartLineItem } from "@/components/storefront/cart/cart-line-item";
import type { PublicStore } from "@/types/storefront";

interface CartDrawerProps {
  store: PublicStore;
}

const overlayTransition = { duration: 0.28, ease: [0.32, 0.72, 0, 1] as const };
const panelTransition = { type: "spring" as const, damping: 34, stiffness: 380, mass: 0.85 };
const footerTransition = { type: "spring" as const, damping: 28, stiffness: 320 };

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 24, scale: 0.98 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring" as const, damping: 26, stiffness: 340 },
  },
  exit: {
    opacity: 0,
    x: -16,
    scale: 0.96,
    transition: { duration: 0.2 },
  },
};

export function CartDrawer({ store }: CartDrawerProps) {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const [mounted, setMounted] = useState(false);

  const shipping = calculateCheckoutShipping(subtotal, "standard");
  const total = subtotal + shipping;
  const qualifiesForFreeShipping = subtotal >= store.checkout.freeShippingThreshold;
  const primary = "var(--store-primary, #007AFF)";

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
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          <motion.button
            type="button"
            aria-label="Close cart"
            className="absolute inset-0 bg-black/45 backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayTransition}
            onClick={closeCart}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-white/20 bg-white/95 shadow-[-12px_0_48px_rgba(0,0,0,0.12)] backdrop-blur-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={panelTransition}
          >
            <div className="flex items-center justify-between border-b border-gray-100/80 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Your Cart</h2>
                {items.length > 0 && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-6">
              <AnimatePresence mode="wait">
                {items.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center justify-center py-24 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={panelTransition}
                      className="h-20 w-20 rounded-3xl flex items-center justify-center mb-5"
                      style={{ backgroundColor: `${store.primaryColor}12` }}
                    >
                      <ShoppingBag className="h-8 w-8" style={{ color: primary }} />
                    </motion.div>
                    <p className="font-semibold text-gray-900">Your cart is empty</p>
                    <p className="text-sm text-gray-500 mt-1 max-w-[220px]">
                      Discover something you love and add it here.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-7 rounded-xl h-11 px-6"
                      onClick={closeCart}
                    >
                      Continue shopping
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="items"
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                    className="divide-y divide-gray-100/90 py-1"
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
              {items.length > 0 && (
                <motion.div
                  key="footer"
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 24 }}
                  transition={footerTransition}
                  className="border-t border-gray-100/80 px-6 py-5 space-y-4 bg-white/90 backdrop-blur-xl"
                >
                  {qualifiesForFreeShipping && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-green-700 bg-green-50"
                    >
                      <Sparkles className="h-3.5 w-3.5 shrink-0" />
                      You qualify for free shipping!
                    </motion.div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <motion.span
                        key={subtotal}
                        initial={{ opacity: 0.5, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {formatCurrency(subtotal, store.currency)}
                      </motion.span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>
                        {qualifiesForFreeShipping
                          ? "Free"
                          : formatCurrency(shipping, store.currency)}
                      </span>
                    </div>
                    {!qualifiesForFreeShipping && (
                      <p className="text-xs text-gray-400">
                        Free shipping over{" "}
                        {formatCurrency(store.checkout.freeShippingThreshold, store.currency)}
                      </p>
                    )}
                    <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-100">
                      <span>Total</span>
                      <motion.span
                        key={total}
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1 }}
                        style={{ color: primary }}
                      >
                        {formatCurrency(total, store.currency)}
                      </motion.span>
                    </div>
                  </div>

                  <Button
                    asChild
                    className="w-full h-12 rounded-xl text-white font-medium shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      backgroundColor: primary,
                      boxShadow: `0 8px 24px ${store.primaryColor}35`,
                    }}
                    onClick={closeCart}
                  >
                    <Link href={getStoreCheckoutUrl(store.slug)} className="inline-flex items-center justify-center gap-2">
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
