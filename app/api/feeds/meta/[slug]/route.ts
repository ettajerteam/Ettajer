import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseMarketingIntegrations } from "@/lib/marketing-integrations";
import { buildMetaCatalogFeedTsv } from "@/lib/meta-product-feed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: { slug: string };
}

function normalizeSlug(raw: string): string {
  return decodeURIComponent(raw).replace(/\.tsv$/i, "").trim();
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const storeSlug = normalizeSlug(context.params.slug);
    if (!storeSlug) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
      include: {
        settings: { select: { marketingIntegrations: true } },
        products: {
          where: { status: "active" },
          orderBy: { updatedAt: "desc" },
          take: 5000,
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            price: true,
            comparePrice: true,
            inventory: true,
            status: true,
            productType: true,
            images: true,
            commerce: true,
            tags: true,
            category: { select: { name: true } },
          },
        },
      },
    });

    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    const meta = parseMarketingIntegrations(store.settings?.marketingIntegrations).meta;
    const requiredKey = meta.catalogFeedToken?.trim() || null;
    if (requiredKey) {
      const provided = new URL(request.url).searchParams.get("key")?.trim() || "";
      if (provided !== requiredKey) {
        return NextResponse.json({ message: "Invalid or missing feed key" }, { status: 401 });
      }
    }

    const tsv = buildMetaCatalogFeedTsv({
      storeSlug: store.slug,
      storeName: store.name,
      currency: store.currency || "MAD",
      products: store.products.map((product) => ({
        id: product.id,
        title: product.title,
        slug: product.slug,
        description: product.description,
        price: product.price,
        comparePrice: product.comparePrice,
        inventory: product.inventory,
        status: product.status,
        productType: product.productType,
        images: product.images,
        commerce: product.commerce,
        categoryName: product.category?.name ?? null,
        tags: product.tags,
      })),
    });

    return new NextResponse(tsv, {
      status: 200,
      headers: {
        "Content-Type": "text/tab-separated-values; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "Content-Disposition": `inline; filename="${store.slug}-meta-catalog.tsv"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[meta-catalog-feed]", error);
    return NextResponse.json({ message: "Failed to build catalog feed" }, { status: 500 });
  }
}
