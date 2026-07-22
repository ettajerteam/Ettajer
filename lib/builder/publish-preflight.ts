import { SECTION_REGISTRY } from "@/lib/sections/registry";
import type { HomeLayout, StoreSection } from "@/lib/sections/types";
import { getBlock, getBlockBySectionType } from "./block-registry";
import { getAllSchemaFields } from "./schema-inspector-utils";
import { sectionToBlockId } from "./legacy-adapter";
import type { SettingFieldSchema } from "./block-schema";

export type PreflightIssueLevel = "error" | "warning";

export type PreflightIssue = {
  level: PreflightIssueLevel;
  pageKey: string;
  pageLabel: string;
  sectionId: string | null;
  message: string;
};

function sectionLabel(section: StoreSection): string {
  if (section.label?.trim()) return section.label.trim();
  const block = getBlockBySectionType(section.type) ?? getBlock(sectionToBlockId(section));
  if (block?.name) return block.name;
  return SECTION_REGISTRY[section.type]?.label ?? section.type;
}

function isEmptyValue(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function validateSection(
  pageKey: string,
  pageLabel: string,
  section: StoreSection,
  catalog?: {
    productIds?: Set<string>;
    collectionIds?: Set<string>;
    mediaUrls?: Set<string>;
  }
): PreflightIssue[] {
  const issues: PreflightIssue[] = [];
  const block = getBlockBySectionType(section.type) ?? getBlock(sectionToBlockId(section));
  const label = sectionLabel(section);

  if (!block) {
    issues.push({
      level: "warning",
      pageKey,
      pageLabel,
      sectionId: section.id,
      message: `${label}: unknown block type “${section.type}”`,
    });
    return issues;
  }

  if (!block.implemented) {
    issues.push({
      level: "error",
      pageKey,
      pageLabel,
      sectionId: section.id,
      message: `${label}: block is not implemented and will not render live`,
    });
  }

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  const fields = block.settingsSchema ? getAllSchemaFields(block.settingsSchema) : [];

  for (const field of fields) {
    if (field.type === "productPicker" || field.type === "collectionPicker") {
      const value = settings[field.key];
      if (isEmptyValue(value)) {
        issues.push({
          level: "warning",
          pageKey,
          pageLabel,
          sectionId: section.id,
          message: `${label}: “${field.label}” is empty`,
        });
      } else if (catalog) {
        const ids = Array.isArray(value)
          ? value.map(String)
          : typeof value === "string"
            ? [value]
            : [];
        const known =
          field.type === "productPicker" ? catalog.productIds : catalog.collectionIds;
        if (known) {
          for (const id of ids) {
            if (id && !known.has(id)) {
              issues.push({
                level: "error",
                pageKey,
                pageLabel,
                sectionId: section.id,
                message: `${label}: “${field.label}” references a missing ${
                  field.type === "productPicker" ? "product" : "collection"
                }`,
              });
            }
          }
        }
      }
    }
    if (field.type === "image" || field.type === "media") {
      // empty images are common defaults — warn only when altKey is set and image present without alt
      const image = settings[field.key];
      const altKey = field.altKey ?? "alt";
      if (typeof image === "string" && image.trim() && isEmptyValue(settings[altKey])) {
        issues.push({
          level: "warning",
          pageKey,
          pageLabel,
          sectionId: section.id,
          message: `${label}: image is missing alt text`,
        });
      }
      if (typeof image === "string" && image.trim()) {
        const url = image.trim();
        if (url.startsWith("blob:") || url === "undefined" || url === "null") {
          issues.push({
            level: "error",
            pageKey,
            pageLabel,
            sectionId: section.id,
            message: `${label}: “${field.label}” has an invalid media URL`,
          });
        } else if (catalog?.mediaUrls && catalog.mediaUrls.size > 0) {
          const isExternal = /^https?:\/\//i.test(url);
          const looksLocal =
            url.startsWith("/") ||
            url.includes("/uploads/") ||
            url.includes("/api/media") ||
            url.includes("media/");
          if (looksLocal && !isExternal && !catalog.mediaUrls.has(url)) {
            // also allow path-only matches against known urls
            const matched = Array.from(catalog.mediaUrls).some(
              (known) => known === url || known.endsWith(url) || url.endsWith(known)
            );
            if (!matched) {
              issues.push({
                level: "warning",
                pageKey,
                pageLabel,
                sectionId: section.id,
                message: `${label}: “${field.label}” may reference a missing media asset`,
              });
            }
          }
        }
      }
    }
  }

  // Soft required: headline-like text fields that are empty while section is visible
  if (section.visible) {
    const textFields = fields.filter(
      (f: SettingFieldSchema) =>
        (f.type === "text" || f.type === "textarea" || f.type === "richtext") &&
        (f.key === "headline" || f.key === "title" || f.key === "content")
    );
    const hasAnyText = textFields.some((f) => !isEmptyValue(settings[f.key]));
    if (textFields.length > 0 && !hasAnyText && section.type !== "product-grid") {
      issues.push({
        level: "warning",
        pageKey,
        pageLabel,
        sectionId: section.id,
        message: `${label}: main text is empty (store defaults may fill it)`,
      });
    }
  }

  return issues;
}

export function runPublishPreflight(
  pages: { key: string; label: string; layout: HomeLayout }[],
  catalog?: {
    productIds?: Set<string>;
    collectionIds?: Set<string>;
    mediaUrls?: Set<string>;
  }
): PreflightIssue[] {
  const issues: PreflightIssue[] = [];
  for (const page of pages) {
    if (!page.layout?.sections?.length) {
      issues.push({
        level: "warning",
        pageKey: page.key,
        pageLabel: page.label,
        sectionId: null,
        message: `${page.label}: has no sections`,
      });
      continue;
    }
    for (const section of page.layout.sections) {
      issues.push(...validateSection(page.key, page.label, section, catalog));
    }
  }
  return issues;
}

export function preflightHasErrors(issues: PreflightIssue[]): boolean {
  return issues.some((i) => i.level === "error");
}
