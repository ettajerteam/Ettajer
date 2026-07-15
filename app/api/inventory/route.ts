import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import { getInventorySummary, listInventory, updateInventory, type StockFilter } from "@/lib/inventory";

const FILTERS: StockFilter[] = ["all", "in_stock", "low_stock", "out_of_stock"];

export async function GET(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const filter = (searchParams.get("filter") ?? "all") as StockFilter;
    const search = searchParams.get("search")?.trim() ?? "";
    const safeFilter = FILTERS.includes(filter) ? filter : "all";

    const [items, summary] = await Promise.all([
      listInventory(store.id, safeFilter, search || undefined),
      getInventorySummary(store.id),
    ]);

    return NextResponse.json({ items, summary, currency: store.currency });
  } catch (error) {
    console.error("Inventory error:", error);
    return NextResponse.json({ message: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { productId, inventory } = body;
    if (!productId || typeof inventory !== "number") {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const product = await updateInventory(productId, store.id, inventory);
    return NextResponse.json({ product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update";
    return NextResponse.json({ message }, { status: 400 });
  }
}
