import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import { getEmailAnalyticsBundle } from "@/lib/email-marketing/email-analytics";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const daysParam = new URL(request.url).searchParams.get("days");
    const days = daysParam ? Number(daysParam) : 30;
    const bundle = await getEmailAnalyticsBundle(store.id, {
      days: Number.isFinite(days) ? days : 30,
    });

    return NextResponse.json({ ok: true, ...bundle });
  } catch (error) {
    console.error("[email/analytics GET]", error);
    return NextResponse.json(
      { message: "Failed to load email analytics" },
      { status: 500 }
    );
  }
}
