import { prisma } from "@/lib/db";
import { ALL_SECTION_TYPES, type SectionType, type StoreSection } from "@/lib/sections/types";
import { isValidThemeId } from "@/lib/themes";
import { DeveloperApiError } from "@/lib/developer/errors";
import {
  asThemeDocument,
  type StoreThemeDocumentV1,
  type TemplateKey,
} from "@/lib/developer/theme-document";

const ALLOWED_SECTION_TYPES = new Set<string>(ALL_SECTION_TYPES);

const SCRIPT_RE = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
const ON_EVENT_RE = /\son\w+\s*=\s*(['"]).*?\1/gi;
const JS_URL_RE = /javascript:/gi;

export function sanitizeThemeText(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replace(SCRIPT_RE, "")
      .replace(ON_EVENT_RE, "")
      .replace(JS_URL_RE, "")
      .slice(0, 20_000);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeThemeText);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k === "__proto__" || k === "constructor" || k === "prototype") continue;
      out[k] = sanitizeThemeText(v);
    }
    return out;
  }
  return value;
}

const DANGEROUS_HREF_RE = /^(javascript|data|vbscript):/i;

function isSafeNavHref(href: string): boolean {
  if (!href || href.includes("<") || DANGEROUS_HREF_RE.test(href)) return false;
  if (href.startsWith("/") || href.startsWith("#") || href.startsWith("?")) return true;
  if (/^https?:\/\//i.test(href)) return true;
  // Reject protocol-relative and bare non-path values (e.g. sanitized javascript: leftovers).
  return false;
}

/** Sanitize + validate navigation items for theme drafts or live store menus. */
export function validateNavigation(raw: unknown): StoreThemeDocumentV1["navigation"] {
  const sanitized = sanitizeThemeText(raw);
  if (!Array.isArray(sanitized)) {
    throw new DeveloperApiError(
      "INVALID_NAVIGATION",
      "navigation must be an array.",
      { hint: "Pass NavItem[]: { id, label, href, children? }[]. Use get_navigation first." },
    );
  }
  const walk = (items: unknown[], depth: number): StoreThemeDocumentV1["navigation"] => {
    if (depth > 3) {
      throw new DeveloperApiError(
        "INVALID_NAVIGATION",
        "Navigation nesting too deep.",
        { maxDepth: 3 },
      );
    }
    return items.map((item, index) => {
      if (!item || typeof item !== "object") {
        throw new DeveloperApiError(
          "INVALID_NAVIGATION",
          `Invalid navigation item at index ${index}.`,
        );
      }
      const row = item as Record<string, unknown>;
      const id = typeof row.id === "string" && row.id.trim() ? row.id.trim() : `nav-${index}`;
      const label =
        typeof row.label === "string" && row.label.trim()
          ? row.label.trim().slice(0, 120)
          : "";
      const href = typeof row.href === "string" ? row.href.trim().slice(0, 2000) : "";
      if (!label) {
        throw new DeveloperApiError(
          "INVALID_NAVIGATION",
          "Navigation items require a label.",
          { index },
        );
      }
      if (!isSafeNavHref(href)) {
        throw new DeveloperApiError(
          "INVALID_NAVIGATION",
          `Unsafe or empty navigation href for "${label}".`,
          {
            href,
            hint: "Use relative paths like /, /products, /collections/{slug}, /pages/{slug}, or https:// URLs.",
          },
        );
      }
      const children = Array.isArray(row.children)
        ? walk(row.children, depth + 1)
        : undefined;
      return { id, label, href, ...(children?.length ? { children } : {}) };
    });
  };
  return walk(sanitized, 0);
}

/** Reject dangerous remote media registration (SSRF / javascript: / data:). */
export function assertSafeMediaUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new DeveloperApiError("VALIDATION_ERROR", "Invalid media URL.");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new DeveloperApiError(
      "UNSAFE_MEDIA_URL",
      "Media URL must be http(s).",
      { hint: "Use https URLs or upload via multipart to Ettajer media." },
    );
  }
  const host = parsed.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host) ||
    host === "169.254.169.254" ||
    host === "metadata.google.internal"
  ) {
    throw new DeveloperApiError(
      "UNSAFE_MEDIA_URL",
      "Media URL host is not allowed.",
      {
        host,
        hint: "Private/metadata hosts are blocked (SSRF protection). Use get_media or upload_media.",
      },
    );
  }
}

