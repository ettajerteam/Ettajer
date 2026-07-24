"use client";

import { useCallback, useState } from "react";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  formatDigitalFileSize,
  type ProductDigitalFile,
} from "@/lib/product-digital-files";
import { cn } from "@/lib/utils";

interface DigitalFileUploadProps {
  files: ProductDigitalFile[];
  onChange: (files: ProductDigitalFile[]) => void;
  /** Max PDF files (ebooks usually need 1). */
  maxFiles?: number;
}

export function DigitalFileUpload({
  files,
  onChange,
  maxFiles = 3,
}: DigitalFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const uploadFiles = useCallback(
    async (list: FileList | File[]) => {
      const incoming = Array.from(list).filter(
        (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
      );
      if (!incoming.length) {
        toast.error("Please choose a PDF file");
        return;
      }
      if (files.length + incoming.length > maxFiles) {
        toast.error(`You can attach up to ${maxFiles} PDF file(s)`);
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("kind", "document");
        incoming.forEach((file) => formData.append("files", file));

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Upload failed");

        const next: ProductDigitalFile[] = Array.isArray(data.assets)
          ? data.assets.map(
              (a: {
                url: string;
                filename?: string;
                mimeType?: string;
                sizeBytes?: number;
                alt?: string | null;
              }) => ({
                url: a.url,
                filename: a.filename || a.alt || "ebook.pdf",
                mimeType: a.mimeType || "application/pdf",
                sizeBytes: a.sizeBytes ?? 0,
              })
            )
          : [];

        onChange([...files, ...next]);
        toast.success(`${next.length} PDF uploaded`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [files, maxFiles, onChange]
  );

  const removeAt = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          void uploadFiles(e.dataTransfer.files);
        }}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-8 transition-all",
          isDragging
            ? "border-[#007AFF] bg-[#007AFF]/5"
            : "border-muted-foreground/20 hover:border-[#007AFF]/40 hover:bg-muted/30"
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-7 w-7 animate-spin text-[#007AFF]" />
            <p className="text-sm font-medium">Uploading PDF…</p>
          </div>
        ) : (
          <>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#007AFF]/10 text-[#007AFF]">
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium">Upload ebook PDF</p>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              PDF only · up to 50 MB · customers get this file after purchase
            </p>
            <label className="mt-4 cursor-pointer">
              <input
                type="file"
                accept="application/pdf,.pdf"
                multiple={maxFiles > 1}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) void uploadFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <span className="inline-flex items-center justify-center rounded-xl bg-[#007AFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#0066d6]">
                Choose PDF
              </span>
            </label>
          </>
        )}
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => {
            const size = formatDigitalFileSize(file.sizeBytes);
            return (
              <li
                key={`${file.url}-${index}`}
                className="flex items-center gap-3 rounded-xl border bg-muted/30 px-3 py-2.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.filename}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {[file.mimeType === "application/pdf" ? "PDF" : file.mimeType, size]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-600"
                  aria-label="Remove PDF"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
