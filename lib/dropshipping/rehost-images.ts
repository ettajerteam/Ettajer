import { saveUploadedFile } from "@/lib/media/service";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function extFromContentType(type: string): string {
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  if (type.includes("gif")) return "gif";
  return "jpg";
}

async function rehostOne(
  storeId: string,
  imageUrl: string,
  index: number,
  altPrefix?: string
): Promise<{
  url: string;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  alt: string | null;
}> {
  const fallback = {
    url: imageUrl,
    width: null as number | null,
    height: null as number | null,
    sizeBytes: null as number | null,
    alt: altPrefix ? `${altPrefix} ${index + 1}` : null,
  };
  try {
    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        Referer: new URL(imageUrl).origin,
      },
      signal: AbortSignal.timeout(12000),
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = (res.headers.get("content-type") || "image/jpeg").split(";")[0].trim();
    if (!contentType.startsWith("image/")) throw new Error("Not an image");
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength < 500) throw new Error("Image too small");
    const ext = extFromContentType(contentType);
    const file = new File([new Uint8Array(buffer)], `import-${Date.now()}-${index}.${ext}`, {
      type: contentType === "image/jpg" ? "image/jpeg" : contentType,
    });
    const asset = await saveUploadedFile(storeId, file, {
      kind: "image",
      metadata: {
        alt: altPrefix ? `${altPrefix} ${index + 1}` : `Imported image ${index + 1}`,
      },
    });
    return {
      url: asset.url,
      width: asset.width,
      height: asset.height,
      sizeBytes: asset.size,
      alt: asset.alt,
    };
  } catch {
    return fallback;
  }
}

/**
 * Download remote supplier images and persist them into the store media library.
 * Runs in parallel for speed. Falls back to the original remote URL on failure.
 */
export async function rehostSupplierImages(
  storeId: string,
  imageUrls: string[],
  opts?: { limit?: number; altPrefix?: string }
): Promise<
  { url: string; width: number | null; height: number | null; sizeBytes: number | null; alt: string | null }[]
> {
  const limit = opts?.limit ?? 6;
  const slice = imageUrls.slice(0, limit);
  return Promise.all(
    slice.map((imageUrl, index) => rehostOne(storeId, imageUrl, index, opts?.altPrefix))
  );
}
