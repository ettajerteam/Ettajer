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
import { CollectionForm } from "@/components/collections/collection-form";
import type { CollectionFormValues } from "@/lib/validations/catalog";
import type { Collection } from "@/types/catalog";
import type { Product } from "@/types";

interface CollectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection?: Collection | null;
  products: Product[];
  onSuccess: () => void;
}

export function CollectionSheet({
  open,
  onOpenChange,
  collection,
  products,
  onSuccess,
}: CollectionSheetProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!collection;
  const formId = "collection-form";

  const handleSubmit = async (data: CollectionFormValues) => {
    setLoading(true);
    try {
      const url = isEditing ? `/api/collections/${collection.id}` : "/api/collections";
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message ?? "Failed to save collection");

      toast.success(isEditing ? "Collection updated" : "Collection created");
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
      <SheetContent side="right" className="flex w-full flex-col overflow-hidden p-0 sm:max-w-xl">
        <SheetHeader className="shrink-0 border-b border-border/80 px-6 pb-5 pt-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <SheetTitle className="text-xl font-semibold tracking-[-0.02em]">
              {isEditing ? "Edit collection" : "Add collection"}
            </SheetTitle>
            <SheetDescription className="mt-1">
              {isEditing ? "Update collection details and products" : "Create a curated product collection"}
            </SheetDescription>
          </motion.div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <CollectionForm
            key={collection?.id ?? "new"}
            initialData={collection ?? undefined}
            products={products}
            onSubmit={handleSubmit}
            formId={formId}
          />
        </div>

        <SheetFooter className="shrink-0 border-t border-border/80 bg-background/90 px-6 py-4 backdrop-blur-xl">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form={formId} className="rounded-xl" loading={loading}>
            {isEditing ? "Save changes" : "Create collection"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
