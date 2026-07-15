import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import { getLiveViewData, parseLiveMapRange } from "@/lib/live-view";

export async function GET(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const range = parseLiveMapRange(searchParams.get("range"));
    const data = await getLiveViewData(store.id, store.currency, range);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch" }, { status: 500 });
  }
}
