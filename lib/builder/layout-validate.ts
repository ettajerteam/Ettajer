/**
 * Server-side layout quotas and structure checks for go-live reliability.
 */

import { getBlock, getBlockBySectionType } from "@/lib/builder/block-registry";
import { sectionToBlockId } from "@/lib/builder/legacy-adapter";
import type { HomeLayout, StoreSection } from "@/lib/sections/types";

export const LAYOUT_MAX_SECTIONS = 80;
export const LAYOUT_MAX_PAYLOAD_BYTES = 750_000;
export const LAYOUT_MAX_SETTING_STRING = 50_000;

export type LayoutValidationIssue = {
  code: string;
  message: string;
  sectionId?: string;
};

function estimatePayloadBytes(layout: HomeLayout): number {
  try {
    return new TextEncoder().encode(JSON.stringify(layout)).length;
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
}

function walkSettings(value: unknown, path: string, issues: LayoutValidationIssue[], sectionId: string) {
  if (typeof value === "string" && value.length > LAYOUT_MAX_SETTING_STRING) {
    issues.push({
      code: "SETTING_TOO_LARGE",
      message: `Section setting “${path}” exceeds ${LAYOUT_MAX_SETTING_STRING} characters`,
      sectionId,
    });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => walkSettings(item, `${path}[${i}]`, issues, sectionId));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      walkSettings(child, path ? `${path}.${key}` : key, issues, sectionId);
    }
  }
}

function validateSection(section: StoreSection): LayoutValidationIssue[] {
  const issues: LayoutValidationIssue[] = [];
  if (!section.id || typeof section.id !== "string") {
    issues.push({ code: "SECTION_ID", message: "Section is missing an id" });
    return issues;
  }
  if (!section.type || typeof section.type !== "string") {
    issues.push({
      code: "SECTION_TYPE",
      message: "Section is missing a type",
      sectionId: section.id,
    });
    return issues;
  }

  const block =
    getBlockBySectionType(section.type) ?? getBlock(sectionToBlockId(section));
  if (!block) {
    issues.push({
      code: "UNKNOWN_BLOCK",
      message: `Unknown block type “${section.type}”`,
      sectionId: section.id,
    });
  } else if (!block.implemented) {
    issues.push({
      code: "UNIMPLEMENTED_BLOCK",
      message: `Block “${section.type}” is not implemented and cannot go live`,
      sectionId: section.id,
    });
  }

  walkSettings(section.settings ?? {}, "", issues, section.id);
  return issues;
}

export function validateLayoutForPublish(layout: unknown): LayoutValidationIssue[] {
  const issues: LayoutValidationIssue[] = [];
  if (!layout || typeof layout !== "object" || Array.isArray(layout)) {
    return [{ code: "INVALID_LAYOUT", message: "Layout must be an object" }];
  }

  const sections = (layout as HomeLayout).sections;
  if (!Array.isArray(sections)) {
    return [{ code: "INVALID_SECTIONS", message: "Layout.sections must be an array" }];
  }

  if (sections.length > LAYOUT_MAX_SECTIONS) {
    issues.push({
      code: "TOO_MANY_SECTIONS",
      message: `Layout has ${sections.length} sections (max ${LAYOUT_MAX_SECTIONS})`,
    });
  }

  const bytes = estimatePayloadBytes(layout as HomeLayout);
  if (bytes > LAYOUT_MAX_PAYLOAD_BYTES) {
    issues.push({
      code: "PAYLOAD_TOO_LARGE",
      message: `Layout payload is ~${Math.round(bytes / 1024)}KB (max ${Math.round(LAYOUT_MAX_PAYLOAD_BYTES / 1024)}KB)`,
    });
  }

  const seen = new Set<string>();
  for (const section of sections) {
    if (!section || typeof section !== "object") {
      issues.push({ code: "INVALID_SECTION", message: "Invalid section entry" });
      continue;
    }
    if (typeof section.id === "string") {
      if (seen.has(section.id)) {
        issues.push({
          code: "DUPLICATE_SECTION_ID",
          message: `Duplicate section id “${section.id}”`,
          sectionId: section.id,
        });
      }
      seen.add(section.id);
    }
    issues.push(...validateSection(section as StoreSection));
  }

  return issues;
}
