"use client";

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { markLaunchChecklistTemplate } from "@/components/website-editor/editor-getting-started";
import type { PendingDesignInsert } from "@/components/website-editor/editor-shell-dialogs";
import { createSectionFromBlock } from "@/lib/builder/legacy-adapter";
import { toHomeLayout, toStoreSections } from "@/lib/builder/ai/serialize";
import type { AiGeneratedPage, AiGeneratedSection } from "@/lib/builder/ai/types";
import { recordRecentBlockId } from "@/lib/builder/block-preferences";
import { getBlock } from "@/lib/builder/block-registry";
import type { BlockDesignPreset } from "@/lib/builder/block-design-presets";
import type { BlockId } from "@/lib/builder/types";
import type { EditorPageTarget } from "@/lib/builder/editor-types";
import {
  decodeSectionClipboard,
  readSectionFromSystemClipboard,
} from "@/lib/builder/section-clipboard";
import { ensureLayoutForTheme, useCentralBuilderStore } from "@/lib/website-layout-store";
import { getTemplateDefaults } from "@/lib/theme-utils";
import type { ThemeId } from "@/lib/themes";
import type { StoreThemeSettings } from "@/types/storefront";
import { serializePageContentWithLayout } from "@/lib/page-layout";
import type { StorePageRow } from "@/lib/pages";
import type { NavItem } from "@/lib/navigation";
import type { HomeLayout } from "@/lib/sections/types";
import { getSectionLabel } from "@/lib/sections/registry";
import { prepareTemplateApply, type WebsiteTemplate } from "@/lib/website-templates";

type SectionType = Parameters<
  ReturnType<typeof useCentralBuilderStore.getState>["addSection"]
>[0];

