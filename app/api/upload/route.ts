import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import { saveUploadedFile, DOCUMENT_MIME_TYPES } from "@/lib/media/service";

export async function POST(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const kindRaw = String(formData.get("kind") || "image");
    const kind = kindRaw === "document" ? "document" : "image";

    if (!files.length) {
      return NextResponse.json({ message: "No files provided" }, { status: 400 });
    }

    if (kind === "document") {
      for (const file of files) {
        if (!DOCUMENT_MIME_TYPES.includes(file.type)) {
          return NextResponse.json(
            { message: `Only PDF files are allowed for digital products (got ${file.type || file.name})` },
            { status: 400 }
          );
        }
      }
    }

    const assets: {
      url: string;
      width: number | null;
      height: number | null;
      sizeBytes: number;
      alt: string | null;
      filename: string;
      mimeType: string;
      originalSizeBytes?: number | null;
      compressed?: boolean;
    }[] = [];
    const urls: string[] = [];

    for (const file of files) {
      try {
        const asset = await saveUploadedFile(store.id, file, {
          kind: kind === "document" ? "document" : "image",
        });
        const meta =
          asset.metadata && typeof asset.metadata === "object"
            ? (asset.metadata as { originalSize?: number; compressed?: boolean })
            : null;

        urls.push(asset.url);
        assets.push({
          url: asset.url,
          width: asset.width,
          height: asset.height,
          sizeBytes: asset.size,
          alt: asset.alt,
          filename: asset.filename,
          mimeType: asset.mimeType,
          originalSizeBytes: meta?.originalSize ?? null,
          compressed: Boolean(meta?.compressed),
        });
      } catch (error) {
        return NextResponse.json(
          { message: error instanceof Error ? error.message : "Upload failed" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ urls, assets });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Failed to upload files" }, { status: 500 });
  }
}
