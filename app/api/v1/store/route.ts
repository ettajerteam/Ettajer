import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";
import { getStoreForContext } from "@/lib/developer/commerce-read";

export const dynamic = "force-dynamic";

export const GET = withDeveloperApi({
  scopes: "store:read",
  handler: async (_req, ctx) => {
    const store = await getStoreForContext(ctx);
    return jsonData({ store });
  },
});
