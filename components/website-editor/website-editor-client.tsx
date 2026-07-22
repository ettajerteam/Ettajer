"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useIsXl } from "@/hooks/use-is-xl";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { FullscreenPreview } from "@/components/themes/fullscreen-preview";
import { EditorSectionSettings } from "@/components/website-editor/editor-section-settings";
import { EditorGettingStarted } from "@/components/website-editor/editor-getting-started";
import { BuilderCanvas, BuilderCanvasIframe } from "@/components/website-editor/builder-canvas";
import { ComponentEditBanner } from "@/components/website-editor/component-edit-banner";
import { EditorTopBar } from "@/components/website-editor/editor-context-bar";
import { EditorShellDialogs } from "@/components/website-editor/editor-shell-dialogs";
import { EditorStaleComponentBanner } from "@/components/website-editor/editor-stale-component-banner";
import { EditorCollapsiblePanel } from "@/components/website-editor/editor-collapsible-panel";
import {
  EditorLeftPanel,
  EditorLeftRailIcons,
} from "@/components/website-editor/editor-left-panel";
import {
  useEditorChromeHistory,
  useSyncChromeLayoutHistoryKind,
} from "@/components/website-editor/use-editor-chrome-history";
import { useEditorPublish } from "@/components/website-editor/use-editor-publish";
import { useEditorPreviewBridge } from "@/components/website-editor/use-editor-preview-bridge";
import { useEditorSectionActions } from "@/components/website-editor/use-editor-section-actions";
import { useThemeStore } from "@/lib/theme-store";
import { ensureTemplateLayouts, useCentralBuilderStore } from "@/lib/website-layout-store";
import { type ThemeId } from "@/lib/themes";
import { isThemeDirty, resolveThemeDraft } from "@/lib/theme-utils";
import { PREVIEW_PRODUCT_SLUG } from "@/lib/storefront-preview-product";
import { PREVIEW_COLLECTION_SLUG } from "@/lib/storefront-preview-collection";
import { PREVIEW_BLOG_POST_SLUG } from "@/lib/storefront-preview-blog-post";
import { listWebsiteTemplates } from "@/lib/website-templates";
import type { NavItem } from "@/lib/navigation";
import { getSectionLabel } from "@/lib/sections/registry";
import { sanitizeLayout } from "@/lib/sections/parse";
import { useEditorShortcuts } from "@/lib/builder/use-editor-shortcuts";
import {
  getComponentRef,
  resolveLayoutSections,
} from "@/lib/builder/components";
import {
  getComponentInstanceCount,
  useComponentStore,
} from "@/lib/builder/component-store";
import type { StorePageRow } from "@/lib/pages";
import type { StoreThemeData, PreviewPaths } from "@/types/theme";
import {
  clearLayoutDrafts,
  getEditorTabId,
  getLayoutDraftStorageKey,
  loadLayoutDraftsAsync,
  saveLayoutDraftsAsync,
  type LayoutDraftBundle,
} from "@/lib/builder/layout-draft-storage";
import { getPageLayoutKey } from "@/lib/page-layout";
import type { HomeLayout } from "@/lib/sections/types";
import { postToPreview } from "@/lib/builder/events";
import type { EditorKeyHandlers } from "@/lib/builder/editor-key-dispatch";
import { cn } from "@/lib/utils";

interface WebsiteEditorClientProps {
  store: StoreThemeData;
  previewPaths: PreviewPaths;
  initialPages: StorePageRow[];
  productCount?: number;
}

