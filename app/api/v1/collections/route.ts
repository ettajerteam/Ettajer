import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";
import { listCollectionsForStore } from "@/lib/developer/commerce-read";

export const dynamic = "force-dynamic";

export const GET = withDeveloperApi({
  scopes: "collections:read",
  handler: async (req, ctx) => {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? "100");
    const cursor = url.searchParams.get("cursor") ?? undefined;
    const page = await listCollectionsForStore(ctx.storeId, { limit, cursor });
    return jsonData(
      { collections: page.items },
      { pagination: page.pagination },
    );
  },
});
