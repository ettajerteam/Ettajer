"use client";

import Image from "next/image";
import { Film, FileCode2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/media/api";
import type { MediaAsset } from "@/lib/media/types";
import { cn } from "@/lib/utils";

interface MediaGridItemProps {
  asset: MediaAsset;
  selected?: boolean;
  onSelect?: (asset: MediaAsset) => void;
  onDelete?: (asset: MediaAsset) => void;
  onOpenDetail?: (asset: MediaAsset) => void;
  pickerMode?: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function AssetPreview({ asset }: { asset: MediaAsset }) {
  if (asset.kind === "video") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/80 text-white">
          <Film className="h-4 w-4" />
        </div>
        <p className="line-clamp-2 text-center text-[10px] font-medium text-neutral-600">
          {asset.filename}
        </p>
      </div>
    );
  }

  if (asset.kind === "svg") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-3">
        <FileCode2 className="h-8 w-8 text-[#007AFF]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.url}
          alt={asset.alt ?? asset.filename}
          className="max-h-16 max-w-full object-contain"
        />
      </div>
    );
  }

  return (
    <Image
      src={asset.url}
      alt={asset.alt ?? asset.filename}
      fill
      className="object-cover"
      sizes="160px"
    />
  );
}

export function MediaGridItem({
  asset,
  selected,
  onSelect,
  onDelete,
  onOpenDetail,
  pickerMode,
}: MediaGridItemProps) {
  const dims =
    asset.width && asset.height ? `${asset.width}×${asset.height}` : null;

  const handleClick = () => {
    if (pickerMode) {
      onSelect?.(asset);
      return;
    }
    if (onOpenDetail) {
      onOpenDetail(asset);
      return;
    }
    onSelect?.(asset);
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-white transition-all",
        selected
          ? "border-[#007AFF] ring-2 ring-[#007AFF]/20 shadow-sm"
          : "border-neutral-200 hover:border-neutral-300 hover:shadow-sm"
      )}
    >
      <button
        type="button"
        onClick={handleClick}
        className="block w-full text-left"
        title={[asset.filename, dims, formatFileSize(asset.size), formatDate(asset.createdAt)]
          .filter(Boolean)
          .join(" · ")}
      >
        <div className="relative aspect-square bg-neutral-100">
          <AssetPreview asset={asset} />
          {selected && (
            <div className="absolute inset-0 bg-[#007AFF]/10 ring-2 ring-inset ring-[#007AFF]/40" />
          )}
          {asset.kind === "logo" && (
            <span className="absolute left-1.5 top-1.5 rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-neutral-600 shadow-sm">
              Logo
            </span>
          )}
          {asset.kind === "svg" && (
            <span className="absolute left-1.5 top-1.5 rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#007AFF] shadow-sm">
              SVG
            </span>
          )}
        </div>
        <div className="border-t border-neutral-100 px-2 py-1.5">
          <p className="truncate text-[11px] font-medium text-neutral-700">{asset.filename}</p>
          <p className="text-[10px] text-neutral-400">{formatFileSize(asset.size)}</p>
        </div>
      </button>

      {onDelete && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute right-1.5 top-1.5 h-7 w-7 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(asset);
          }}
          aria-label={`Delete ${asset.filename}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
