"use client";

import { ChevronRight } from "lucide-react";
import { ThemeCustomizer } from "@/components/themes/theme-customizer";
import { ThemeEditorTemplatePicker } from "@/components/themes/theme-editor-template-picker";
import { EditorLayersPanel } from "@/components/website-editor/editor-layers-panel";
import { EditorSectionSettings } from "@/components/website-editor/editor-section-settings";
import { EditorPagesPanel } from "@/components/website-editor/editor-pages-panel";
import { EditorNavigationPanel } from "@/components/website-editor/editor-navigation-panel";
import { BuilderAddPanel } from "@/components/website-editor/builder-add-panel";
import { EditorPanelCloseButton } from "@/components/website-editor/editor-collapsible-panel";
import { EditorPanelSection } from "@/components/website-editor/editor-panel-section";
import { WebsiteTemplatesPanel } from "@/components/website-templates/website-templates-panel";
import { MediaLibrary } from "@/components/media/media-library";
import { LeftPanelRailButtons } from "@/components/website-editor/left-panel-rail";
import { getSectionLabel } from "@/lib/sections/registry";
import { resolveImageSettingKey } from "@/lib/builder/media-target";
import { dashboardKicker } from "@/lib/dashboard-ui";
import type { ThemeId } from "@/lib/themes";
import type { NavItem } from "@/lib/navigation";
import type { StorePageRow } from "@/lib/pages";
import type { WebsiteTemplate } from "@/lib/website-templates";
import type { MediaAsset } from "@/lib/media/types";
import type { HomeLayout, StoreSection } from "@/lib/sections/types";
import type { ComponentProps } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type InspectorSettingsProps = ComponentProps<typeof EditorSectionSettings>;
type PagesPanelProps = ComponentProps<typeof EditorPagesPanel>;
type LayersPanelProps = ComponentProps<typeof EditorLayersPanel>;
type AddPanelProps = ComponentProps<typeof BuilderAddPanel>;
type TemplatePickerProps = ComponentProps<typeof ThemeEditorTemplatePicker>;

export interface EditorLeftPanelProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onClose: () => void;
  anyLayoutDirty: boolean;
  themeDirty: boolean;
  navigationDirty: boolean;
  isXl: boolean | null;
  mobileSettingsOpen: boolean;
  onMobileSettingsOpenChange: (open: boolean) => void;
  /** Store slug / branding */
  storeSlug: string;
  pages: StorePageRow[];
  activePage: PagesPanelProps["active"];
  onSelectPage: PagesPanelProps["onSelect"];
  onPagesChange: (pages: StorePageRow[]) => void;
  previewProductSlug: string;
  onPreviewProductSlugChange: (slug: string) => void;
  previewCollectionSlug: string;
  onPreviewCollectionSlugChange: (slug: string) => void;
  previewBlogPostSlug: string;
  onPreviewBlogPostSlugChange: (slug: string) => void;
  draftNavigation: NavItem[];
  onNavigationChange: (items: NavItem[]) => void;
  onRequestDesignInsert: AddPanelProps["onRequestDesignInsert"];
  onInsertComponent: NonNullable<AddPanelProps["onInsertComponent"]>;
  draftLayout: HomeLayout;
  onReorderSections: LayersPanelProps["onReorder"];
  onRemoveSection: LayersPanelProps["onRemove"];
  onToggleSectionVisible: LayersPanelProps["onToggleVisible"];
  onAddSection: LayersPanelProps["onAdd"];
  onDuplicateSection: NonNullable<LayersPanelProps["onDuplicate"]>;
  onSaveAsComponent: NonNullable<LayersPanelProps["onSaveAsComponent"]>;
  onDetachComponent: NonNullable<LayersPanelProps["onDetachComponent"]>;
  onEditComponent: NonNullable<LayersPanelProps["onEditComponent"]>;
  componentNames: Record<string, string>;
  selectedSection: StoreSection | null;
  inspectorFocus: NonNullable<InspectorSettingsProps["inspectorFocus"]>;
  inspectorSettingsProps: InspectorSettingsProps;
  onUpdateSectionSettings: (sectionId: string, updates: Record<string, unknown>) => void;
  onSetA11yStatus: (status: string) => void;
  onPreviewWebsiteTemplate: (template: WebsiteTemplate) => void;
  onRequestApplyWebsiteTemplate: (template: WebsiteTemplate) => void;
  pendingWebsiteTemplateId: string | null;
  savedWebsiteTemplateId?: string | null;
  selectedTemplate: ThemeId;
  liveTheme: TemplatePickerProps["liveTemplate"];
  onSelectTemplate: (theme: ThemeId) => void;
  previewDraft: ComponentProps<typeof ThemeCustomizer>["draft"];
  onDraftChange: ComponentProps<typeof ThemeCustomizer>["onChange"];
}

