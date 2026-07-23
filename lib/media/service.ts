import path from "path";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { deletePersistedFile, persistUploadedFile, urlToLocalFilePath } from "@/lib/media/storage";
import type {
  MediaFolderCreatePayload,
  MediaFolderUpdatePayload,
  MediaKind,
  MediaMetadata,
  MediaUpdatePayload,
  MediaUploadMetadata,
} from "./types";

export const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
export const VIDEO_MAX_SIZE = 50 * 1024 * 1024;
export const SVG_MAX_SIZE = 1 * 1024 * 1024;

export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const SVG_MIME_TYPES = ["image/svg+xml"];
export const VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

/** @deprecated Prefer persistUploadedFile from @/lib/media/storage */
export function getUploadDir(storeId: string): string {
  return path.join(process.cwd(), "public", "uploads", storeId);
}

/** @deprecated Prefer urlToLocalFilePath from @/lib/media/storage */
export function urlToFilePath(url: string, storeId: string): string | null {
  return urlToLocalFilePath(url, storeId);
}

function inferKind(mimeType: string, requestedKind?: MediaKind): MediaKind {
  if (requestedKind === "logo") return "logo";
  if (SVG_MIME_TYPES.includes(mimeType)) return "svg";
  if (VIDEO_MIME_TYPES.includes(mimeType)) return "video";
  if (requestedKind === "svg") return "svg";
  return requestedKind === "video" ? "video" : "image";
}

function maxSizeForMime(mimeType: string): number {
  if (VIDEO_MIME_TYPES.includes(mimeType)) return VIDEO_MAX_SIZE;
  if (SVG_MIME_TYPES.includes(mimeType)) return SVG_MAX_SIZE;
  return IMAGE_MAX_SIZE;
}

function isAllowedMime(mimeType: string, kind?: MediaKind): boolean {
  if (kind === "logo") return IMAGE_MIME_TYPES.includes(mimeType);
  if (kind === "svg") return SVG_MIME_TYPES.includes(mimeType);
  if (kind === "video") return VIDEO_MIME_TYPES.includes(mimeType);
  return (
    IMAGE_MIME_TYPES.includes(mimeType) ||
    SVG_MIME_TYPES.includes(mimeType) ||
    VIDEO_MIME_TYPES.includes(mimeType)
  );
}

function buildMetadata(
  file: File,
  options?: { width?: number; height?: number }
): MediaMetadata {
  return {
    mimeType: file.type,
    size: file.size,
    ...(options?.width != null ? { width: options.width } : {}),
    ...(options?.height != null ? { height: options.height } : {}),
  };
}

export function serializeMediaFolder(folder: {
  id: string;
  storeId: string;
  name: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: { assets: number };
}) {
  return {
    id: folder.id,
    storeId: folder.storeId,
    name: folder.name,
    parentId: folder.parentId,
    createdAt: folder.createdAt.toISOString(),
    updatedAt: folder.updatedAt.toISOString(),
    ...(folder._count ? { assetCount: folder._count.assets } : {}),
  };
}

export function serializeMediaAsset(asset: {
  id: string;
  storeId: string;
  folderId: string | null;
  url: string;
  filename: string;
  mimeType: string;
  kind: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  title: string | null;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: asset.id,
    storeId: asset.storeId,
    folderId: asset.folderId,
    url: asset.url,
    filename: asset.filename,
    mimeType: asset.mimeType,
    kind: asset.kind as MediaKind,
    size: asset.size,
    width: asset.width,
    height: asset.height,
    alt: asset.alt,
    title: asset.title,
    metadata: (asset.metadata as MediaMetadata | null) ?? null,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
  };
}

async function writeFileToDisk(storeId: string, file: File): Promise<{ url: string; storedFilename: string }> {
  return persistUploadedFile(storeId, file);
}

export async function saveUploadedFile(
  storeId: string,
  file: File,
  options?: { kind?: MediaKind; metadata?: MediaUploadMetadata; folderId?: string | null }
) {
  if (!isAllowedMime(file.type, options?.kind)) {
    throw new Error(`Invalid file type: ${file.type}`);
  }

  const maxSize = maxSizeForMime(file.type);
  if (file.size > maxSize) {
    const limitMb = maxSize / (1024 * 1024);
    throw new Error(`File too large: ${file.name} (max ${limitMb}MB)`);
  }

  const { url } = await writeFileToDisk(storeId, file);
  const kind = inferKind(file.type, options?.kind);
  const width = options?.metadata?.width ?? null;
  const height = options?.metadata?.height ?? null;

  const asset = await prisma.mediaAsset.create({
    data: {
      storeId,
      folderId: options?.folderId ?? null,
      url,
      filename: file.name,
      mimeType: file.type,
      kind,
      size: file.size,
      width,
      height,
      alt: options?.metadata?.alt ?? file.name.replace(/\.[^.]+$/, ""),
      title: options?.metadata?.title ?? null,
      metadata: buildMetadata(file, {
        width: width ?? undefined,
        height: height ?? undefined,
      }) as Prisma.InputJsonValue,
    },
  });

  return serializeMediaAsset(asset);
}

