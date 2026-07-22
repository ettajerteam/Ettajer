/**
 * Typed postMessage protocol between the website editor shell and the preview iframe.
 * Event-driven bridge — see `components/storefront/builder-section-bridge.tsx`.
 */

import type { DeviceMode } from "./types";
import type { NavItem } from "@/lib/navigation";
import type { StoreThemeSettings } from "@/types/storefront";
import { getEditorOrigin, isAllowedBridgeOrigin } from "./bridge-origins";

/** Messages sent from editor parent → preview iframe */
export type BuilderEditorToPreviewMessage =
  | { type: "ettajer:preview-device"; device: DeviceMode }
  | { type: "ettajer:focus-section"; sectionId: string }
  | { type: "ettajer:focus-element"; layerId: string }
  | { type: "ettajer:preview-layout"; layout: import("@/lib/sections/types").HomeLayout; seq?: number }
  | {
      type: "ettajer:preview-layout-patch";
      seq: number;
      patches: Array<
        | { op: "section"; section: import("@/lib/sections/types").StoreSection }
        | { op: "order"; sectionIds: string[] }
        | { op: "remove"; sectionId: string }
        | { op: "setting"; sectionId: string; key: string; value: unknown }
      >;
    }
  | {
      type: "ettajer:preview-theme";
      theme: Partial<
        Pick<
          StoreThemeSettings,
          "theme" | "primaryColor" | "secondaryColor" | "font" | "logo"
        >
      >;
    }
  | { type: "ettajer:preview-navigation"; navigation: NavItem[] }
  | {
      type: "ettajer:drag-block";
      blockId: string | null;
      blockName?: string | null;
      active: boolean;
    };

/** Messages sent from preview iframe → editor parent */
export type BuilderPreviewToEditorMessage =
  | { type: "ettajer:preview-ready" }
  | { type: "ettajer:select-section"; sectionId: string }
  | { type: "ettajer:select-element"; layerId: string }
  | { type: "ettajer:hover-section"; sectionId: string | null }
  | { type: "ettajer:drag-active"; active: boolean }
  | { type: "ettajer:drag-insert"; insertIndex: number }
  | { type: "ettajer:drop-block"; blockId: string; insertIndex?: number }
  | { type: "ettajer:drop-component"; componentId: string; insertIndex?: number }
  | {
      type: "ettajer:reorder-section";
      sectionId: string;
      insertIndex: number;
    }
  | {
      type: "ettajer:update-setting";
      sectionId: string;
      key: string;
      value: string;
      aborted?: boolean;
    }
  | {
      type: "ettajer:key";
      key: string;
      code?: string;
      metaKey: boolean;
      ctrlKey: boolean;
      shiftKey: boolean;
      altKey: boolean;
    }
  | {
      type: "ettajer:middle-pan";
      active: boolean;
      clientX?: number;
      clientY?: number;
    };

export type BuilderBridgeMessage =
  | BuilderEditorToPreviewMessage
  | BuilderPreviewToEditorMessage;

const PREVIEW_TO_EDITOR_TYPES = new Set([
  "ettajer:preview-ready",
  "ettajer:select-section",
  "ettajer:select-element",
  "ettajer:hover-section",
  "ettajer:drag-active",
  "ettajer:drag-insert",
  "ettajer:drop-block",
  "ettajer:drop-component",
  "ettajer:reorder-section",
  "ettajer:update-setting",
  "ettajer:key",
  "ettajer:middle-pan",
]);

export function isPreviewToEditorMessage(
  data: unknown
): data is BuilderPreviewToEditorMessage {
  if (!data || typeof data !== "object") return false;
  const type = (data as { type?: unknown }).type;
  return typeof type === "string" && PREVIEW_TO_EDITOR_TYPES.has(type);
}

export function postToPreview(
  target: Window | null | undefined,
  message: BuilderEditorToPreviewMessage
): void {
  const origin = getEditorOrigin() || "*";
  target?.postMessage(message, origin);
}

/** Flush layout + theme + navigation to the preview in one turn. */
export type PreviewLayoutPatches = Extract<
  BuilderEditorToPreviewMessage,
  { type: "ettajer:preview-layout-patch" }
>["patches"];

export function postPreviewWorkspaceState(
  target: Window | null | undefined,
  payload: {
    layout: import("@/lib/sections/types").HomeLayout;
    theme: Partial<StoreThemeSettings>;
    navigation: NavItem[];
    seq?: number;
    patches?: PreviewLayoutPatches;
  }
): void {
  if (!target) return;
  if (payload.patches && payload.patches.length > 0 && typeof payload.seq === "number") {
    postToPreview(target, {
      type: "ettajer:preview-layout-patch",
      seq: payload.seq,
      patches: payload.patches,
    });
  } else {
    postToPreview(target, {
      type: "ettajer:preview-layout",
      layout: payload.layout,
      ...(typeof payload.seq === "number" ? { seq: payload.seq } : {}),
    });
  }
  postToPreview(target, { type: "ettajer:preview-theme", theme: payload.theme });
  postToPreview(target, {
    type: "ettajer:preview-navigation",
    navigation: payload.navigation,
  });
}

export function postToEditor(message: BuilderPreviewToEditorMessage): void {
  if (typeof window === "undefined") return;
  const origin = getEditorOrigin() || "*";
  window.parent.postMessage(message, origin);
}

export function isTrustedBridgeEvent(event: MessageEvent): boolean {
  return isAllowedBridgeOrigin(event.origin);
}
