"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

interface CartButtonProps {
  className?: string;
  variant?: "minimal" | "modern" | "bold";
}

/** Standalone cart control — header uses its own premium Bag control. */
export function CartButton({ className, variant = "minimal" }: CartButtonProps) {
  const itemCount = useCartStore((s) => s.getItemCount());
  const openCart = useCartStore((s) => s.openCart);

  const isBold = variant === "bold";
  const isModern = variant === "modern";

  return (
    <button
      type="button"
      onClick={openCart}
      className={cn(
        "group relative inline-flex h-10 items-center gap-2 px-2.5 transition",
        isModern && "rounded-sm hover:bg-black/[0.04]",
        isBold && "rounded-lg hover:bg-white/5",
        !isModern && !isBold && "rounded-full hover:bg-neutral-100",
        className
      )}
      aria-label={`Open cart, ${itemCount} items`}
    >
      <ShoppingBag
        className={cn(
          "h-[18px] w-[18px] transition",
          isBold ? "text-white/75 group-hover:text-white" : "text-neutral-700 group-hover:text-neutral-900"
        )}
      />
      <span
        className={cn(
          "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
          itemCount > 0
            ? "text-white"
            : isBold
              ? "bg-white/10 text-white/50"
              : "bg-neutral-100 text-neutral-400"
        )}
        style={itemCount > 0 ? { backgroundColor: "var(--store-primary, #0a0a0a)" } : undefined}
      >
        {itemCount > 99 ? "99+" : itemCount}
      </span>
    </button>
  );
}
