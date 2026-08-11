import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedStore } from "@/lib/get-authenticated-store";
import { getEtsyConnectionForStore } from "@/lib/channels/connection-service";
import { importSpecificListings } from "@/lib/channels/sync-runner";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  listingIds: z.array(z.string().min(1)).min(1).max(100),
});

/** Imports merchant-selected Etsy listings (from the preview picker) into Ettajer products. */
export async function POST(request: Request) {
  const store = await getAuthenticatedStore();
  if (!store) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "listingIds is required" },
      { status: 400 }
    );
  }

  const connection = await getEtsyConnectionForStore(store.id);
  if (!connection || connection.status === "DISCONNECTED") {
    return NextResponse.json({ message: "Connect your Etsy shop first" }, { status: 400 });
  }

  try {
    const result = await importSpecificListings(store.id, connection.id, parsed.data.listingIds);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[etsy/import]", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Import failed" },
      { status: 500 }
    );
  }
}
