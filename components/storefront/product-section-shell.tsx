"use client";

import { useProductPageZone } from "@/components/storefront/product-page-layout-context";
import { cn } from "@/lib/utils";

export function ProductSectionShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const zone = useProductPageZone();

  if (zone === "gallery" || zone === "details") {
    return <div className={cn(className)}>{children}</div>;
  }

  return <div className={cn("mx-auto max-w-6xl px-6", className)}>{children}</div>;
}
