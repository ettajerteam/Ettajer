import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { productSchema } from "@/lib/validations/product";
import { getAuthenticatedStore, serializeProduct, productInclude } from "@/lib/products";
import { validateProductIds } from "@/lib/catalog";

export async function GET(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();

    const products = await prisma.product.findMany({
      where: {
        storeId: store.id,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
                { tags: { has: search } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: productInclude,
    });

    return NextResponse.json({
      products: products.map(serializeProduct),
      currency: store.currency,
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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
    const slugExists = await prisma.product.findFirst({
      where: { storeId: store.id, slug },
    });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const product = await prisma.product.create({
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
          connect: data.collectionIds.map((id) => ({ id })),
        },
        storeId: store.id,
      },
      include: productInclude,
    });

    return NextResponse.json({ product: serializeProduct(product) }, { status: 201 });
  } catch (error) {
    console.error("Product create error:", error);
    return NextResponse.json({ message: "Failed to create product" }, { status: 500 });
  }
}
