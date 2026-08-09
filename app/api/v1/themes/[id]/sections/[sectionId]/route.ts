import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";
import {
  updateThemeSection,
  deleteThemeSection,
} from "@/lib/developer/theme-service";
import type { TemplateKey } from "@/lib/developer/theme-document";

export const dynamic = "force-dynamic";

export const PATCH = withDeveloperApi({
  idempotent: true,
  scopes: "themes:write",
  handler: async (req, ctx, params) => {
    const body = (await req.json()) as {
      templateKey?: TemplateKey;
      pageId?: string;
      settings?: Record<string, unknown>;
      label?: string;
      visible?: boolean;
      type?: string;
    };
    const result = await updateThemeSection(ctx, params.id, params.sectionId, body);
    return jsonData(result);
  },
});

export const DELETE = withDeveloperApi({
  idempotent: true,
  scopes: "themes:write",
  handler: async (req, ctx, params) => {
    const url = new URL(req.url);
    const theme = await deleteThemeSection(ctx, params.id, params.sectionId, {
      templateKey: (url.searchParams.get("templateKey") as TemplateKey) || undefined,
      pageId: url.searchParams.get("pageId") || undefined,
    });
    return jsonData({ theme });
  },
});
