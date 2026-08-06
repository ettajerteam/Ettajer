import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import {
  exportCampaignRecipientsCsv,
  listCampaignRecipients,
} from "@/lib/email-marketing/campaigns";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: { id: string };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const authStore = await getAuthenticatedStore();
    if (!authStore) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const format = url.searchParams.get("format")?.trim() || "json";

    if (format === "csv") {
      const { filename, csv } = await exportCampaignRecipientsCsv(
        authStore.id,
        params.id
      );
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const status = url.searchParams.get("status")?.trim() || "all";
    const q = url.searchParams.get("q")?.trim() || "";
    const page = Number(url.searchParams.get("page") || "1");
    const pageSize = Number(url.searchParams.get("pageSize") || "25");

    const result = await listCampaignRecipients(authStore.id, params.id, {
      status,
      q,
      page,
      pageSize,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[email/campaigns/:id/recipients GET]", error);
    const message =
      error instanceof Error ? error.message : "Failed to load recipients";
    const status = message === "Campaign not found" ? 404 : 500;
    return NextResponse.json({ message }, { status });
  }
}
