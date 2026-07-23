import { put, del } from "@vercel/blob";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { isUploadthingConfigured } from "@/lib/uploadthing-config";

function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);
}

function hasBlobToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export function canPersistUploads(): boolean {
  return hasBlobToken() || isUploadthingConfigured() || !isVercelRuntime();
}

function getUploadDir(storeId: string): string {
  return path.join(process.cwd(), "public", "uploads", storeId);
}

export function urlToLocalFilePath(url: string, storeId: string): string | null {
  const prefix = `/uploads/${storeId}/`;
  if (!url.startsWith(prefix)) return null;
  const filename = url.slice(prefix.length);
  if (!filename || filename.includes("..") || filename.includes("/")) return null;
  return path.join(getUploadDir(storeId), filename);
}

function isRemoteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/**
 * Persist an uploaded file. Prefer Vercel Blob on production; fall back to
 * local disk only when not running on Vercel (dev). Never mkdir under /var/task.
 */
export async function persistUploadedFile(
  storeId: string,
  file: File,
  options?: { prefix?: string }
): Promise<{ url: string; storedFilename: string }> {
  const ext = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "bin";
  const storedFilename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const keyPrefix = options?.prefix ?? "uploads";
  const pathname = `${keyPrefix}/${storeId}/${storedFilename}`;

  if (hasBlobToken()) {
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type || undefined,
    });
    return { url: blob.url, storedFilename };
  }

  // Optional UploadThing server upload when blob is not configured
  if (isUploadthingConfigured()) {
    const { UTApi } = await import("uploadthing/server");
    const utapi = new UTApi();
    const result = await utapi.uploadFiles(file);
    if (result.error || !result.data) {
      throw new Error(result.error?.message ?? "Cloud upload failed");
    }
    const url = result.data.ufsUrl ?? result.data.url;
    return { url, storedFilename: result.data.name || storedFilename };
  }

  if (isVercelRuntime()) {
    throw new Error(
      "Image uploads require cloud storage. Set BLOB_READ_WRITE_TOKEN (Vercel Blob) or UPLOADTHING_TOKEN on Vercel."
    );
  }

  const uploadDir = getUploadDir(storeId);
  await mkdir(uploadDir, { recursive: true });
  const filepath = path.join(uploadDir, storedFilename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);
  return { url: `/uploads/${storeId}/${storedFilename}`, storedFilename };
}

export async function deletePersistedFile(url: string, storeId: string): Promise<void> {
  if (!url) return;

  if (isRemoteUrl(url)) {
    if (hasBlobToken() && url.includes("blob.vercel-storage.com")) {
      try {
        await del(url);
      } catch {
        // Blob may already be gone
      }
    }
    // UploadThing / other remotes: leave orphan files (no store key to delete safely)
    return;
  }

  const filepath = urlToLocalFilePath(url, storeId);
  if (!filepath) return;
  try {
    await unlink(filepath);
  } catch {
    // File may already be removed
  }
}
