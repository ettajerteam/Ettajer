import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/get-authenticated-store";
import { disconnectConnection, getEtsyConnectionForStore } from "@/lib/channels/connection-service";
import { appendChannelSyncLog } from "@/lib/channels/sync-log";

export const dynamic = "force-dynamic";

export async function POST() {
  const store = await getAuthenticatedStore();
  if (!store) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const connection = await getEtsyConnectionForStore(store.id);
  if (!connection) {
    return NextResponse.json({ message: "No Etsy connection found" }, { status: 404 });
  }

  const updated = await disconnectConnection(store.id, connection.id);
  if (!updated) {
    return NextResponse.json({ message: "Failed to disconnect Etsy" }, { status: 500 });
  }

  await appendChannelSyncLog({
    storeId: store.id,
    connectionId: connection.id,
    channel: "etsy",
    operation: "disconnect",
    status: "success",
    message: "Etsy account disconnected",
  });

  return NextResponse.json({ ok: true });
}
