"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Layers,
  Plus,
  Star,
  CircleOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { CollectionTableSkeleton } from "@/components/collections/collection-table-skeleton";
import { cn } from "@/lib/utils";
import {
  dashboardCard,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import type { Collection } from "@/types/catalog";

interface CollectionListProps {
  collections: Collection[];
  loading?: boolean;
  hasFilters?: boolean;
  onEdit: (collection: Collection) => void;
  onAdd: () => void;
  onRefresh: () => void;
  onClearFilters?: () => void;
  toolbar?: ReactNode;
}

export function CollectionList({
  collections,
  loading = false,
  hasFilters = false,
  onEdit,
  onAdd,
  onRefresh,
  onClearFilters,
  toolbar,
}: CollectionListProps) {
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/collections/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          typeof data.message === "string" ? data.message : "Failed to delete"
        );
      }
      toast.success("Collection deleted");
      setDeleteTarget(null);
      onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading && collections.length === 0) {
    return <CollectionTableSkeleton />;
  }

  if (collections.length === 0) {
    if (hasFilters) {
      return (
        <div className={cn(dashboardCard, "overflow-hidden")}>
          <div className="flex flex-col gap-2.5 border-b border-black/[0.05] px-4 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className={dashboardTitle}>Collections</h2>
              <p className={dashboardSubtitle}>No collections match your search</p>
            </div>
            {toolbar}
          </div>
          <ProductsEmptyState
            icon={CircleOff}
            title="No matches"
            description="Try another search or clear filters."
            action={
              onClearFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 rounded-md border-black/[0.06] px-3 text-[12px] dark:border-white/10"
                  onClick={onClearFilters}
                >
                  Clear search
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
        icon={Layers}
        title="No collections yet"
        description="Group products into curated collections for campaigns, menus, and homepage features."
        action={
          <Button
            onClick={onAdd}
            className="h-8 rounded-md bg-neutral-900 px-3 text-[12px] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add collection
          </Button>
        }
        tips={[
          {
            step: "01",
            title: "Create a collection",
            body: "Name it, add a short description, and optional cover image.",
          },
          {
            step: "02",
            title: "Add products",
            body: "Pick catalog items that belong together for shoppers.",
          },
          {
            step: "03",
            title: "Feature it",
            body: "Mark as featured to show on your storefront homepage.",
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
            <h2 className={dashboardTitle}>
              Collections
              <span className="ml-1.5 font-normal text-neutral-400">
                {loading ? "Updating…" : collections.length}
              </span>
            </h2>
            <p className={dashboardSubtitle}>Click a row to edit</p>
          </div>
          {toolbar}
        </div>

        {/* Mobile */}
        <div className="divide-y divide-black/[0.04] dark:divide-white/5 md:hidden">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="px-4 py-3 transition-colors hover:bg-[#F5F5F7]/80 dark:hover:bg-white/[0.03]"
              onClick={() => onEdit(collection)}
            >
              <div className="flex items-start gap-3">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-black/[0.06] bg-[#F5F5F7] dark:border-white/10 dark:bg-white/[0.05]">
                  {collection.image ? (
                    <Image
                      src={collection.image}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Layers className="h-4 w-4 text-neutral-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                        {collection.name}
                      </p>
                      <p className="mt-0.5 text-[10px] text-neutral-400">
                        /{collection.slug} · {collection.productCount} product
                        {collection.productCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <ItemActions
                        collection={collection}
                        onEdit={onEdit}
                        onDelete={setDeleteTarget}
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <FeaturedChip featured={collection.featured} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-black/[0.05] text-left text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10">
                <th className="px-4 py-2.5">Collection</th>
                <th className="px-4 py-2.5">Slug</th>
                <th className="px-4 py-2.5">Products</th>
                <th className="px-4 py-2.5">Featured</th>
                <th className="px-4 py-2.5 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {collections.map((collection) => (
                <tr
                  key={collection.id}
                  className="cursor-pointer border-b border-black/[0.04] last:border-0 transition-colors duration-150 hover:bg-[#F5F5F7]/80 dark:border-white/5 dark:hover:bg-white/[0.03]"
                  onClick={() => onEdit(collection)}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-black/[0.06] bg-[#F5F5F7] dark:border-white/10 dark:bg-white/[0.05]">
                        {collection.image ? (
                          <Image
                            src={collection.image}
                            alt=""
                            fill
                            sizes="36px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Layers className="h-3.5 w-3.5 text-neutral-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                          {collection.name}
                        </p>
                        {collection.description ? (
                          <p className="truncate text-[10px] text-neutral-400">
                            {collection.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-400">/{collection.slug}</td>
                  <td className="px-4 py-2.5 font-medium tabular-nums text-neutral-900 dark:text-white">
                    {collection.productCount}
                  </td>
                  <td className="px-4 py-2.5">
                    <FeaturedChip featured={collection.featured} />
                  </td>
                  <td
                    className="px-4 py-2.5 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ItemActions
                      collection={collection}
                      onEdit={onEdit}
                      onDelete={setDeleteTarget}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-md gap-0 overflow-hidden p-0 sm:rounded-[12px]">
          <DialogHeader className="space-y-1 border-b border-black/[0.05] px-4 py-3.5 text-left dark:border-white/10">
            <DialogTitle className="text-[14px] font-semibold tracking-[-0.01em]">
              Delete collection
            </DialogTitle>
            <DialogDescription className="text-[12px]">
              Delete &quot;{deleteTarget?.name}&quot;? Products will not be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-1.5 px-4 py-3 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-md border-black/[0.06] px-3 text-[12px] dark:border-white/10"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-8 rounded-md px-3 text-[12px]"
              onClick={() => void handleDelete()}
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

function FeaturedChip({ featured }: { featured: boolean }) {
  if (!featured) {
    return <span className="text-[11px] text-neutral-300">—</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-[#007AFF]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#007AFF]">
      <Star className="h-3 w-3 fill-current" />
      Featured
    </span>
  );
}

function ItemActions({
  collection,
  onEdit,
  onDelete,
}: {
  collection: Collection;
  onEdit: (c: Collection) => void;
  onDelete: (c: Collection) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-neutral-400"
          aria-label="Actions"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onSelect={() => onEdit(collection)}>
          <Pencil className="mr-2 h-3.5 w-3.5" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onSelect={() => onDelete(collection)}
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
