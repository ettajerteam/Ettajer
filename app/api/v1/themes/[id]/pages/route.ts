import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";
import { asThemeDocument } from "@/lib/developer/theme-document";
import { getStoreTheme, createThemePage } from "@/lib/developer/theme-service";

export const dynamic = "force-dynamic";

export const GET = withDeveloperApi({
  scopes: "themes:read",
  handler: async (_req, ctx, params) => {
    const theme = await getStoreTheme(ctx.storeId, params.id);
    return jsonData({ pages: asThemeDocument(theme.document).pages });
  },
});

export const POST = withDeveloperApi({
  idempotent: true,
  scopes: ["themes:write", "pages:write"],
  handler: async (req, ctx, params) => {
    const body = (await req.json()) as {
      slug?: string;
      title?: string;
      layout?: unknown;
    };
    const theme = await createThemePage(ctx, params.id, {
      slug: body.slug || "page",
      title: body.title || "Page",
      layout: body.layout,
    });
    return jsonData({ theme }, { status: 201 });
  },
});
