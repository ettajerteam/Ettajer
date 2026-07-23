import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedStore } from "@/lib/products";
import { prisma } from "@/lib/db";
import { compressRasterImage, LOGO_IMAGE_MAX_EDGE } from "@/lib/media/compress-image";
import { persistUploadedFile } from "@/lib/media/storage";
import { IMAGE_MAX_SIZE, IMAGE_MIME_TYPES, IMAGE_RAW_MAX_SIZE } from "@/lib/media/service";

export async function POST(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    if (!IMAGE_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ message: "Invalid file type" }, { status: 400 });
    }

    if (file.size > IMAGE_RAW_MAX_SIZE) {
      return NextResponse.json(
        { message: `File too large (max ${IMAGE_RAW_MAX_SIZE / (1024 * 1024)}MB)` },
        { status: 400 }
      );
    }

    const compressed = await compressRasterImage(file, {
      maxEdge: LOGO_IMAGE_MAX_EDGE,
      quality: 85,
    });
    const uploadFile = compressed.file;

    if (uploadFile.size > IMAGE_MAX_SIZE) {
      return NextResponse.json(
        { message: "Logo is still too large after compression" },
        { status: 400 }
      );
    }

    const { url: logoUrl } = await persistUploadedFile(store.id, uploadFile, {
      prefix: "logos",
    });

    const updated = await prisma.store.update({
      where: { id: store.id },
      data: { logo: logoUrl },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath(`/store/${store.slug}`);
    revalidatePath(`/store/${store.slug}`, "layout");

    return NextResponse.json({ logo: logoUrl, store: { logo: updated.logo } });
  } catch (error) {
    console.error("Logo upload error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to upload logo",
      },
      { status: 500 }
    );
  }
}