function collectProductIds(settings: Record<string, unknown>): string[] {
  const ids: string[] = [];
  for (const key of ["products", "productIds"] as const) {
    const products = settings[key];
    if (Array.isArray(products)) {
      for (const item of products) {
        if (typeof item === "string") ids.push(item);
        else if (item && typeof item === "object" && "productId" in item) {
          const id = (item as { productId?: unknown }).productId;
          if (typeof id === "string") ids.push(id);
        }
      }
    }
  }
  if (typeof settings.productId === "string") ids.push(settings.productId);
  return ids;
}


function collectCollectionIds(settings: Record<string, unknown>): string[] {
  const ids: string[] = [];
  if (typeof settings.collectionId === "string") ids.push(settings.collectionId);
  for (const key of ["collections", "collectionIds"] as const) {
    const val = settings[key];
    if (Array.isArray(val)) {
      for (const item of val) {
        if (typeof item === "string") ids.push(item);
        else if (item && typeof item === "object" && "collectionId" in item) {
          const id = (item as { collectionId?: unknown }).collectionId;
          if (typeof id === "string") ids.push(id);
        }
      }
    }
  }
  return ids;
}

function collectMediaIds(settings: Record<string, unknown>): string[] {
  const ids: string[] = [];
  if (typeof settings.mediaId === "string") ids.push(settings.mediaId);
  const media = settings.media;
  if (Array.isArray(media)) {
    for (const item of media) {
      if (typeof item === "string") ids.push(item);
      else if (item && typeof item === "object" && "mediaId" in item) {
        const id = (item as { mediaId?: unknown }).mediaId;
        if (typeof id === "string") ids.push(id);
      }
    }
  }
  return ids;
}

