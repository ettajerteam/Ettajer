"use client";

import { useState, type ReactNode } from "react";
import { AppImage as Image } from "@/components/shared/app-image";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Package,
  Plus,
  Search,
  Download,
  Briefcase,
  Truck,
} from "lucide-react";
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
import { formatCurrency, cn } from "@/lib/utils";
import { dashboardCard, dashboardSubtitle, dashboardTitle } from "@/lib/dashboard-ui";
import type { Product, ProductType } from "@/types";

interface ProductListProps {
  products: Product[];
  currency: string;
  onEdit: (product: Product) => void;
  onAdd: () => void;
  onRefresh: () => void;
  toolbar?: ReactNode;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

/** Short label for catalog rows — full title stays on `title` tooltip. */
function catalogTitle(title: string, maxChars = 48): string {
  const cleaned = title
    .replace(/\s*[-–—]\s*AliExpress(?:\s*\d+)?\s*\/?\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length <= maxChars) return cleaned;
  const slice = cleaned.slice(0, maxChars);
  const cut = slice.replace(/\s+\S*$/, "").trimEnd();
  return `${(cut.length > 20 ? cut : slice).trimEnd()}…`;
}

const TYPE_META: Record<
  ProductType,
  { label: string; icon: typeof Package }
> = {
  physical: { label: "Physical", icon: Package },
  digital: { label: "Digital", icon: Download },
  service: { label: "Service", icon: Briefcase },
  dropshipping: { label: "Dropshipping", icon: Truck },
};

function inventoryLabel(product: Product) {
  const tracks =
    product.productType === "physical" || product.productType === "dropshipping";
  if (!tracks) return { text: "—", tone: "muted" as const };
  if (product.inventory <= 0) return { text: "Out of stock", tone: "danger" as const };
  if (product.inventory <= 10)
    return { text: `${product.inventory} left`, tone: "warn" as const };
  return { text: `${product.inventory} in stock`, tone: "ok" as const };
}

export function ProductList({
  products,
  currency,
  onEdit,
  onAdd,
  onRefresh,
  toolbar,
  hasFilters,
  onClearFilters,
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
    if (hasFilters) {
      return (
        <div className={cn(dashboardCard, "overflow-hidden")}>
          <div className="flex flex-col gap-2.5 border-b border-black/[0.05] px-4 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className={dashboardTitle}>Catalog</h2>
              <p className={dashboardSubtitle}>No products match your filters</p>
            </div>
            {toolbar}
          </div>
          <ProductsEmptyState
            icon={Search}
            title="No matches"
            description="Try another search or clear filters to see your full catalog."
            action={
              onClearFilters ? (
                <Button
                  variant="outline"
                  className="h-8 rounded-md border-black/[0.06] px-3 text-[12px] dark:border-white/10"
                  onClick={onClearFilters}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
            embedded
          />
        </div>
      );
    }

    return (
      <ProductsEmptyState
        icon={Package}
        title="Your catalog is empty"
        description="Add your first product — photos, pricing, barcode, and inventory in one place."
        action={
          <Button
            className="h-8 rounded-md bg-neutral-900 px-3 text-[12px] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
            onClick={onAdd}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add product
          </Button>
        }
        tips={[
          {
            step: "01",
            title: "Add product details",
            body: "Title, price, SKU, and barcode are assigned automatically if empty.",
          },
          {
            step: "02",
            title: "Add media",
            body: "Upload photos so shoppers can see what they’re buying.",
          },
          {
            step: "03",
            title: "Publish",
            body: "Save as draft anytime, then publish when you’re ready to sell.",
          },
        ]}
      />
    );
  }

  return (
    <>
      <div className={cn(dashboardCard, "overflow-hidden")}>
        <div className="flex flex-col gap-2.5 border-b border-black/[0.05] px-4 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className={dashboardTitle}>Catalog</h2>
            <p className={dashboardSubtitle}>
              {products.length} product{products.length === 1 ? "" : "s"}
            </p>
          </div>
          {toolbar}
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-black/[0.05] dark:divide-white/[0.06] md:hidden">
          {products.map((product) => {
            const type = TYPE_META[product.productType] ?? TYPE_META.physical;
            const TypeIcon = type.icon;
            const stock = inventoryLabel(product);
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => onEdit(product)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F5F5F7]/80 dark:hover:bg-white/[0.03]"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-black/[0.06] bg-muted dark:border-white/10">
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
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <p
                      className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-semibold tracking-[-0.01em]"
                      title={product.title}
                    >
                      {catalogTitle(product.title, 42)}
                    </p>
                    <Badge
                      variant={product.status === "active" ? "success" : "secondary"}
                      className="shrink-0 rounded-full px-2 py-0 text-[10px]"
                    >
                      {product.status === "active"
                        ? "Active"
                        : product.status === "archived"
                          ? "Archived"
                          : "Draft"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[13px] font-medium text-foreground">
                    {formatCurrency(product.price, currency)}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <TypeIcon className="h-3 w-3" />
                      {type.label}
                    </span>
                    <span
                      className={cn(
                        stock.tone === "danger" && "text-red-600 dark:text-red-400",
                        stock.tone === "warn" && "text-amber-600 dark:text-amber-400",
                        stock.tone === "ok" && "text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {stock.text}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden md:block">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="border-b border-black/[0.05] text-left text-[11px] uppercase tracking-[0.1em] text-muted-foreground dark:border-white/10">
                <th className="w-[36%] px-6 py-3 font-medium">Product</th>
                <th className="w-[14%] px-6 py-3 font-medium">Type</th>
                <th className="w-[14%] px-6 py-3 font-medium">Price</th>
                <th className="w-[14%] px-6 py-3 font-medium">Inventory</th>
                <th className="w-[12%] px-6 py-3 font-medium">Status</th>
                <th className="w-14 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const type = TYPE_META[product.productType] ?? TYPE_META.physical;
                const TypeIcon = type.icon;
                const stock = inventoryLabel(product);
                const shortTitle = catalogTitle(product.title, 48);
                return (
                  <tr
                    key={product.id}
                    className="group cursor-pointer border-b border-black/[0.04] last:border-0 transition-colors duration-150 hover:bg-[#F5F5F7]/80 dark:border-white/5 dark:hover:bg-white/[0.03]"
                    onClick={() => onEdit(product)}
                  >
                    <td className="max-w-0 overflow-hidden px-6 py-3.5">
                      <div className="flex min-w-0 items-center gap-3.5">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-black/[0.06] bg-muted dark:border-white/10">
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
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p
                            className="overflow-hidden text-ellipsis whitespace-nowrap font-medium tracking-[-0.01em] text-foreground"
                            title={product.title}
                          >
                            {shortTitle}
                          </p>
                          <p className="mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-muted-foreground">
                            {[product.sku, product.categoryName, ...product.collectionNames]
                              .filter(Boolean)
                              .join(" · ") || "No SKU"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white/70 px-2.5 py-1 text-[11px] font-medium text-neutral-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-300">
                        <TypeIcon className="h-3 w-3" />
                        {type.label}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="font-medium tabular-nums text-foreground">
                        {formatCurrency(product.price, currency)}
                      </p>
                      {product.comparePrice && product.comparePrice > product.price ? (
                        <p className="text-[11px] tabular-nums text-muted-foreground line-through">
                          {formatCurrency(product.comparePrice, currency)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={cn(
                          "text-[13px]",
                          stock.tone === "muted" && "text-muted-foreground",
                          stock.tone === "danger" && "font-medium text-red-600 dark:text-red-400",
                          stock.tone === "warn" && "font-medium text-amber-600 dark:text-amber-400",
                          stock.tone === "ok" && "text-foreground"
                        )}
                      >
                        {stock.text}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge
                        variant={product.status === "active" ? "success" : "secondary"}
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                      >
                        {product.status === "active"
                          ? "Active"
                          : product.status === "archived"
                            ? "Archived"
                            : "Draft"}
                      </Badge>
                    </td>
                    <td
                      className="w-14 px-4 py-3.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 rounded-full opacity-100 transition-opacity sm:opacity-70 sm:group-hover:opacity-100"
                            aria-label="Product actions"
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
                );
              })}
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
              className="product-editor-btn-soft rounded-full"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-full"
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