export function useEditorSectionActions({
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
}: {
  draftLayout: HomeLayout;
  pages: StorePageRow[];
  setPages: Dispatch<SetStateAction<StorePageRow[]>>;
  setDraftNavigation: Dispatch<SetStateAction<NavItem[]>>;
  setPreviewKey: Dispatch<SetStateAction<number>>;
  setPendingWebsiteTemplateId: Dispatch<SetStateAction<string | null>>;
  handleSelectPage: (target: EditorPageTarget) => void;
  addSection: (type: SectionType) => void;
  insertSectionAt: (section: HomeLayout["sections"][number], index: number) => void;
  removeSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  copySection: (id: string) => void;
  pasteSection: (
    afterId?: string,
    section?: HomeLayout["sections"][number]
  ) => boolean;
  replaceDraftLayout: (
    layout: HomeLayout,
    opts?: { selectedSectionId?: string | null; selectedElementId?: string | null }
  ) => void;
  applyTemplateToDraft: (layout: HomeLayout) => void;
  initPageLayouts: (
    layout: HomeLayout,
    pages: StorePageRow[],
    theme: ThemeId
  ) => void;
  setActiveTab: (tab: string) => void;
  canUndo: () => boolean;
  undo: () => void;
  insertComponent: (
    componentId: string,
    layout: HomeLayout,
    index?: number
  ) => { layout: HomeLayout; sectionIds: string[] } | null;
  saveSelectionAsComponent: (
    name: string,
    sectionIds: string[],
    layout: HomeLayout,
    opts?: { description?: string }
  ) => { name: string } | null;
  detachComponent: (instanceId: string, layout: HomeLayout) => HomeLayout;
  setEditingComponent: (componentId: string | null) => void;
  setDraft: (updates: Partial<StoreThemeSettings>) => void;
  setSelectedTemplate: (theme: ThemeId) => void;
}) {
  const [templatePreview, setTemplatePreview] = useState<WebsiteTemplate | null>(null);
  const [templateApply, setTemplateApply] = useState<WebsiteTemplate | null>(null);
  const [applyingTemplate, setApplyingTemplate] = useState(false);
  const [saveComponentOpen, setSaveComponentOpen] = useState(false);
  const [saveComponentSectionId, setSaveComponentSectionId] = useState<string | null>(null);
  const [aiReplaceConfirmOpen, setAiReplaceConfirmOpen] = useState(false);
  const [pendingAiLayout, setPendingAiLayout] = useState<HomeLayout | null>(null);
  const [pendingAiTitle, setPendingAiTitle] = useState<string>("page");
  const [pendingDesignInsert, setPendingDesignInsert] = useState<PendingDesignInsert | null>(
    null
  );

  const handleAddSection = useCallback(
    (type: SectionType) => {
      addSection(type);
      toast.success(`Added ${getSectionLabel(type)}`);
    },
    [addSection]
  );

  const handleInsertComponent = useCallback(
    (componentId: string, index?: number) => {
      try {
        const result = insertComponent(componentId, draftLayout, index);
        if (!result) {
          toast.error("Couldn’t insert component", {
            description: "The component may be empty or corrupted. Try saving it again.",
          });
          return;
        }
        replaceDraftLayout(result.layout, {
          selectedSectionId: result.sectionIds[0] ?? null,
          selectedElementId: result.sectionIds[0] ?? null,
        });
        toast.success("Component inserted");
        setActiveTab("layers");
      } catch (error) {
        console.error(error);
        toast.error("Couldn’t insert component");
      }
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
    (blockId: BlockId, index?: number, settings?: Record<string, unknown>) => {
      const section = createSectionFromBlock(
        blockId,
        settings ? { settings } : undefined
      );
      const block = getBlock(blockId);
      if (!section) {
        toast.message(block ? `${block.name} is coming soon` : "Block not available");
        return;
      }
      insertSectionAt(section, index ?? draftLayout.sections.length);
      recordRecentBlockId(blockId);
      toast.success(
        settings
          ? `Added ${block?.name ?? "block"} design`
          : `Added ${block?.name ?? "block"}`
      );
      setActiveTab("layers");
    },
    [draftLayout.sections.length, insertSectionAt, setActiveTab]
  );

  const handleRequestDesignInsert = useCallback((blockId: BlockId, insertIndex?: number) => {
    const block = getBlock(blockId);
    if (!block?.implemented) {
      toast.message(block ? `${block.name} is coming soon` : "Block not available");
      return;
    }
    setPendingDesignInsert({ blockId, insertIndex });
  }, []);

  const handlePickDesignInsert = useCallback(
    (preset: BlockDesignPreset) => {
      const pending = pendingDesignInsert;
      if (!pending) return;
      const targetId = pending.blockId ?? preset.blockId;
      handleInsertBlock(targetId, pending.insertIndex, preset.settings);
      setPendingDesignInsert(null);
    },
    [handleInsertBlock, pendingDesignInsert]
  );

  const handlePickDefaultDesignInsert = useCallback(() => {
    const pending = pendingDesignInsert;
    if (!pending) return;
    handleInsertBlock(pending.blockId, pending.insertIndex);
    setPendingDesignInsert(null);
  }, [handleInsertBlock, pendingDesignInsert]);

  const handleGeneratedSection = useCallback(
    (generated: AiGeneratedSection) => {
      const [section] = toStoreSections([generated]);
      if (!section) {
        toast.error("Could not insert that section");
        return;
      }
      insertSectionAt(section, draftLayout.sections.length);
      recordRecentBlockId(generated.blockId);
      const block = getBlock(generated.blockId);
      toast.success(`Generated ${block?.name ?? "section"}`);
      setActiveTab("layers");
    },
    [draftLayout.sections.length, insertSectionAt, setActiveTab]
  );

  const handleGeneratedPage = useCallback(
    async (page: AiGeneratedPage, options: { applyToCurrent: boolean }) => {
      const layout = toHomeLayout(page);
      if (layout.sections.length === 0) {
        toast.error("Generated page had no sections");
        return;
      }

      if (options.applyToCurrent) {
        if (draftLayout.sections.length > 1) {
          setPendingAiLayout(layout);
          setPendingAiTitle(page.title || "page");
          setAiReplaceConfirmOpen(true);
          return;
        }
        applyTemplateToDraft(layout);
        toast.success(`Applied generated ${page.title || "page"}`);
        setActiveTab("layers");
        return;
      }

      const slugBase =
        page.slug?.trim() ||
        page.title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") ||
        "ai-page";

      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: page.title || "Generated page",
          slug: slugBase,
          status: "draft",
          content: serializePageContentWithLayout({
            body: "",
            layout,
            metaTitle: page.title || undefined,
          }),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        page?: StorePageRow;
      };
      if (!res.ok || !data.page) {
        toast.error(data.message ?? "Failed to create page");
        return;
      }

      setPages((prev) => [data.page!, ...prev]);
      handleSelectPage({ type: "custom", page: data.page });
      toast.success(`Created “${data.page.title}”`);
    },
    [
      applyTemplateToDraft,
      draftLayout.sections.length,
      handleSelectPage,
      setActiveTab,
      setPages,
    ]
  );

  const confirmAiReplacePage = useCallback(() => {
    if (!pendingAiLayout) return;
    applyTemplateToDraft(pendingAiLayout);
    toast.success(`Applied generated ${pendingAiTitle}`);
    setActiveTab("layers");
    setAiReplaceConfirmOpen(false);
    setPendingAiLayout(null);
  }, [pendingAiLayout, pendingAiTitle, applyTemplateToDraft, setActiveTab]);

  const handleRemoveSection = useCallback(
    (id: string) => {
      if (draftLayout.sections.length <= 1) {
        toast.warning("Cannot delete the last section");
        return;
      }
      const section = draftLayout.sections.find((s) => s.id === id);
      removeSection(id);
      if (section) {
        toast.success(`Removed ${getSectionLabel(section.type)}`, {
          description: "You can restore it with Undo",
          action: {
            label: "Undo",
            onClick: () => {
              if (canUndo()) undo();
            },
          },
        });
      }
    },
    [draftLayout.sections, removeSection, canUndo, undo]
  );

  const handleCopySection = useCallback(
    (id: string) => {
      copySection(id);
      toast.success("Copied");
    },
    [copySection]
  );

  const handlePasteSection = useCallback(() => {
    void (async () => {
      const fromSystem = await readSectionFromSystemClipboard();
      const beforeCount = useCentralBuilderStore.getState().draftLayout.sections.length;
      const ok = fromSystem
        ? pasteSection(undefined, fromSystem)
        : pasteSection();
      const afterCount = useCentralBuilderStore.getState().draftLayout.sections.length;
      if (ok && afterCount > beforeCount) {
        toast.success("Pasted section");
      } else if (fromSystem && !ok) {
        toast.error("Couldn’t paste section", {
          description: "That clipboard payload uses an unknown or unsupported section type.",
        });
      } else {
        toast.message("Nothing to paste", {
          description: "Copy a section first, or paste ettajer/section-v1 clipboard data.",
        });
      }
    })();
  }, [pasteSection]);

  // Native paste (Ctrl/Cmd+V) when focus is on the editor chrome — not inputs.
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      const text = event.clipboardData?.getData("text/plain") ?? "";
      const section = decodeSectionClipboard(text);
      if (!section) return;
      event.preventDefault();
      const beforeCount = useCentralBuilderStore.getState().draftLayout.sections.length;
      const ok = pasteSection(undefined, section);
      const afterCount = useCentralBuilderStore.getState().draftLayout.sections.length;
      if (ok && afterCount > beforeCount) {
        toast.success("Pasted section");
      } else {
        toast.error("Couldn’t paste section", {
          description: "Unsupported or corrupt section clipboard data.",
        });
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [pasteSection]);

  const handleDuplicateSection = useCallback(
    (id: string) => {
      const section = draftLayout.sections.find((s) => s.id === id);
      duplicateSection(id);
      if (section) toast.success(`Duplicated ${getSectionLabel(section.type)}`);
    },
    [draftLayout.sections, duplicateSection]
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
      setPendingWebsiteTemplateId(templateApply.id);
      setTemplateApply(null);
      setTemplatePreview(null);
      markLaunchChecklistTemplate();
      toast.success(`${templateApply.name} applied to draft — Go live when ready`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to apply template");
    } finally {
      setApplyingTemplate(false);
    }
  }, [
    templateApply,
    applyTemplateToDraft,
    setSelectedTemplate,
    setDraft,
    pages,
    setActiveTab,
    handleSelectPage,
    initPageLayouts,
    setDraftNavigation,
    setPages,
    setPreviewKey,
    setPendingWebsiteTemplateId,
  ]);

  return {
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
    handleGeneratedSection,
    handleGeneratedPage,
    confirmAiReplacePage,
    handleRemoveSection,
    handleCopySection,
    handlePasteSection,
    handleDuplicateSection,
    handleSelectTemplate,
    handlePreviewWebsiteTemplate,
    handleRequestApplyWebsiteTemplate,
    handleConfirmApplyWebsiteTemplate,
    clearPendingAiLayout: () => setPendingAiLayout(null),
  };
}
