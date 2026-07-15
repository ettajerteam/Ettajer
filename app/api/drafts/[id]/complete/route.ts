import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import { convertDraftToOrder } from "@/lib/drafts";
import { serializeOrderDetail } from "@/lib/orders";

interface RouteContext {
  params: { id: string };
}

export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const order = await convertDraftToOrder(params.id, store.id);

    return NextResponse.json({ order: serializeOrderDetail(order) });
  } catch (error) {
    console.error("Draft convert error:", error);
    const message = error instanceof Error ? error.message : "Failed to complete draft";
    const status = message === "Draft not found" ? 404 : 400;
    return NextResponse.json({ message }, { status });
  }
}
