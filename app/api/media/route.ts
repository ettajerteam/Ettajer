import { NextResponse } from "next/server";
import {
  listMediaAssets,
  listMediaFolders,
  saveUploadedFile,
} from "@/lib/media/service";
import { getAuthenticatedStore } from "@/lib/products";
import type { MediaKind, MediaUploadMetadata } from "@/lib/media/types";

export async function GET(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? undefined;
    const kindParam = searchParams.get("kind");
    const kind =
      kindParam === "image" ||
      kindParam === "svg" ||
      kindParam === "logo" ||
      kindParam === "video" ||
      kindParam === "all"
        ? kindParam
        : "all";

    const folderParam = searchParams.get("folderId");
    const folderId =
      folderParam === "root" ? null : folderParam === undefined ? undefined : folderParam;

    const [assets, folders] = await Promise.all([
      listMediaAssets(store.id, { q, kind, folderId }),
      listMediaFolders(store.id, folderId === undefined ? null : folderId),
    ]);

    return NextResponse.json({ assets, folders });
  } catch (error) {
    console.error("Media list error:", error);
    return NextResponse.json({ message: "Failed to list media" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const kindParam = formData.get("kind");
    const kind =
      kindParam === "logo" ||
      kindParam === "video" ||
      kindParam === "image" ||
      kindParam === "svg"
        ? (kindParam as MediaKind)
        : undefined;

    const folderParam = formData.get("folderId");
    const folderId = typeof folderParam === "string" && folderParam ? folderParam : null;

    if (!files.length) {
      return NextResponse.json({ message: "No files provided" }, { status: 400 });
    }

    const metadataEntries = formData.getAll("metadata").map((entry) => {
      if (typeof entry !== "string") return {};
      try {
        return JSON.parse(entry) as MediaUploadMetadata;
      } catch {
        return {};
      }
    });

    const assets = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const metadata = metadataEntries[i] ?? {};
      try {
        const asset = await saveUploadedFile(store.id, file, { kind, metadata, folderId });
        assets.push(asset);
      } catch (error) {
        return NextResponse.json(
          { message: error instanceof Error ? error.message : "Upload failed" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ assets });
  } catch (error) {
    console.error("Media upload error:", error);
    return NextResponse.json({ message: "Failed to upload media" }, { status: 500 });
  }
}
