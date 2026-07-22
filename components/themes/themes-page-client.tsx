"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ThemesHero } from "@/components/themes/themes-hero";
import { ThemesWebsiteGallery } from "@/components/themes/themes-website-gallery";
import { ThemesBrandPanel } from "@/components/themes/themes-brand-panel";
import { ThemeDevicePreview } from "@/components/themes/theme-device-preview";
import { FullscreenPreview } from "@/components/themes/fullscreen-preview";
import { ThemeActionBar } from "@/components/themes/theme-action-bar";
import { OnlineStorePageShell } from "@/components/online-store/online-store-page-shell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/lib/theme-store";
import { THEME_TEMPLATES, type ThemeId } from "@/lib/themes";
import {
  getBrandProgress,
  getTemplateDefaults,
  isThemeDirty,
  resolveThemeDraft,
} from "@/lib/theme-utils";
import { isWebsiteTemplateId } from "@/lib/website-templates/registry";
import type { WebsiteTemplate, WebsiteTemplateId } from "@/lib/website-templates/types";
import type { StoreThemeData, PreviewPaths } from "@/types/theme";

interface ThemesPageClientProps {
  store: StoreThemeData;
  previewPaths: PreviewPaths;
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ThemesPageClient({ store: initialStore, previewPaths }: ThemesPageClientProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialStore);
  const [previewKey, setPreviewKey] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [applyingTemplateId, setApplyingTemplateId] = useState<WebsiteTemplateId | null>(null);

  const {
    draft,
    selectedTemplate,
    previewOpen,
    setDraft,
    setSelectedTemplate,
    setPreviewOpen,
    initFromStore,
  } = useThemeStore();

  useEffect(() => {
    initFromStore({
      theme: initialStore.theme,
      primaryColor: initialStore.primaryColor,
      secondaryColor: initialStore.secondaryColor,
      font: initialStore.font,
      logo: initialStore.logo,
    });
  }, [initialStore, initFromStore]);

  const previewDraft = useMemo(
    () => resolveThemeDraft(saved, draft, selectedTemplate),
    [saved, draft, selectedTemplate],
  );

  const dirty = useMemo(
    () => isThemeDirty(saved, draft, selectedTemplate),
    [saved, draft, selectedTemplate],
  );

  const themeChanged = saved.theme !== selectedTemplate;
  const liveTemplate = THEME_TEMPLATES.find((t) => t.id === saved.theme);
  const activeTemplate = THEME_TEMPLATES.find((t) => t.id === selectedTemplate);
  const brandProgress = useMemo(() => getBrandProgress(previewDraft), [previewDraft]);

  const activeWebsiteTemplateId: WebsiteTemplateId | null =
    saved.websiteTemplateId && isWebsiteTemplateId(saved.websiteTemplateId)
      ? saved.websiteTemplateId
      : null;

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

  const openEditor = () => router.push("/dashboard/themes/editor");

  const handleSelectTemplate = (theme: ThemeId) => {
    setSelectedTemplate(theme);
    setDraft(getTemplateDefaults(theme));
  };

  const handleDiscard = () => {
    initFromStore({
      theme: saved.theme,
      primaryColor: saved.primaryColor,
      secondaryColor: saved.secondaryColor,
      font: saved.font,
      logo: saved.logo,
    });
    toast.message("Changes discarded");
  };

  const publish = async () => {
    setPublishing(true);
    try {
      const res = await fetch("/api/store/theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: previewDraft.theme,
          primaryColor: previewDraft.primaryColor,
          secondaryColor: previewDraft.secondaryColor,
          font: previewDraft.font,
          logo: previewDraft.logo ?? null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to publish");
      }

      const { store: updated } = await res.json();
      const newSaved: StoreThemeData = {
        ...saved,
        logo: updated.logo,
        theme: updated.theme as ThemeId,
        primaryColor: updated.primaryColor,
        secondaryColor: updated.secondaryColor,
        font: updated.font,
        updatedAt: new Date().toISOString(),
      };

      setSaved(newSaved);
      initFromStore({
        theme: newSaved.theme,
        primaryColor: newSaved.primaryColor,
        secondaryColor: newSaved.secondaryColor,
        font: newSaved.font,
        logo: newSaved.logo,
      });
      setPreviewKey((k) => k + 1);
      toast.success("Theme published to your store");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to publish");
    } finally {
      setPublishing(false);
      setConfirmOpen(false);
    }
  };

