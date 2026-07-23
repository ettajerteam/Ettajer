import sharp from "sharp";

/** Max edge length for product / gallery photos after compression. */
export const PRODUCT_IMAGE_MAX_EDGE = 2000;

/** Accept larger phone photos; we compress before storage. */
export const PRODUCT_IMAGE_RAW_MAX_SIZE = 15 * 1024 * 1024;

/** Logo uploads — smaller edge. */
export const LOGO_IMAGE_MAX_EDGE = 800;

export type CompressedImageResult = {
  file: File;
  width: number;
  height: number;
  size: number;
  originalSize: number;
  mimeType: string;
  compressed: boolean;
};

function basenameWithoutExt(name: string): string {
  const base = name.replace(/\.[^.]+$/, "").trim() || "image";
  return base.replace(/[^\w\-]+/g, "-").slice(0, 80);
}

/**
 * Resize + convert raster images to WebP for smaller Blob/DB storage.
 * SVG and video are returned unchanged. Animated GIF is left as-is.
 */
export async function compressRasterImage(
  file: File,
  options?: { maxEdge?: number; quality?: number }
): Promise<CompressedImageResult> {
  const originalSize = file.size;
  const maxEdge = options?.maxEdge ?? PRODUCT_IMAGE_MAX_EDGE;
  const quality = options?.quality ?? 80;

  if (file.type === "image/svg+xml" || file.type.startsWith("video/")) {
    return {
      file,
      width: 0,
      height: 0,
      size: file.size,
      originalSize,
      mimeType: file.type,
      compressed: false,
    };
  }

  if (!file.type.startsWith("image/")) {
    return {
      file,
      width: 0,
      height: 0,
      size: file.size,
      originalSize,
      mimeType: file.type,
      compressed: false,
    };
  }

  try {
    const input = Buffer.from(await file.arrayBuffer());
    const image = sharp(input, { animated: false, failOn: "none" }).rotate();
    const meta = await image.metadata();

    // Keep animated GIFs as uploaded — sharp would flatten them
    if (file.type === "image/gif" && (meta.pages ?? 1) > 1) {
      return {
        file,
        width: meta.width ?? 0,
        height: meta.height ?? 0,
        size: file.size,
        originalSize,
        mimeType: file.type,
        compressed: false,
      };
    }

    const pipeline = sharp(input, { failOn: "none" })
      .rotate()
      .resize({
        width: maxEdge,
        height: maxEdge,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality, effort: 4 });

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

    // If somehow larger, keep original (rare for huge PNGs already small)
    if (data.length >= originalSize && originalSize <= 500 * 1024) {
      return {
        file,
        width: meta.width ?? info.width,
        height: meta.height ?? info.height,
        size: file.size,
        originalSize,
        mimeType: file.type,
        compressed: false,
      };
    }

    const filename = `${basenameWithoutExt(file.name)}.webp`;
    const out = new File([new Uint8Array(data)], filename, { type: "image/webp" });

    return {
      file: out,
      width: info.width,
      height: info.height,
      size: out.size,
      originalSize,
      mimeType: "image/webp",
      compressed: true,
    };
  } catch {
    // Fall back to original if sharp fails (corrupt file, exotic format)
    return {
      file,
      width: 0,
      height: 0,
      size: file.size,
      originalSize,
      mimeType: file.type,
      compressed: false,
    };
  }
}
