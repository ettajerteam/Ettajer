"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import type { Category, CategoryDetail } from "@/types/catalog";

interface CategoryProductsDialogProps {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryProductsDialog({
  category,
  open,
  onOpenChange,
}: CategoryProductsDialogProps) {
  const [detail, setDetail] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !category) {
      setDetail(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/categories/${category.id}`, { signal: controller.signal, cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!controller.signal.aborted && data.category) setDetail(data.category);
      })
      .catch(() => {
        /* aborted or failed — leave empty */
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [open, category]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="space-y-1 border-b border-black/[0.06] px-5 py-4 text-left dark:border-white/10">
          <DialogTitle className="text-[17px] font-semibold text-foreground">
            {category?.name}
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-normal">
            Products assigned to this category
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-40 rounded-md" />
                    <Skeleton className="h-3 w-24 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : !detail?.products.length ? (
            <div className="py-10 text-center">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-500/10 text-muted-foreground">
                <Package className="h-4 w-4" />
              </span>
              <p className="mt-3 text-[13px] font-medium text-foreground">No products yet</p>
              <p className="mt-1 text-[12px] leading-normal text-muted-foreground">
                Assign products to this category from the product editor.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
              {detail.products.map((product) => (
                <div key={product.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-black/[0.06] bg-muted dark:border-white/10">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-foreground">
                      {product.title}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-normal text-muted-foreground">
                      {formatCurrency(product.price, "MAD")} · Stock {product.inventory}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
