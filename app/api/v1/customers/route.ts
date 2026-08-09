import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";
import { listCustomersForStore } from "@/lib/developer/commerce-read";

export const dynamic = "force-dynamic";

export const GET = withDeveloperApi({
  scopes: "customers:read",
  handler: async (req, ctx) => {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? "50");
    const cursor = url.searchParams.get("cursor") ?? undefined;
    const page = await listCustomersForStore(ctx.storeId, { limit, cursor });
    return jsonData(
      { customers: page.items },
      { pagination: page.pagination },
    );
  },
});
