import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";
import { getSanitizedStoreSettings } from "@/lib/developer/commerce-read";

export const dynamic = "force-dynamic";

export const GET = withDeveloperApi({
  scopes: "settings:read",
  handler: async (_req, ctx) => {
    const settings = await getSanitizedStoreSettings(ctx.storeId);
    return jsonData({ settings });
  },
});
