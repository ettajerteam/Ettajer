import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";
import { getOrderForStore } from "@/lib/developer/commerce-read";

export const dynamic = "force-dynamic";

export const GET = withDeveloperApi({
  scopes: "orders:read",
  handler: async (_req, ctx, params) => {
    const order = await getOrderForStore(ctx.storeId, params.id);
    return jsonData({ order });
  },
});
