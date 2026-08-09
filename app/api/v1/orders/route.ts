import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";
import { listOrdersForStore } from "@/lib/developer/commerce-read";

export const dynamic = "force-dynamic";

export const GET = withDeveloperApi({
  scopes: "orders:read",
  handler: async (req, ctx) => {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? "25");
    const cursor = url.searchParams.get("cursor") ?? undefined;
    const page = await listOrdersForStore(ctx.storeId, { limit, cursor });
    return jsonData({ orders: page.items }, { pagination: page.pagination });
  },
});
