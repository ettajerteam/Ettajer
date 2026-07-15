"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronRight,
  FileText,
  FileImage,
  Layers,
  LayoutTemplate,
  Palette,
  PartyPopper,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeCustomizer } from "@/components/themes/theme-customizer";
import { ThemeEditorTemplatePicker } from "@/components/themes/theme-editor-template-picker";
import { FullscreenPreview } from "@/components/themes/fullscreen-preview";
import { EditorLayersPanel } from "@/components/website-editor/editor-layers-panel";
import { EditorSectionSettings } from "@/components/website-editor/editor-section-settings";
import { EditorPagesPanel } from "@/components/website-editor/editor-pages-panel";
import { EditorGettingStarted } from "@/components/website-editor/editor-getting-started";
import { BuilderCanvas, BuilderCanvasIframe } from "@/components/website-editor/builder-canvas";
import { BuilderAddPanel } from "@/components/website-editor/builder-add-panel";
import { SaveComponentDialog } from "@/components/website-editor/save-component-dialog";
import { ComponentEditBanner } from "@/components/website-editor/component-edit-banner";
import { EditorTopBar } from "@/components/website-editor/editor-context-bar";
import { EditorPublishPanel } from "@/components/website-editor/editor-publish-panel";
import { MediaLibrary } from "@/components/media/media-library";
import {
  EditorCollapsiblePanel,
  EditorPanelCloseButton,
} from "@/components/website-editor/editor-collapsible-panel";
import { EditorPanelSection } from "@/components/website-editor/editor-panel-section";
import { EditorShortcutsHelp } from "@/components/website-editor/editor-shortcuts-help";
import { WebsiteTemplatesPanel } from "@/components/website-templates/website-templates-panel";
import { WebsiteTemplatePreviewDialog } from "@/components/website-templates/website-template-preview-dialog";
import { WebsiteTemplateApplyDialog } from "@/components/website-templates/website-template-apply-dialog";
import { Separator } from "@/components/ui/separator";
import { useThemeStore } from "@/lib/theme-store";
import { ensureLayoutForTheme, ensureTemplateLayouts, useCentralBuilderStore } from "@/lib/website-layout-store";
import { type ThemeId } from "@/lib/themes";
import { isThemeDirty, resolveThemeDraft, getTemplateDefaults } from "@/lib/theme-utils";
import { buildPreviewUrl } from "@/lib/preview-engine";
import { updatePageContentLayout } from "@/lib/page-layout";
import { prepareTemplateApply, type WebsiteTemplate } from "@/lib/website-templates";
import type { NavItem } from "@/lib/navigation";
import { dashboardKicker, dashboardTitle } from "@/lib/dashboard-ui";
import { SECTION_REGISTRY } from "@/lib/sections/registry";
import { createSectionFromBlock } from "@/lib/builder/legacy-adapter";
import { recordRecentBlockId } from "@/lib/builder/block-preferences";
import { useEditorShortcuts } from "@/lib/builder/use-editor-shortcuts";
import { getBlock } from "@/lib/builder/block-registry";
import type { BlockId } from "@/lib/builder/types";
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
import { cn } from "@/lib/utils";

interface WebsiteEditorClientProps {
  store: StoreThemeData;
  previewPaths: PreviewPaths;
  initialPages: StorePageRow[];
}

const LEFT_PANEL_RAIL_ITEMS = [
  { value: "pages", icon: FileText, title: "Pages" },
  { value: "add", icon: Plus, title: "Add blocks" },
  { value: "layers", icon: Layers, title: "Layers", showDirty: "layout" as const },
  { value: "templates", icon: LayoutTemplate, title: "Website templates" },
  { value: "design", icon: Palette, title: "Design", showDirty: "theme" as const },
  { value: "assets", icon: FileImage, title: "Assets" },
] as const;

function LeftPanelRailButtons({
  activeTab,
  onSelectTab,
  anyLayoutDirty,
  themeDirty,
}: {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  anyLayoutDirty: boolean;
  themeDirty: boolean;
}) {
  return (
    <>
      {LEFT_PANEL_RAIL_ITEMS.map((item) => {
        const Icon = item.icon;
        const isDirty =
          "showDirty" in item && item.showDirty === "layout"
            ? anyLayoutDirty
            : "showDirty" in item && item.showDirty === "theme"
              ? themeDirty
              : false;
        return (
          <Button
            key={item.value}
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "relative h-9 w-9 rounded-lg",
              activeTab === item.value && "bg-[#007AFF]/10 text-[#007AFF]"
            )}
            onClick={() => onSelectTab(item.value)}
            title={item.title}
            aria-label={item.title}
          >
            <Icon className="h-4 w-4" />
            {isDirty ? (
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
            ) : null}
          </Button>
        );
      })}
    </>
  );
}

