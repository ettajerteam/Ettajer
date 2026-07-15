/**
 * Typed postMessage protocol between the website editor shell and the preview iframe.
 * Event-driven bridge — see `components/storefront/builder-section-bridge.tsx`.
 */

import type { DeviceMode } from "./types";

/** Messages sent from editor parent → preview iframe */
export type BuilderEditorToPreviewMessage =
  | { type: "ettajer:preview-device"; device: DeviceMode }
  | { type: "ettajer:focus-section"; sectionId: string }
  | {
      type: "ettajer:drag-block";
      blockId: string | null;
      blockName?: string | null;
      active: boolean;
    };

/** Messages sent from preview iframe → editor parent */
export type BuilderPreviewToEditorMessage =
  | { type: "ettajer:select-section"; sectionId: string }
  | { type: "ettajer:hover-section"; sectionId: string | null }
  | { type: "ettajer:drag-active"; active: boolean }
  | { type: "ettajer:drag-insert"; insertIndex: number }
  | { type: "ettajer:drop-block"; blockId: string; insertIndex?: number }
  | { type: "ettajer:drop-component"; componentId: string; insertIndex?: number }
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
  "ettajer:select-section",
  "ettajer:hover-section",
  "ettajer:drag-active",
  "ettajer:drag-insert",
  "ettajer:drop-block",
  "ettajer:drop-component",
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
  target?.postMessage(message, "*");
}

export function postToEditor(message: BuilderPreviewToEditorMessage): void {
  if (typeof window === "undefined") return;
  window.parent.postMessage(message, "*");
}
