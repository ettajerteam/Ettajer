"use client";

import { useState } from "react";
import { FolderOpen } from "lucide-react";
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

export function CategorySheet({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategorySheetProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(category);
  const formId = "category-form";

  const handleSubmit = async (data: CategoryFormValues) => {
    setLoading(true);
    try {
      const url = isEditing ? `/api/categories/${category!.id}` : "/api/categories";
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof result.message === "string" ? result.message : "Failed to save category"
        );
      }

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
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-hidden border-l border-black/[0.06] bg-[#F7F8FA]/95 p-0 backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-950/95 sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 space-y-0 border-b border-black/[0.06] px-5 py-5 text-left dark:border-white/10 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#007AFF]/12 text-[#007AFF]">
              <FolderOpen className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <SheetTitle className="text-[17px] font-semibold text-foreground">
                {isEditing ? "Edit category" : "Create category"}
              </SheetTitle>
              <SheetDescription className="mt-1 text-[13px] leading-normal text-muted-foreground">
                {isEditing
                  ? "Update the name, cover, and visibility of this category."
                  : "Organize products so shoppers can browse by type."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="product-editor-shell flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <CategoryForm
            key={category?.id ?? "new"}
            initialData={category ?? undefined}
            onSubmit={handleSubmit}
            formId={formId}
          />
        </div>

        <SheetFooter className="shrink-0 gap-2 border-t border-black/[0.06] bg-white/80 px-5 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/80 sm:flex-row sm:justify-end sm:space-x-0 sm:px-6">
          <Button
            type="button"
            variant="ghost"
            className="product-editor-btn-soft h-10 rounded-full px-5"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            className="product-editor-btn-soft-primary h-10 rounded-full px-5"
            loading={loading}
          >
            {isEditing ? "Save changes" : "Create category"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
