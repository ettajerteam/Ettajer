import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";
import { buildStoreContext } from "@/lib/developer/commerce-read";

export const dynamic = "force-dynamic";

export const GET = withDeveloperApi({
  handler: async (_req, ctx) => {
    const context = await buildStoreContext(ctx);
    return jsonData(context);
  },
});