export async function validateThemeDocument(
  storeId: string,
  raw: unknown,
): Promise<StoreThemeDocumentV1> {
  const sanitized = sanitizeThemeText(raw) as StoreThemeDocumentV1;
  const doc = asThemeDocument(sanitized);

  if (!isValidThemeId(doc.theme.theme)) {
    throw new DeveloperApiError(
      "INVALID_THEME_STYLE",
      `Invalid theme style "${doc.theme.theme}". Use minimal, modern, or bold.`,
      {
        received: doc.theme.theme,
        supportedStyles: ["minimal", "modern", "bold"],
        hint: "Call get_theme_schema for full theme capabilities.",
      },
    );
  }

  const productIds = new Set<string>();
  const collectionIds = new Set<string>();
  const mediaIds = new Set<string>();
  const supportedTypes = Array.from(ALLOWED_SECTION_TYPES);

  const walkSections = (sections: StoreSection[], where: string) => {
    for (const section of sections) {
      if (!section || typeof section !== "object") {
        throw new DeveloperApiError(
          "VALIDATION_ERROR",
          `Invalid section in ${where}`,
          { where, hint: "Each section needs id, type, visible, settings." },
        );
      }
      if (!ALLOWED_SECTION_TYPES.has(section.type)) {
        throw new DeveloperApiError(
          "INVALID_THEME_SECTION",
          `Section type '${section.type}' is not supported.`,
          {
            where,
            received: section.type,
            supportedTypes,
            hint: "Call get_theme_schema and use an implemented section type.",
          },
        );
      }
      if (typeof section.id !== "string" || !section.id) {
        throw new DeveloperApiError(
          "VALIDATION_ERROR",
          `Section missing id in ${where}`,
          { where, hint: "Provide a stable string id per section." },
        );
      }
      const settings = (section.settings ?? {}) as Record<string, unknown>;
      for (const id of collectProductIds(settings)) productIds.add(id);
      for (const id of collectCollectionIds(settings)) collectionIds.add(id);
      for (const id of collectMediaIds(settings)) mediaIds.add(id);
    }
  };

  walkSections(doc.templates.home.sections, "templates.home");
  if (doc.templates.product) walkSections(doc.templates.product.sections, "templates.product");
  if (doc.templates.collection) {
    walkSections(doc.templates.collection.sections, "templates.collection");
  }
  if (doc.templates.blogPost) {
    walkSections(doc.templates.blogPost.sections, "templates.blogPost");
  }
  for (const page of doc.pages) {
    walkSections(page.layout.sections, `pages.${page.slug}`);
  }

  if (productIds.size > 0) {
    const found = await prisma.product.findMany({
      where: { storeId, id: { in: Array.from(productIds) } },
      select: { id: true },
    });
    const foundSet = new Set(found.map((p) => p.id));
    for (const id of Array.from(productIds)) {
      if (!foundSet.has(id)) {
        throw new DeveloperApiError(
          "INVALID_PRODUCT_REFERENCE",
          `Product ${id} does not belong to this store.`,
          {
            productId: id,
            hint: "Use get_products to retrieve valid product IDs for the authenticated store.",
          },
        );
      }
    }
  }

  if (collectionIds.size > 0) {
    const found = await prisma.collection.findMany({
      where: { storeId, id: { in: Array.from(collectionIds) } },
      select: { id: true },
    });
    const foundSet = new Set(found.map((c) => c.id));
    for (const id of Array.from(collectionIds)) {
      if (!foundSet.has(id)) {
        throw new DeveloperApiError(
          "INVALID_COLLECTION_REFERENCE",
          `Collection ${id} does not belong to this store.`,
          {
            collectionId: id,
            hint: "Use get_collections to retrieve valid collection IDs.",
          },
        );
      }
    }
  }

  if (mediaIds.size > 0) {
    const found = await prisma.mediaAsset.findMany({
      where: { storeId, id: { in: Array.from(mediaIds) } },
      select: { id: true },
    });
    const foundSet = new Set(found.map((m) => m.id));
    for (const id of Array.from(mediaIds)) {
      if (!foundSet.has(id)) {
        throw new DeveloperApiError(
          "INVALID_MEDIA_REFERENCE",
          `Media ${id} does not belong to this store.`,
          {
            mediaId: id,
            hint: "Use get_media or upload_media, then reference mediaId in section settings.",
          },
        );
      }
    }
  }

  return doc;
}

export function assertSectionType(type: string): asserts type is SectionType {
  if (!ALLOWED_SECTION_TYPES.has(type)) {
    throw new DeveloperApiError(
      "INVALID_THEME_SECTION",
      `Section type '${type}' is not supported.`,
      {
        received: type,
        supportedTypes: Array.from(ALLOWED_SECTION_TYPES),
        hint: "Call get_theme_schema before creating sections.",
      },
    );
  }
}

export function resolveTemplateLayout(
  doc: StoreThemeDocumentV1,
  templateKey: TemplateKey,
  pageId?: string,
) {
  if (templateKey === "home") return doc.templates.home;
  if (templateKey === "product") {
    return doc.templates.product ?? { version: 1 as const, sections: [] };
  }
  if (templateKey === "collection") {
    return doc.templates.collection ?? { version: 1 as const, sections: [] };
  }
  if (templateKey === "blogPost") {
    return doc.templates.blogPost ?? { version: 1 as const, sections: [] };
  }
  if (pageId) {
    const page = doc.pages.find((p) => p.id === pageId || p.slug === pageId);
    if (!page) throw new DeveloperApiError("NOT_FOUND", "Page not found in theme.");
    return page.layout;
  }
  throw new DeveloperApiError("VALIDATION_ERROR", "Unknown template key.");
}
