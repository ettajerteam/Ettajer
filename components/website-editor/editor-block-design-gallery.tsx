"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BlockDesignThumb } from "@/components/website-editor/block-design-thumb";
import { getBlock } from "@/lib/builder/block-registry";
import {
  getPresetsForBlock,
  type BlockDesignPreset,
} from "@/lib/builder/block-design-presets";
import type { ApplyDesignMode } from "@/lib/builder/apply-design-preset";
import type { BlockId } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

interface EditorBlockDesignGalleryProps {
  open: boolean;
  blockId: BlockId | null;
  mode?: "insert" | "replace";
  onOpenChange: (open: boolean) => void;
  onPick: (
    preset: BlockDesignPreset,
    options?: { applyMode?: ApplyDesignMode }
  ) => void;
  /** Insert block defaults without a named preset */
  onPickDefault?: () => void;
}

export function EditorBlockDesignGallery({
  open,
  blockId,
  mode = "insert",
  onOpenChange,
  onPick,
  onPickDefault,
}: EditorBlockDesignGalleryProps) {
  const block = blockId ? getBlock(blockId) : undefined;
  const presets = useMemo(() => {
    if (!blockId) return [];
    const listed = getPresetsForBlock(blockId);
    if (listed.length > 0) return listed;
    return [
      {
        id: `${blockId}-default`,
        blockId,
        name: block?.name ?? "Default",
        description: block?.description || "Standard layout — customize after adding",
        thumb: "generic" as const,
        settings: { ...(block?.defaultContent ?? {}) },
      } satisfies BlockDesignPreset,
    ];
  }, [blockId, block]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [keepContent, setKeepContent] = useState(true);

  const selected = presets.find((p) => p.id === selectedId) ?? presets[0] ?? null;
  const isProductGallery =
    blockId === "product-grid" || blockId === "featured-products";
  const isCollectionGallery = blockId === "collection-banner";
  const isPhotoGallery = isProductGallery || isCollectionGallery;

  useEffect(() => {
    if (open && presets[0]) {
      setSelectedId(presets[0].id);
      setKeepContent(true);
    }
  }, [open, blockId, presets]);

  const title =
    mode === "replace"
      ? `Change ${block?.name ?? "block"} design`
      : `Choose a ${block?.name ?? "block"} design`;

  const applyMode: ApplyDesignMode = keepContent ? "keep-content" : "replace-all";

  const handlePick = (preset: BlockDesignPreset) => {
    onPick(preset, mode === "replace" ? { applyMode } : undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl",
          isPhotoGallery ? "max-w-4xl" : "max-w-3xl"
        )}
      >
        <div className="shrink-0 border-b border-neutral-200 px-5 py-4">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="flex items-center gap-2.5 text-base">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#007AFF]/10 text-[#007AFF]">
                <LayoutTemplate className="h-4 w-4" />
              </span>
              <span className="min-w-0 truncate">{title}</span>
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-snug">
              {mode === "replace"
                ? keepContent
                  ? "Updates layout and style only — your text, images, and selected products stay."
                  : "Replaces layout, style, and template copy from the design you pick."
                : isProductGallery
                  ? "Each template shows a visual demo with product photos. Pick one — then choose your real products in the inspector."
                  : isCollectionGallery
                    ? "Each template shows a collection layout demo. Pick one — then choose which collections to show in the inspector."
                    : "Pick a starting layout. You can edit copy, images, and style after adding."}
            </DialogDescription>
            {presets.length > 0 ? (
              <p className="text-[11px] tabular-nums text-neutral-400">
                {presets.length} template{presets.length === 1 ? "" : "s"}
              </p>
            ) : null}
          </DialogHeader>

          {mode === "replace" ? (
            <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5">
              <input
                type="checkbox"
                checked={keepContent}
                onChange={(e) => setKeepContent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[#007AFF] focus:ring-[#007AFF]"
              />
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-neutral-900">
                  Keep my text & images
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-neutral-500">
                  Recommended. Uncheck only if you want the template’s sample copy too.
                </span>
              </span>
            </label>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-5 py-4">
          {presets.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-500">
              No design presets for this block yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {presets.map((preset) => {
                const active = selected?.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedId(preset.id)}
                    onDoubleClick={() => handlePick(preset)}
                    className={cn(
                      "group flex min-w-0 flex-col overflow-hidden rounded-xl border text-left transition-all",
                      active
                        ? "border-[#007AFF] bg-[#007AFF]/[0.04] ring-2 ring-[#007AFF]/25"
                        : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm"
                    )}
                  >
                    <div className="relative border-b border-neutral-100 bg-neutral-50">
                      <BlockDesignThumb
                        kind={preset.thumb}
                        images={preset.previewImages}
                        className={cn(
                          "w-full rounded-none border-0",
                          isPhotoGallery ? "h-[148px]" : "h-[104px]"
                        )}
                      />
                      {active ? (
                        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#007AFF] text-white shadow-sm">
                          <Check className="h-3 w-3" />
                        </span>
                      ) : null}
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5 px-3 py-2.5">
                      <p className="truncate text-[13px] font-semibold text-neutral-900">
                        {preset.name}
                      </p>
                      <p className="line-clamp-2 text-[11px] leading-snug text-neutral-500">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-neutral-200 bg-neutral-50/90 px-5 py-3 sm:justify-end">
          <div className="flex w-full flex-wrap justify-end gap-2">
            {mode === "insert" && onPickDefault ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-lg"
                onClick={() => {
                  onPickDefault();
                  onOpenChange(false);
                }}
              >
                Use default
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="rounded-lg"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            )}
            <Button
              type="button"
              className="rounded-lg bg-[#007AFF] hover:bg-[#0066d6]"
              disabled={!selected}
              onClick={() => {
                if (!selected) return;
                handlePick(selected);
              }}
            >
              {mode === "replace"
                ? keepContent
                  ? "Apply layout"
                  : "Replace with template"
                : "Add this design"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
