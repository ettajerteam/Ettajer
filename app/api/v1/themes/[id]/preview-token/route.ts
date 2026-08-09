import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";
import { createThemePreviewAccess } from "@/lib/developer/theme-preview";

export const dynamic = "force-dynamic";

export const POST = withDeveloperApi({
  // themes:read is enough; themes:preview also accepted inside createThemePreviewAccess
  scopes: "themes:read",
  handler: async (_req, ctx, params) => {
    const result = await createThemePreviewAccess(ctx, params.id);
    return jsonData(result);
  },
});
