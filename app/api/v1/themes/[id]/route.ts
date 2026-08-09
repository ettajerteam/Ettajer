import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";
import {
  getStoreTheme,
  updateStoreTheme,
  archiveStoreTheme,
} from "@/lib/developer/theme-service";

export const dynamic = "force-dynamic";

export const GET = withDeveloperApi({
  scopes: "themes:read",
  handler: async (_req, ctx, params) => {
    const theme = await getStoreTheme(ctx.storeId, params.id);
    return jsonData({ theme });
  },
});

export const PATCH = withDeveloperApi({
  idempotent: true,
  scopes: "themes:write",
  handler: async (req, ctx, params) => {
    const body = (await req.json()) as {
      name?: string;
      description?: string | null;
      document?: unknown;
      provider?: string;
    };
    const theme = await updateStoreTheme(ctx, params.id, body);
    return jsonData({ theme });
  },
});

export const DELETE = withDeveloperApi({
  idempotent: true,
  scopes: "themes:write",
  handler: async (_req, ctx, params) => {
    const theme = await archiveStoreTheme(ctx, params.id);
    return jsonData({ theme });
  },
});
