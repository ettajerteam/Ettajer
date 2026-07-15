"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MediaAsset, MediaKind } from "@/lib/media/types";
import { MediaLibraryCore } from "./media-library";

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: string | null;
  onSelect: (asset: MediaAsset) => void;
  kind?: MediaKind | "all";
  title?: string;
}

export function MediaPicker({
  open,
  onOpenChange,
  value,
  onSelect,
  kind = "all",
  title = "Choose media",
}: MediaPickerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-neutral-100 px-6 py-4">
          <DialogTitle className="text-base">{title}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto px-6 py-4">
          <MediaLibraryCore
            kind={kind}
            selectedUrl={value}
            compactUpload
            showDelete={false}
            showDetail={false}
            showFolders
            onSelect={(asset) => {
              onSelect(asset);
              onOpenChange(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
