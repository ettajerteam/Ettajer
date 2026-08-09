import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";
import {
  createStoreTheme,
  listStoreThemes,
} from "@/lib/developer/theme-service";

export const dynamic = "force-dynamic";

export const GET = withDeveloperApi({
  scopes: "themes:read",
  handler: async (_req, ctx) => {
    const themes = await listStoreThemes(ctx.storeId);
    return jsonData({ themes });
  },
});

export const POST = withDeveloperApi({
  idempotent: true,
  scopes: "themes:create",
  handler: async (req, ctx) => {
    const body = (await req.json()) as {
      name?: string;
      description?: string;
      provider?: string;
      document?: unknown;
    };
    const theme = await createStoreTheme(ctx, {
      name: body.name || "Untitled theme",
      description: body.description,
      provider: body.provider,
      document: body.document,
    });
    return jsonData({ theme }, { status: 201 });
  },
});
