export type ProductImageAsset = {
  url: string;
  width?: number | null;
  height?: number | null;
  sizeBytes?: number | null;
  alt?: string | null;
};

export function parseProductImageAssets(images: unknown): ProductImageAsset[] {
  if (!Array.isArray(images)) return [];

  const assets: ProductImageAsset[] = [];
  for (const entry of images) {
    if (typeof entry === "string" && entry.trim()) {
      assets.push({ url: entry.trim() });
      continue;
    }
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    if (typeof row.url !== "string" || !row.url.trim()) continue;
    assets.push({
      url: row.url.trim(),
      width: typeof row.width === "number" ? row.width : null,
      height: typeof row.height === "number" ? row.height : null,
      sizeBytes: typeof row.sizeBytes === "number" ? row.sizeBytes : null,
      alt: typeof row.alt === "string" ? row.alt : null,
    });
  }
  return assets;
}

/** Storefront / legacy helpers — URL list only. */
export function parseProductImages(images: unknown): string[] {
  return parseProductImageAssets(images).map((asset) => asset.url);
}

export function serializeProductImagesForDb(images: ProductImageAsset[]): ProductImageAsset[] {
  return images
    .filter((img) => img.url.trim())
    .map((img) => ({
      url: img.url.trim(),
      ...(img.width != null ? { width: img.width } : {}),
      ...(img.height != null ? { height: img.height } : {}),
      ...(img.sizeBytes != null ? { sizeBytes: img.sizeBytes } : {}),
      ...(img.alt?.trim() ? { alt: img.alt.trim() } : {}),
    }));
}

export function formatImageDimensions(asset: ProductImageAsset): string | null {
  if (asset.width && asset.height) return `${asset.width}×${asset.height}`;
  return null;
}

export function formatImageFileSize(bytes?: number | null): string | null {
  if (bytes == null || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
