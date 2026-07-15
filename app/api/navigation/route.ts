import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import { getStoreNavigation, saveStoreNavigation, type NavItem } from "@/lib/navigation";

export async function GET() {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const items = await getStoreNavigation(store.id);
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const items = body.items as NavItem[];
    if (!Array.isArray(items)) {
      return NextResponse.json({ message: "Invalid items" }, { status: 400 });
    }

    await saveStoreNavigation(store.id, items);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Failed to save" }, { status: 500 });
  }
}
