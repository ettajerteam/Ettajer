"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { MoreHorizontal, Pencil, Trash2, Package, Plus } from "lucide-react";
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
import { ProductsEmptyState } from "@/components/products/products-empty-state";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductListProps {
  products: Product[];
  currency: string;
  onEdit: (product: Product) => void;
  onAdd: () => void;
  onRefresh: () => void;
  toolbar?: ReactNode;
}

export function ProductList({
  products,
  currency,
  onEdit,
  onAdd,
  onRefresh,
  toolbar,
}: ProductListProps) {
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to delete");
      }
      toast.success("Product deleted");
      setDeleteTarget(null);
      onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (products.length === 0) {
    return (
      <ProductsEmptyState
        icon={Package}
        title="No products yet"
        description="Add your first product to start selling. It only takes a minute."
        action={
          <Button onClick={onAdd} className="rounded-xl bg-[#007AFF] hover:bg-[#007AFF]/90">
            <Plus className="mr-1.5 h-4 w-4" />
            Add product
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="premium-card overflow-hidden">
        <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">All products</h2>
          {toolbar}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="hidden px-6 py-3 font-medium md:table-cell">Inventory</th>
                <th className="hidden px-6 py-3 font-medium sm:table-cell">Status</th>
                <th className="px-6 py-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="group cursor-pointer border-b border-border/80 transition-colors duration-200 last:border-0 hover:bg-muted/35"
                  onClick={() => onEdit(product)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{product.title}</p>
                        {product.sku && (
                          <p className="text-xs text-muted-foreground">{product.sku}</p>
                        )}
                        {(product.categoryName || product.collectionNames.length > 0) && (
                          <p className="truncate text-xs text-muted-foreground">
                            {[product.categoryName, ...product.collectionNames]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">
                      {formatCurrency(product.price, currency)}
                    </p>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <p className="text-xs text-muted-foreground line-through">
                        {formatCurrency(product.comparePrice, currency)}
                      </p>
                    )}
                  </td>
                  <td className="hidden px-6 py-4 text-muted-foreground md:table-cell">
                    {product.inventory}
                  </td>
                  <td className="hidden px-6 py-4 sm:table-cell">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={product.status === "active" ? "success" : "secondary"}>
                        {product.status === "active" ? "Active" : "Draft"}
                      </Badge>
                      {product.inventory <= 0 && product.status === "active" && (
                        product.productType === "physical" || product.productType === "dropshipping"
                      ) ? (
                        <Badge variant="warning">Out of stock</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[11px] capitalize text-muted-foreground">
                      {product.productType}
                    </p>
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
                        <DropdownMenuItem onClick={() => onEdit(product)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(product)}
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

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="rounded-2xl border-border/80 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.4)]">
          <DialogHeader>
            <DialogTitle className="text-xl tracking-[-0.02em]">Delete product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This action cannot
              be undone.
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
            <Button variant="destructive" className="rounded-xl" onClick={handleDelete} loading={deleting}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
