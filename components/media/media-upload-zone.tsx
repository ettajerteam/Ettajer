"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaKind } from "@/lib/media/types";

interface MediaUploadZoneProps {
  onUpload: (files: File[]) => Promise<void>;
  kind?: MediaKind | "all";
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}

function acceptForKind(kind?: MediaKind | "all"): string {
  if (kind === "video") return "video/mp4,video/webm,video/quicktime";
  if (kind === "svg") return "image/svg+xml,.svg";
  if (kind === "logo" || kind === "image") {
    return "image/jpeg,image/png,image/webp,image/gif";
  }
  return "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,.svg,video/mp4,video/webm,video/quicktime";
}

export function MediaUploadZone({
  onUpload,
  kind = "all",
  disabled,
  compact,
  className,
}: MediaUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList?.length || disabled || uploading) return;
      const files = Array.from(fileList);
      setUploading(true);
      try {
        await onUpload(files);
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [disabled, onUpload, uploading]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void handleFiles(e.dataTransfer.files);
  };

  const sizeHint =
    kind === "video"
      ? "MP4, WebM · max 50MB"
      : kind === "svg"
        ? "SVG · max 1MB"
        : kind === "all"
          ? "Images, SVG, video · up to 50MB"
          : "JPEG, PNG, WebP, GIF · max 5MB";

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onClick={() => !disabled && !uploading && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        "group relative flex cursor-pointer rounded-lg border border-dashed transition-all",
        compact
          ? "flex-row items-center gap-2.5 px-3 py-2.5"
          : "flex-col items-center justify-center px-6 py-8",
        dragging
          ? "border-[#007AFF] bg-[#007AFF]/5"
          : "border-neutral-200 bg-neutral-50/80 hover:border-neutral-300 hover:bg-neutral-50",
        (disabled || uploading) && "pointer-events-none opacity-60",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={acceptForKind(kind)}
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => void handleFiles(e.target.files)}
      />
      {uploading ? (
        <Loader2
          className={cn(
            "shrink-0 animate-spin text-[#007AFF]",
            compact ? "h-4 w-4" : "h-6 w-6"
          )}
        />
      ) : (
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-neutral-200",
            compact ? "h-8 w-8" : "h-10 w-10"
          )}
        >
          <Upload
            className={cn(
              "text-neutral-500 group-hover:text-[#007AFF]",
              compact ? "h-3.5 w-3.5" : "h-4 w-4"
            )}
          />
        </div>
      )}
      <div className={cn(!compact && "mt-3 text-center", compact && "min-w-0 flex-1")}>
        <p
          className={cn(
            "font-medium text-neutral-700",
            compact ? "truncate text-xs" : "text-sm"
          )}
        >
          {uploading ? "Uploading…" : "Drop files here or click to upload"}
        </p>
        <p className={cn("text-neutral-400", compact ? "truncate text-[10px]" : "mt-1 text-[11px]")}>
          {sizeHint}
        </p>
      </div>
    </div>
  );
}
