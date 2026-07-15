"use client";

import { AlertTriangle, FileText, Layers, Navigation, Palette, Undo2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SECTION_REGISTRY } from "@/lib/sections/registry";
import { getTemplateHomeLayout, getTemplateSecondaryPages } from "@/lib/website-templates";
import type { WebsiteTemplate } from "@/lib/website-templates";
import type { StorePageRow } from "@/lib/pages";

interface WebsiteTemplateApplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: WebsiteTemplate | null;
  existingPages: StorePageRow[];
  applying?: boolean;
  onConfirm: () => void;
}

export function WebsiteTemplateApplyDialog({
  open,
  onOpenChange,
  template,
  existingPages,
  applying,
  onConfirm,
}: WebsiteTemplateApplyDialogProps) {
  if (!template) return null;

  const homeLayout = getTemplateHomeLayout(template);
  const existingSlugs = new Set(existingPages.map((p) => p.slug));
  const pagesToCreate = getTemplateSecondaryPages(template).filter(
    (p) => !existingSlugs.has(p.slug)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply {template.name}?</DialogTitle>
          <DialogDescription>
            This replaces your current draft layout, theme colors, and navigation. Your live store
            stays unchanged until you publish.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-3">
          <p className="flex items-start gap-2 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Applying a template overwrites draft sections, theme settings, and navigation. Existing
              custom pages are kept.
            </span>
          </p>
        </div>

        <ul className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50/80 p-3 text-sm">
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <Palette className="h-3.5 w-3.5 text-[#007AFF]" />
            </span>
            <span>
              <span className="font-medium text-neutral-900">Theme style & colors</span>
              <span className="block text-xs text-neutral-500 capitalize">
                {template.theme.theme} · {template.theme.font}
              </span>
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <Layers className="h-3.5 w-3.5 text-[#007AFF]" />
            </span>
            <span>
              <span className="font-medium text-neutral-900">Home sections</span>
              <span className="block text-xs text-neutral-500">
                {homeLayout.sections.length} sections —{" "}
                {homeLayout.sections.map((s) => SECTION_REGISTRY[s.type].label).join(", ")}
              </span>
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <Navigation className="h-3.5 w-3.5 text-[#007AFF]" />
            </span>
            <span>
              <span className="font-medium text-neutral-900">Navigation</span>
              <span className="block text-xs text-neutral-500">
                {template.navigation.map((n) => n.label).join(" · ")}
              </span>
            </span>
          </li>
          {pagesToCreate.length > 0 && (
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                <FileText className="h-3.5 w-3.5 text-[#007AFF]" />
              </span>
              <span>
                <span className="font-medium text-neutral-900">New pages (drafts)</span>
                <span className="block text-xs text-neutral-500">
                  Will create {pagesToCreate.length} page{pagesToCreate.length === 1 ? "" : "s"} if
                  they don&apos;t exist: {pagesToCreate.map((p) => p.title).join(", ")}
                </span>
              </span>
            </li>
          )}
        </ul>

        <p className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Undo2 className="h-3.5 w-3.5" />
          You can undo with Ctrl+Z or customize everything before publishing.
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={applying}>
            Cancel
          </Button>
          <Button className="bg-[#007AFF]" onClick={onConfirm} loading={applying}>
            Apply to draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
