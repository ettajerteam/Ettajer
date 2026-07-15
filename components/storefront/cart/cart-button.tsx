"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

interface CartButtonProps {
  className?: string;
  variant?: "minimal" | "modern" | "bold";
}

export function CartButton({ className, variant = "minimal" }: CartButtonProps) {
  const itemCount = useCartStore((s) => s.getItemCount());
  const openCart = useCartStore((s) => s.openCart);

  const variantStyles = {
    minimal: "text-gray-600 hover:text-gray-900",
    modern: "text-black hover:opacity-60",
    bold: "text-white/70 hover:text-[var(--store-primary)]",
  };

  return (
    <button
      type="button"
      onClick={openCart}
      className={cn(
        "relative p-2 rounded-xl transition-colors",
        variantStyles[variant],
        className
      )}
      aria-label={`Open cart, ${itemCount} items`}
    >
      <ShoppingBag className="h-5 w-5" />
      {itemCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-semibold text-white"
          style={{ backgroundColor: "var(--store-primary, #007AFF)" }}
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}
