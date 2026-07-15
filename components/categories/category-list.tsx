"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { MoreHorizontal, Pencil, Trash2, FolderOpen, Plus, Package } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CategoryProductsDialog } from "@/components/categories/category-products-dialog";
import { ProductsEmptyState } from "@/components/products/products-empty-state";
import type { Category } from "@/types/catalog";

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onAdd: () => void;
  onRefresh: () => void;
  toolbar?: ReactNode;
}

export function CategoryList({
  categories,
  onEdit,
  onAdd,
  onRefresh,
  toolbar,
}: CategoryListProps) {
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [viewTarget, setViewTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/categories/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to delete");
      }
      toast.success("Category deleted");
      setDeleteTarget(null);
      onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (categories.length === 0) {
    return (
      <ProductsEmptyState
        icon={FolderOpen}
        title="No categories yet"
        description="Organize your products into categories for easier browsing."
        action={
          <Button onClick={onAdd} className="rounded-xl bg-[#007AFF] hover:bg-[#007AFF]/90">
            <Plus className="mr-1.5 h-4 w-4" />
            Add category
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="premium-card overflow-hidden">
        <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">All categories</h2>
          {toolbar}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="hidden px-6 py-3 font-medium sm:table-cell">Slug</th>
                <th className="px-6 py-3 font-medium">Products</th>
                <th className="hidden px-6 py-3 font-medium md:table-cell">Status</th>
                <th className="px-6 py-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="group cursor-pointer border-b border-border/80 transition-colors duration-200 last:border-0 hover:bg-muted/35"
                  onClick={() => setViewTarget(category)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted">
                        {category.image ? (
                          <Image
                            src={category.image}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-foreground">{category.name}</span>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 font-mono text-sm text-muted-foreground sm:table-cell">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewTarget(category);
                      }}
                      className="inline-flex items-center gap-1.5 text-sm text-[#007AFF] transition-colors hover:underline"
                    >
                      <Package className="h-3.5 w-3.5" />
                      {category.productCount}
                    </button>
                  </td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    <Badge variant={category.status === "active" ? "success" : "secondary"}>
                      {category.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => setViewTarget(category)}>
                          <Package className="mr-2 h-4 w-4" />
                          View products
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(category)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(category)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryProductsDialog
        category={viewTarget}
        open={!!viewTarget}
        onOpenChange={(open) => !open && setViewTarget(null)}
      />

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="rounded-2xl border-border/80 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.4)]">
          <DialogHeader>
            <DialogTitle className="text-xl tracking-[-0.02em]">Delete category</DialogTitle>
            <DialogDescription>
              Delete &quot;{deleteTarget?.name}&quot;? Products in this category will be unassigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={handleDelete}
              loading={deleting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
