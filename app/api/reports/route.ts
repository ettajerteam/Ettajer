import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import { getReportsData, parseReportRange } from "@/lib/reports";

export async function GET(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const rangeParam = new URL(request.url).searchParams.get("range");
    const range = parseReportRange(rangeParam);

    const data = await getReportsData(store.id, store.currency, range);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Reports error:", error);
    return NextResponse.json({ message: "Failed to fetch reports" }, { status: 500 });
  }
}
