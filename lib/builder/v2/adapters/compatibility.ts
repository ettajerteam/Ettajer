import type { HomeLayout } from "@/lib/sections/types";
import type { BuilderDocumentV2 } from "../types";
import { validateBuilderDocumentV2 } from "../utils/validate";
import { homeLayoutToV2 } from "./v1-to-v2";
import { isV2V1Compatible, v2ToHomeLayout } from "./v2-to-v1";

/** @alias homeLayoutToV2 */
export const homeLayoutToBuilderDocument = homeLayoutToV2;

/** @alias v2ToHomeLayout */
export const builderDocumentToHomeLayout = v2ToHomeLayout;

export { isV2V1Compatible };

/**
 * Returns true when a V2 document is structurally valid and can round-trip
 * to V1 without nested-element data loss.
 */
export function isV1V2Compatible(doc: BuilderDocumentV2): boolean {
  if (!isV2V1Compatible(doc)) return false;
  return validateBuilderDocumentV2(doc).length === 0;
}

function sectionSignature(layout: HomeLayout): string {
  return layout.sections
    .map((s) => `${s.id}:${s.type}:${s.visible}:${JSON.stringify(s.settings)}`)
    .join("|");
}

/**
 * Validate V1 → V2 → V1 round-trip fidelity for a home layout.
 * Used in tests and publish gates during shadow mode.
 */
export function validateHomeLayoutRoundTrip(layout: HomeLayout): boolean {
  const doc = homeLayoutToV2(layout);
  if (!isV1V2Compatible(doc)) return false;
  const restored = v2ToHomeLayout(doc);
  return sectionSignature(layout) === sectionSignature(restored);
}

/**
 * Validate V2 → V1 → V2 structural parity (ids, types, visibility).
 * Content/settings may differ in ordering; structural shape must match.
 */
export function validateDocumentRoundTrip(doc: BuilderDocumentV2): boolean {
  if (!isV1V2Compatible(doc)) return false;
  const v1 = v2ToHomeLayout(doc);
  const roundTrip = homeLayoutToV2(v1);

  const home = doc.pages.find((p) => p.pageType === "home") ?? doc.pages[0];
  const rtHome = roundTrip.pages.find((p) => p.pageType === "home") ?? roundTrip.pages[0];
  if (!home || !rtHome) return false;
  if (home.sections.join(",") !== rtHome.sections.join(",")) return false;

  for (const sectionId of home.sections) {
    const a = doc.sections[sectionId];
    const b = roundTrip.sections[sectionId];
    if (!a || !b) return false;
    if (a.type !== b.type || a.visible !== b.visible) return false;
  }

  return true;
}
