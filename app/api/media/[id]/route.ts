import { NextResponse } from "next/server";
import {
  deleteMediaAsset,
  replaceMediaAssetFile,
  updateMediaAsset,
} from "@/lib/media/service";
import { getAuthenticatedStore } from "@/lib/products";
import type { MediaKind, MediaUpdatePayload, MediaUploadMetadata } from "@/lib/media/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const deleted = await deleteMediaAsset(store.id, id);
    if (!deleted) {
      return NextResponse.json({ message: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Media delete error:", error);
    return NextResponse.json({ message: "Failed to delete media" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = (await request.json()) as MediaUpdatePayload;

    const payload: MediaUpdatePayload = {};
    if (body.alt !== undefined) payload.alt = body.alt;
    if (body.title !== undefined) payload.title = body.title;
    if (
      body.kind === "image" ||
      body.kind === "svg" ||
      body.kind === "logo" ||
      body.kind === "video"
    ) {
      payload.kind = body.kind as MediaKind;
    }
    if (body.folderId !== undefined) payload.folderId = body.folderId;

    const asset = await updateMediaAsset(store.id, id, payload);
    if (!asset) {
      return NextResponse.json({ message: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Media update error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to update media" },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    let metadata: MediaUploadMetadata = {};
    const metadataEntry = formData.get("metadata");
    if (typeof metadataEntry === "string") {
      try {
        metadata = JSON.parse(metadataEntry) as MediaUploadMetadata;
      } catch {
        metadata = {};
      }
    }

    const asset = await replaceMediaAssetFile(store.id, id, file, { metadata });
    if (!asset) {
      return NextResponse.json({ message: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Media replace error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to replace media" },
      { status: 400 }
    );
  }
}
