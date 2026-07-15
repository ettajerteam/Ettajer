import type { HomeLayout, SectionType, StoreSection } from "./types";
import {
  ALL_SECTION_TYPES,
  COLLECTION_SECTION_TYPES,
  HOME_SECTION_TYPES,
  PRODUCT_SECTION_TYPES,
} from "./types";
import {
  getDefaultCollectionLayout,
  getDefaultHomeLayout,
  getDefaultProductLayout,
} from "./defaults";

const VALID_TYPES = new Set<SectionType>(ALL_SECTION_TYPES);
const HOME_TYPES = new Set<SectionType>(HOME_SECTION_TYPES);
const PRODUCT_TYPES = new Set<SectionType>(PRODUCT_SECTION_TYPES);
const COLLECTION_TYPES = new Set<SectionType>(COLLECTION_SECTION_TYPES);

function isStoreSection(value: unknown, allowedTypes: Set<SectionType> = VALID_TYPES): value is StoreSection {
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

export function serializeHomeLayout(layout: HomeLayout): HomeLayout {
  return {
    version: 1,
    sections: layout.sections.map((s) => ({
      id: s.id,
      type: s.type,
      settings: s.settings ?? {},
      visible: s.visible,
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
    return parseHomeLayout(JSON.parse(json));
  } catch {
    return null;
  }
}
