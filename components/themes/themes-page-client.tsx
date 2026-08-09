"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Pencil } from "lucide-react";
import { toast } from "sonner";
import { ThemeStorefrontPreview } from "@/components/themes/theme-storefront-preview";
import { ThemeShareFeature } from "@/components/themes/theme-share-feature";
import { ThemesWebsiteGallery } from "@/components/themes/themes-website-gallery";
import { ThemesAiDesignsSection } from "@/components/themes/themes-ai-designs-section";
import { OnlineStorePageShell } from "@/components/online-store/online-store-page-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useThemeStore } from "@/lib/theme-store";
import { THEME_TEMPLATES, type ThemeId } from "@/lib/themes";
import { isThemeDirty, resolveThemeDraft } from "@/lib/theme-utils";
import { isWebsiteTemplateId } from "@/lib/website-templates/registry";
import type { WebsiteTemplate, WebsiteTemplateId } from "@/lib/website-templates/types";
import { getAbsoluteStoreUrl } from "@/lib/storefront-urls";
import type { StoreThemeData, PreviewPaths } from "@/types/theme";
import { dashboardPrimaryBtn } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

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
  const [applyingId, setApplyingId] = useState<WebsiteTemplateId | null>(null);

  const { draft, selectedTemplate, initFromStore } = useThemeStore();

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

  const activeWebsiteId =
    saved.websiteTemplateId && isWebsiteTemplateId(saved.websiteTemplateId)
      ? saved.websiteTemplateId
      : null;

  const storeUrl = getAbsoluteStoreUrl(saved.slug);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

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
      toast.success("Published to your store");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to publish");
    } finally {
      setPublishing(false);
      setConfirmOpen(false);
    }
  };

  const handlePublish = () => {
    if (!dirty) {
      toast.message("Already up to date");
      return;
    }
    if (themeChanged) {
      setConfirmOpen(true);
      return;
    }
    void publish();
  };

  const handleApplyTemplate = async (template: WebsiteTemplate) => {
    setApplyingId(template.id);
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
      const nextTheme = template.theme.theme;
      const nextPrimary = template.theme.primaryColor;
      const nextSecondary = template.theme.secondaryColor;
      const nextFont = template.theme.font;
      setSaved((prev) => ({
        ...prev,
        websiteTemplateId: template.id,
        theme: nextTheme,
        primaryColor: nextPrimary,
        secondaryColor: nextSecondary,
        font: nextFont,
      }));
      initFromStore({
        theme: nextTheme,
        primaryColor: nextPrimary,
        secondaryColor: nextSecondary,
        font: nextFont,
        logo: saved.logo,
      });
      setPreviewKey((k) => k + 1);
      toast.success(`${template.name} is live on your store`);
      router.refresh();
      document
        .getElementById("themes-preview")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to apply template");
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <OnlineStorePageShell>
      <div className="space-y-5">
        <div id="themes-preview" className="scroll-mt-4">
          <ThemeStorefrontPreview
            storeSlug={saved.slug}
            draft={previewDraft}
            previewPaths={previewPaths}
            refreshKey={previewKey}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            className={cn(dashboardPrimaryBtn, "h-7 px-2.5")}
            onClick={() => router.push("/dashboard/themes/editor")}
          >
            <Pencil className="mr-1.5 h-3 w-3" />
            Customize
          </Button>
          <Button
            variant="outline"
            className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] shadow-none dark:border-white/10"
            loading={publishing}
            disabled={publishing}
            onClick={handlePublish}
          >
            {publishing ? "Publishing…" : dirty ? "Publish" : "Published"}
          </Button>
          <Button
            variant="outline"
            className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] shadow-none dark:border-white/10"
            onClick={() =>
              document.getElementById("themes-designs")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }
          >
            Templates
          </Button>
          <Button
            variant="outline"
            className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] shadow-none dark:border-white/10"
            asChild
          >
            <a href={storeUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-3 w-3" />
              View store
            </a>
          </Button>
        </div>

        <ThemeShareFeature storeSlug={saved.slug} storeName={saved.name} />

        <ThemesWebsiteGallery
          activeTemplateId={activeWebsiteId}
          applyingId={applyingId}
          onApply={handleApplyTemplate}
        />

      <ThemesAiDesignsSection storeSlug={saved.slug} />
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="rounded-[14px] border-black/[0.06] dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-[15px] tracking-[-0.02em]">
              Switch to {activeTemplate?.name}?
            </DialogTitle>
            <DialogDescription className="text-[12px]">
              Changing from {liveTemplate?.name} to {activeTemplate?.name}. Customers see it after
              publish.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="h-7 rounded-md text-[11px]"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className={cn(dashboardPrimaryBtn, "h-7 px-2.5")}
              loading={publishing}
              onClick={() => void publish()}
            >
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OnlineStorePageShell>
  );
}
