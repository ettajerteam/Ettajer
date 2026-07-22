import { NextResponse } from "next/server";
import sharp from "sharp";
import { getAuthenticatedStore } from "@/lib/products";
import { saveUploadedFile } from "@/lib/media/service";

async function readServerImageDimensions(
  file: File
): Promise<{ width: number; height: number } | null> {
  try {
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
      return null;
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height) return null;
    return { width: meta.width, height: meta.height };
  } catch {
    return null;
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

    if (!files.length) {
      return NextResponse.json({ message: "No files provided" }, { status: 400 });
    }

    const assets: {
      url: string;
      width: number | null;
      height: number | null;
      sizeBytes: number;
      alt: string | null;
    }[] = [];
    const urls: string[] = [];

    for (const file of files) {
      try {
        const dims = await readServerImageDimensions(file);
        const asset = await saveUploadedFile(store.id, file, {
          kind: "image",
          metadata: {
            width: dims?.width,
            height: dims?.height,
          },
        });
        urls.push(asset.url);
        assets.push({
          url: asset.url,
          width: asset.width,
          height: asset.height,
          sizeBytes: asset.size,
          alt: asset.alt,
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
    return NextResponse.json({ message: "Failed to upload images" }, { status: 500 });
  }
}
