"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  formatImageDimensions,
  formatImageFileSize,
  type ProductImageAsset,
} from "@/lib/product-images";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  images: ProductImageAsset[];
  onChange: (images: ProductImageAsset[]) => void;
}

function savingsLabel(asset: ProductImageAsset): string | null {
  if (
    !asset.compressed ||
    asset.originalSizeBytes == null ||
    asset.sizeBytes == null ||
    asset.originalSizeBytes <= asset.sizeBytes
  ) {
    return null;
  }
  const pct = Math.round((1 - asset.sizeBytes / asset.originalSizeBytes) * 100);
  if (pct < 5) return null;
  return `${pct}% smaller`;
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (!fileArray.length) {
        toast.error("Please choose image files (JPG, PNG, WebP)");
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        fileArray.forEach((file) => formData.append("files", file));

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message ?? "Upload failed");

        const assets: ProductImageAsset[] = Array.isArray(data.assets)
          ? data.assets.map(
              (a: {
                url: string;
                width?: number | null;
                height?: number | null;
                sizeBytes?: number;
                alt?: string | null;
                originalSizeBytes?: number | null;
                compressed?: boolean;
              }) => ({
                url: a.url,
                width: a.width ?? null,
                height: a.height ?? null,
                sizeBytes: a.sizeBytes ?? null,
                alt: a.alt ?? null,
                originalSizeBytes: a.originalSizeBytes ?? null,
                compressed: a.compressed,
              })
            )
          : (data.urls as string[]).map((url: string) => ({ url }));

        onChange([...images, ...assets]);

        const compressedCount = assets.filter((a) => a.compressed).length;
        if (compressedCount > 0) {
          toast.success(
            `${assets.length} photo${assets.length === 1 ? "" : "s"} uploaded · auto-compressed`
          );
        } else {
          toast.success(`${assets.length} image(s) uploaded`);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [images, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      void uploadFiles(e.dataTransfer.files);
    },
    [uploadFiles]
  );

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const setAsCover = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const [picked] = next.splice(index, 1);
    next.unshift(picked);
    onChange(next);
    toast.success("Cover photo updated");
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition-all duration-300",
          isDragging
            ? "border-[#007AFF] bg-[#007AFF]/5 scale-[1.01]"
            : "border-muted-foreground/20 hover:border-[#007AFF]/40 hover:bg-muted/30"
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#007AFF]" />
            <p className="text-sm font-medium text-foreground">Compressing & uploading…</p>
            <p className="text-xs text-muted-foreground">Photos are optimized before saving</p>
          </div>
        ) : (
          <>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#007AFF]/10 text-[#007AFF]">
              <ImagePlus className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium mb-1">Drag & drop product photos</p>
            <p className="text-xs text-muted-foreground mb-1 text-center max-w-sm">
              JPG, PNG, WebP · up to 15 MB each · auto-compressed to WebP
            </p>
            <p className="text-xs text-muted-foreground/80 mb-4 text-center">
              Saved to your media library and linked when you publish
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) void uploadFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <span className="inline-flex items-center justify-center rounded-xl bg-[#007AFF] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0066d6]">
                Browse photos
              </span>
            </label>
          </>
        )}
      </div>

      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              {images.length} photo{images.length === 1 ? "" : "s"} · first is the cover
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            <AnimatePresence initial={false}>
              {images.map((asset, index) => {
                const dims = formatImageDimensions(asset);
                const size = formatImageFileSize(asset.sizeBytes);
                const saved = savingsLabel(asset);
                return (
                  <motion.div
                    key={`${asset.url}-${index}`}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border bg-muted",
                      index === 0 && "ring-2 ring-[#007AFF]/35"
                    )}
                  >
                    <div className="relative aspect-[4/5]">
                      <Image
                        src={asset.url}
                        alt={asset.alt || `Product ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-1 p-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                        {index !== 0 ? (
                          <button
                            type="button"
                            onClick={() => setAsCover(index)}
                            className="inline-flex items-center gap-1 rounded-lg bg-black/65 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm hover:bg-black/80"
                            title="Set as cover"
                          >
                            <Star className="h-3 w-3" />
                            Cover
                          </button>
                        ) : (
                          <span />
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/65 text-white backdrop-blur-sm hover:bg-red-600/90"
                          aria-label="Remove image"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {index === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 rounded-md bg-[#007AFF] px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm">
                          Cover
                        </span>
                      )}
                      {saved && (
                        <span className="absolute bottom-1.5 right-1.5 rounded-md bg-emerald-600/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          {saved}
                        </span>
                      )}
                    </div>
                    {(dims || size) && (
                      <p className="border-t border-border/60 px-2 py-1.5 text-[10px] text-muted-foreground">
                        {[dims, size].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
