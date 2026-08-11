import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/get-authenticated-store";
import { getEtsyConnectionForStore } from "@/lib/channels/connection-service";
import { runChannelOperationForStore } from "@/lib/channels/sync-runner";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { productId: string };
}

/**
 * Refreshes an already-published Etsy listing's content + inventory from the
 * current Ettajer product (idempotent — same "publish_listing" operation
 * used for the initial publish, since it already diffs create vs update).
 */
export async function POST(_request: Request, { params }: RouteParams) {
  const store = await getAuthenticatedStore();
  if (!store) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const connection = await getEtsyConnectionForStore(store.id);
  if (!connection || connection.status === "DISCONNECTED") {
    return NextResponse.json({ message: "Connect your Etsy shop first" }, { status: 400 });
  }

  try {
    const result = await runChannelOperationForStore(store.id, connection.id, "publish_listing", {
      productId: params.productId,
    });
    return NextResponse.json({ ok: true, message: result.message });
  } catch (error) {
    console.error("[etsy/products/sync]", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to sync listing" },
      { status: 500 }
    );
  }
}
