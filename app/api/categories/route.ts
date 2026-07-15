import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedStore } from "@/lib/products";
import { categorySchema } from "@/lib/validations/catalog";
import {
  ensureUniqueSlug,
  serializeCategory,
  slugFromName,
} from "@/lib/catalog";

export async function GET(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();

    const categories = await prisma.category.findMany({
      where: {
        storeId: store.id,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { slug: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      categories: categories.map(serializeCategory),
    });
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const baseSlug = slugFromName(data.name);
    const slug = await ensureUniqueSlug("category", store.id, baseSlug);

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description ?? null,
        image: data.image ?? null,
        status: data.status,
        storeId: store.id,
      },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({ category: serializeCategory(category) }, { status: 201 });
  } catch (error) {
    console.error("Category create error:", error);
    return NextResponse.json({ message: "Failed to create category" }, { status: 500 });
  }
}
