"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/products/product-form";
import type { ProductFormValues } from "@/lib/validations/product";
import type { Product } from "@/types";
import type { TicketPrinter } from "@/lib/ticket-printers";

interface ProductSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  ticketPrinters?: TicketPrinter[];
  product?: Product | null;
  onSuccess: () => void;
}

export function ProductSheet({
  open,
  onOpenChange,
  currency,
  ticketPrinters = [],
  product,
  onSuccess,
}: ProductSheetProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!product;
  const formId = "product-form";

  const handleSubmit = async (data: ProductFormValues) => {
    const cleanedVariants = data.variants
      .filter((v) => v.name.trim())
      .map((v) => ({
        ...v,
        options: v.options.filter((o) => o.trim()),
      }))
      .filter((v) => v.options.length > 0);

    const cleanedDetails = data.details
      .filter((d) => d.label.trim() && d.value.trim())
      .map((d) => ({
        ...d,
        label: d.label.trim(),
        value: d.value.trim(),
      }));

    const payload = { ...data, variants: cleanedVariants, details: cleanedDetails };

    setLoading(true);
    try {
      const url = isEditing ? `/api/products/${product.id}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message ?? "Failed to save product");

      toast.success(isEditing ? "Product updated" : "Product created");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-hidden p-0 sm:max-w-xl lg:max-w-2xl"
      >
        <SheetHeader className="shrink-0 border-b border-border/80 px-6 pb-5 pt-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SheetTitle className="text-xl font-semibold tracking-[-0.02em]">
              {isEditing ? "Edit product" : "Add product"}
            </SheetTitle>
            <SheetDescription className="mt-1">
              {isEditing
                ? "Update your product details below"
                : "Fill in the details to add a new product to your store"}
            </SheetDescription>
          </motion.div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <ProductForm
            key={product?.id ?? "new"}
            currency={currency}
            ticketPrinters={ticketPrinters}
            initialData={product ?? undefined}
            onSubmit={handleSubmit}
            formId={formId}
          />
        </div>

        <SheetFooter className="shrink-0 border-t border-border/80 bg-background/90 px-6 py-4 backdrop-blur-xl">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" form={formId} className="rounded-xl" loading={loading}>
            {isEditing ? "Save changes" : "Create product"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
