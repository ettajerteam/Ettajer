export type ProductDigitalFile = {
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
};

export function parseProductDigitalFiles(value: unknown): ProductDigitalFile[] {
  if (!Array.isArray(value)) return [];
  const files: ProductDigitalFile[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    if (typeof row.url !== "string" || !row.url.trim()) continue;
    if (typeof row.filename !== "string" || !row.filename.trim()) continue;
    files.push({
      url: row.url.trim(),
      filename: row.filename.trim(),
      mimeType:
        typeof row.mimeType === "string" && row.mimeType.trim()
          ? row.mimeType.trim()
          : "application/pdf",
      sizeBytes: typeof row.sizeBytes === "number" ? row.sizeBytes : 0,
    });
  }
  return files;
}

export function serializeProductDigitalFilesForDb(
  files: ProductDigitalFile[]
): ProductDigitalFile[] {
  return files
    .filter((f) => f.url.trim() && f.filename.trim())
    .map((f) => ({
      url: f.url.trim(),
      filename: f.filename.trim(),
      mimeType: f.mimeType.trim() || "application/pdf",
      sizeBytes: Math.max(0, Math.floor(f.sizeBytes || 0)),
    }));
}

export function formatDigitalFileSize(bytes?: number | null): string | null {
  if (bytes == null || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