  const handlePublishClick = () => {
    if (themeChanged) {
      setConfirmOpen(true);
      return;
    }
    publish();
  };

  const handleApplyWebsiteTemplate = async (template: WebsiteTemplate) => {
    setApplyingTemplateId(template.id);
    try {
      const res = await fetch("/api/store/website-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to apply template");
      }
      const data = await res.json();
      const newSaved: StoreThemeData = {
        ...saved,
        theme: data.store.theme as ThemeId,
        primaryColor: data.store.primaryColor,
        secondaryColor: data.store.secondaryColor,
        font: data.store.font,
        websiteTemplateId: data.store.websiteTemplateId,
        updatedAt: new Date().toISOString(),
      };
      setSaved(newSaved);
      initFromStore({
        theme: newSaved.theme,
        primaryColor: newSaved.primaryColor,
        secondaryColor: newSaved.secondaryColor,
        font: newSaved.font,
        logo: newSaved.logo,
      });
      setPreviewKey((k) => k + 1);
      toast.success(`${template.name} is now live on your store`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to apply template");
    } finally {
      setApplyingTemplateId(null);
    }
  };

  return (
    <OnlineStorePageShell>
      <ThemesHero
        storeSlug={saved.slug}
        themeId={saved.theme}
        websiteTemplateId={activeWebsiteTemplateId}
        primaryColor={previewDraft.primaryColor ?? saved.primaryColor}
        secondaryColor={previewDraft.secondaryColor ?? saved.secondaryColor}
        font={previewDraft.font ?? saved.font}
        updatedAt={saved.updatedAt}
        brandProgress={brandProgress}
        dirty={dirty}
        onOpenEditor={openEditor}
        onScrollToBrand={() => scrollToId("themes-brand")}
        onScrollToDesigns={() => scrollToId("themes-designs")}
      />

      <div id="themes-preview" className="scroll-mt-24">
        <ThemeDevicePreview
          storeSlug={saved.slug}
          draft={previewDraft}
          previewPaths={previewPaths}
          refreshKey={previewKey}
          onFullscreen={() => setPreviewOpen(true)}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] xl:items-start">
        <ThemesWebsiteGallery
          activeTemplateId={activeWebsiteTemplateId}
          applyingId={applyingTemplateId}
          onApply={handleApplyWebsiteTemplate}
        />
        <ThemesBrandPanel
          primaryColor={previewDraft.primaryColor ?? saved.primaryColor}
          secondaryColor={previewDraft.secondaryColor ?? saved.secondaryColor}
          font={previewDraft.font ?? saved.font}
          selectedTemplate={selectedTemplate}
          liveTemplate={saved.theme}
          onPrimaryChange={(primaryColor) => setDraft({ primaryColor })}
          onSecondaryChange={(secondaryColor) => setDraft({ secondaryColor })}
          onFontChange={(font) => setDraft({ font })}
          onSelectStyle={handleSelectTemplate}
        />
      </div>

      {dirty ? (
        <ThemeActionBar
          publishing={publishing}
          onDiscard={handleDiscard}
          onPublish={handlePublishClick}
        />
      ) : null}

      <FullscreenPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        storeSlug={saved.slug}
        draft={previewDraft}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch to {activeTemplate?.name}?</DialogTitle>
            <DialogDescription>
              You&apos;re changing your store style from{" "}
              <strong>{liveTemplate?.name}</strong> to <strong>{activeTemplate?.name}</strong>.
              Customers will see the new look once you publish.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={publish}
              loading={publishing}
              className="bg-[#007AFF] hover:bg-[#0071EB]"
            >
              Publish changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OnlineStorePageShell>
  );
}
