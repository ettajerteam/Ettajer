"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUploadThing } from "@/components/uploadthing";
import { isUploadthingConfigured } from "@/lib/uploadthing-config";
import { cn } from "@/lib/utils";

interface SingleImageUploadProps {
  image: string | null;
  onChange: (image: string | null) => void;
  label?: string;
}

export function SingleImageUpload({ image, onChange, label = "Image" }: SingleImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const uploadthingEnabled = isUploadthingConfigured();

  const { startUpload, isUploading } = useUploadThing("productImage", {
    onClientUploadComplete: (res) => {
      if (res[0]?.url) {
        onChange(res[0].url);
        toast.success("Image uploaded");
      }
    },
    onUploadError: (error) => {
      toast.error(error.message || "Upload failed");
    },
  });

  const uploadLocal = useCallback(
    async (files: FileList | File[]) => {
      const file = Array.from(files)[0];
      if (!file) return;

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("files", file);

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message ?? "Upload failed");

        onChange(data.urls[0] ?? null);
        toast.success("Image uploaded");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      if (uploadthingEnabled) {
        await startUpload(Array.from(files));
      } else {
        await uploadLocal(files);
      }
    },
    [uploadthingEnabled, startUpload, uploadLocal]
  );

  const busy = uploading || isUploading;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <AnimatePresence mode="wait">
        {image ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative h-40 w-full rounded-xl overflow-hidden border bg-muted/30"
          >
            <Image src={image} alt="" fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
            }}
            className={cn(
              "relative flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed transition-colors cursor-pointer",
              isDragging ? "border-[#007AFF] bg-[#007AFF]/5" : "border-muted-foreground/25 hover:border-[#007AFF]/50"
            )}
          >
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={busy}
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
            {busy ? (
              <Loader2 className="h-8 w-8 text-[#007AFF] animate-spin" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
