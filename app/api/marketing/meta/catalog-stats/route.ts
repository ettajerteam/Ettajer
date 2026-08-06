import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import {
  getMetaCatalogFeedUrl,
  isProductEligibleForMetaCatalog,
} from "@/lib/meta-product-feed";
import { parseMarketingIntegrations } from "@/lib/marketing-integrations";

export const dynamic = "force-dynamic";

/** Catalog feed readiness for the signed-in merchant's store. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    include: {
      settings: { select: { marketingIntegrations: true } },
      products: {
        where: { status: "active" },
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
        take: 5000,
      },
    },
  });

  if (!store) {
    return NextResponse.json({ message: "Store not found" }, { status: 404 });
  }

  const meta = parseMarketingIntegrations(store.settings?.marketingIntegrations).meta;
  const eligible = store.products.filter((product) =>
    isProductEligibleForMetaCatalog({
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
    })
  );

  return NextResponse.json({
    storeSlug: store.slug,
    currency: store.currency,
    activeProducts: store.products.length,
    eligibleProducts: eligible.length,
    feedUrl: getMetaCatalogFeedUrl(store.slug, meta.catalogFeedToken),
    hasFeedKey: Boolean(meta.catalogFeedToken),
    catalogId: meta.catalogId,
    pixelConnected: Boolean(meta.connected && meta.pixelId),
    capiEnabled: Boolean(meta.accessToken),
  });
}
