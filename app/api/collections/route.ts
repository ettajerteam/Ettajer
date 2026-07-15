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

export async function GET(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();

    const collections = await prisma.collection.findMany({
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
      include: {
        _count: { select: { products: true } },
        products: { select: { id: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      collections: collections.map(serializeCollection),
    });
  } catch (error) {
    console.error("Collections fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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
    const slug = await ensureUniqueSlug("collection", store.id, baseSlug);

    const collection = await prisma.collection.create({
      data: {
        name: data.name,
        slug,
        description: data.description ?? null,
        image: data.image ?? null,
        featured: data.featured,
        storeId: store.id,
        products: {
          connect: data.productIds.map((id) => ({ id })),
        },
      },
      include: {
        _count: { select: { products: true } },
        products: { select: { id: true } },
      },
    });

    return NextResponse.json({ collection: serializeCollection(collection) }, { status: 201 });
  } catch (error) {
    console.error("Collection create error:", error);
    return NextResponse.json({ message: "Failed to create collection" }, { status: 500 });
  }
}
