"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Check, ExternalLink, Loader2, RotateCcw } from "lucide-react";
import { ThemeCustomizer } from "@/components/themes/theme-customizer";
import { ThemeEditorTemplatePicker } from "@/components/themes/theme-editor-template-picker";
import { ThemeDevicePreview } from "@/components/themes/theme-device-preview";
import { FullscreenPreview } from "@/components/themes/fullscreen-preview";
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
import { isThemeDirty, resolveThemeDraft, getTemplateDefaults } from "@/lib/theme-utils";
import { dashboardGlassHeader } from "@/lib/dashboard-ui";
import type { StoreThemeData, PreviewPaths } from "@/types/theme";

interface ThemeEditorClientProps {
  store: StoreThemeData;
  previewPaths: PreviewPaths;
}

export function ThemeEditorClient({ store: initialStore, previewPaths }: ThemeEditorClientProps) {
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

  const handleDraftChange = useCallback(
    (updates: Partial<typeof draft>) => setDraft(updates),
    [setDraft]
  );

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
      toast.success("Theme published");
      router.push("/dashboard/themes");
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

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <header className={dashboardGlassHeader}>
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="shrink-0 rounded-xl" asChild>
              <Link href="/dashboard/themes">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-base font-semibold tracking-[-0.03em]">
                Theme editor · {activeTemplate?.name}
              </h1>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {dirty ? (
                  <>
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                    Unsaved changes
                  </>
                ) : (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    All changes saved
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden gap-1.5 rounded-lg sm:inline-flex" asChild>
              <Link href={`/store/${saved.slug}`} target="_blank">
                <ExternalLink className="h-3.5 w-3.5" />
                View store
              </Link>
            </Button>
            {dirty && (
              <Button variant="ghost" size="sm" onClick={handleDiscard} className="gap-1.5 rounded-lg">
                <RotateCcw className="h-3.5 w-3.5" />
                Discard
              </Button>
            )}
            <Button
              size="sm"
              onClick={handlePublishClick}
              disabled={!dirty || publishing}
              className="gap-1.5 rounded-xl premium-glow-blue bg-[#007AFF] hover:bg-[#0071EB]"
            >
              {publishing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Publishing…
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Publish
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col xl:flex-row">
        <aside className="w-full shrink-0 border-b xl:w-[380px] xl:border-b-0 xl:border-r">
          <div className="space-y-6 p-4 sm:p-5">
            <ThemeEditorTemplatePicker
              selectedTemplate={selectedTemplate}
              liveTemplate={saved.theme}
              onSelect={handleSelectTemplate}
            />
            <ThemeCustomizer
              draft={previewDraft}
              selectedTemplate={selectedTemplate}
              onChange={handleDraftChange}
              embedded
            />
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6">
          <ThemeDevicePreview
            storeSlug={saved.slug}
            draft={previewDraft}
            previewPaths={previewPaths}
            refreshKey={previewKey}
            onFullscreen={() => setPreviewOpen(true)}
            embedded
          />
        </main>
      </div>

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
              You&apos;re changing from <strong>{liveTemplate?.name}</strong> to{" "}
              <strong>{activeTemplate?.name}</strong>. Publish to make it live.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={publish} loading={publishing} className="bg-[#007AFF]">
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
