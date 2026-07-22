import type { HomeLayout, SectionType, StoreSection } from "./types";
import {
  ALL_SECTION_TYPES,
  COLLECTION_ALLOWED_SECTION_TYPES,
  HOME_SECTION_TYPES,
  PRODUCT_ALLOWED_SECTION_TYPES,
} from "./types";
import {
  getDefaultCollectionLayout,
  getDefaultHomeLayout,
  getDefaultProductLayout,
  getDefaultBlogPostLayout,
} from "./defaults";

const VALID_TYPES = new Set<SectionType>(ALL_SECTION_TYPES);
const HOME_TYPES = new Set<SectionType>(HOME_SECTION_TYPES);
const PRODUCT_TYPES = new Set<SectionType>(PRODUCT_ALLOWED_SECTION_TYPES);
const COLLECTION_TYPES = new Set<SectionType>(COLLECTION_ALLOWED_SECTION_TYPES);

export function isKnownSectionType(type: unknown): type is SectionType {
  return typeof type === "string" && VALID_TYPES.has(type as SectionType);
}

export function isStoreSection(
  value: unknown,
  allowedTypes: Set<SectionType> = VALID_TYPES
): value is StoreSection {
  if (!value || typeof value !== "object") return false;
  const s = value as StoreSection;
  return (
    typeof s.id === "string" &&
    allowedTypes.has(s.type) &&
    typeof s.settings === "object" &&
    s.settings !== null &&
    typeof s.visible === "boolean"
  );
}

/** Drop unknown / corrupt sections so editor UI never crashes on bad drafts. */
export function sanitizeLayout(raw: unknown): HomeLayout | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as HomeLayout;
  const list = Array.isArray(obj.sections)
    ? obj.sections
    : Array.isArray(raw)
      ? (raw as unknown[])
      : null;
  if (!list) return null;
  const sections: StoreSection[] = [];
  for (const entry of list) {
    if (!entry || typeof entry !== "object") continue;
    const s = entry as Partial<StoreSection>;
    if (typeof s.id !== "string" || !isKnownSectionType(s.type)) continue;
    if (!s.settings || typeof s.settings !== "object" || Array.isArray(s.settings)) continue;
    sections.push({
      id: s.id,
      type: s.type,
      visible: s.visible !== false,
      settings: s.settings as StoreSection["settings"],
      ...(typeof s.label === "string" && s.label.trim() ? { label: s.label.trim() } : {}),
    });
  }
  if (sections.length === 0) return null;
  return { version: 1, sections };
}

function parseLayout(
  raw: unknown,
  fallback: () => HomeLayout,
  allowedTypes: Set<SectionType> = VALID_TYPES
): HomeLayout {
  if (!raw) return fallback();

  if (Array.isArray(raw)) {
    const sections = raw.filter((s) => isStoreSection(s, allowedTypes));
    if (sections.length > 0) return { version: 1, sections };
    return fallback();
  }

  if (typeof raw === "object" && raw !== null) {
    const obj = raw as HomeLayout;
    if (obj.version === 1 && Array.isArray(obj.sections)) {
      const sections = obj.sections.filter((s) => isStoreSection(s, allowedTypes));
      if (sections.length > 0) return { version: 1, sections };
    }
  }

  return fallback();
}

export function parseHomeLayout(raw: unknown, theme?: Parameters<typeof getDefaultHomeLayout>[0]): HomeLayout {
  return parseLayout(raw, () => getDefaultHomeLayout(theme), HOME_TYPES);
}

export function parseProductLayout(
  raw: unknown,
  theme?: Parameters<typeof getDefaultProductLayout>[0]
): HomeLayout {
  return parseLayout(raw, () => getDefaultProductLayout(theme), PRODUCT_TYPES);
}

export function parseCollectionLayout(
  raw: unknown,
  theme?: Parameters<typeof getDefaultCollectionLayout>[0]
): HomeLayout {
  return parseLayout(raw, () => getDefaultCollectionLayout(theme), COLLECTION_TYPES);
}

export function parseBlogPostLayout(
  raw: unknown,
  theme?: Parameters<typeof getDefaultBlogPostLayout>[0]
): HomeLayout {
  return parseLayout(raw, () => getDefaultBlogPostLayout(theme), VALID_TYPES);
}

export function serializeHomeLayout(layout: HomeLayout): HomeLayout {
  return {
    version: 1,
    sections: layout.sections.map((s) => ({
      id: s.id,
      type: s.type,
      settings: s.settings ?? {},
      visible: s.visible,
      ...(s.label?.trim() ? { label: s.label.trim() } : {}),
    })),
  };
}

export const serializeProductLayout = serializeHomeLayout;
export const serializeCollectionLayout = serializeHomeLayout;

export function encodeLayoutForPreview(layout: HomeLayout): string {
  const str = JSON.stringify(serializeHomeLayout(layout));
  const base64 =
    typeof btoa !== "undefined"
      ? btoa(unescape(encodeURIComponent(str)))
      : Buffer.from(str, "utf8").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeLayoutFromPreview(encoded: string): HomeLayout | null {
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof atob !== "undefined"
        ? decodeURIComponent(escape(atob(padded)))
        : Buffer.from(padded, "base64").toString("utf8");
    // Preserve all known section types (home / product / collection) for iframe preview URLs.
    return sanitizeLayout(JSON.parse(json));
  } catch {
    return null;
  }
}
