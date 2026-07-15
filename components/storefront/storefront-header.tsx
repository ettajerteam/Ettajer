"use client";

import Link from "next/link";
import Image from "next/image";
import { CartButton } from "@/components/storefront/cart/cart-button";
import type { PublicCategory, PublicStore } from "@/types/storefront";
import { getStoreUrl, resolveStoreNavHref } from "@/lib/storefront-urls";
import { cn } from "@/lib/utils";

interface StorefrontHeaderProps {
  store: PublicStore;
  variant?: "minimal" | "modern" | "bold";
  backHref?: string;
  backLabel?: string;
  categories?: PublicCategory[];
}

export function StorefrontHeader({
  store,
  variant = "minimal",
  backHref,
  backLabel,
  categories = [],
}: StorefrontHeaderProps) {
  const isMinimal = variant === "minimal";
  const isModern = variant === "modern";
  const isBold = variant === "bold";

  const navItems = store.navigation?.length
    ? store.navigation
    : categories.length > 0
      ? [
          { id: "shop", label: "Shop", href: "/" },
          ...categories.slice(0, 4).map((c) => ({
            id: c.id,
            label: c.name,
            href: `/category/${c.slug}`,
          })),
        ]
      : [{ id: "shop", label: "Shop", href: "/" }];

  const linkClass = cn(
    "transition-colors shrink-0",
    isMinimal && "text-gray-500 hover:text-gray-900",
    isModern && "text-xs font-bold uppercase tracking-widest hover:opacity-60",
    isBold && "text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white"
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-40",
        isMinimal && "bg-white/80 backdrop-blur-xl border-b border-gray-100",
        isModern && "border-b border-black/10",
        isBold && "border-b border-white/10"
      )}
      style={isModern ? { backgroundColor: store.secondaryColor } : undefined}
    >
      <div
        className={cn(
          "mx-auto px-6 flex items-center justify-between",
          isModern ? "max-w-7xl h-20" : "max-w-6xl h-16"
        )}
      >
        <div className="flex items-center gap-4 min-w-0">
          {backHref ? (
            <Link href={backHref} className={cn(linkClass, "text-sm shrink-0")}>
              {backLabel ?? "← Back"}
            </Link>
          ) : (
            <Link href={getStoreUrl(store.slug)} className="flex items-center gap-3 min-w-0">
              {store.logo ? (
                <Image
                  src={store.logo}
                  alt={store.name}
                  width={32}
                  height={32}
                  className="rounded-lg shrink-0"
                />
              ) : (
                <span
                  className={cn(
                    "font-semibold tracking-tight truncate",
                    isModern && "text-lg font-black uppercase",
                    isBold && "text-sm font-black uppercase tracking-widest"
                  )}
                >
                  {store.name}
                </span>
              )}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!backHref && (
            <nav className="hidden md:flex items-center gap-6 text-sm max-w-md overflow-x-auto">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={resolveStoreNavHref(store.slug, item.href)}
                  className={linkClass}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
          <CartButton variant={variant} />
        </div>
      </div>
    </header>
  );
}
