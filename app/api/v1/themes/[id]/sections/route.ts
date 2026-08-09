import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";
import { asThemeDocument } from "@/lib/developer/theme-document";
import {
  getStoreTheme,
  createThemeSection,
} from "@/lib/developer/theme-service";
import type { TemplateKey } from "@/lib/developer/theme-document";

export const dynamic = "force-dynamic";

export const GET = withDeveloperApi({
  scopes: "themes:read",
  handler: async (req, ctx, params) => {
    const theme = await getStoreTheme(ctx.storeId, params.id);
    const doc = asThemeDocument(theme.document);
    const url = new URL(req.url);
    const templateKey = (url.searchParams.get("templateKey") || "home") as TemplateKey;
    const pageId = url.searchParams.get("pageId") || undefined;
    let sections = doc.templates.home.sections;
    if (pageId) {
      const page = doc.pages.find((p) => p.id === pageId || p.slug === pageId);
      sections = page?.layout.sections ?? [];
    } else if (templateKey === "product") {
      sections = doc.templates.product?.sections ?? [];
    } else if (templateKey === "collection") {
      sections = doc.templates.collection?.sections ?? [];
    } else if (templateKey === "blogPost") {
      sections = doc.templates.blogPost?.sections ?? [];
    }
    return jsonData({ sections });
  },
});

export const POST = withDeveloperApi({
  idempotent: true,
  scopes: "themes:write",
  handler: async (req, ctx, params) => {
    const body = (await req.json()) as {
      templateKey?: TemplateKey;
      pageId?: string;
      sectionType?: string;
      settings?: Record<string, unknown>;
      label?: string;
      index?: number;
    };
    const result = await createThemeSection(ctx, params.id, {
      templateKey: body.templateKey,
      pageId: body.pageId,
      sectionType: body.sectionType || "rich-text",
      settings: body.settings,
      label: body.label,
      index: body.index,
    });
    return jsonData(result, { status: 201 });
  },
});
