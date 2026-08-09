import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";
import { deleteThemePage, updateThemePage } from "@/lib/developer/theme-service";

export const dynamic = "force-dynamic";

export const PATCH = withDeveloperApi({
  idempotent: true,
  scopes: ["themes:write", "pages:write"],
  handler: async (req, ctx, params) => {
    const body = (await req.json()) as {
      title?: string;
      slug?: string;
      layout?: unknown;
      status?: string;
    };
    const theme = await updateThemePage(ctx, params.id, params.pageId, body);
    return jsonData({ theme });
  },
});

export const DELETE = withDeveloperApi({
  idempotent: true,
  scopes: ["themes:write", "pages:write"],
  handler: async (_req, ctx, params) => {
    const theme = await deleteThemePage(ctx, params.id, params.pageId);
    return jsonData({ theme });
  },
});
