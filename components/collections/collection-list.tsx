"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { MoreHorizontal, Pencil, Trash2, Layers, Plus, Star } from "lucide-react";
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
import type { Collection } from "@/types/catalog";

interface CollectionListProps {
  collections: Collection[];
  onEdit: (collection: Collection) => void;
  onAdd: () => void;
  onRefresh: () => void;
  toolbar?: ReactNode;
}

export function CollectionList({
  collections,
  onEdit,
  onAdd,
  onRefresh,
  toolbar,
}: CollectionListProps) {
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/collections/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to delete");
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

  if (collections.length === 0) {
    return (
      <ProductsEmptyState
        icon={Layers}
        title="No collections yet"
        description="Group products into curated collections for campaigns and homepage features."
        action={
          <Button onClick={onAdd} className="rounded-xl bg-[#007AFF] hover:bg-[#007AFF]/90">
            <Plus className="mr-1.5 h-4 w-4" />
            Add collection
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="premium-card overflow-hidden">
        <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">All collections</h2>
          {toolbar}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="hidden px-6 py-3 font-medium sm:table-cell">Slug</th>
                <th className="px-6 py-3 font-medium">Products</th>
                <th className="hidden px-6 py-3 font-medium md:table-cell">Featured</th>
                <th className="px-6 py-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {collections.map((collection) => (
                <tr
                  key={collection.id}
                  className="group cursor-pointer border-b border-border/80 transition-colors duration-200 last:border-0 hover:bg-muted/35"
                  onClick={() => onEdit(collection)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted">
                        {collection.image ? (
                          <Image
                            src={collection.image}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Layers className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-foreground">{collection.name}</span>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 font-mono text-sm text-muted-foreground sm:table-cell">
                    {collection.slug}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{collection.productCount}</td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    {collection.featured ? (
                      <Badge className="border-0 bg-[#007AFF]/10 text-[#007AFF]">
                        <Star className="mr-1 h-3 w-3 fill-current" />
                        Featured
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
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
                        <DropdownMenuItem onClick={() => onEdit(collection)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(collection)}
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
            <DialogTitle className="text-xl tracking-[-0.02em]">Delete collection</DialogTitle>
            <DialogDescription>
              Delete &quot;{deleteTarget?.name}&quot;? Products will not be deleted.
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