export function EditorLeftPanel(props: EditorLeftPanelProps) {
  const {
    activeTab,
    onSelectTab,
    onClose,
    anyLayoutDirty,
    themeDirty,
    navigationDirty,
    isXl,
    mobileSettingsOpen,
    onMobileSettingsOpenChange,
    storeSlug,
    pages,
    activePage,
    onSelectPage,
    onPagesChange,
    previewProductSlug,
    onPreviewProductSlugChange,
    previewCollectionSlug,
    onPreviewCollectionSlugChange,
    previewBlogPostSlug,
    onPreviewBlogPostSlugChange,
    draftNavigation,
    onNavigationChange,
    onRequestDesignInsert,
    onInsertComponent,
    draftLayout,
    onReorderSections,
    onRemoveSection,
    onToggleSectionVisible,
    onAddSection,
    onDuplicateSection,
    onSaveAsComponent,
    onDetachComponent,
    onEditComponent,
    componentNames,
    selectedSection,
    inspectorFocus,
    inspectorSettingsProps,
    onUpdateSectionSettings,
    onSetA11yStatus,
    onPreviewWebsiteTemplate,
    onRequestApplyWebsiteTemplate,
    pendingWebsiteTemplateId,
    savedWebsiteTemplateId,
    selectedTemplate,
    liveTheme,
    onSelectTemplate,
    previewDraft,
    onDraftChange,
  } = props;

  return (
    <div className="flex h-full min-h-0 flex-row">
      <div className="flex w-14 shrink-0 flex-col items-center border-r border-neutral-200 bg-neutral-50/80 py-2">
        <div className="flex min-h-0 flex-1 flex-col items-center gap-0.5 overflow-y-auto">
          <LeftPanelRailButtons
            activeTab={activeTab}
            onSelectTab={onSelectTab}
            anyLayoutDirty={anyLayoutDirty}
            themeDirty={themeDirty}
            navigationDirty={navigationDirty}
          />
        </div>
        <EditorPanelCloseButton side="left" onClick={onClose} className="mb-1" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {activeTab === "pages" ? (
          <div className="editor-scroll-hidden min-h-0 flex-1 overflow-y-auto px-2 py-1.5">
            <EditorPagesPanel
              storeSlug={storeSlug}
              pages={pages}
              active={activePage}
              onSelect={onSelectPage}
              onPagesChange={onPagesChange}
              previewProductSlug={previewProductSlug}
              onPreviewProductSlugChange={onPreviewProductSlugChange}
              previewCollectionSlug={previewCollectionSlug}
              onPreviewCollectionSlugChange={onPreviewCollectionSlugChange}
              previewBlogPostSlug={previewBlogPostSlug}
              onPreviewBlogPostSlugChange={onPreviewBlogPostSlugChange}
            />
          </div>
        ) : null}

        {activeTab === "menu" ? (
          <div className="editor-scroll-hidden min-h-0 flex-1 overflow-y-auto px-2 py-1.5">
            <EditorNavigationPanel items={draftNavigation} onChange={onNavigationChange} />
          </div>
        ) : null}

        {activeTab === "add" ? (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-2 py-1.5">
            <BuilderAddPanel
              onRequestDesignInsert={onRequestDesignInsert}
              onInsertComponent={onInsertComponent}
            />
          </div>
        ) : null}

        {activeTab === "layers" ? (
          <div className="editor-scroll-hidden min-h-0 flex-1 overflow-y-auto px-2 py-1.5">
            <EditorLayersPanel
              sections={draftLayout.sections}
              onReorder={onReorderSections}
              onRemove={onRemoveSection}
              onToggleVisible={onToggleSectionVisible}
              onAdd={onAddSection}
              onDuplicate={onDuplicateSection}
              onSaveAsComponent={onSaveAsComponent}
              onDetachComponent={onDetachComponent}
              onEditComponent={onEditComponent}
              componentNames={componentNames}
            />
            {isXl === false ? (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => onMobileSettingsOpenChange(!mobileSettingsOpen)}
                  className="flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-left transition-colors hover:bg-neutral-100"
                >
                  <div>
                    <p className={dashboardKicker}>Inspector</p>
                    <p className="text-sm font-medium text-neutral-900">
                      {selectedSection
                        ? getSectionLabel(selectedSection.type)
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
                  <div className="mt-2 rounded-lg border border-neutral-200 bg-white p-3 shadow-sm">
                    <EditorSectionSettings {...inspectorSettingsProps} />
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ) : null}

        {activeTab === "templates" ? (
          <div className="editor-scroll-hidden min-h-0 flex-1 overflow-y-auto px-2 py-1.5">
            <WebsiteTemplatesPanel
              onPreview={onPreviewWebsiteTemplate}
              onApply={onRequestApplyWebsiteTemplate}
              activeTemplateId={pendingWebsiteTemplateId ?? savedWebsiteTemplateId}
            />
          </div>
        ) : null}

        {activeTab === "design" ? (
          <div className="editor-scroll-hidden min-h-0 flex-1 space-y-4 overflow-y-auto px-2 py-1.5">
            <div className="px-0.5">
              <p className="text-xs font-semibold text-neutral-800">Design</p>
              <p className="mt-0.5 text-[11px] text-neutral-400">
                Theme style, colors, and fonts for your storefront
              </p>
            </div>
            <EditorPanelSection label="Theme style" description="Minimal, Modern, or Bold">
              <ThemeEditorTemplatePicker
                selectedTemplate={selectedTemplate}
                liveTemplate={liveTheme}
                onSelect={onSelectTemplate}
              />
            </EditorPanelSection>
            <EditorPanelSection label="Colors & brand" description="Logo and color palette">
              <ThemeCustomizer
                draft={previewDraft}
                selectedTemplate={selectedTemplate}
                onChange={onDraftChange}
                embedded
                sections={["brand", "colors"]}
              />
            </EditorPanelSection>
            <EditorPanelSection label="Typography" description="Storefront font">
              <ThemeCustomizer
                draft={previewDraft}
                selectedTemplate={selectedTemplate}
                onChange={onDraftChange}
                embedded
                sections={["typography"]}
              />
            </EditorPanelSection>
          </div>
        ) : null}

        {activeTab === "assets" ? (
          <div className="editor-scroll-hidden min-h-0 flex-1 overflow-y-auto px-2 py-1.5">
            <MediaLibrary
              variant="sidebar"
              onSelect={(asset: MediaAsset) => {
                const section = selectedSection;
                const key = resolveImageSettingKey(section, inspectorFocus);
                if (!section || !key) {
                  toast.message("Select an image slot first", {
                    description: "Click an image in the preview or Layers, then pick an asset.",
                  });
                  return;
                }
                onUpdateSectionSettings(section.id, { [key]: asset.url });
                if (asset.alt) {
                  const altKey = key === "image" ? "alt" : `${key}Alt`;
                  const settings = section.settings as Record<string, unknown>;
                  if (settings[altKey] == null || settings[altKey] === "") {
                    onUpdateSectionSettings(section.id, { [altKey]: asset.alt });
                  }
                }
                toast.success("Image applied");
                onSetA11yStatus("Image applied to selected section");
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function EditorLeftRailIcons({
  activeTab,
  onSelectTab,
  anyLayoutDirty,
  themeDirty,
  navigationDirty,
}: {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  anyLayoutDirty: boolean;
  themeDirty: boolean;
  navigationDirty: boolean;
}) {
  return (
    <LeftPanelRailButtons
      activeTab={activeTab}
      onSelectTab={onSelectTab}
      anyLayoutDirty={anyLayoutDirty}
      themeDirty={themeDirty}
      navigationDirty={navigationDirty}
    />
  );
}
