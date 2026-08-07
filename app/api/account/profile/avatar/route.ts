import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { compressRasterImage, LOGO_IMAGE_MAX_EDGE } from "@/lib/media/compress-image";
import { persistUploadedFile } from "@/lib/media/storage";
import { IMAGE_MAX_SIZE, IMAGE_MIME_TYPES, IMAGE_RAW_MAX_SIZE } from "@/lib/media/service";
import { loadUserPlan, serializeAccountProfile } from "@/lib/account-profile";
import { logPlatformError } from "@/lib/admin/platform-errors";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
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
        { message: "Photo is still too large after compression" },
        { status: 400 }
      );
    }

    const { url: imageUrl } = await persistUploadedFile(
      `user-${session.user.id}`,
      uploadFile,
      { prefix: "avatars" }
    );

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        marketingEmails: true,
        founderNumber: true,
        passwordHash: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    return NextResponse.json({
      image: imageUrl,
      profile: serializeAccountProfile({ ...updated, plan: await loadUserPlan(updated.id) }),
    });
  } catch (error) {
    await logPlatformError({
      source: "api/account/profile/avatar",
      message: error instanceof Error ? error.message : "Avatar upload failed",
      stack: error instanceof Error ? error.stack : undefined,
      path: "/api/account/profile/avatar",
    });
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to upload photo",
      },
      { status: 500 }
    );
  }
}
