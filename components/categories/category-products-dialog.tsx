"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import type { Category } from "@/types/catalog";
import type { CategoryDetail } from "@/types/catalog";

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

    setLoading(true);
    fetch(`/api/categories/${category.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.category) setDetail(data.category);
      })
      .finally(() => setLoading(false));
  }, [open, category]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] max-w-lg flex-col rounded-2xl border-border/80 p-0">
        <DialogHeader className="border-b border-border/80 px-6 pb-4 pt-6">
          <DialogTitle className="text-xl font-semibold tracking-[-0.02em]">
            {category?.name}
          </DialogTitle>
          <DialogDescription className="mt-1">Products in this category</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="premium-skeleton h-16 w-full animate-pulse" />
              ))}
            </div>
          ) : !detail?.products.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No products in this category
            </p>
          ) : (
            <div className="space-y-2">
              {detail.products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-xl border border-border/80 bg-muted/20 p-3 transition-colors hover:bg-muted/35"
                >
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                    {product.image ? (
                      <Image src={product.image} alt="" fill className="object-cover" unoptimized />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(product.price, "MAD")} · Stock: {product.inventory}
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