export async function replaceMediaAssetFile(
  storeId: string,
  id: string,
  file: File,
  options?: { metadata?: MediaUploadMetadata }
) {
  const existing = await prisma.mediaAsset.findFirst({ where: { id, storeId } });
  if (!existing) return null;

  if (!isAllowedMime(file.type, existing.kind as MediaKind)) {
    throw new Error(`Invalid file type for this asset: ${file.type}`);
  }

  const maxSize = maxSizeForMime(file.type);
  if (file.size > maxSize) {
    const limitMb = maxSize / (1024 * 1024);
    throw new Error(`File too large: ${file.name} (max ${limitMb}MB)`);
  }

  const oldPath = urlToFilePath(existing.url, storeId);
  const { url } = await writeFileToDisk(storeId, file);

  if (oldPath || existing.url.startsWith("http")) {
    await deletePersistedFile(existing.url, storeId);
  }

  const kind = inferKind(file.type, existing.kind as MediaKind);
  const width = options?.metadata?.width ?? existing.width;
  const height = options?.metadata?.height ?? existing.height;

  const asset = await prisma.mediaAsset.update({
    where: { id },
    data: {
      url,
      filename: file.name,
      mimeType: file.type,
      kind,
      size: file.size,
      width,
      height,
      metadata: buildMetadata(file, {
        width: width ?? undefined,
        height: height ?? undefined,
      }) as Prisma.InputJsonValue,
    },
  });

  return serializeMediaAsset(asset);
}

export async function listMediaAssets(
  storeId: string,
  params?: { q?: string; kind?: MediaKind | "all"; folderId?: string | null }
) {
  const q = params?.q?.trim();
  const kind = params?.kind;
  const folderId = params?.folderId;

  const assets = await prisma.mediaAsset.findMany({
    where: {
      storeId,
      ...(kind && kind !== "all" ? { kind } : {}),
      ...(folderId === null ? { folderId: null } : folderId ? { folderId } : {}),
      ...(q
        ? {
            OR: [
              { filename: { contains: q, mode: "insensitive" } },
              { title: { contains: q, mode: "insensitive" } },
              { alt: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return assets.map(serializeMediaAsset);
}

export async function listMediaFolders(storeId: string, parentId?: string | null) {
  const folders = await prisma.mediaFolder.findMany({
    where: {
      storeId,
      ...(parentId === undefined ? {} : { parentId }),
    },
    include: { _count: { select: { assets: true } } },
    orderBy: { name: "asc" },
  });

  return folders.map(serializeMediaFolder);
}

export async function createMediaFolder(storeId: string, payload: MediaFolderCreatePayload) {
  if (payload.parentId) {
    const parent = await prisma.mediaFolder.findFirst({
      where: { id: payload.parentId, storeId },
    });
    if (!parent) throw new Error("Parent folder not found");
  }

  const folder = await prisma.mediaFolder.create({
    data: {
      storeId,
      name: payload.name.trim(),
      parentId: payload.parentId ?? null,
    },
    include: { _count: { select: { assets: true } } },
  });

  return serializeMediaFolder(folder);
}

export async function updateMediaFolder(
  storeId: string,
  id: string,
  payload: MediaFolderUpdatePayload
) {
  const existing = await prisma.mediaFolder.findFirst({ where: { id, storeId } });
  if (!existing) return null;

  if (payload.parentId) {
    if (payload.parentId === id) throw new Error("A folder cannot be its own parent");
    const parent = await prisma.mediaFolder.findFirst({
      where: { id: payload.parentId, storeId },
    });
    if (!parent) throw new Error("Parent folder not found");
  }

  const folder = await prisma.mediaFolder.update({
    where: { id },
    data: {
      ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
      ...(payload.parentId !== undefined ? { parentId: payload.parentId } : {}),
    },
    include: { _count: { select: { assets: true } } },
  });

  return serializeMediaFolder(folder);
}

export async function deleteMediaFolder(storeId: string, id: string) {
  const existing = await prisma.mediaFolder.findFirst({ where: { id, storeId } });
  if (!existing) return false;

  await prisma.mediaAsset.updateMany({
    where: { folderId: id, storeId },
    data: { folderId: null },
  });

  await prisma.mediaFolder.delete({ where: { id } });
  return true;
}

export async function updateMediaAsset(
  storeId: string,
  id: string,
  payload: MediaUpdatePayload
) {
  const existing = await prisma.mediaAsset.findFirst({ where: { id, storeId } });
  if (!existing) return null;

  if (payload.folderId) {
    const folder = await prisma.mediaFolder.findFirst({
      where: { id: payload.folderId, storeId },
    });
    if (!folder) throw new Error("Folder not found");
  }

  const asset = await prisma.mediaAsset.update({
    where: { id },
    data: {
      ...(payload.alt !== undefined ? { alt: payload.alt } : {}),
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.kind !== undefined ? { kind: payload.kind } : {}),
      ...(payload.folderId !== undefined ? { folderId: payload.folderId } : {}),
    },
  });

  return serializeMediaAsset(asset);
}

export async function deleteMediaAsset(storeId: string, id: string) {
  const existing = await prisma.mediaAsset.findFirst({ where: { id, storeId } });
  if (!existing) return false;

  await deletePersistedFile(existing.url, storeId);

  await prisma.mediaAsset.delete({ where: { id } });
  return true;
}
