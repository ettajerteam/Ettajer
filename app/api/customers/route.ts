import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import { listCustomers } from "@/lib/customers";
import type { CustomerSort } from "@/types/customers";

const VALID_SORTS: CustomerSort[] = ["recent", "spent", "orders", "name"];

export async function GET(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() ?? "";
    const sortParam = searchParams.get("sort") ?? "recent";
    const sort = VALID_SORTS.includes(sortParam as CustomerSort)
      ? (sortParam as CustomerSort)
      : "recent";

    const customers = await listCustomers(store.id, { search: search || undefined, sort });

    return NextResponse.json({ customers, currency: store.currency });
  } catch (error) {
    console.error("Customers fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch customers" }, { status: 500 });
  }
}
