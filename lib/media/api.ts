import type {
  MediaAsset,
  MediaFolder,
  MediaFolderCreatePayload,
  MediaFolderUpdatePayload,
  MediaKind,
  MediaListParams,
  MediaListResponse,
  MediaFoldersResponse,
  MediaUpdatePayload,
  MediaUploadMetadata,
  MediaUploadResponse,
} from "./types";

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.message ?? "Request failed";
  } catch {
    return "Request failed";
  }
}

export function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

export async function fetchMedia(params?: MediaListParams): Promise<MediaListResponse> {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.kind && params.kind !== "all") search.set("kind", params.kind);
  if (params?.folderId === null) search.set("folderId", "root");
  else if (params?.folderId) search.set("folderId", params.folderId);

  const qs = search.toString();
  const res = await fetch(`/api/media${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error(await parseError(res));

  return (await res.json()) as MediaListResponse;
}

export async function fetchMediaFolders(parentId?: string | null): Promise<MediaFolder[]> {
  const search = new URLSearchParams();
  if (parentId === null) search.set("parentId", "root");
  else if (parentId) search.set("parentId", parentId);

  const qs = search.toString();
  const res = await fetch(`/api/media/folders${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error(await parseError(res));

  const data = (await res.json()) as MediaFoldersResponse;
  return data.folders;
}

export async function createMediaFolder(payload: MediaFolderCreatePayload): Promise<MediaFolder> {
  const res = await fetch("/api/media/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as MediaFolder;
}

export async function updateMediaFolder(
  id: string,
  payload: MediaFolderUpdatePayload
): Promise<MediaFolder> {
  const res = await fetch(`/api/media/folders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as MediaFolder;
}

export async function deleteMediaFolder(id: string): Promise<void> {
  const res = await fetch(`/api/media/folders/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function uploadMedia(
  files: File[],
  options?: {
    kind?: MediaKind;
    metadata?: MediaUploadMetadata | MediaUploadMetadata[];
    folderId?: string | null;
  }
): Promise<MediaAsset[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  if (options?.kind) formData.append("kind", options.kind);
  if (options?.folderId) formData.append("folderId", options.folderId);

  const metadataList = Array.isArray(options?.metadata)
    ? options.metadata
    : options?.metadata
      ? [options.metadata]
      : [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    let meta = metadataList[i];
    if (!meta && file.type.startsWith("image/") && file.type !== "image/svg+xml") {
      const dims = await readImageDimensions(file);
      meta = {
        width: dims?.width,
        height: dims?.height,
        alt: file.name.replace(/\.[^.]+$/, ""),
      };
    } else if (!meta) {
      meta = { alt: file.name.replace(/\.[^.]+$/, "") };
    }
    formData.append("metadata", JSON.stringify(meta));
  }

  const res = await fetch("/api/media", { method: "POST", body: formData });
  if (!res.ok) throw new Error(await parseError(res));

  const data = (await res.json()) as MediaUploadResponse;
  return data.assets;
}

export async function replaceMedia(
  id: string,
  file: File,
  metadata?: MediaUploadMetadata
): Promise<MediaAsset> {
  const formData = new FormData();
  formData.append("file", file);
  if (metadata) formData.append("metadata", JSON.stringify(metadata));

  if (file.type.startsWith("image/") && file.type !== "image/svg+xml") {
    const dims = await readImageDimensions(file);
    if (dims) {
      formData.set(
        "metadata",
        JSON.stringify({ ...metadata, width: dims.width, height: dims.height })
      );
    }
  }

  const res = await fetch(`/api/media/${id}`, { method: "PUT", body: formData });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as MediaAsset;
}

export async function deleteMedia(id: string): Promise<void> {
  const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function updateMedia(id: string, payload: MediaUpdatePayload): Promise<MediaAsset> {
  const res = await fetch(`/api/media/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as MediaAsset;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function absoluteMediaUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (typeof window !== "undefined") return `${window.location.origin}${url}`;
  return url;
}
