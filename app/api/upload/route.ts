import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import { saveUploadedFile } from "@/lib/media/service";

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

    const urls: string[] = [];

    for (const file of files) {
      try {
        const asset = await saveUploadedFile(store.id, file, { kind: "image" });
        urls.push(asset.url);
      } catch (error) {
        return NextResponse.json(
          { message: error instanceof Error ? error.message : "Upload failed" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Failed to upload files" }, { status: 500 });
  }
}
