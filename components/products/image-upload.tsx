"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUploadThing } from "@/components/uploadthing";
import { isUploadthingConfigured } from "@/lib/uploadthing-config";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const uploadthingEnabled = isUploadthingConfigured();

  const { startUpload, isUploading } = useUploadThing("productImage", {
    onClientUploadComplete: (res) => {
      const urls = res.map((f) => f.url);
      onChange([...images, ...urls]);
      toast.success(`${urls.length} image(s) uploaded`);
    },
    onUploadError: (error) => {
      toast.error(error.message || "Upload failed");
    },
  });

  const uploadLocal = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (!fileArray.length) return;

      setUploading(true);
      try {
        const formData = new FormData();
        fileArray.forEach((file) => formData.append("files", file));

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message ?? "Upload failed");

        onChange([...images, ...data.urls]);
        toast.success(`${data.urls.length} image(s) uploaded`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [images, onChange]
  );

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (!fileArray.length) return;

      if (uploadthingEnabled) {
        await startUpload(fileArray);
      } else {
        await uploadLocal(files);
      }
    },
    [uploadthingEnabled, startUpload, uploadLocal]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      uploadFiles(e.dataTransfer.files);
    },
    [uploadFiles]
  );

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const busy = uploading || isUploading;

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
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-300",
          isDragging
            ? "border-[#007AFF] bg-[#007AFF]/5"
            : "border-muted-foreground/20 hover:border-[#007AFF]/40 hover:bg-muted/30"
        )}
      >
        {busy ? (
          <Loader2 className="h-8 w-8 animate-spin text-[#007AFF]" />
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm font-medium mb-1">Drag & drop images here</p>
            <p className="text-xs text-muted-foreground mb-1">
              PNG, JPG, WebP up to 4MB
            </p>
            {!uploadthingEnabled && (
              <p className="text-xs text-amber-600 mb-3">
                Add UPLOADTHING_TOKEN to .env for cloud uploads
              </p>
            )}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && uploadFiles(e.target.files)}
              />
              <span className="inline-flex items-center justify-center rounded-xl border border-input bg-background/50 px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
                Browse files
              </span>
            </label>
          </>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          <AnimatePresence>
            {images.map((url, index) => (
              <motion.div
                key={`${url}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="group relative aspect-square rounded-xl overflow-hidden border bg-muted"
              >
                <Image src={url} alt={`Product ${index + 1}`} fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                    Cover
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
