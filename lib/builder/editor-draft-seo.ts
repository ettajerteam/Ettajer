/**
 * Cloud editor drafts + publish snapshots stored on StoreSettings.seo
 * (same pattern as layoutRevision — no schema migration).
 */

import type { LayoutDraftBundle } from "@/lib/builder/layout-draft-storage";
import type { HomeLayout } from "@/lib/sections/types";
import type { NavItem } from "@/lib/navigation";

export const EDITOR_DRAFT_MAX_BYTES = 450_000;
export const PUBLISH_SNAPSHOT_MAX = 5;

export type PublishSnapshot = {
  id: string;
  revision: number;
  createdAt: string;
  summary: string;
  layouts?: Partial<Record<string, HomeLayout>>;
  theme?: Record<string, unknown>;
  navigation?: NavItem[];
};

export function parseEditorDraft(seoRaw: unknown): LayoutDraftBundle | null {
  if (!seoRaw || typeof seoRaw !== "object" || Array.isArray(seoRaw)) return null;
  const draft = (seoRaw as Record<string, unknown>).editorDraft;
  if (!draft || typeof draft !== "object" || Array.isArray(draft)) return null;
  const bundle = draft as LayoutDraftBundle;
  if (typeof bundle.updatedAt !== "number") return null;
  return bundle;
}

export function mergeSeoWithEditorDraft(
  seoRaw: unknown,
  draft: LayoutDraftBundle | null
): Record<string, unknown> {
  const base =
    seoRaw && typeof seoRaw === "object" && !Array.isArray(seoRaw)
      ? { ...(seoRaw as Record<string, unknown>) }
      : {};
  if (draft == null) {
    delete base.editorDraft;
  } else {
    base.editorDraft = draft;
  }
  return base;
}

export function parsePublishSnapshots(seoRaw: unknown): PublishSnapshot[] {
  if (!seoRaw || typeof seoRaw !== "object" || Array.isArray(seoRaw)) return [];
  const raw = (seoRaw as Record<string, unknown>).publishSnapshots;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is PublishSnapshot =>
      !!item &&
      typeof item === "object" &&
      typeof (item as PublishSnapshot).id === "string" &&
      typeof (item as PublishSnapshot).revision === "number" &&
      typeof (item as PublishSnapshot).createdAt === "string"
  );
}

export function mergeSeoWithPublishSnapshot(
  seoRaw: unknown,
  snapshot: PublishSnapshot
): Record<string, unknown> {
  const base =
    seoRaw && typeof seoRaw === "object" && !Array.isArray(seoRaw)
      ? { ...(seoRaw as Record<string, unknown>) }
      : {};
  const prev = parsePublishSnapshots(base);
  base.publishSnapshots = [snapshot, ...prev].slice(0, PUBLISH_SNAPSHOT_MAX);
  return base;
}

export function estimateJsonBytes(value: unknown): number {
  try {
    return new TextEncoder().encode(JSON.stringify(value)).length;
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
}
