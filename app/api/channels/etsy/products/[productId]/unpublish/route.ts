import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/get-authenticated-store";
import { getEtsyConnectionForStore } from "@/lib/channels/connection-service";
import { runChannelOperationForStore } from "@/lib/channels/sync-runner";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { productId: string };
}

/** Deactivates the Etsy listing for a product (best-effort remote call) and marks the mapping inactive. */
export async function POST(_request: Request, { params }: RouteParams) {
  const store = await getAuthenticatedStore();
  if (!store) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const connection = await getEtsyConnectionForStore(store.id);
  if (!connection) {
    return NextResponse.json({ message: "No Etsy connection found" }, { status: 404 });
  }

  try {
    const result = await runChannelOperationForStore(store.id, connection.id, "unpublish_listing", {
      productId: params.productId,
    });
    return NextResponse.json({ ok: true, message: result.message });
  } catch (error) {
    console.error("[etsy/products/unpublish]", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to unpublish listing" },
      { status: 500 }
    );
  }
}
