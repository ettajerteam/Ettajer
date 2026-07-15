import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { productSchema } from "@/lib/validations/product";
import { getAuthenticatedStore, serializeProduct, productInclude } from "@/lib/products";
import { validateProductIds } from "@/lib/catalog";

interface RouteParams {
  params: { id: string };
}

async function updateProduct(request: Request, productId: string) {
  const store = await getAuthenticatedStore();
  if (!store) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.product.findFirst({
    where: { id: productId, storeId: store.id },
  });

  if (!existing) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  if (data.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, storeId: store.id },
    });
    if (!category) {
      return NextResponse.json({ message: "Invalid category" }, { status: 400 });
    }
  }

  if (!(await validateProductIds(store.id, data.collectionIds))) {
    return NextResponse.json({ message: "Invalid collection assignment" }, { status: 400 });
  }

  let slug = slugify(data.title);
  if (slug !== existing.slug) {
    const slugExists = await prisma.product.findFirst({
      where: { storeId: store.id, slug },
    });
    if (slugExists && slugExists.id !== existing.id) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
  }

  const product = await prisma.product.update({
    where: { id: existing.id },
    data: {
      title: data.title,
      slug,
      description: data.description || null,
      price: data.price,
      comparePrice: data.comparePrice ?? null,
      inventory: data.inventory,
      sku: data.sku || null,
      images: data.images,
      variants: data.variants,
      tags: data.tags,
      ticketPrinterId: data.ticketPrinterId ?? null,
      categoryId: data.categoryId ?? null,
      collections: {
        set: data.collectionIds.map((id) => ({ id })),
      },
    },
    include: productInclude,
  });

  return NextResponse.json({ product: serializeProduct(product) });
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const product = await prisma.product.findFirst({
      where: { id: params.id, storeId: store.id },
      include: productInclude,
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product: serializeProduct(product) });
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    return await updateProduct(request, params.id);
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    return await updateProduct(request, params.id);
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.product.findFirst({
      where: { id: params.id, storeId: store.id },
    });

    if (!existing) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id: existing.id } });

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 });
  }
}
