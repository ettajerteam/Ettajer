import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedStore } from "@/lib/get-authenticated-store";
import { getEtsyConnectionForStore, serializeConnectionPublic } from "@/lib/channels/connection-service";

export const dynamic = "force-dynamic";

/** Public (token-free) connection status for the Channels → Etsy dashboard page. */
export async function GET() {
  const store = await getAuthenticatedStore();
  if (!store) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const connection = await getEtsyConnectionForStore(store.id);
  if (!connection) {
    return NextResponse.json({
      connected: false,
      connection: null,
      listingCount: 0,
      orderCount: 0,
      recentLogs: [],
    });
  }

  const [listingCount, orderCount, recentLogs] = await Promise.all([
    prisma.productChannelListing.count({
      where: { storeId: store.id, connectionId: connection.id },
    }),
    prisma.channelOrder.count({
      where: { storeId: store.id, connectionId: connection.id },
    }),
    prisma.channelSyncLog.findMany({
      where: { storeId: store.id, connectionId: connection.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return NextResponse.json({
    connected: connection.status === "CONNECTED",
    connection: serializeConnectionPublic(connection),
    listingCount,
    orderCount,
    recentLogs: recentLogs.map((log) => ({
      id: log.id,
      operation: log.operation,
      status: log.status,
      externalId: log.externalId,
      durationMs: log.durationMs,
      errorCode: log.errorCode,
      message: log.message,
      createdAt: log.createdAt.toISOString(),
    })),
  });
}
