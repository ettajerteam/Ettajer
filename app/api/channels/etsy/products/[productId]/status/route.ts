import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedStore } from "@/lib/get-authenticated-store";
import { getEtsyConnectionForStore, serializeConnectionPublic } from "@/lib/channels/connection-service";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { productId: string };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Thin, product-scoped Etsy status for the "Sales Channels" panel on the product editor. */
export async function GET(_request: Request, { params }: RouteParams) {
  const store = await getAuthenticatedStore();
  if (!store) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const product = await prisma.product.findFirst({
    where: { id: params.productId, storeId: store.id },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  const connection = await getEtsyConnectionForStore(store.id);
  if (!connection) {
    return NextResponse.json({
      connected: false,
      connection: null,
      listing: null,
    });
  }

  const listing = await prisma.productChannelListing.findFirst({
    where: { storeId: store.id, connectionId: connection.id, productId: product.id },
  });

  const metadata = listing && isRecord(listing.metadata) ? listing.metadata : {};
  const url = typeof metadata.url === "string" ? metadata.url : null;

  return NextResponse.json({
    connected: connection.status === "CONNECTED",
    connection: serializeConnectionPublic(connection),
    listing: listing
      ? {
          id: listing.id,
          status: listing.status,
          externalProductId: listing.externalProductId,
          lastSyncedAt: listing.lastSyncedAt ? listing.lastSyncedAt.toISOString() : null,
          lastError: listing.lastError,
          url,
        }
      : null,
  });
}
