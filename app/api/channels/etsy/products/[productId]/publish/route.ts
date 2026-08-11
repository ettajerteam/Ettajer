import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/get-authenticated-store";
import { getEtsyConnectionForStore } from "@/lib/channels/connection-service";
import { runChannelOperationForStore } from "@/lib/channels/sync-runner";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { productId: string };
}

/** Publishes (creates or updates) the Etsy listing for one Ettajer product. */
export async function POST(request: Request, { params }: RouteParams) {
  const store = await getAuthenticatedStore();
  if (!store) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const connection = await getEtsyConnectionForStore(store.id);
  if (!connection || connection.status === "DISCONNECTED") {
    return NextResponse.json({ message: "Connect your Etsy shop first" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const channelAttributes =
    body && typeof body === "object" && body.channelAttributes && typeof body.channelAttributes === "object"
      ? (body.channelAttributes as Record<string, unknown>)
      : undefined;

  try {
    const result = await runChannelOperationForStore(store.id, connection.id, "publish_listing", {
      productId: params.productId,
      channelAttributes,
    });
    return NextResponse.json({ ok: true, message: result.message });
  } catch (error) {
    console.error("[etsy/products/publish]", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to publish listing" },
      { status: 500 }
    );
  }
}
