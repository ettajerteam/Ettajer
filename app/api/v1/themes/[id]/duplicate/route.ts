import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";
import { duplicateStoreTheme } from "@/lib/developer/theme-service";

export const dynamic = "force-dynamic";

export const POST = withDeveloperApi({
  idempotent: true,
  scopes: "themes:create",
  handler: async (_req, ctx, params) => {
    const theme = await duplicateStoreTheme(ctx, params.id);
    return jsonData({ theme }, { status: 201 });
  },
});
