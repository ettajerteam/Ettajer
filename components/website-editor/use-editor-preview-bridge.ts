"use client";

import { useEffect, useMemo, useRef, useState, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import type { EditorKeyHandlers } from "@/lib/builder/editor-key-dispatch";
import { dispatchEditorKey } from "@/lib/builder/editor-key-dispatch";
import type { EditorPageTarget } from "@/lib/builder/editor-types";
import type { BlockId, DeviceMode } from "@/lib/builder/types";
import {
  isPreviewToEditorMessage,
  isTrustedBridgeEvent,
  postPreviewWorkspaceState,
  postToPreview,
} from "@/lib/builder/events";
import {
  getEditorPagePreviewPath,
  isEditorPreviewOnlyTarget,
} from "@/lib/editor-pages-config";
import { buildPreviewUrl, buildPreviewQueryString } from "@/lib/preview-engine";
import type { NavItem } from "@/lib/navigation";
import type { HomeLayout } from "@/lib/sections/types";
import type { StoreThemeSettings } from "@/types/storefront";
import type { PreviewPaths } from "@/types/theme";
import { useCentralBuilderStore } from "@/lib/website-layout-store";

type PreviewPayload = {
  layout: HomeLayout;
  theme: Record<string, unknown>;
  navigation: NavItem[];
  seq?: number;
  patches?: Array<
    | { op: "section"; section: HomeLayout["sections"][number] }
    | { op: "order"; sectionIds: string[] }
    | { op: "remove"; sectionId: string }
    | { op: "setting"; sectionId: string; key: string; value: unknown }
  >;
};

export function useEditorPreviewBridge({
  activePage,
  storeSlug,
  effectivePreviewPaths,
  previewProductSlug,
  previewCollectionSlug,
  previewBlogPostSlug,
  previewLayout,
  previewDraft,
  draftNavigation,
  previewKey,
  setPreviewKey,
  device,
  selectedSectionId,
  selectedElementId,
  shortcutHandlersRef,
  selectLayer,
  setActiveTab,
  setRightPanelOpen,
  updateSectionSettings,
  reorderSectionToIndex,
  handleRequestDesignInsert,
  handleInsertComponent,
}: {
  activePage: EditorPageTarget;
  storeSlug: string;
  effectivePreviewPaths: PreviewPaths;
  previewProductSlug: string;
  previewCollectionSlug: string;
  previewBlogPostSlug: string;
  previewLayout: HomeLayout;
  previewDraft: StoreThemeSettings;
  draftNavigation: NavItem[];
  previewKey: number;
  setPreviewKey: Dispatch<SetStateAction<number>>;
  device: DeviceMode;
  selectedSectionId: string | null;
  selectedElementId: string | null;
  shortcutHandlersRef: MutableRefObject<EditorKeyHandlers>;
  selectLayer: (id: string) => void;
  setActiveTab: (tab: string) => void;
  setRightPanelOpen: (open: boolean) => void;
  updateSectionSettings: (sectionId: string, updates: Record<string, unknown>) => void;
  reorderSectionToIndex: (sectionId: string, insertIndex: number) => void;
  handleRequestDesignInsert: (blockId: BlockId, insertIndex?: number) => void;
  handleInsertComponent: (componentId: string, insertIndex?: number) => void;
}) {
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const lastPreviewPayloadRef = useRef<PreviewPayload | null>(null);
  const lastSentLayoutRef = useRef<HomeLayout | null>(null);
  const previewSeqRef = useRef(0);
  const [previewLoading, setPreviewLoading] = useState(true);

  const previewPath = useMemo(
    () =>
      getEditorPagePreviewPath(storeSlug, activePage, {
        productSlug: previewProductSlug,
        collectionSlug: previewCollectionSlug,
        blogPostSlug: previewBlogPostSlug,
      }),
    [storeSlug, activePage, previewProductSlug, previewCollectionSlug, previewBlogPostSlug]
  );

  const previewUrl = useMemo(() => {
    // Keep layout/theme/nav/device out of the URL — push via postMessage so edits
    // and device toggles don't remount the iframe.
    if (isEditorPreviewOnlyTarget(activePage)) {
      return `${previewPath}?${buildPreviewQueryString({})}`;
    }

    if (activePage.type === "custom") {
      return buildPreviewUrl(
        storeSlug,
        undefined,
        "home",
        effectivePreviewPaths,
        null,
        null,
        undefined,
        activePage.page.slug
      );
    }

    const previewPage =
      activePage.type === "product"
        ? "product"
        : activePage.type === "collection"
          ? "collection"
          : "home";

    return buildPreviewUrl(
      storeSlug,
      undefined,
      previewPage,
      effectivePreviewPaths,
      null,
      null,
      undefined
    );
  }, [activePage, previewPath, storeSlug, effectivePreviewPaths]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      previewSeqRef.current += 1;
      const seq = previewSeqRef.current;
      const prev = lastSentLayoutRef.current;
      let patches:
        | Array<
            | { op: "section"; section: HomeLayout["sections"][number] }
            | { op: "order"; sectionIds: string[] }
            | { op: "remove"; sectionId: string }
            | { op: "setting"; sectionId: string; key: string; value: unknown }
          >
        | undefined;

      if (prev) {
        const sameOrder =
          prev.sections.length === previewLayout.sections.length &&
          prev.sections.every((s, i) => s.id === previewLayout.sections[i]?.id);
        if (sameOrder) {
          const settingPatches: Array<{
            op: "setting";
            sectionId: string;
            key: string;
            value: unknown;
          }> = [];
          const fullSections: HomeLayout["sections"] = [];
          for (let i = 0; i < previewLayout.sections.length; i++) {
            const next = previewLayout.sections[i]!;
            const old = prev.sections[i]!;
            if (JSON.stringify(next) === JSON.stringify(old)) continue;
            const oldSettings = (old.settings ?? {}) as Record<string, unknown>;
            const nextSettings = (next.settings ?? {}) as Record<string, unknown>;
            const structureChanged =
              next.type !== old.type ||
              next.visible !== old.visible ||
              next.label !== old.label ||
              JSON.stringify({ ...next, settings: undefined }) !==
                JSON.stringify({ ...old, settings: undefined });
            if (structureChanged) {
              fullSections.push(next);
              continue;
            }
            const keys = Array.from(
              new Set([...Object.keys(oldSettings), ...Object.keys(nextSettings)])
            );
            let changedKeys = 0;
            for (const key of keys) {
              if (JSON.stringify(oldSettings[key]) !== JSON.stringify(nextSettings[key])) {
                changedKeys += 1;
                settingPatches.push({
                  op: "setting",
                  sectionId: next.id,
                  key,
                  value: nextSettings[key],
                });
              }
            }
            if (changedKeys === 0 || changedKeys > 4) {
              // Too many setting keys — send full section instead
              for (let j = settingPatches.length - 1; j >= 0; j--) {
                if (settingPatches[j]?.sectionId === next.id) settingPatches.splice(j, 1);
              }
              fullSections.push(next);
            }
          }
          if (fullSections.length > 0 && fullSections.length <= 3) {
            patches = fullSections.map((section) => ({ op: "section" as const, section }));
          } else if (fullSections.length === 0 && settingPatches.length > 0 && settingPatches.length <= 8) {
            patches = settingPatches;
          } else if (fullSections.length === 0 && settingPatches.length === 0) {
            patches = [];
          } else if (fullSections.length > 0 && fullSections.length <= 3 && settingPatches.length === 0) {
            patches = fullSections.map((section) => ({ op: "section" as const, section }));
          }
        } else if (
          prev.sections.length === previewLayout.sections.length &&
          prev.sections.every((s) => previewLayout.sections.some((n) => n.id === s.id))
        ) {
          patches = [
            { op: "order", sectionIds: previewLayout.sections.map((s) => s.id) },
            ...previewLayout.sections
              .filter((s) => {
                const old = prev.sections.find((p) => p.id === s.id);
                return !old || JSON.stringify(old) !== JSON.stringify(s);
              })
              .slice(0, 3)
              .map((section) => ({ op: "section" as const, section })),
          ];
        }
      }

      const payload: PreviewPayload = {
        layout: previewLayout,
        theme: {
          theme: previewDraft.theme,
          primaryColor: previewDraft.primaryColor,
          secondaryColor: previewDraft.secondaryColor,
          font: previewDraft.font,
          logo: previewDraft.logo ?? null,
          textColor: previewDraft.textColor,
          mutedColor: previewDraft.mutedColor,
          borderColor: previewDraft.borderColor,
          buttonRadius: previewDraft.buttonRadius,
        },
        navigation: draftNavigation,
        seq,
        ...(patches && patches.length > 0 ? { patches } : {}),
      };
      lastPreviewPayloadRef.current = payload;
      lastSentLayoutRef.current = previewLayout;
      postPreviewWorkspaceState(previewIframeRef.current?.contentWindow, payload);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [previewLayout, previewDraft, draftNavigation, previewKey, previewUrl]);

  useEffect(() => {
    setPreviewLoading(true);
  }, [previewUrl, previewKey]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isTrustedBridgeEvent(event)) return;
      const iframeWin = previewIframeRef.current?.contentWindow;
      if (!iframeWin || event.source !== iframeWin) return;
      if (!isPreviewToEditorMessage(event.data)) return;

      if (event.data.type === "ettajer:preview-ready") {
        const payload = lastPreviewPayloadRef.current;
        if (payload) postPreviewWorkspaceState(iframeWin, payload);
        return;
      }

      if (event.data.type === "ettajer:select-section") {
        selectLayer(event.data.sectionId);
        setActiveTab("layers");
      }
      if (event.data.type === "ettajer:select-element") {
        selectLayer(event.data.layerId);
        setActiveTab("layers");
        setRightPanelOpen(true);
      }
      if (event.data.type === "ettajer:update-setting") {
        if (event.data.aborted) return;
        updateSectionSettings(event.data.sectionId, { [event.data.key]: event.data.value });
      }
      if (event.data.type === "ettajer:key") {
        dispatchEditorKey(
          {
            key: event.data.key,
            code: event.data.code,
            metaKey: event.data.metaKey,
            ctrlKey: event.data.ctrlKey,
            shiftKey: event.data.shiftKey,
            altKey: event.data.altKey,
            fromPreview: true,
          },
          shortcutHandlersRef.current
        );
      }
      if (event.data.type === "ettajer:reorder-section") {
        reorderSectionToIndex(event.data.sectionId, event.data.insertIndex);
      }
      if (event.data.type === "ettajer:hover-section") {
        useCentralBuilderStore.getState().setHoveredElement(event.data.sectionId);
      }
      if (event.data.type === "ettajer:drag-active") {
        if (!event.data.active) {
          useCentralBuilderStore.getState().endDrag();
        }
      }
      if (event.data.type === "ettajer:drag-insert") {
        useCentralBuilderStore.getState().updateDrag({ insertIndex: event.data.insertIndex });
      }
      if (event.data.type === "ettajer:drop-block") {
        handleRequestDesignInsert(
          event.data.blockId as BlockId,
          typeof event.data.insertIndex === "number" ? event.data.insertIndex : undefined
        );
        useCentralBuilderStore.getState().endDrag();
      }
      if (event.data.type === "ettajer:drop-component") {
        handleInsertComponent(
          event.data.componentId,
          typeof event.data.insertIndex === "number" ? event.data.insertIndex : undefined
        );
        useCentralBuilderStore.getState().endDrag();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [
    selectLayer,
    handleRequestDesignInsert,
    handleInsertComponent,
    setActiveTab,
    setRightPanelOpen,
    updateSectionSettings,
    reorderSectionToIndex,
    shortcutHandlersRef,
  ]);

  useEffect(() => {
    postToPreview(previewIframeRef.current?.contentWindow, {
      type: "ettajer:preview-device",
      device,
    });
  }, [device, previewKey]);

  useEffect(() => {
    if (!selectedSectionId) return;
    const layerId = selectedElementId?.includes(":")
      ? selectedElementId
      : selectedSectionId;
    const sendFocus = () => {
      if (layerId.includes(":")) {
        postToPreview(previewIframeRef.current?.contentWindow, {
          type: "ettajer:focus-element",
          layerId,
        });
      } else {
        postToPreview(previewIframeRef.current?.contentWindow, {
          type: "ettajer:focus-section",
          sectionId: selectedSectionId,
        });
      }
    };
    sendFocus();
    const timer = window.setTimeout(sendFocus, 400);
    return () => window.clearTimeout(timer);
  }, [selectedSectionId, selectedElementId, previewKey]);

  const handleRefreshPreview = () => {
    setPreviewLoading(true);
    setPreviewKey((k) => k + 1);
  };

  return {
    previewIframeRef,
    previewPath,
    previewUrl,
    previewLoading,
    setPreviewLoading,
    handleRefreshPreview,
  };
}
