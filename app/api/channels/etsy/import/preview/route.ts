import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedStore } from "@/lib/get-authenticated-store";
import {
  getConnectionTokens,
  getEtsyConnectionForStore,
  updateConnectionTokens,
} from "@/lib/channels/connection-service";
import { getAdapter } from "@/lib/channels/adapters";
import { classifyChannelListing } from "@/lib/channels/sync-runner";

export const dynamic = "force-dynamic";

/** Lists remote Etsy listings with import readiness classification for the "Import from Etsy" picker. */
export async function GET(request: Request) {
  const store = await getAuthenticatedStore();
  if (!store) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const connection = await getEtsyConnectionForStore(store.id);
  if (!connection || connection.status === "DISCONNECTED") {
    return NextResponse.json({ message: "Connect your Etsy shop first" }, { status: 400 });
  }

  const tokens = getConnectionTokens(connection);
  if (!tokens) {
    return NextResponse.json(
      { message: "Etsy connection needs to be reconnected" },
      { status: 409 }
    );
  }

  const url = new URL(request.url);
  const state = url.searchParams.get("state") ?? "active";
  const cursor = url.searchParams.get("cursor");
  const limitParam = Number(url.searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 25;

  try {
    const adapter = getAdapter(connection.channel, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      shopId: connection.externalShopId,
      onTokenRefreshed: (refreshed) => updateConnectionTokens(connection.id, refreshed),
    });

    const page = await adapter.listProducts({ cursor, limit, state });
    const externalIds = page.items.map((item) => item.externalProductId);
    const existing = externalIds.length
      ? await prisma.productChannelListing.findMany({
          where: {
            storeId: store.id,
            connectionId: connection.id,
            channel: connection.channel,
            externalProductId: { in: externalIds },
          },
          select: { externalProductId: true, productId: true },
        })
      : [];
    const importedProductIdByExternalId = new Map(
      existing.map((row) => [row.externalProductId, row.productId])
    );

    const items = page.items.map((listing) => {
      const { readiness, issues } = classifyChannelListing(listing);
      return {
        externalProductId: listing.externalProductId,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        currencyCode: listing.currencyCode,
        sku: listing.sku,
        quantity: listing.quantity,
        tags: listing.tags,
        images: listing.images.map((image) => image.url),
        state: listing.state,
        url: listing.url ?? null,
        readiness,
        issues,
        alreadyImported: importedProductIdByExternalId.has(listing.externalProductId),
        importedProductId: importedProductIdByExternalId.get(listing.externalProductId) ?? null,
      };
    });

    return NextResponse.json({ items, nextCursor: page.nextCursor ?? null });
  } catch (error) {
    console.error("[etsy/import/preview]", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to load Etsy listings" },
      { status: 500 }
    );
  }
}
