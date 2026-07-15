import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedStore } from "@/lib/products";
import { collectionSchema } from "@/lib/validations/catalog";
import {
  ensureUniqueSlug,
  serializeCollection,
  slugFromName,
  validateProductIds,
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

    const collection = await prisma.collection.findFirst({
      where: { id: params.id, storeId: store.id },
      include: {
        _count: { select: { products: true } },
        products: { select: { id: true } },
      },
    });

    if (!collection) {
      return NextResponse.json({ message: "Collection not found" }, { status: 404 });
    }

    return NextResponse.json({ collection: serializeCollection(collection) });
  } catch (error) {
    console.error("Collection fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch collection" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.collection.findFirst({
      where: { id: params.id, storeId: store.id },
    });

    if (!existing) {
      return NextResponse.json({ message: "Collection not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = collectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (!(await validateProductIds(store.id, data.productIds))) {
      return NextResponse.json({ message: "One or more products are invalid" }, { status: 400 });
    }

    const baseSlug = slugFromName(data.name);
    const slug =
      baseSlug === existing.slug
        ? existing.slug
        : await ensureUniqueSlug("collection", store.id, baseSlug, existing.id);

    const collection = await prisma.collection.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        slug,
        description: data.description ?? null,
        image: data.image ?? null,
        featured: data.featured,
        products: {
          set: data.productIds.map((id) => ({ id })),
        },
      },
      include: {
        _count: { select: { products: true } },
        products: { select: { id: true } },
      },
    });

    return NextResponse.json({ collection: serializeCollection(collection) });
  } catch (error) {
    console.error("Collection update error:", error);
    return NextResponse.json({ message: "Failed to update collection" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.collection.findFirst({
      where: { id: params.id, storeId: store.id },
    });

    if (!existing) {
      return NextResponse.json({ message: "Collection not found" }, { status: 404 });
    }

    await prisma.collection.delete({ where: { id: existing.id } });

    return NextResponse.json({ message: "Collection deleted" });
  } catch (error) {
    console.error("Collection delete error:", error);
    return NextResponse.json({ message: "Failed to delete collection" }, { status: 500 });
  }
}
