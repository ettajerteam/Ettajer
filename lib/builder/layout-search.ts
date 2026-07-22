/**
 * Index string settings for find-in-layout search.
 */

import type { StoreSection } from "@/lib/sections/types";
import { getBlock, getBlockBySectionType } from "./block-registry";
import { getAllSchemaFields } from "./schema-inspector-utils";
import { sectionToBlockId } from "./legacy-adapter";

export type LayoutSearchHit = {
  sectionId: string;
  fieldKey: string;
  fieldLabel: string;
  snippet: string;
};

function asSearchableText(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (Array.isArray(value)) {
    const parts = value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const obj = item as Record<string, unknown>;
          return [obj.title, obj.headline, obj.text, obj.label, obj.content]
            .filter((v) => typeof v === "string")
            .join(" ");
        }
        return "";
      })
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    return parts.length > 0 ? parts : null;
  }
  return null;
}

export function searchLayoutSections(
  sections: StoreSection[],
  query: string
): LayoutSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: LayoutSearchHit[] = [];

  for (const section of sections) {
    const block = getBlockBySectionType(section.type) ?? getBlock(sectionToBlockId(section));
    const settings = (section.settings ?? {}) as Record<string, unknown>;
    const fields = block?.settingsSchema ? getAllSchemaFields(block.settingsSchema) : [];

    const label = section.label?.trim() || block?.name || section.type;
    if (label.toLowerCase().includes(q)) {
      hits.push({
        sectionId: section.id,
        fieldKey: "label",
        fieldLabel: "Name",
        snippet: label,
      });
    }

    if (fields.length === 0) {
      for (const [key, value] of Object.entries(settings)) {
        if (key === "styles") continue;
        const text = asSearchableText(value);
        if (text && text.toLowerCase().includes(q)) {
          hits.push({
            sectionId: section.id,
            fieldKey: key,
            fieldLabel: key,
            snippet: text.slice(0, 80),
          });
        }
      }
      continue;
    }

    for (const field of fields) {
      if (
        field.type !== "text" &&
        field.type !== "textarea" &&
        field.type !== "richtext" &&
        field.type !== "url" &&
        field.type !== "link"
      ) {
        continue;
      }
      const text = asSearchableText(settings[field.key]);
      if (text && text.toLowerCase().includes(q)) {
        hits.push({
          sectionId: section.id,
          fieldKey: field.key,
          fieldLabel: field.label,
          snippet: text.slice(0, 80),
        });
      }
    }
  }

  return hits;
}
