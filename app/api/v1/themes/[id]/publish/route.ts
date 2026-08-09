import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";
import { publishStoreTheme } from "@/lib/developer/theme-service";

export const dynamic = "force-dynamic";

export const POST = withDeveloperApi({
  idempotent: true,
  scopes: "themes:publish",
  handler: async (_req, ctx, params) => {
    const theme = await publishStoreTheme(ctx, params.id);
    return jsonData({
      success: true,
      themeId: theme.id,
      status: theme.status,
      theme,
    });
  },
});
