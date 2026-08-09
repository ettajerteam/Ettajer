import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";
import { getProductForStore } from "@/lib/developer/commerce-read";

export const dynamic = "force-dynamic";

export const GET = withDeveloperApi({
  scopes: "products:read",
  handler: async (_req, ctx, params) => {
    const product = await getProductForStore(ctx.storeId, params.id);
    return jsonData({ product });
  },
});
