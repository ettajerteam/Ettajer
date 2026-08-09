import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";
import { getCheckoutSummary } from "@/lib/developer/commerce-read";

export const dynamic = "force-dynamic";

export const GET = withDeveloperApi({
  scopes: "checkout:read",
  handler: async (_req, ctx) => {
    const checkout = await getCheckoutSummary(ctx.storeId);
    return jsonData({ checkout });
  },
});
