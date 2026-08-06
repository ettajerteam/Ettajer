import type { HomeLayout } from "@/lib/sections/types";
import { parseHomeLayout, serializeHomeLayout } from "@/lib/sections/parse";

/** SEO, legacy body, and optional section layout stored in StorePage.content. */

export interface PageContentData {
  body: string;
  metaTitle?: string;
  metaDescription?: string;
  /** Comma-separated keywords for meta tags */
  keywords?: string;
  /** Open Graph / social share image URL */
  ogImage?: string;
  /** Hide from search engines when true */
  noIndex?: boolean;
  layout?: HomeLayout;
}

const PAGE_MARKER = "__ettajerPage";

function parseLayoutField(raw: unknown): HomeLayout | undefined {
  if (!raw) return undefined;
  const layout = parseHomeLayout(raw);
  return layout.sections.length > 0 ? layout : undefined;
}

export function parsePageContent(raw: string): PageContentData {
  if (!raw?.trim()) return { body: "" };
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed && parsed[PAGE_MARKER] === true) {
      return {
        body: typeof parsed.body === "string" ? parsed.body : "",
        metaTitle:
          typeof parsed.metaTitle === "string" ? parsed.metaTitle : undefined,
        metaDescription:
          typeof parsed.metaDescription === "string"
            ? parsed.metaDescription
            : undefined,
        keywords:
          typeof parsed.keywords === "string"
            ? parsed.keywords
            : Array.isArray(parsed.keywords)
              ? parsed.keywords.filter((k): k is string => typeof k === "string").join(", ")
              : undefined,
        ogImage:
          typeof parsed.ogImage === "string" ? parsed.ogImage : undefined,
        noIndex: parsed.noIndex === true,
        layout: parseLayoutField(parsed.layout),
      };
    }
  } catch {
    /* plain text content */
  }
  return { body: raw };
}

export function serializePageContent(data: PageContentData): string {
  const hasLayout = Boolean(data.layout?.sections?.length);
  const hasSeo = Boolean(
    data.metaTitle?.trim() ||
      data.metaDescription?.trim() ||
      data.keywords?.trim() ||
      data.ogImage?.trim() ||
      data.noIndex
  );
  const hasBody = Boolean(data.body?.trim());

  if (!hasLayout && !hasSeo && !hasBody) return "";

  if (!hasLayout && !hasSeo) return data.body;

  return JSON.stringify({
    [PAGE_MARKER]: true,
    body: data.body,
    metaTitle: data.metaTitle?.trim() || undefined,
    metaDescription: data.metaDescription?.trim() || undefined,
    keywords: data.keywords?.trim() || undefined,
    ogImage: data.ogImage?.trim() || undefined,
    noIndex: data.noIndex === true ? true : undefined,
    layout: hasLayout ? serializeHomeLayout(data.layout!) : undefined,
  });
}

function layoutsEqual(a: HomeLayout | undefined, b: HomeLayout | undefined): boolean {
  const sa = a?.sections?.length ? serializeHomeLayout(a) : null;
  const sb = b?.sections?.length ? serializeHomeLayout(b) : null;
  return JSON.stringify(sa) === JSON.stringify(sb);
}

export function pageContentEquals(a: string, b: string): boolean {
  const pa = parsePageContent(a);
  const pb = parsePageContent(b);
  return (
    pa.body === pb.body &&
    (pa.metaTitle ?? "") === (pb.metaTitle ?? "") &&
    (pa.metaDescription ?? "") === (pb.metaDescription ?? "") &&
    (pa.keywords ?? "") === (pb.keywords ?? "") &&
    (pa.ogImage ?? "") === (pb.ogImage ?? "") &&
    Boolean(pa.noIndex) === Boolean(pb.noIndex) &&
    layoutsEqual(pa.layout, pb.layout)
  );
}

export function pageKeywordsList(keywords?: string): string[] {
  if (!keywords?.trim()) return [];
  return keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 20);
}
