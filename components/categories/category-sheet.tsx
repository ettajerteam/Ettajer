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
import { CategoryForm } from "@/components/categories/category-form";
import type { CategoryFormValues } from "@/lib/validations/catalog";
import type { Category } from "@/types/catalog";

interface CategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSuccess: () => void;
}

export function CategorySheet({ open, onOpenChange, category, onSuccess }: CategorySheetProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!category;
  const formId = "category-form";

  const handleSubmit = async (data: CategoryFormValues) => {
    setLoading(true);
    try {
      const url = isEditing ? `/api/categories/${category.id}` : "/api/categories";
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message ?? "Failed to save category");

      toast.success(isEditing ? "Category updated" : "Category created");
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
              {isEditing ? "Edit category" : "Add category"}
            </SheetTitle>
            <SheetDescription className="mt-1">
              {isEditing ? "Update category details" : "Create a new product category"}
            </SheetDescription>
          </motion.div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <CategoryForm
            key={category?.id ?? "new"}
            initialData={category ?? undefined}
            onSubmit={handleSubmit}
            formId={formId}
          />
        </div>

        <SheetFooter className="shrink-0 border-t border-border/80 bg-background/90 px-6 py-4 backdrop-blur-xl">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form={formId} className="rounded-xl" loading={loading}>
            {isEditing ? "Save changes" : "Create category"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