export function WebsiteEditorClient({
  store: initialStore,
  previewPaths,
  initialPages,
}: WebsiteEditorClientProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialStore);
  const [pages, setPages] = useState(initialPages);
  const [previewKey, setPreviewKey] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [publishSuccessOpen, setPublishSuccessOpen] = useState(false);
  const [lastPublishSummary, setLastPublishSummary] = useState<string | null>(null);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [savedNavigation, setSavedNavigation] = useState<NavItem[]>([]);
  const [draftNavigation, setDraftNavigation] = useState<NavItem[]>([]);
  const [templatePreview, setTemplatePreview] = useState<WebsiteTemplate | null>(null);
  const [templateApply, setTemplateApply] = useState<WebsiteTemplate | null>(null);
  const [applyingTemplate, setApplyingTemplate] = useState(false);
  const [saveComponentOpen, setSaveComponentOpen] = useState(false);
  const [saveComponentSectionId, setSaveComponentSectionId] = useState<string | null>(null);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);

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

  const undoAvailable = useCentralBuilderStore((s) => s.historyPast.length > 0);
  const redoAvailable = useCentralBuilderStore((s) => s.historyFuture.length > 0);
  const hasClipboard = useCentralBuilderStore((s) => s.clipboardSection !== null);

  const layoutDirty = useMemo(() => {
    return JSON.stringify(draftLayout) !== JSON.stringify(savedLayout);
  }, [draftLayout, savedLayout]);

  const anyLayoutDirty = useCentralBuilderStore((s) => s.isDirty());

  useEffect(() => {
    initFromStore({
      theme: initialStore.theme,
      primaryColor: initialStore.primaryColor,
      secondaryColor: initialStore.secondaryColor,
      font: initialStore.font,
      logo: initialStore.logo,
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
  }, [initialStore, initFromStore, initTemplateLayouts, initComponents, fetchComponents, initialPages]);

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

  const dirty = themeDirty || anyLayoutDirty || navigationDirty;

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
      if (ref && !ref.detached) {
        void syncComponentSectionFromLayout(ref.componentId, ref.sectionIndex, {
          ...selectedSection,
          settings: { ...selectedSection.settings, ...settings },
        });
        setPreviewKey((k) => k + 1);
      }
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
  };

  const previewPath =
    activePage.type === "home"
      ? `/store/${saved.slug}`
      : activePage.type === "custom"
        ? `/store/${saved.slug}/pages/${activePage.page.slug}`
        : activePage.type === "product"
          ? previewPaths.product
            ? `/store/${saved.slug}/product/${previewPaths.product}`
            : `/store/${saved.slug}`
          : previewPaths.collection
            ? `/store/${saved.slug}/collection/${previewPaths.collection}`
            : `/store/${saved.slug}`;

  const handleSelectPage = useCallback(
    (target: Parameters<typeof switchPage>[0]) => {
      switchPage(target);
      setActiveTab("layers");
      setPreviewKey((k) => k + 1);
    },
    [switchPage, setActiveTab]
  );

  const handleAddSection = useCallback(
    (type: Parameters<typeof addSection>[0]) => {
      addSection(type);
      toast.success(`Added ${SECTION_REGISTRY[type].label}`);
    },
    [addSection]
  );

  const handleInsertComponent = useCallback(
    (componentId: string, index?: number) => {
      const result = insertComponent(componentId, draftLayout, index);
      if (!result) {
        toast.error("Component not found");
        return;
      }
      replaceDraftLayout(result.layout, {
        selectedSectionId: result.sectionIds[0] ?? null,
        selectedElementId: result.sectionIds[0] ?? null,
      });
      setPreviewKey((k) => k + 1);
      toast.success("Component inserted");
      setActiveTab("layers");
    },
    [draftLayout, insertComponent, replaceDraftLayout, setActiveTab]
  );

  const handleSaveAsComponent = useCallback((sectionId: string) => {
    setSaveComponentSectionId(sectionId);
    setSaveComponentOpen(true);
  }, []);

  const handleConfirmSaveComponent = useCallback(
    (name: string, description?: string) => {
      if (!saveComponentSectionId) return;
      const component = saveSelectionAsComponent(
        name,
        [saveComponentSectionId],
        draftLayout,
        { description }
      );
      if (component) {
        toast.success(`Saved component "${component.name}"`);
      } else {
        toast.error("Failed to save component");
      }
      setSaveComponentSectionId(null);
    },
    [saveComponentSectionId, saveSelectionAsComponent, draftLayout]
  );

  const handleDetachComponent = useCallback(
    (instanceId: string) => {
      const next = detachComponent(instanceId, draftLayout);
      replaceDraftLayout(next);
      setPreviewKey((k) => k + 1);
      toast.success("Component detached — now editable locally");
    },
    [detachComponent, draftLayout, replaceDraftLayout]
  );

  const handleEditComponent = useCallback(
    (componentId: string) => {
      setEditingComponent(componentId);
      toast.message("Editing component — changes apply to all linked instances");
    },
    [setEditingComponent]
  );

  const handleInsertBlock = useCallback(
    (blockId: BlockId, index?: number) => {
      const section = createSectionFromBlock(blockId);
      const block = getBlock(blockId);
      if (!section) {
        toast.message(block ? `${block.name} is coming soon` : "Block not available");
        return;
      }
      insertSectionAt(section, index ?? draftLayout.sections.length);
      recordRecentBlockId(blockId);
      toast.success(`Added ${block?.name ?? "block"}`);
      setActiveTab("layers");
    },
    [draftLayout.sections.length, insertSectionAt, setActiveTab]
  );

  const handleRemoveSection = useCallback(
    (id: string) => {
      if (draftLayout.sections.length <= 1) {
        toast.warning("Cannot delete the last section");
        return;
      }
      const section = draftLayout.sections.find((s) => s.id === id);
      removeSection(id);
      if (section) {
        toast.success(`Removed ${SECTION_REGISTRY[section.type].label} — Ctrl+Z to undo`);
      }
    },
    [draftLayout.sections, removeSection]
  );

  const handleCopySection = useCallback(
    (id: string) => {
      copySection(id);
      toast.success("Copied");
    },
    [copySection]
  );

  const handlePasteSection = useCallback(() => {
    pasteSection();
    toast.success("Pasted");
  }, [pasteSection]);

  const handleDuplicateSection = useCallback(
    (id: string) => {
      const section = draftLayout.sections.find((s) => s.id === id);
      duplicateSection(id);
      if (section) toast.success(`Duplicated ${SECTION_REGISTRY[section.type].label}`);
    },
    [draftLayout.sections, duplicateSection]
  );

  const handleDraftChange = useCallback(
    (updates: Partial<typeof draft>) => setDraft(updates),
    [setDraft]
  );

  const handleSelectTemplate = (theme: ThemeId) => {
    setSelectedTemplate(theme);
    setDraft(getTemplateDefaults(theme));
  };

  const handlePreviewWebsiteTemplate = useCallback((template: WebsiteTemplate) => {
    setTemplatePreview(template);
  }, []);

  const handleRequestApplyWebsiteTemplate = useCallback((template: WebsiteTemplate) => {
    setTemplateApply(template);
  }, []);

  const handleConfirmApplyWebsiteTemplate = useCallback(async () => {
    if (!templateApply) return;
    setApplyingTemplate(true);
    try {
      const result = prepareTemplateApply(templateApply);
      applyTemplateToDraft(result.homeLayout);
      setSelectedTemplate(result.theme.theme);
      setDraft({
        theme: result.theme.theme,
        primaryColor: result.theme.primaryColor,
        secondaryColor: result.theme.secondaryColor,
        font: result.theme.font,
        ...(result.branding?.logo ? { logo: result.branding.logo } : {}),
      });
      setDraftNavigation(result.navigation);

      const existingSlugs = new Set(pages.map((p) => p.slug));
      const createdPages: StorePageRow[] = [];
      for (const pageDef of result.pages) {
        if (existingSlugs.has(pageDef.slug)) continue;
        const res = await fetch("/api/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: pageDef.title,
            slug: pageDef.slug,
            content: pageDef.content,
            status: pageDef.status ?? "draft",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          createdPages.push(data.page);
          existingSlugs.add(pageDef.slug);
        }
      }
      const nextPages = createdPages.length > 0 ? [...createdPages, ...pages] : pages;
      if (createdPages.length > 0) {
        setPages(nextPages);
      }

      initPageLayouts(
        ensureLayoutForTheme(result.homeLayout, result.theme.theme),
        nextPages,
        result.theme.theme
      );

      setActiveTab("layers");
      handleSelectPage({ type: "home" });
      setPreviewKey((k) => k + 1);
      setTemplateApply(null);
      setTemplatePreview(null);
      toast.success(`${templateApply.name} applied to draft — publish when ready`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to apply template");
    } finally {
      setApplyingTemplate(false);
    }
  }, [templateApply, applyTemplateToDraft, setSelectedTemplate, setDraft, pages, setActiveTab, handleSelectPage, initPageLayouts]);

  const selectTabFromRail = (tab: string) => {
    setActiveTab(tab);
    setLeftPanelOpen(true);
  };

  const leftPanelTabs = (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full min-h-0 flex-row">
      <div className="flex w-14 shrink-0 flex-col items-center border-r border-neutral-200 bg-neutral-50/80 py-2">
        <div className="flex flex-1 flex-col items-center gap-1">
          <LeftPanelRailButtons
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            anyLayoutDirty={anyLayoutDirty}
            themeDirty={themeDirty}
          />
        </div>
        <EditorPanelCloseButton
          side="left"
          onClick={() => setLeftPanelOpen(false)}
          className="mb-1"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
        <TabsContent value="pages" className="editor-tab-content editor-scroll-hidden mt-0 min-h-0 flex-1 overflow-y-auto">
          <EditorPagesPanel
            storeSlug={saved.slug}
            pages={pages}
            active={activePage}
            onSelect={handleSelectPage}
            onPagesChange={setPages}
          />
        </TabsContent>

        <TabsContent value="add" className="editor-tab-content mt-0 flex min-h-0 flex-1 flex-col overflow-hidden">
          <BuilderAddPanel
            onInsertBlock={handleInsertBlock}
            onInsertComponent={handleInsertComponent}
          />
        </TabsContent>

        <TabsContent value="layers" className="editor-tab-content editor-scroll-hidden mt-0 min-h-0 flex-1 space-y-4 overflow-y-auto">
          {draftLayout.sections.length === 0 ? (
            <p className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-500">
              No sections yet. Open the <strong className="text-neutral-700">Add</strong> panel to
              insert your first block.
            </p>
          ) : null}
          <EditorLayersPanel
            sections={draftLayout.sections}
            onReorder={reorderSections}
            onRemove={handleRemoveSection}
            onToggleVisible={toggleSectionVisible}
            onAdd={handleAddSection}
            onDuplicate={handleDuplicateSection}
            onSaveAsComponent={handleSaveAsComponent}
            onDetachComponent={handleDetachComponent}
            onEditComponent={handleEditComponent}
            componentNames={componentNames}
          />
          <div className="xl:hidden">
            <button
              type="button"
              onClick={() => setMobileSettingsOpen((open) => !open)}
              className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-left transition-colors hover:bg-neutral-100"
            >
              <div>
                <p className={dashboardKicker}>Inspector</p>
                <p className="text-sm font-medium text-neutral-900">
                  {selectedSection
                    ? SECTION_REGISTRY[selectedSection.type].label
                    : "Section settings"}
                </p>
              </div>
              <ChevronRight
                className={cn(
                  "h-4 w-4 text-neutral-400 transition-transform",
                  mobileSettingsOpen && "rotate-90"
                )}
              />
            </button>
            {mobileSettingsOpen && (
              <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                <EditorSectionSettings {...inspectorSettingsProps} />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="editor-tab-content editor-scroll-hidden mt-0 min-h-0 flex-1 overflow-y-auto">
          <WebsiteTemplatesPanel
            onPreview={handlePreviewWebsiteTemplate}
            onApply={handleRequestApplyWebsiteTemplate}
          />
        </TabsContent>

        <TabsContent value="design" className="editor-tab-content editor-scroll-hidden mt-0 min-h-0 flex-1 space-y-5 overflow-y-auto">
          <EditorPanelSection label="Theme style" description="Visual style — colors and typography preset">
            <ThemeEditorTemplatePicker
              selectedTemplate={selectedTemplate}
              liveTemplate={saved.theme}
              onSelect={handleSelectTemplate}
            />
          </EditorPanelSection>
          <Separator className="bg-neutral-100" />
          <EditorPanelSection label="Brand & colors" description="Logo, palette, and color schemes">
            <ThemeCustomizer
              draft={previewDraft}
              selectedTemplate={selectedTemplate}
              onChange={handleDraftChange}
              embedded
              sections={["brand", "colors"]}
            />
          </EditorPanelSection>
          <Separator className="bg-neutral-100" />
          <EditorPanelSection label="Typography" description="Font family for your storefront">
            <ThemeCustomizer
              draft={previewDraft}
              selectedTemplate={selectedTemplate}
              onChange={handleDraftChange}
              embedded
              sections={["typography"]}
            />
          </EditorPanelSection>
        </TabsContent>

        <TabsContent value="assets" className="editor-tab-content editor-scroll-hidden mt-0 min-h-0 flex-1 overflow-y-auto">
          <MediaLibrary />
        </TabsContent>
      </div>
    </Tabs>
  );

  const leftRailIcons = (
    <LeftPanelRailButtons
      activeTab={activeTab}
      onSelectTab={selectTabFromRail}
      anyLayoutDirty={anyLayoutDirty}
      themeDirty={themeDirty}
    />
  );

  const inspectorContent = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-neutral-100 px-4 py-3">
        <div className="min-w-0">
          <p className={dashboardKicker}>Inspector</p>
          <p className={dashboardTitle}>Section settings</p>
        </div>
        <EditorPanelCloseButton side="right" onClick={() => setRightPanelOpen(false)} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <EditorSectionSettings {...inspectorSettingsProps} />
      </div>
    </div>
  );

  const previewUrl = useMemo(() => {
    if (activePage.type === "custom") {
      return buildPreviewUrl(
        saved.slug,
        previewDraft,
        "home",
        previewPaths,
        previewLayout,
        selectedSectionId,
        device,
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
      saved.slug,
      previewDraft,
      previewPage,
      previewPaths,
      previewLayout,
      selectedSectionId,
      device
    );
  }, [
    activePage,
    saved.slug,
    previewDraft,
    previewPaths,
    previewLayout,
    selectedSectionId,
    device,
  ]);

  useEffect(() => {
    setPreviewLoading(true);
  }, [previewUrl, previewKey]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "ettajer:select-section" && typeof event.data.sectionId === "string") {
        selectLayer(event.data.sectionId);
        setActiveTab("layers");
      }
      if (event.data?.type === "ettajer:hover-section") {
        useCentralBuilderStore.getState().setHoveredElement(
          typeof event.data.sectionId === "string" ? event.data.sectionId : null
        );
      }
      if (event.data?.type === "ettajer:drag-active") {
        if (event.data.active) {
          // drag state started from add panel store; iframe confirms canvas drag
        } else {
          useCentralBuilderStore.getState().endDrag();
        }
      }
      if (event.data?.type === "ettajer:drag-insert" && typeof event.data.insertIndex === "number") {
        useCentralBuilderStore.getState().updateDrag({ insertIndex: event.data.insertIndex });
      }
      if (event.data?.type === "ettajer:drop-block" && typeof event.data.blockId === "string") {
        handleInsertBlock(
          event.data.blockId as BlockId,
          typeof event.data.insertIndex === "number" ? event.data.insertIndex : undefined
        );
        useCentralBuilderStore.getState().endDrag();
      }
      if (event.data?.type === "ettajer:drop-component" && typeof event.data.componentId === "string") {
        handleInsertComponent(
          event.data.componentId,
          typeof event.data.insertIndex === "number" ? event.data.insertIndex : undefined
        );
        useCentralBuilderStore.getState().endDrag();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [selectLayer, handleInsertBlock, handleInsertComponent, setActiveTab]);

  useEffect(() => {
    if (selectedSectionId) setMobileSettingsOpen(true);
  }, [selectedSectionId]);

  useEffect(() => {
    previewIframeRef.current?.contentWindow?.postMessage(
      { type: "ettajer:preview-device", device },
      "*"
    );
  }, [device, previewKey]);

  useEffect(() => {
    if (!selectedSectionId) return;
    const sendFocus = () => {
      previewIframeRef.current?.contentWindow?.postMessage(
        { type: "ettajer:focus-section", sectionId: selectedSectionId },
        "*"
      );
    };
    sendFocus();
    const timer = window.setTimeout(sendFocus, 400);
    return () => window.clearTimeout(timer);
  }, [selectedSectionId, previewKey]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const handleDiscard = () => {
    initFromStore({
      theme: saved.theme,
      primaryColor: saved.primaryColor,
      secondaryColor: saved.secondaryColor,
      font: saved.font,
      logo: saved.logo,
    });
    initTemplateLayouts(
      ensureTemplateLayouts(
        {
          home: saved.homeLayout,
          product: saved.productLayout,
          collection: saved.collectionLayout,
        },
        saved.theme
      ),
      pages,
      saved.theme
    );
    switchPage(activePage);
    setDraftNavigation(savedNavigation);
    setDiscardOpen(false);
    toast.message("Changes discarded");
  };

  const publishRef = useRef<() => Promise<void>>(async () => {});

  const publish = async () => {
    const hadThemeChanges = themeDirty;
    const hadNavigationChanges = navigationDirty;

    syncActivePageToCache();
    const dirtyKeys = getDirtyPageKeys();
    const layoutCache = useCentralBuilderStore.getState().pageLayoutCache;
    const homeDirty = dirtyKeys.includes("home");
    const productDirty = dirtyKeys.includes("product");
    const collectionDirty = dirtyKeys.includes("collection");
    const customPageDirtyKeys = dirtyKeys.filter((k) => k.startsWith("page:"));

    setPublishing(true);
    try {
      const requests: Promise<Response>[] = [
        fetch("/api/store/theme", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            theme: previewDraft.theme,
            primaryColor: previewDraft.primaryColor,
            secondaryColor: previewDraft.secondaryColor,
            font: previewDraft.font,
            logo: previewDraft.logo ?? null,
          }),
        }),
      ];

      if (homeDirty) {
        requests.push(
          fetch("/api/store/layout", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ field: "home", layout: layoutCache.home?.draft ?? draftLayout }),
          })
        );
      }

      if (productDirty) {
        requests.push(
          fetch("/api/store/layout", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ field: "product", layout: layoutCache.product?.draft }),
          })
        );
      }

      if (collectionDirty) {
        requests.push(
          fetch("/api/store/layout", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ field: "collection", layout: layoutCache.collection?.draft }),
          })
        );
      }

      for (const key of customPageDirtyKeys) {
        const pageId = key.slice("page:".length);
        const page = pages.find((p) => p.id === pageId);
        const pageLayout = layoutCache[key]?.draft;
        if (!page || !pageLayout) continue;
        requests.push(
          fetch(`/api/pages/${pageId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: updatePageContentLayout(page.content, pageLayout),
            }),
          })
        );
      }

      if (hadNavigationChanges) {
        requests.push(
          fetch("/api/navigation", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: draftNavigation }),
          })
        );
      }

      const responses = await Promise.all(requests);
      const themeRes = responses[0];
      let responseIdx = 1;
      const layoutRes = homeDirty ? responses[responseIdx++] : null;
      const productLayoutRes = productDirty ? responses[responseIdx++] : null;
      const collectionLayoutRes = collectionDirty ? responses[responseIdx++] : null;
      const pageResponses = customPageDirtyKeys.map(() => responses[responseIdx++]);
      const navigationRes = hadNavigationChanges ? responses[responseIdx] : null;

      if (!themeRes.ok) {
        const data = await themeRes.json();
        throw new Error(data.message ?? "Failed to publish theme");
      }
      if (layoutRes && !layoutRes.ok) {
        const data = await layoutRes.json();
        throw new Error(data.message ?? "Failed to publish layout");
      }
      if (productLayoutRes && !productLayoutRes.ok) {
        const data = await productLayoutRes.json();
        throw new Error(data.message ?? "Failed to publish product layout");
      }
      if (collectionLayoutRes && !collectionLayoutRes.ok) {
        const data = await collectionLayoutRes.json();
        throw new Error(data.message ?? "Failed to publish collection layout");
      }
      for (const pageRes of pageResponses) {
        if (!pageRes.ok) {
          const data = await pageRes.json();
          throw new Error(data.message ?? "Failed to publish page layout");
        }
      }
      if (navigationRes && !navigationRes.ok) {
        const data = await navigationRes.json();
        throw new Error(data.message ?? "Failed to publish navigation");
      }

      const { store: updated } = await themeRes.json();
      let homeLayout = saved.homeLayout;
      let productLayout = saved.productLayout;
      let collectionLayout = saved.collectionLayout;
      if (layoutRes) {
        const { layout } = await layoutRes.json();
        homeLayout = layout;
      }
      if (productLayoutRes) {
        const { layout } = await productLayoutRes.json();
        productLayout = layout;
      }
      if (collectionLayoutRes) {
        const { layout } = await collectionLayoutRes.json();
        collectionLayout = layout;
      }

      let nextPages = pages;
      for (let i = 0; i < customPageDirtyKeys.length; i++) {
        const pageRes = pageResponses[i];
        if (!pageRes) continue;
        const { page: updatedPage } = await pageRes.json();
        nextPages = nextPages.map((p) => (p.id === updatedPage.id ? updatedPage : p));
      }

      const newSaved: StoreThemeData = {
        ...saved,
        logo: updated.logo,
        theme: updated.theme as ThemeId,
        primaryColor: updated.primaryColor,
        secondaryColor: updated.secondaryColor,
        font: updated.font,
        homeLayout,
        productLayout,
        collectionLayout,
        updatedAt: new Date().toISOString(),
      };

      setSaved(newSaved);
      setPages(nextPages);
      initFromStore({
        theme: newSaved.theme,
        primaryColor: newSaved.primaryColor,
        secondaryColor: newSaved.secondaryColor,
        font: newSaved.font,
        logo: newSaved.logo,
      });
      initTemplateLayouts(
        ensureTemplateLayouts(
          {
            home: homeLayout,
            product: productLayout,
            collection: collectionLayout,
          },
          newSaved.theme
        ),
        nextPages,
        newSaved.theme
      );
      switchPage(activePage);
      commitSavedLayouts();
      if (hadNavigationChanges) {
        setSavedNavigation(draftNavigation);
      }
      setPreviewKey((k) => k + 1);

      const summaryParts: string[] = [];
      if (hadThemeChanges) summaryParts.push("theme & colors");
      if (homeDirty) {
        const count = layoutCache.home?.draft.sections.length ?? 0;
        summaryParts.push(`${count} home section${count === 1 ? "" : "s"}`);
      }
      if (productDirty) {
        summaryParts.push("product page template");
      }
      if (collectionDirty) {
        summaryParts.push("collection page template");
      }
      if (customPageDirtyKeys.length > 0) {
        summaryParts.push(
          `${customPageDirtyKeys.length} page layout${customPageDirtyKeys.length === 1 ? "" : "s"}`
        );
      }
      if (hadNavigationChanges) summaryParts.push("navigation");
      setLastPublishSummary(
        summaryParts.length > 0 ? summaryParts.join(" and ") : "your website"
      );
      setPublishSuccessOpen(true);
      toast.success("Website published");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to publish");
    } finally {
      setPublishing(false);
      setConfirmOpen(false);
    }
  };

  publishRef.current = publish;

  const handlePublishClick = () => {
    setConfirmOpen(true);
  };

  const hiddenSectionCount = draftLayout.sections.filter((s) => !s.visible).length;

  const handleRefreshPreview = () => {
    setPreviewLoading(true);
    setPreviewKey((k) => k + 1);
  };

  useEditorShortcuts({
    canEditSections: true,
    selectedSectionId,
    hasClipboard,
    canUndo,
    canRedo,
    undo,
    redo,
    onPublish: () => setConfirmOpen(true),
    canPublish: dirty && !publishing,
    deselect: () => setSelectedSection(null),
    onFocusSelection: () => {
      if (!selectedSectionId) {
        const first = draftLayout.sections[0];
        if (first) setSelectedSection(first.id);
        return;
      }
      setActiveTab("design");
      previewIframeRef.current?.contentWindow?.postMessage(
        { type: "ettajer:focus-section", sectionId: selectedSectionId },
        "*"
      );
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

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900">
      <EditorTopBar
        activePage={activePage}
        pages={pages}
        device={device}
        dirty={dirty}
        publishing={publishing}
        undoAvailable={undoAvailable}
        redoAvailable={redoAvailable}
        storeSlug={saved.slug}
        onSelectPage={handleSelectPage}
        onDeviceChange={setDevice}
        onPublish={handlePublishClick}
        onDiscard={() => setDiscardOpen(true)}
        onUndo={() => undo()}
        onRedo={() => redo()}
      />

      {editingComponentId && components[editingComponentId] ? (
        <ComponentEditBanner
          componentName={components[editingComponentId].name}
          instanceCount={getComponentInstanceCount(editingComponentId, draftLayout)}
          onExit={() => setEditingComponent(null)}
        />
      ) : null}

      <EditorGettingStarted className="border-b border-neutral-200/80 bg-white px-4 py-2 sm:px-5" />

      <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
        {/* Mobile / tablet: full-width left panel */}
        <aside className="order-2 w-full shrink-0 border-t border-neutral-200 bg-white xl:hidden">
          {leftPanelTabs}
        </aside>

        {/* Desktop: collapsible left panel */}
        <EditorCollapsiblePanel
          side="left"
          open={leftPanelOpen}
          onOpenChange={setLeftPanelOpen}
          collapsedContent={leftRailIcons}
        className="order-2 hidden xl:order-1 xl:flex xl:min-h-[calc(100vh-11rem)] xl:flex-col"
        >
          {leftPanelTabs}
        </EditorCollapsiblePanel>

        <main className="relative order-1 flex min-h-[50vh] flex-1 flex-col p-3 sm:p-4 xl:order-2 xl:min-h-0 xl:p-5">
          <div className="mx-auto flex h-full w-full max-w-none flex-1 flex-col">
            <BuilderCanvas
              previewPath={previewPath}
              device={device}
              onRefresh={handleRefreshPreview}
              onFullscreen={() => setPreviewOpen(true)}
              loading={previewLoading}
            >
              <BuilderCanvasIframe
                iframeRef={previewIframeRef}
                refreshKey={previewKey}
                previewUrl={previewUrl}
                onLoad={() => setPreviewLoading(false)}
              />
            </BuilderCanvas>
          </div>
        </main>

        {/* Desktop: collapsible right inspector */}
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
          className="order-3 hidden xl:flex xl:min-h-[calc(100vh-11rem)] xl:flex-col"
          expandedWidth="300px"
        >
          {inspectorContent}
        </EditorCollapsiblePanel>
      </div>

      <FullscreenPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        storeSlug={saved.slug}
        draft={previewDraft}
      />

      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard unsaved changes?</DialogTitle>
            <DialogDescription>
              Your theme and section edits will be reset to the last published version.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscardOpen(false)}>
              Keep editing
            </Button>
            <Button variant="destructive" onClick={handleDiscard}>
              Discard changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={publishSuccessOpen} onOpenChange={setPublishSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-[#007AFF]" />
              Website published
            </DialogTitle>
            <DialogDescription>
              {lastPublishSummary
                ? `Your live store now reflects ${lastPublishSummary}. Customers will see the updates immediately.`
                : "Your changes are now live on your storefront."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => router.push("/dashboard/themes")}>
              Back to themes
            </Button>
            <Button
              className="bg-[#007AFF]"
              onClick={() => setPublishSuccessOpen(false)}
            >
              Keep editing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditorPublishPanel
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={publish}
        publishing={publishing}
        themeDirty={themeDirty}
        layoutDirty={layoutDirty}
        navigationDirty={navigationDirty}
        themeChanged={themeChanged}
        liveTheme={saved.theme}
        selectedTheme={selectedTemplate}
        sectionCount={draftLayout.sections.length}
        hiddenSectionCount={hiddenSectionCount}
        navigationItemCount={draftNavigation.length}
      />

      <WebsiteTemplatePreviewDialog
        open={templatePreview !== null}
        onOpenChange={(open) => {
          if (!open) setTemplatePreview(null);
        }}
        template={templatePreview}
        storeSlug={saved.slug}
        previewPaths={previewPaths}
        onApply={() => {
          if (templatePreview) {
            setTemplateApply(templatePreview);
            setTemplatePreview(null);
          }
        }}
      />

      <WebsiteTemplateApplyDialog
        open={templateApply !== null}
        onOpenChange={(open) => {
          if (!open) setTemplateApply(null);
        }}
        template={templateApply}
        existingPages={pages}
        applying={applyingTemplate}
        onConfirm={handleConfirmApplyWebsiteTemplate}
      />

      <SaveComponentDialog
        open={saveComponentOpen}
        onOpenChange={setSaveComponentOpen}
        sectionCount={1}
        onSave={handleConfirmSaveComponent}
      />
    </div>
  );
}
