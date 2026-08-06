"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowUpRight, Check, MoreHorizontal, PenLine, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { EmailTemplateRow } from "@/lib/email-marketing/types";
import type { EmailGalleryItem } from "@/lib/email-marketing/gallery";

interface EmailTemplatesClientProps {
  initial: EmailTemplateRow[];
  gallery: EmailGalleryItem[];
  storePrimaryColor?: string | null;
}

export function EmailTemplatesClient({
  initial,
  gallery,
  storePrimaryColor: _storePrimaryColor,
}: EmailTemplatesClientProps) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initial);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmailTemplateRow | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const ownedGalleryIds = useMemo(
    () => new Set(templates.map((t) => t.galleryId).filter(Boolean)),
    [templates],
  );

  async function addFromGallery(galleryId: string) {
    setAddingId(galleryId);
    try {
      const res = await fetch("/api/email/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "gallery", galleryId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Failed to add",
        );
      }
      const tpl = data.template as EmailTemplateRow;
      setTemplates((prev) => [tpl, ...prev]);
      toast.success("Template added");
      router.push(`/dashboard/marketing/email/templates/${tpl.id}/edit`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add");
    } finally {
      setAddingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/email/templates?id=${encodeURIComponent(deleteTarget.id)}`,
        { method: "DELETE" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Delete failed",
        );
      }
      setTemplates((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Template deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex justify-end">
        <Button
          asChild
          className="h-9 rounded-full bg-neutral-950 px-4 text-[13px] font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
        >
          <Link href="/dashboard/marketing/email/templates/new">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create
          </Link>
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 px-6 py-10 text-center dark:border-white/15">
          <p className="text-[13px] font-medium text-neutral-950 dark:text-white">
            No templates yet
          </p>
          <p className="mx-auto mt-1 max-w-xs text-[12px] text-neutral-400">
            Add a starter below, or create a blank template.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-100 dark:divide-white/10 dark:border-white/10">
          {templates.map((tpl) => (
            <li key={tpl.id}>
              <div className="flex items-center gap-3 px-4 py-3.5">
                <Link
                  href={`/dashboard/marketing/email/templates/${tpl.id}/edit`}
                  className="min-w-0 flex-1"
                >
                  <p className="truncate text-[13px] font-medium text-neutral-950 dark:text-white">
                    {tpl.name}
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-neutral-400">
                    {tpl.subject}
                  </p>
                </Link>
                <Link
                  href={`/dashboard/marketing/email/templates/${tpl.id}/edit`}
                  className="hidden text-[12px] font-medium text-neutral-500 hover:text-neutral-900 sm:inline dark:hover:text-white"
                >
                  Edit
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 rounded-full text-neutral-400"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 text-[12px]">
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/marketing/email/templates/${tpl.id}/edit`}
                      >
                        <PenLine className="mr-2 h-3.5 w-3.5" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => setDeleteTarget(tpl)}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          ))}
        </ul>
      )}

      <section>
        <h3 className="mb-3 text-[13px] font-semibold tracking-[-0.01em] text-neutral-950 dark:text-white">
          Starters
        </h3>
        <ul className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-100 dark:divide-white/10 dark:border-white/10">
          {gallery.map((item) => {
            const added = ownedGalleryIds.has(item.id);
            return (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 px-4 py-3.5"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-neutral-950 dark:text-white">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-[12px] text-neutral-400">
                    {item.description}
                  </p>
                </div>
                <Button
                  type="button"
                  variant={added ? "outline" : "default"}
                  className={cn(
                    "h-8 shrink-0 rounded-full px-3 text-[12px]",
                    added
                      ? "border-neutral-200 text-neutral-400 dark:border-white/15"
                      : "bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950",
                  )}
                  disabled={added || addingId === item.id}
                  loading={addingId === item.id}
                  onClick={() => void addFromGallery(item.id)}
                >
                  {added ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Added
                    </>
                  ) : (
                    <>
                      Add
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      </section>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete template?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `“${deleteTarget.name}” will be removed. Automations using it must be unlinked first.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-full text-[12px]"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-8 rounded-full bg-red-600 px-3 text-[12px] text-white hover:bg-red-700"
              loading={deleting}
              onClick={() => void handleDelete()}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
