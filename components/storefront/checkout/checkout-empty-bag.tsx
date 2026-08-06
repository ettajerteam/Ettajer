"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCheckoutThemeStyles } from "@/lib/checkout-theme-styles";
import type { CheckoutThemeId } from "@/lib/shop-preferences";

interface CheckoutEmptyBagProps {
  storeName: string;
  catalogHref: string;
  storeHref: string;
  eyebrow?: string;
  checkoutTheme?: CheckoutThemeId | string | null;
  isBold?: boolean;
  isModern?: boolean;
}

export function CheckoutEmptyBag({
  storeName,
  catalogHref,
  storeHref,
  eyebrow = "Checkout",
  checkoutTheme,
  isBold = false,
  isModern = false,
}: CheckoutEmptyBagProps) {
  const styles = getCheckoutThemeStyles(checkoutTheme);
  const soft = styles.id === "soft";
  const compact = styles.id === "compact";
  const btnRadius = soft
    ? "rounded-2xl"
    : compact
      ? "rounded-lg"
      : isModern
        ? "rounded-sm"
        : "rounded-full";

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        isBold
          ? "rounded-3xl border border-white/10 bg-zinc-900 p-6 sm:p-10 lg:p-14"
          : soft
            ? "rounded-[1.75rem] bg-[color-mix(in_srgb,var(--store-primary)_5%,#faf9f7)] p-6 sm:p-10"
            : compact
              ? "rounded-xl border border-neutral-200 bg-neutral-50/60 p-5 sm:p-8"
              : "rounded-3xl border border-neutral-200/80 bg-[#F7F7F8] p-6 sm:p-10 lg:p-14"
      )}
    >
      {/* Laptop composition: visual stage + copy */}
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative mx-auto flex w-full max-w-sm justify-center lg:mx-0 lg:max-w-none"
        >
          <div
            className={cn(
              "relative flex aspect-[4/3] w-full max-w-[340px] items-center justify-center overflow-hidden lg:max-w-none",
              isBold
                ? "rounded-[1.75rem] border border-white/10 bg-zinc-950"
                : soft
                  ? "rounded-[2rem] bg-white/80 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.25)] ring-1 ring-black/[0.04]"
                  : compact
                    ? "rounded-lg border border-neutral-200 bg-white"
                    : "rounded-[1.75rem] border border-white bg-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.2)]"
            )}
          >
            {/* Soft ambient blobs */}
            <div
              className="absolute -left-8 -top-8 h-32 w-32 rounded-full opacity-40 blur-2xl"
              style={{ backgroundColor: "var(--store-primary)" }}
            />
            <div
              className={cn(
                "absolute -bottom-10 -right-6 h-36 w-36 rounded-full blur-2xl",
                isBold ? "bg-white/10" : "bg-neutral-200/80"
              )}
            />

            <div className="relative z-[1] flex flex-col items-center px-6 py-8">
              <div
                className={cn(
                  "mb-4 flex items-center justify-center text-white shadow-lg",
                  soft
                    ? "h-16 w-16 rounded-3xl"
                    : compact
                      ? "h-12 w-12 rounded-lg"
                      : "h-14 w-14 rounded-2xl"
                )}
                style={{
                  backgroundColor: "var(--store-primary)",
                  boxShadow: soft
                    ? "0 16px 40px -12px color-mix(in srgb, var(--store-primary) 55%, transparent)"
                    : undefined,
                }}
              >
                <ShoppingBag
                  className={compact ? "h-5 w-5" : "h-6 w-6"}
                  strokeWidth={2}
                />
              </div>
              <div className="flex items-end gap-2">
                {[0.45, 0.7, 1, 0.55].map((h, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-10 sm:w-12",
                      isBold ? "bg-white/10" : "bg-neutral-100",
                      soft ? "rounded-xl" : compact ? "rounded-md" : "rounded-lg"
                    )}
                    style={{ height: `${48 + h * 36}px` }}
                  />
                ))}
              </div>
              <p
                className={cn(
                  "mt-4 text-[11px] font-medium tracking-wide",
                  isBold ? "text-white/35" : "text-neutral-400"
                )}
              >
                0 items in bag
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
          className={cn(
            "text-center lg:max-w-lg lg:text-left",
            isBold && "text-white"
          )}
        >
          <p
            className={cn(
              "mb-3 text-[11px] font-semibold uppercase tracking-[0.18em]",
              isBold ? "text-white/40" : "text-neutral-400"
            )}
          >
            {eyebrow}
          </p>
          <h2
            className={cn(
              "text-2xl font-semibold tracking-tight sm:text-3xl",
              isBold ? "text-white" : "text-neutral-900"
            )}
          >
            Your bag is empty
          </h2>
          <p
            className={cn(
              "mx-auto mt-3 max-w-md text-[15px] leading-relaxed lg:mx-0",
              isBold ? "text-white/50" : "text-neutral-500"
            )}
          >
            Add a few pieces from {storeName} before checking out — your bag
            will show up here with totals and delivery.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
            <Link
              href={catalogHref}
              className={cn(
                "inline-flex h-12 items-center justify-center gap-2 px-6 text-[13px] font-semibold text-white transition hover:opacity-90",
                btnRadius,
                isModern && "uppercase tracking-[0.1em]"
              )}
              style={{ backgroundColor: "var(--store-primary, #0a0a0a)" }}
            >
              Shop the catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={storeHref}
              className={cn(
                "inline-flex h-12 items-center justify-center gap-2 border px-6 text-[13px] font-medium transition",
                btnRadius,
                isModern && "uppercase tracking-[0.1em]",
                isBold
                  ? "border-white/25 text-white/80 hover:border-white/50"
                  : "border-neutral-300 bg-white/70 text-neutral-700 hover:border-neutral-400"
              )}
            >
              <Store className="h-4 w-4 opacity-70" />
              Back to store
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