export function WebsiteEditorClient({
  store: initialStore,
  previewPaths,
  initialPages,
  productCount = 0,
}: WebsiteEditorClientProps) {
  const router = useRouter();
  const isXl = useIsXl();
  const [saved, setSaved] = useState(initialStore);
  const [pages, setPages] = useState(initialPages);
  const [previewKey, setPreviewKey] = useState(0);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [savedNavigation, setSavedNavigation] = useState<NavItem[]>([]);
  const [draftNavigation, setDraftNavigation] = useState<NavItem[]>([]);
  const [pendingWebsiteTemplateId, setPendingWebsiteTemplateId] = useState<string | null>(null);
  const [draftSaveStatus, setDraftSaveStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [lastDraftSavedAt, setLastDraftSavedAt] = useState<number | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [multiTabNotice, setMultiTabNotice] = useState(false);
  const editorBootstrapped = useRef(false);
  const [a11yStatus, setA11yStatus] = useState("");
  const [previewProductSlug, setPreviewProductSlug] = useState(
    previewPaths.product ?? PREVIEW_PRODUCT_SLUG
  );
  const [previewCollectionSlug, setPreviewCollectionSlug] = useState(
    previewPaths.collection ?? PREVIEW_COLLECTION_SLUG
  );
  const [previewBlogPostSlug, setPreviewBlogPostSlug] = useState(
    previewPaths.blogPost ?? PREVIEW_BLOG_POST_SLUG
  );

  const effectivePreviewPaths = useMemo<PreviewPaths>(
    () => ({
      ...previewPaths,
      product: previewProductSlug,
      collection: previewCollectionSlug,
      blogPost: previewBlogPostSlug,
    }),
    [previewPaths, previewProductSlug, previewCollectionSlug, previewBlogPostSlug]
  );

  const components = useComponentStore((s) => s.components);
  const editingComponentId = useComponentStore((s) => s.editingComponentId);
  const initComponents = useComponentStore((s) => s.initComponents);
  const fetchComponents = useComponentStore((s) => s.fetchComponents);
  const saveSelectionAsComponent = useComponentStore((s) => s.saveSelectionAsComponent);
  const insertComponent = useComponentStore((s) => s.insertComponent);
  const detachComponent = useComponentStore((s) => s.detachComponent);
  const setEditingComponent = useComponentStore((s) => s.setEditingComponent);
  const syncComponentSectionFromLayout = useComponentStore((s) => s.syncComponentSectionFromLayout);

  const {
    draft,
    selectedTemplate,
    previewOpen,
    setDraft,
    setSelectedTemplate,
    setPreviewOpen,
    initFromStore,
  } = useThemeStore();

  const {
    draftLayout,
    savedLayout,
    selectedSectionId,
    activePage,
    activeDevice,
    builderSettings,
    initPageLayouts,
    initTemplateLayouts,
    switchPage,
    syncActivePageToCache,
    getDirtyPageKeys,
    commitSavedLayouts,
    applyTemplateToDraft,
    setSelectedSection,
    selectAdjacentSection,
    cycleElementFocus,
    selectLayer,
    setActiveDevice,
    setActiveTab,
    setInspectorFocus,
    setBuilderSettings,
    reorderSections,
    reorderSectionToIndex,
    moveSectionUp,
    moveSectionDown,
    moveSectionBy,
    duplicateSection,
    copySection,
    pasteSection,
    removeSection,
    addSection,
    insertSectionAt,
    toggleSectionVisible,
    updateSectionSettings,
    updateSectionStyle,
    replaceDraftLayout,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCentralBuilderStore();

  const device = activeDevice;
  const activeTab = builderSettings.activeTab;
  const leftPanelOpen = builderSettings.leftPanelOpen;
  const rightPanelOpen = builderSettings.rightPanelOpen;
  const inspectorFocus = builderSettings.inspectorFocus;

  const setLeftPanelOpen = (open: boolean) => setBuilderSettings({ leftPanelOpen: open });
  const setRightPanelOpen = (open: boolean) => setBuilderSettings({ rightPanelOpen: open });
  const setDevice = setActiveDevice;

  const layoutUndoAvailable = useCentralBuilderStore((s) => s.historyPast.length > 0);
  const layoutRedoAvailable = useCentralBuilderStore((s) => s.historyFuture.length > 0);
  const historyPastLen = useCentralBuilderStore((s) => s.historyPast.length);

  const setA11yStatusStable = useCallback((s: string) => setA11yStatus(s), []);
  const {
    handleDraftChange,
    handleNavigationChange,
    handleUndo,
    handleRedo,
    canUndoIncludingChrome,
    canRedoIncludingChrome,
    syncLayoutHistoryLength,
    chromeHistTick,
    chromeUndoAvailable,
    chromeRedoAvailable,
  } = useEditorChromeHistory({
    draft,
    draftNavigation,
    setDraft,
    setDraftNavigation,
    canUndoLayout: canUndo,
    canRedoLayout: canRedo,
    undoLayout: undo,
    redoLayout: redo,
    onA11yStatus: setA11yStatusStable,
  });
  useSyncChromeLayoutHistoryKind(historyPastLen, syncLayoutHistoryLength);
  void chromeHistTick;
  const undoAvailable = layoutUndoAvailable || chromeUndoAvailable;
  const redoAvailable = layoutRedoAvailable || chromeRedoAvailable;

  const hasClipboard = useCentralBuilderStore((s) => s.clipboardSection !== null);
  const selectedElementId = useCentralBuilderStore((s) => s.selectedElementId);
  const pageLayoutCache = useCentralBuilderStore((s) => s.pageLayoutCache);

  const anyLayoutDirty = useCentralBuilderStore((s) => s.isDirty());

  const pendingTemplateName = useMemo(() => {
    if (!pendingWebsiteTemplateId) return null;
    const t = listWebsiteTemplates().find((x) => x.id === pendingWebsiteTemplateId);
    return t?.name ?? pendingWebsiteTemplateId;
  }, [pendingWebsiteTemplateId]);

  const applyDraftRestore = useCallback((
    drafts: LayoutDraftBundle,
    options?: { silent?: boolean }
  ) => {
    useCentralBuilderStore.setState((state) => {
      const cache = { ...state.pageLayoutCache };
      let restored = 0;
      for (const [key, layout] of Object.entries(drafts.layouts)) {
        const clean = sanitizeLayout(layout);
        if (!clean) continue;
        const existing = cache[key];
        if (!existing) {
          cache[key] = {
            draft: clean,
            saved: { version: 1, sections: [] },
          };
        } else {
          cache[key] = {
            ...existing,
            draft: clean,
          };
        }
        restored += 1;
      }
      if (restored === 0) return state;
      const activeKey = getPageLayoutKey(state.activePage);
      const active = cache[activeKey];
      return {
        pageLayoutCache: cache,
        draftLayout: active ? active.draft : state.draftLayout,
        selectedSectionId: active?.draft.sections[0]?.id ?? state.selectedSectionId,
        selectedElementId: active?.draft.sections[0]?.id ?? state.selectedElementId,
      };
    });
    if (drafts.theme) {
      setDraft(drafts.theme);
    }
    if (drafts.navigation) {
      setDraftNavigation(drafts.navigation);
    }
    setLastDraftSavedAt(drafts.updatedAt);
    setDraftSaveStatus("saved");
    if (!options?.silent) {
      toast.success("Draft restored");
    }
  }, [setDraft]);

  useEffect(() => {
    if (editorBootstrapped.current) return;
    editorBootstrapped.current = true;

    initFromStore({
      theme: initialStore.theme,
      primaryColor: initialStore.primaryColor,
      secondaryColor: initialStore.secondaryColor,
      font: initialStore.font,
      logo: initialStore.logo,
      textColor: initialStore.textColor,
      mutedColor: initialStore.mutedColor,
      borderColor: initialStore.borderColor,
      buttonRadius: initialStore.buttonRadius,
    });
    initTemplateLayouts(
      ensureTemplateLayouts(
        {
          home: initialStore.homeLayout,
          product: initialStore.productLayout,
          collection: initialStore.collectionLayout,
        },
        initialStore.theme
      ),
      initialPages,
      initialStore.theme
    );
    initComponents(initialStore.id ?? "local", []);
    void fetchComponents();

    const storeId = initialStore.id;
    if (!storeId) return;

    void (async () => {
      const local = await loadLayoutDraftsAsync(storeId);
      let cloud: LayoutDraftBundle | null = null;
      try {
        const res = await fetch("/api/store/editor-draft");
        if (res.ok) {
          const data = (await res.json()) as { draft?: LayoutDraftBundle | null };
          cloud = data.draft ?? null;
        }
      } catch {
        // offline — local only
      }
      const localAt = local?.updatedAt ?? 0;
      const cloudAt = cloud?.updatedAt ?? 0;
      const best =
        cloudAt > localAt
          ? cloud
          : local && Object.keys(local.layouts ?? {}).length > 0
            ? local
            : cloud;
      if (best?.layouts && Object.keys(best.layouts).length > 0) {
        // Resume work silently — never interrupt page switches with a restore dialog.
        applyDraftRestore(best, { silent: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap once per editor mount
  }, []);

  const componentNames = useMemo(() => {
    const names: Record<string, string> = {};
    for (const c of Object.values(components)) names[c.id] = c.name;
    return names;
  }, [components]);

  const previewLayout = useMemo(
    () => ({
      version: 1 as const,
      sections: resolveLayoutSections(draftLayout.sections, components),
    }),
    [draftLayout.sections, components]
  );

  const previewDraft = useMemo(
    () => resolveThemeDraft(saved, draft, selectedTemplate),
    [saved, draft, selectedTemplate]
  );

  const themeDirty = useMemo(
    () => isThemeDirty(saved, draft, selectedTemplate),
    [saved, draft, selectedTemplate]
  );

  const navigationDirty = useMemo(() => {
    return JSON.stringify(draftNavigation) !== JSON.stringify(savedNavigation);
  }, [draftNavigation, savedNavigation]);

  const dirty = themeDirty || anyLayoutDirty || navigationDirty || !!pendingWebsiteTemplateId;

  const {
    publishing,
    confirmOpen,
    setConfirmOpen,
    discardOpen,
    setDiscardOpen,
    publishSuccessOpen,
    setPublishSuccessOpen,
    lastPublishSummary,
    revisionConflictOpen,
    setRevisionConflictOpen,
    publishSnapshotsOpen,
    setPublishSnapshotsOpen,
    publishSnapshotList,
    setPublishSnapshotList,
    restoringSnapshot,
    setRestoringSnapshot,
    publishResume,
    setPublishResume,
    publishLayoutChanges,
    preflightIssues,
    handleDiscard,
    publish,
    handlePublishClick,
    handleOverwriteLive,
  } = useEditorPublish({
    pages,
    setPages,
    saved,
    setSaved,
    draftNavigation,
    setDraftNavigation,
    savedNavigation,
    setSavedNavigation,
    previewDraft,
    themeDirty,
    navigationDirty,
    dirty,
    pendingWebsiteTemplateId,
    setPendingWebsiteTemplateId,
    draftLayout,
    activePage,
    storeId: initialStore.id,
    initialLayoutRevision: initialStore.layoutRevision ?? 0,
    initFromStore,
    initTemplateLayouts,
    switchPage,
    syncActivePageToCache,
    commitSavedLayouts,
    setPreviewKey,
    setDraftSaveStatus,
    setLastDraftSavedAt,
    setA11yStatus,
  });

  const dirtyPageKeys = useMemo(() => getDirtyPageKeys(), [getDirtyPageKeys, anyLayoutDirty, pageLayoutCache]);
  const unpublishedPageCount = dirtyPageKeys.length;

  const persistLayoutDraftsNow = useCallback(() => {
    const storeId = initialStore.id;
    if (!storeId) return false;
    setDraftSaveStatus("saving");
    syncActivePageToCache();
    const cache = useCentralBuilderStore.getState().pageLayoutCache;
    const layouts: Partial<Record<string, HomeLayout>> = {};
    for (const [key, snapshot] of Object.entries(cache)) {
      if (JSON.stringify(snapshot.draft) !== JSON.stringify(snapshot.saved)) {
        layouts[key] = snapshot.draft;
      }
    }
    const themeStillDirty = isThemeDirty(
      saved,
      draft,
      useThemeStore.getState().selectedTemplate
    );
    const navStillDirty =
      JSON.stringify(draftNavigation) !== JSON.stringify(savedNavigation);

    void saveLayoutDraftsAsync(storeId, layouts, {
      ...(themeStillDirty ? { theme: draft } : {}),
      ...(navStillDirty ? { navigation: draftNavigation } : {}),
      activePageKey: getPageLayoutKey(useCentralBuilderStore.getState().activePage),
    }).then((result) => {
      if (result === "error") {
        setDraftSaveStatus("error");
        toast.error("Draft couldn’t be saved on this device");
        return;
      }
      if (result === "cleared") {
        setDraftSaveStatus("idle");
        setLastDraftSavedAt(null);
        void fetch("/api/store/editor-draft", { method: "DELETE" }).catch(() => undefined);
        return;
      }
      setDraftSaveStatus("saved");
      setLastDraftSavedAt(Date.now());
      const bundle: LayoutDraftBundle = {
        updatedAt: Date.now(),
        layouts: layouts as LayoutDraftBundle["layouts"],
        ...(themeStillDirty ? { theme: draft } : {}),
        ...(navStillDirty ? { navigation: draftNavigation } : {}),
        activePageKey: getPageLayoutKey(useCentralBuilderStore.getState().activePage),
        tabId: getEditorTabId(),
      };
      void fetch("/api/store/editor-draft", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: bundle }),
      }).catch(() => {
        // Cloud sync optional — local draft already persisted; never throw into the editor.
      });
    });

    return Object.keys(layouts).length > 0 || themeStillDirty || navStillDirty;
  }, [
    initialStore.id,
    syncActivePageToCache,
    draft,
    draftNavigation,
    saved,
    savedNavigation,
  ]);

  const handleSaveDraft = useCallback(() => {
    const savedDraft = persistLayoutDraftsNow();
    if (savedDraft || dirty) {
      toast.success("Draft saved", {
        description: savedDraft
          ? "Layout kept on this device until you Go live."
          : "Nothing new to save — Go live when you are ready.",
      });
    } else {
      toast.message("All caught up", { description: "No unpublished layout changes." });
    }
  }, [persistLayoutDraftsNow, dirty]);

  useEffect(() => {
    const isDirtyNow = anyLayoutDirty || themeDirty || navigationDirty;
    if (isDirtyNow) {
      const timer = window.setTimeout(() => {
        persistLayoutDraftsNow();
      }, 1200);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [
    anyLayoutDirty,
    themeDirty,
    navigationDirty,
    draftLayout,
    draft,
    draftNavigation,
    persistLayoutDraftsNow,
  ]);

  useEffect(() => {
    const storeId = initialStore.id;
    if (!storeId) return;

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        persistLayoutDraftsNow();
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== getLayoutDraftStorageKey(storeId) || !event.newValue) return;
      try {
        const pointer = JSON.parse(event.newValue) as { tabId?: string };
        if (!pointer?.tabId || pointer.tabId === getEditorTabId()) return;
        setMultiTabNotice(true);
      } catch {
        // ignore
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("storage", onStorage);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("storage", onStorage);
    };
  }, [initialStore.id, persistLayoutDraftsNow]);

  const themeChanged = saved.theme !== selectedTemplate;

  const selectedSection =
    draftLayout.sections.find((s) => s.id === selectedSectionId) ?? null;

  const selectedSectionIndex = selectedSection
    ? draftLayout.sections.findIndex((s) => s.id === selectedSection.id)
    : -1;

  const inspectorSettingsProps = {
    section: selectedSection,
    sectionIndex: selectedSectionIndex,
    device,
    inspectorFocus,
    onFocusChange: setInspectorFocus,
    canMoveUp: selectedSectionIndex > 0,
    canMoveDown:
      selectedSectionIndex >= 0 &&
      selectedSectionIndex < draftLayout.sections.length - 1,
    onChange: (settings: Record<string, unknown>) => {
      if (!selectedSection) return;
      updateSectionSettings(selectedSection.id, settings);
      const ref = getComponentRef(selectedSection);
      if (
        ref &&
        !ref.detached &&
        editingComponentId &&
        editingComponentId === ref.componentId
      ) {
        void syncComponentSectionFromLayout(ref.componentId, ref.sectionIndex, {
          ...selectedSection,
          settings: { ...selectedSection.settings, ...settings },
        });
      }
    },
    onStylePatch: (
      patch: Parameters<typeof updateSectionStyle>[2],
      options?: { responsive?: boolean },
    ) => {
      if (!selectedSection) return;
      updateSectionStyle(selectedSection.id, device, patch, {
        forceResponsive: options?.responsive,
      });
    },
    onToggleVisible: selectedSection
      ? (visible: boolean) => {
          if (visible !== selectedSection.visible) {
            toggleSectionVisible(selectedSection.id);
          }
        }
      : undefined,
    onDuplicate: selectedSection
      ? () => handleDuplicateSection(selectedSection.id)
      : undefined,
    onMoveUp: selectedSection ? () => moveSectionUp(selectedSection.id) : undefined,
    onMoveDown: selectedSection ? () => moveSectionDown(selectedSection.id) : undefined,
    onOpenBrand: () => setActiveTab("design"),
  };

  const handlePreviewProductSlugChange = useCallback((slug: string) => {
    setPreviewProductSlug(slug);
    setPreviewKey((k) => k + 1);
  }, []);

  const handlePreviewCollectionSlugChange = useCallback((slug: string) => {
    setPreviewCollectionSlug(slug);
    setPreviewKey((k) => k + 1);
  }, []);

  const handlePreviewBlogPostSlugChange = useCallback((slug: string) => {
    setPreviewBlogPostSlug(slug);
    setPreviewKey((k) => k + 1);
  }, []);

  const handleSelectPage = useCallback(
    (target: Parameters<typeof switchPage>[0]) => {
      switchPage(target);
      setActiveTab("layers");
    },
    [switchPage, setActiveTab]
  );

  const {
    templatePreview,
    setTemplatePreview,
    templateApply,
    setTemplateApply,
    applyingTemplate,
    saveComponentOpen,
    setSaveComponentOpen,
    aiReplaceConfirmOpen,
    setAiReplaceConfirmOpen,
    pendingAiTitle,
    pendingDesignInsert,
    setPendingDesignInsert,
    handleAddSection,
    handleInsertComponent,
    handleSaveAsComponent,
    handleConfirmSaveComponent,
    handleDetachComponent,
    handleEditComponent,
    handleRequestDesignInsert,
    handlePickDesignInsert,
    handlePickDefaultDesignInsert,
    confirmAiReplacePage,
    handleRemoveSection,
    handleCopySection,
    handlePasteSection,
    handleDuplicateSection,
    handleSelectTemplate,
    handlePreviewWebsiteTemplate,
    handleRequestApplyWebsiteTemplate,
    handleConfirmApplyWebsiteTemplate,
    clearPendingAiLayout,
  } = useEditorSectionActions({
    draftLayout,
    pages,
    setPages,
    setDraftNavigation,
    setPreviewKey,
    setPendingWebsiteTemplateId,
    handleSelectPage,
    addSection,
    insertSectionAt,
    removeSection,
    duplicateSection,
    copySection,
    pasteSection,
    replaceDraftLayout,
    applyTemplateToDraft,
    initPageLayouts,
    setActiveTab,
    canUndo,
    undo,
    insertComponent,
    saveSelectionAsComponent,
    detachComponent,
    setEditingComponent,
    setDraft,
    setSelectedTemplate,
  });

  const selectTabFromRail = (tab: string) => {
    setActiveTab(tab);
    setLeftPanelOpen(true);
  };

  const leftPanelTabs = (
    <EditorLeftPanel
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onClose={() => setLeftPanelOpen(false)}
      anyLayoutDirty={anyLayoutDirty}
      themeDirty={themeDirty}
      navigationDirty={navigationDirty}
      isXl={isXl}
      mobileSettingsOpen={mobileSettingsOpen}
      onMobileSettingsOpenChange={setMobileSettingsOpen}
      storeSlug={saved.slug}
      pages={pages}
      activePage={activePage}
      onSelectPage={handleSelectPage}
      onPagesChange={setPages}
      previewProductSlug={previewProductSlug}
      onPreviewProductSlugChange={handlePreviewProductSlugChange}
      previewCollectionSlug={previewCollectionSlug}
      onPreviewCollectionSlugChange={handlePreviewCollectionSlugChange}
      previewBlogPostSlug={previewBlogPostSlug}
      onPreviewBlogPostSlugChange={handlePreviewBlogPostSlugChange}
      draftNavigation={draftNavigation}
      onNavigationChange={handleNavigationChange}
      onRequestDesignInsert={handleRequestDesignInsert}
      onInsertComponent={handleInsertComponent}
      draftLayout={draftLayout}
      onReorderSections={reorderSections}
      onRemoveSection={handleRemoveSection}
      onToggleSectionVisible={toggleSectionVisible}
      onAddSection={handleAddSection}
      onDuplicateSection={handleDuplicateSection}
      onSaveAsComponent={handleSaveAsComponent}
      onDetachComponent={handleDetachComponent}
      onEditComponent={handleEditComponent}
      componentNames={componentNames}
      selectedSection={selectedSection}
      inspectorFocus={inspectorFocus}
      inspectorSettingsProps={inspectorSettingsProps}
      onUpdateSectionSettings={updateSectionSettings}
      onSetA11yStatus={setA11yStatus}
      onPreviewWebsiteTemplate={handlePreviewWebsiteTemplate}
      onRequestApplyWebsiteTemplate={handleRequestApplyWebsiteTemplate}
      pendingWebsiteTemplateId={pendingWebsiteTemplateId}
      savedWebsiteTemplateId={saved.websiteTemplateId}
      selectedTemplate={selectedTemplate}
      liveTheme={saved.theme}
      onSelectTemplate={handleSelectTemplate}
      previewDraft={previewDraft}
      onDraftChange={handleDraftChange}
    />
  );

  const leftRailIcons = (
    <EditorLeftRailIcons
      activeTab={activeTab}
      onSelectTab={selectTabFromRail}
      anyLayoutDirty={anyLayoutDirty}
      themeDirty={themeDirty}
      navigationDirty={navigationDirty}
    />
  );

  const inspectorContent = (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2">
        <EditorSectionSettings
          {...inspectorSettingsProps}
          onClose={() => setRightPanelOpen(false)}
        />
      </div>
    </div>
  );

  const shortcutHandlersRef = useRef<EditorKeyHandlers>({
    canEditSections: true,
    selectedSectionId,
    hasClipboard,
    canUndo,
    canRedo,
    undo: () => {
      if (canUndo()) undo();
    },
    redo: () => {
      if (canRedo()) redo();
    },
    onPublish: () => setConfirmOpen(true),
    canPublish: dirty && !publishing,
    onSaveDraft: handleSaveDraft,
    onOpenShortcutsHelp: () => setShortcutsOpen(true),
    deselect: () => setSelectedSection(null),
    onFocusSelection: () => {
      if (!selectedSectionId) {
        const first = draftLayout.sections[0];
        if (first) setSelectedSection(first.id);
        return;
      }
      setActiveTab("design");
      setRightPanelOpen(true);
    },
    onDelete: handleRemoveSection,
    onDuplicate: handleDuplicateSection,
    onCopy: handleCopySection,
    onPaste: handlePasteSection,
    selectAdjacentSection,
    cycleElementFocus,
    moveSectionUp,
    moveSectionDown,
    moveSectionBy,
  });

  // Keep handlers fresh without rebinding the message listener every keystroke
  shortcutHandlersRef.current = {
    canEditSections: true,
    selectedSectionId,
    hasClipboard,
    canUndo,
    canRedo,
    undo: () => {
      if (canUndo()) undo();
    },
    redo: () => {
      if (canRedo()) redo();
    },
    onPublish: () => setConfirmOpen(true),
    canPublish: dirty && !publishing,
    onSaveDraft: handleSaveDraft,
    onOpenShortcutsHelp: () => setShortcutsOpen(true),
    deselect: () => setSelectedSection(null),
    onFocusSelection: () => {
      if (!selectedSectionId) {
        const first = draftLayout.sections[0];
        if (first) setSelectedSection(first.id);
        return;
      }
      setActiveTab("design");
      setRightPanelOpen(true);
    },
    onDelete: handleRemoveSection,
    onDuplicate: handleDuplicateSection,
    onCopy: handleCopySection,
    onPaste: handlePasteSection,
    selectAdjacentSection,
    cycleElementFocus,
    moveSectionUp,
    moveSectionDown,
    moveSectionBy,
  };

  const {
    previewIframeRef,
    previewPath,
    previewUrl,
    previewLoading,
    setPreviewLoading,
    handleRefreshPreview,
  } = useEditorPreviewBridge({
    activePage,
    storeSlug: saved.slug,
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
  });

  useEffect(() => {
    if (selectedSectionId) setMobileSettingsOpen(true);
  }, [selectedSectionId]);

  useEditorShortcuts({
    canEditSections: true,
    selectedSectionId,
    hasClipboard,
    canUndo: canUndoIncludingChrome,
    canRedo: canRedoIncludingChrome,
    undo: handleUndo,
    redo: handleRedo,
    onPublish: () => setConfirmOpen(true),
    canPublish: dirty && !publishing,
    onSaveDraft: handleSaveDraft,
    onOpenShortcutsHelp: () => setShortcutsOpen(true),
    deselect: () => setSelectedSection(null),
    onFocusSelection: () => {
      if (!selectedSectionId) {
        const first = draftLayout.sections[0];
        if (first) setSelectedSection(first.id);
        return;
      }
      setActiveTab("design");
      postToPreview(previewIframeRef.current?.contentWindow, {
        type: "ettajer:focus-section",
        sectionId: selectedSectionId,
      });
    },
    onDelete: handleRemoveSection,
    onDuplicate: handleDuplicateSection,
    onCopy: handleCopySection,
    onPaste: handlePasteSection,
    selectAdjacentSection,
    cycleElementFocus,
    moveSectionUp,
    moveSectionDown,
    moveSectionBy,
  });

  useEffect(() => {
    if (!selectedSectionId) return;
    const section = draftLayout.sections.find((s) => s.id === selectedSectionId);
    if (!section) return;
    setA11yStatus(`Selected ${section.type} section`);
  }, [selectedSectionId, draftLayout.sections]);

  useEffect(() => {
    if (draftSaveStatus === "saving") setA11yStatus("Saving draft");
    else if (draftSaveStatus === "saved") setA11yStatus("Draft saved");
    else if (draftSaveStatus === "error") setA11yStatus("Draft save failed");
  }, [draftSaveStatus]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-neutral-50 text-neutral-900">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {a11yStatus}
      </div>
      <EditorTopBar
        activePage={activePage}
        pages={pages}
        device={device}
        dirty={dirty}
        publishing={publishing}
        undoAvailable={undoAvailable}
        redoAvailable={redoAvailable}
        storeSlug={saved.slug}
        draftSaveStatus={draftSaveStatus}
        lastDraftSavedAt={lastDraftSavedAt}
        unpublishedPageCount={unpublishedPageCount}
        dirtyPageKeys={dirtyPageKeys}
        shortcutsOpen={shortcutsOpen}
        onShortcutsOpenChange={setShortcutsOpen}
        onSelectPage={handleSelectPage}
        onDeviceChange={setDevice}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublishClick}
        onDiscard={() => setDiscardOpen(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenBrand={() => setActiveTab("design")}
      />

      {multiTabNotice ? (
        <div className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-950">
          <p>
            This store is also open in another editor tab. Edits may conflict — keep one tab as the source of truth.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 border-amber-300 bg-white"
            onClick={() => setMultiTabNotice(false)}
          >
            Dismiss
          </Button>
        </div>
      ) : null}

      {editingComponentId && components[editingComponentId] ? (
        <ComponentEditBanner
          componentName={components[editingComponentId].name}
          instanceCount={getComponentInstanceCount(editingComponentId, draftLayout)}
          onExit={() => setEditingComponent(null)}
        />
      ) : null}

      <EditorStaleComponentBanner
        draftLayout={draftLayout}
        components={components}
        onReplaceDraftLayout={replaceDraftLayout}
      />

      <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
        {/* Mount left tools once — CSS-hidden twins duplicated form ids (~30 Chrome warnings). */}
        {isXl === false ? (
          <aside
            className="order-2 max-h-[42vh] w-full shrink-0 overflow-hidden border-t border-neutral-200 bg-white"
            aria-label="Editor tools"
          >
            <ErrorBoundary
              fallback={
                <div className="p-4 text-sm text-neutral-600">Left panel failed to load. Refresh the editor.</div>
              }
            >
              {leftPanelTabs}
            </ErrorBoundary>
          </aside>
        ) : (
          <EditorCollapsiblePanel
            side="left"
            open={leftPanelOpen}
            onOpenChange={setLeftPanelOpen}
            collapsedContent={leftRailIcons}
            expandedWidth="320px"
            className="order-2 hidden min-h-0 xl:order-1 xl:flex xl:h-full xl:flex-col"
          >
            <ErrorBoundary
              fallback={
                <div className="p-4 text-sm text-neutral-600">Left panel failed to load. Refresh the editor.</div>
              }
            >
              {leftPanelTabs}
            </ErrorBoundary>
          </EditorCollapsiblePanel>
        )}

        <main className="relative order-1 flex min-h-0 flex-1 flex-col xl:order-2" aria-label="Store preview">
          <div className="pointer-events-none absolute bottom-4 left-4 z-30 sm:bottom-5 sm:left-5">
            <div className="pointer-events-auto">
              <EditorGettingStarted
                hasTemplate={Boolean(saved.websiteTemplateId || pendingWebsiteTemplateId)}
                hasProducts={productCount > 0}
                onChooseTemplate={() => {
                  setActiveTab("templates");
                  setLeftPanelOpen(true);
                }}
                onEditHero={() => {
                  handleSelectPage({ type: "home" });
                  const homeSections =
                    useCentralBuilderStore.getState().draftLayout.sections;
                  const hero = homeSections.find((s) => s.type === "hero");
                  if (hero) {
                    setSelectedSection(hero.id);
                    setInspectorFocus("text");
                    setRightPanelOpen(true);
                  }
                  setActiveTab("layers");
                  setLeftPanelOpen(true);
                }}
                onPublish={handlePublishClick}
              />
            </div>
          </div>
          <ErrorBoundary
            fallback={
              <div className="flex flex-1 items-center justify-center p-6 text-sm text-neutral-600">
                Preview crashed. Use refresh in the canvas toolbar, or reload the editor.
              </div>
            }
          >
            <BuilderCanvas
              previewPath={previewPath}
              device={device}
              onRefresh={handleRefreshPreview}
              onFullscreen={() => setPreviewOpen(true)}
              loading={previewLoading}
              className="min-h-0 flex-1"
            >
              <BuilderCanvasIframe
                iframeRef={previewIframeRef}
                refreshKey={previewKey}
                previewUrl={previewUrl}
                onLoad={() => setPreviewLoading(false)}
              />
            </BuilderCanvas>
          </ErrorBoundary>
        </main>

        {isXl !== false ? (
          <EditorCollapsiblePanel
            side="right"
            open={rightPanelOpen}
            onOpenChange={setRightPanelOpen}
            collapsedContent={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "relative h-9 w-9 rounded-lg",
                  selectedSection && "bg-[#007AFF]/10 text-[#007AFF]"
                )}
                onClick={() => setRightPanelOpen(true)}
                title="Section settings"
                aria-label="Section settings"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {selectedSection && (
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#007AFF]" />
                )}
              </Button>
            }
            className="order-3 hidden min-h-0 xl:flex xl:h-full xl:flex-col"
            expandedWidth="300px"
          >
            <ErrorBoundary
              fallback={
                <div className="p-4 text-sm text-neutral-600">Inspector failed to load. Try selecting another section.</div>
              }
            >
              {inspectorContent}
            </ErrorBoundary>
          </EditorCollapsiblePanel>
        ) : null}
      </div>

      <FullscreenPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        storeSlug={saved.slug}
        draft={previewDraft}
      />

      <EditorShellDialogs
        storeSlug={saved.slug}
        storeId={initialStore.id}
        previewPaths={previewPaths}
        pages={pages}
        discardOpen={discardOpen}
        onDiscardOpenChange={setDiscardOpen}
        onDiscard={handleDiscard}
        publishSuccessOpen={publishSuccessOpen}
        onPublishSuccessOpenChange={setPublishSuccessOpen}
        lastPublishSummary={lastPublishSummary}
        onBackToThemes={() => router.push("/dashboard/themes")}
        publishSnapshotsOpen={publishSnapshotsOpen}
        onPublishSnapshotsOpenChange={setPublishSnapshotsOpen}
        publishSnapshotList={publishSnapshotList}
        onPublishSnapshotListChange={setPublishSnapshotList}
        restoringSnapshot={restoringSnapshot}
        onRestoringSnapshotChange={setRestoringSnapshot}
        onApplyDraftRestore={applyDraftRestore}
        onSetDraft={(theme) => setDraft(theme as Parameters<typeof setDraft>[0])}
        onSetDraftNavigation={setDraftNavigation}
        publishResume={publishResume}
        onPublishResumeChange={setPublishResume}
        publishing={publishing}
        confirmOpen={confirmOpen}
        onConfirmOpenChange={setConfirmOpen}
        onPublish={publish}
        themeDirty={themeDirty}
        layoutChanges={publishLayoutChanges}
        preflightIssues={preflightIssues}
        onJumpToIssue={(sectionId) => {
          selectLayer(sectionId);
          setActiveTab("layers");
          setRightPanelOpen(true);
        }}
        navigationDirty={navigationDirty}
        themeChanged={themeChanged}
        liveTheme={saved.theme}
        selectedTheme={selectedTemplate}
        navigationItemCount={draftNavigation.length}
        websiteTemplateName={pendingTemplateName}
        revisionConflictOpen={revisionConflictOpen}
        onRevisionConflictOpenChange={setRevisionConflictOpen}
        onOverwriteLive={handleOverwriteLive}
        templatePreview={templatePreview}
        onTemplatePreviewChange={setTemplatePreview}
        templateApply={templateApply}
        onTemplateApplyChange={setTemplateApply}
        applyingTemplate={applyingTemplate}
        onConfirmApplyWebsiteTemplate={handleConfirmApplyWebsiteTemplate}
        aiReplaceConfirmOpen={aiReplaceConfirmOpen}
        onAiReplaceConfirmOpenChange={setAiReplaceConfirmOpen}
        pendingAiTitle={pendingAiTitle}
        onClearPendingAiLayout={clearPendingAiLayout}
        onConfirmAiReplacePage={confirmAiReplacePage}
        saveComponentOpen={saveComponentOpen}
        onSaveComponentOpenChange={setSaveComponentOpen}
        onConfirmSaveComponent={handleConfirmSaveComponent}
        pendingDesignInsert={pendingDesignInsert}
        onPendingDesignInsertChange={setPendingDesignInsert}
        onPickDesignInsert={handlePickDesignInsert}
        onPickDefaultDesignInsert={handlePickDefaultDesignInsert}
      />
    </div>
  );
}
