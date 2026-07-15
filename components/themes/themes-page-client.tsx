"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CurrentThemeCard } from "@/components/themes/current-theme-card";
import { ThemeLibraryGrid } from "@/components/themes/theme-library-grid";
import { ThemeDevicePreview } from "@/components/themes/theme-device-preview";
import { FullscreenPreview } from "@/components/themes/fullscreen-preview";
import { ThemesBrief } from "@/components/themes/themes-brief";
import { ThemeActionBar } from "@/components/themes/theme-action-bar";
import { OnlineStorePageShell } from "@/components/online-store/online-store-page-shell";
import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
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
import type { StoreThemeData, PreviewPaths } from "@/types/theme";

interface ThemesPageClientProps {
  store: StoreThemeData;
  previewPaths: PreviewPaths;
}

export function ThemesPageClient({ store: initialStore, previewPaths }: ThemesPageClientProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialStore);
  const [previewKey, setPreviewKey] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
    [saved, draft, selectedTemplate]
  );

  const dirty = useMemo(
    () => isThemeDirty(saved, draft, selectedTemplate),
    [saved, draft, selectedTemplate]
  );

  const themeChanged = saved.theme !== selectedTemplate;
  const liveTemplate = THEME_TEMPLATES.find((t) => t.id === saved.theme);
  const activeTemplate = THEME_TEMPLATES.find((t) => t.id === selectedTemplate);
  const brandProgress = useMemo(() => getBrandProgress(previewDraft), [previewDraft]);

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

  const briefMessage = dirty
    ? "You have unpublished theme changes. Preview them below, then publish to update your live storefront."
    : `${liveTemplate?.name ?? "Theme"} is live on your store. Customers see this design right now.`;

  return (
    <OnlineStorePageShell>
      <ThemesBrief
        message={briefMessage}
        tone={dirty ? "attention" : "positive"}
        brandProgress={brandProgress}
        liveTemplateName={liveTemplate?.name ?? "Theme"}
        hasUnpublishedChanges={dirty}
      />

      {dirty && (
        <ThemeActionBar
          publishing={publishing}
          onDiscard={handleDiscard}
          onPublish={handlePublishClick}
        />
      )}

      <ThemeDevicePreview
        storeSlug={saved.slug}
        draft={previewDraft}
        previewPaths={previewPaths}
        refreshKey={previewKey}
        onFullscreen={() => setPreviewOpen(true)}
      />

      <CurrentThemeCard
        themeId={saved.theme}
        storeSlug={saved.slug}
        updatedAt={saved.updatedAt}
        onCustomize={openEditor}
      />

      <DashboardSectionHeader
        title="Theme library"
        description="Free themes built for commerce — try any template and publish when you're ready."
      />

      <ThemeLibraryGrid
        selectedTemplate={selectedTemplate}
        liveTemplate={saved.theme}
        onSelect={handleSelectTemplate}
        onCustomizeLive={openEditor}
      />

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
              You&apos;re changing your store template from{" "}
              <strong>{liveTemplate?.name}</strong> to <strong>{activeTemplate?.name}</strong>.
              Your layout will update and customers will see the new design once you publish.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={publish} loading={publishing} className="bg-[#007AFF] hover:bg-[#0071EB]">
              Publish changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OnlineStorePageShell>
  );
}
