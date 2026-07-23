import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getAuthenticatedStore } from "@/lib/products";
import { prisma } from "@/lib/db";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ message: "Invalid file type" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: "File too large (max 5MB)" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", store.id);
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `logo-${Date.now()}.${ext}`;
    const filepath = path.join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const logoUrl = `/uploads/${store.id}/${filename}`;

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
    return NextResponse.json({ message: "Failed to upload logo" }, { status: 500 });
  }
}
