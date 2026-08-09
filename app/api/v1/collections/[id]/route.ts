import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";
import { getCollectionForStore } from "@/lib/developer/commerce-read";

export const dynamic = "force-dynamic";

export const GET = withDeveloperApi({
  scopes: "collections:read",
  handler: async (_req, ctx, params) => {
    const collection = await getCollectionForStore(ctx.storeId, params.id);
    return jsonData({ collection });
  },
});
