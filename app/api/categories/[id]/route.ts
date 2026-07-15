import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedStore } from "@/lib/products";
import { categorySchema } from "@/lib/validations/catalog";
import {
  ensureUniqueSlug,
  serializeCategory,
  serializeCategoryDetail,
  slugFromName,
} from "@/lib/catalog";

interface RouteParams {
  params: { id: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const category = await prisma.category.findFirst({
      where: { id: params.id, storeId: store.id },
      include: {
        _count: { select: { products: true } },
        products: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            inventory: true,
            images: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ category: serializeCategoryDetail(category) });
  } catch (error) {
    console.error("Category fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch category" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.category.findFirst({
      where: { id: params.id, storeId: store.id },
    });

    if (!existing) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
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
    const slug =
      baseSlug === existing.slug
        ? existing.slug
        : await ensureUniqueSlug("category", store.id, baseSlug, existing.id);

    const category = await prisma.category.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        slug,
        description: data.description ?? null,
        image: data.image ?? null,
        status: data.status,
      },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({ category: serializeCategory(category) });
  } catch (error) {
    console.error("Category update error:", error);
    return NextResponse.json({ message: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.category.findFirst({
      where: { id: params.id, storeId: store.id },
    });

    if (!existing) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    await prisma.category.delete({ where: { id: existing.id } });

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Category delete error:", error);
    return NextResponse.json({ message: "Failed to delete category" }, { status: 500 });
  }
}
