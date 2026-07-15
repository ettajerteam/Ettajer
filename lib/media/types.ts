export type MediaKind = "image" | "svg" | "logo" | "video";

export interface MediaMetadata {
  width?: number;
  height?: number;
  mimeType?: string;
  size?: number;
  [key: string]: unknown;
}

export interface MediaFolder {
  id: string;
  storeId: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  assetCount?: number;
}

export interface MediaAsset {
  id: string;
  storeId: string;
  folderId: string | null;
  url: string;
  filename: string;
  mimeType: string;
  kind: MediaKind;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  title: string | null;
  metadata: MediaMetadata | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaListParams {
  q?: string;
  kind?: MediaKind | "all";
  folderId?: string | null;
}

export interface MediaUploadMetadata {
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
}

export interface MediaUpdatePayload {
  alt?: string | null;
  title?: string | null;
  kind?: MediaKind;
  folderId?: string | null;
}

export interface MediaFolderCreatePayload {
  name: string;
  parentId?: string | null;
}

export interface MediaFolderUpdatePayload {
  name?: string;
  parentId?: string | null;
}

export interface MediaListResponse {
  assets: MediaAsset[];
  folders?: MediaFolder[];
}

export interface MediaUploadResponse {
  assets: MediaAsset[];
}

export interface MediaFoldersResponse {
  folders: MediaFolder[];
}
