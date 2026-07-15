"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Copy, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  absoluteMediaUrl,
  formatFileSize,
  replaceMedia,
  updateMedia,
} from "@/lib/media/api";
import type { MediaAsset, MediaFolder } from "@/lib/media/types";

interface MediaAssetDetailProps {
  asset: MediaAsset | null;
  folders: MediaFolder[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (asset: MediaAsset) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function DetailPreview({ asset }: { asset: MediaAsset }) {
  if (asset.kind === "video") {
    return (
      <video
        src={asset.url}
        controls
        className="max-h-64 w-full rounded-lg bg-black object-contain"
      />
    );
  }

  if (asset.kind === "svg") {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.url}
          alt={asset.alt ?? asset.filename}
          className="max-h-48 max-w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
      <Image
        src={asset.url}
        alt={asset.alt ?? asset.filename}
        fill
        className="object-contain"
        sizes="400px"
      />
    </div>
  );
}

export function MediaAssetDetail({
  asset,
  folders,
  open,
  onOpenChange,
  onUpdated,
}: MediaAssetDetailProps) {
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState("");
  const [title, setTitle] = useState("");
  const [folderId, setFolderId] = useState<string>("root");
  const [saving, setSaving] = useState(false);
  const [replacing, setReplacing] = useState(false);

  useEffect(() => {
    if (!asset) return;
    setAlt(asset.alt ?? "");
    setTitle(asset.title ?? "");
    setFolderId(asset.folderId ?? "root");
  }, [asset]);

  const handleSave = async () => {
    if (!asset) return;
    setSaving(true);
    try {
      const updated = await updateMedia(asset.id, {
        alt: alt.trim() || null,
        title: title.trim() || null,
        folderId: folderId === "root" ? null : folderId,
      });
      onUpdated(updated);
      toast.success("Asset updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleReplace = async (file: File) => {
    if (!asset) return;
    setReplacing(true);
    try {
      const updated = await replaceMedia(asset.id, file);
      onUpdated(updated);
      toast.success("Asset replaced");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Replace failed");
    } finally {
      setReplacing(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!asset) return;
    try {
      await navigator.clipboard.writeText(absoluteMediaUrl(asset.url));
      toast.success("URL copied to clipboard");
    } catch {
      toast.error("Could not copy URL");
    }
  };

  if (!asset) return null;

  const dims =
    asset.width && asset.height ? `${asset.width} × ${asset.height}px` : "—";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="truncate pr-8 text-base">{asset.filename}</SheetTitle>
          <SheetDescription>
            {asset.kind.charAt(0).toUpperCase() + asset.kind.slice(1)} ·{" "}
            {formatFileSize(asset.size)}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto py-4">
          <DetailPreview asset={asset} />

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="asset-alt" className="text-xs text-neutral-600">
                Alt text
              </Label>
              <Input
                id="asset-alt"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Describe this asset for accessibility"
                className="h-9 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="asset-title" className="text-xs text-neutral-600">
                Title
              </Label>
              <Input
                id="asset-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Optional display title"
                className="h-9 rounded-lg text-xs"
              />
            </div>

            {folders.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-600">Folder</Label>
                <Select value={folderId} onValueChange={setFolderId}>
                  <SelectTrigger className="h-9 rounded-lg text-xs">
                    <SelectValue placeholder="All files" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="root">All files (root)</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-neutral-100 bg-neutral-50/80 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
              Metadata
            </p>
            <dl className="mt-2 space-y-1.5 text-xs">
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">MIME type</dt>
                <dd className="font-mono text-[10px] text-neutral-700">{asset.mimeType}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Dimensions</dt>
                <dd className="text-neutral-700">{dims}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Uploaded</dt>
                <dd className="text-neutral-700">{formatDate(asset.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">URL</dt>
                <dd className="truncate font-mono text-[10px] text-neutral-600">{asset.url}</dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-lg text-xs"
              onClick={() => void handleCopyUrl()}
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copy URL
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-lg text-xs"
              disabled={replacing}
              onClick={() => replaceInputRef.current?.click()}
            >
              {replacing ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              )}
              Replace file
            </Button>
            <input
              ref={replaceInputRef}
              type="file"
              className="hidden"
              accept={
                asset.kind === "video"
                  ? "video/mp4,video/webm,video/quicktime"
                  : asset.kind === "svg"
                    ? "image/svg+xml,.svg"
                    : "image/jpeg,image/png,image/webp,image/gif"
              }
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleReplace(file);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        <SheetFooter className="flex-row gap-2 border-t border-neutral-100 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-lg text-xs"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-9 flex-1 rounded-lg bg-[#007AFF] text-xs hover:bg-[#0066DD]"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}