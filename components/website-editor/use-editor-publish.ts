"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { markLaunchChecklistPublished } from "@/components/website-editor/editor-getting-started";
import { getEditorDirtyPageLabel } from "@/components/website-editor/editor-page-labels";
import type {
  PublishResumeState,
  PublishSnapshotListItem,
} from "@/components/website-editor/editor-shell-dialogs";
import type { PublishLayoutChange, PublishPreflightIssue } from "@/components/website-editor/editor-publish-panel";
import { diffLayouts } from "@/lib/builder/layout-diff";
import { clearLayoutDrafts } from "@/lib/builder/layout-draft-storage";
import { runPublishPreflight } from "@/lib/builder/publish-preflight";
import { fetchWithRetry } from "@/lib/builder/publish-retry";
import type { EditorPageTarget } from "@/lib/builder/editor-types";
import type { NavItem } from "@/lib/navigation";
import type { StorePageRow } from "@/lib/pages";
import { updatePageContentLayout } from "@/lib/page-layout";
import type { HomeLayout } from "@/lib/sections/types";
import type { ThemeId } from "@/lib/themes";
import type { StoreThemeSettings } from "@/types/storefront";
import type { StoreThemeData } from "@/types/theme";
import { ensureTemplateLayouts, useCentralBuilderStore } from "@/lib/website-layout-store";

type PreviewDraft = StoreThemeSettings;

export function useEditorPublish({
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
  storeId,
  initialLayoutRevision,
  initFromStore,
  initTemplateLayouts,
  switchPage,
  syncActivePageToCache,
  commitSavedLayouts,
  setPreviewKey,
  setDraftSaveStatus,
  setLastDraftSavedAt,
  setA11yStatus,
}: {
  pages: StorePageRow[];
  setPages: Dispatch<SetStateAction<StorePageRow[]>>;
  saved: StoreThemeData;
  setSaved: Dispatch<SetStateAction<StoreThemeData>>;
  draftNavigation: NavItem[];
  setDraftNavigation: Dispatch<SetStateAction<NavItem[]>>;
  savedNavigation: NavItem[];
  setSavedNavigation: Dispatch<SetStateAction<NavItem[]>>;
  previewDraft: PreviewDraft;
  themeDirty: boolean;
  navigationDirty: boolean;
  dirty: boolean;
  pendingWebsiteTemplateId: string | null;
  setPendingWebsiteTemplateId: Dispatch<SetStateAction<string | null>>;
  draftLayout: HomeLayout;
  activePage: EditorPageTarget;
  storeId?: string;
  initialLayoutRevision: number;
  initFromStore: (settings: StoreThemeSettings & { theme: string }) => void;
  initTemplateLayouts: (
    layouts: ReturnType<typeof ensureTemplateLayouts>,
    pages: StorePageRow[],
    theme: ThemeId
  ) => void;
  switchPage: (target: EditorPageTarget) => void;
  syncActivePageToCache: () => void;
  commitSavedLayouts: () => void;
  setPreviewKey: Dispatch<SetStateAction<number>>;
  setDraftSaveStatus: (status: "idle" | "saving" | "saved" | "error") => void;
  setLastDraftSavedAt: (at: number | null) => void;
  setA11yStatus: (status: string) => void;
}) {
  const [publishing, setPublishing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [publishSuccessOpen, setPublishSuccessOpen] = useState(false);
  const [lastPublishSummary, setLastPublishSummary] = useState<string | null>(null);
  const [layoutRevision, setLayoutRevision] = useState(initialLayoutRevision);
  const [revisionConflictOpen, setRevisionConflictOpen] = useState(false);
  const forceLayoutOverwriteRef = useRef(false);
  const [catalogIds, setCatalogIds] = useState<{
    productIds: Set<string>;
    collectionIds: Set<string>;
    mediaUrls: Set<string>;
  } | null>(null);
  const [publishSnapshotsOpen, setPublishSnapshotsOpen] = useState(false);
  const [publishSnapshotList, setPublishSnapshotList] = useState<PublishSnapshotListItem[]>([]);
  const [restoringSnapshot, setRestoringSnapshot] = useState(false);
  const [publishResume, setPublishResume] = useState<PublishResumeState | null>(null);

  const pageLayoutCache = useCentralBuilderStore((s) => s.pageLayoutCache);
  const anyLayoutDirty = useCentralBuilderStore((s) => s.isDirty());
  const getDirtyPageKeys = useCentralBuilderStore((s) => s.getDirtyPageKeys);

  const publishLayoutChanges = useMemo((): PublishLayoutChange[] => {
    const changes: PublishLayoutChange[] = [];
    const keys = getDirtyPageKeys();

    for (const key of keys) {
      const snapshot = pageLayoutCache[key];
      const sectionDiffs = diffLayouts(snapshot?.draft, snapshot?.saved);
      const pageLabel = getEditorDirtyPageLabel(key, pages);

      if (sectionDiffs.length === 0) {
        changes.push({
          label: pageLabel,
          detail: "Layout updated",
          pageKey: key,
        });
        continue;
      }

      for (const diff of sectionDiffs) {
        changes.push({
          label: `${pageLabel} · ${diff.label}`,
          detail: diff.detail,
          sectionId: diff.kind === "reordered" ? undefined : diff.sectionId,
          pageKey: key,
        });
      }
    }
    return changes;
  }, [anyLayoutDirty, pageLayoutCache, pages, getDirtyPageKeys]);

  const preflightIssues = useMemo((): PublishPreflightIssue[] => {
    const keys = getDirtyPageKeys();
    const pagesToCheck = keys.map((key) => {
      const snapshot = pageLayoutCache[key];
      const label = getEditorDirtyPageLabel(key, pages);
      return {
        key,
        label,
        layout: snapshot?.draft ?? { version: 1 as const, sections: [] },
      };
    });
    return runPublishPreflight(pagesToCheck, catalogIds ?? undefined).map((issue) => ({
      level: issue.level,
      message: issue.message,
      sectionId: issue.sectionId,
    }));
  }, [anyLayoutDirty, pageLayoutCache, pages, getDirtyPageKeys, catalogIds]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [productsRes, collectionsRes, mediaRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/collections"),
          fetch("/api/media"),
        ]);
        const productsData = productsRes.ok
          ? ((await productsRes.json()) as { products?: { id: string }[] })
          : { products: [] };
        const collectionsData = collectionsRes.ok
          ? ((await collectionsRes.json()) as { collections?: { id: string }[] })
          : { collections: [] };
        const mediaData = mediaRes.ok
          ? ((await mediaRes.json()) as { assets?: { url?: string }[] })
          : { assets: [] };
        if (cancelled) return;
        setCatalogIds({
          productIds: new Set((productsData.products ?? []).map((p) => p.id)),
          collectionIds: new Set((collectionsData.collections ?? []).map((c) => c.id)),
          mediaUrls: new Set(
            (mediaData.assets ?? [])
              .map((a) => a.url)
              .filter((u): u is string => typeof u === "string" && u.length > 0)
          ),
        });
      } catch {
        // preflight still works without catalog
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
    if (storeId) clearLayoutDrafts(storeId);
    setDraftSaveStatus("idle");
    setLastDraftSavedAt(null);
    setDiscardOpen(false);
    toast.message("Changes discarded");
  };

  const publish = async () => {
    const hadThemeChanges = themeDirty;
    const hadNavigationChanges = navigationDirty;

    syncActivePageToCache();
    const dirtyKeys = getDirtyPageKeys();
    const layoutCache = useCentralBuilderStore.getState().pageLayoutCache;
    const homeDirty = dirtyKeys.includes("home");
    const productDirty = dirtyKeys.includes("product");
    const collectionDirty = dirtyKeys.includes("collection");
    const blogPostDirty = dirtyKeys.includes("blog-post");
    const customPageDirtyKeys = dirtyKeys.filter((k) => k.startsWith("page:"));

    setPublishing(true);
    const completedSteps: string[] = [];
    try {
      type Step = { label: string; run: () => Promise<Response> };
      const steps: Step[] = [
        {
          label: "theme",
          run: () =>
            fetchWithRetry("/api/store/theme", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                theme: previewDraft.theme,
                primaryColor: previewDraft.primaryColor,
                secondaryColor: previewDraft.secondaryColor,
                font: previewDraft.font,
                logo: previewDraft.logo ?? null,
                textColor: previewDraft.textColor ?? null,
                mutedColor: previewDraft.mutedColor ?? null,
                borderColor: previewDraft.borderColor ?? null,
                buttonRadius: previewDraft.buttonRadius ?? null,
                ...(pendingWebsiteTemplateId
                  ? { websiteTemplateId: pendingWebsiteTemplateId }
                  : {}),
              }),
            }),
        },
      ];

      let bumpedRevision = false;
      const layoutBody = (field: string, layout: HomeLayout | undefined) => ({
        field,
        layout,
        ...(bumpedRevision
          ? { bumpRevision: false }
          : forceLayoutOverwriteRef.current
            ? { bumpRevision: true }
            : { expectedRevision: layoutRevision, bumpRevision: true }),
      });

      if (homeDirty) {
        steps.push({
          label: "home layout",
          run: () =>
            fetchWithRetry("/api/store/layout", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(
                layoutBody("home", layoutCache.home?.draft ?? draftLayout)
              ),
            }),
        });
      }
      if (productDirty) {
        steps.push({
          label: "product layout",
          run: () =>
            fetchWithRetry("/api/store/layout", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(layoutBody("product", layoutCache.product?.draft)),
            }),
        });
      }
      if (collectionDirty) {
        steps.push({
          label: "collection layout",
          run: () =>
            fetchWithRetry("/api/store/layout", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(
                layoutBody("collection", layoutCache.collection?.draft)
              ),
            }),
        });
      }
      if (blogPostDirty) {
        steps.push({
          label: "blog post layout",
          run: () =>
            fetchWithRetry("/api/store/layout", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(
                layoutBody("blog-post", layoutCache["blog-post"]?.draft)
              ),
            }),
        });
      }

      for (const key of customPageDirtyKeys) {
        const pageId = key.slice("page:".length);
        const page = pages.find((p) => p.id === pageId);
        const pageLayout = layoutCache[key]?.draft;
        if (!page || !pageLayout) continue;
        steps.push({
          label: `page “${page.title}”`,
          run: () =>
            fetchWithRetry(`/api/pages/${pageId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                content: updatePageContentLayout(page.content, pageLayout),
                status: "published",
              }),
            }),
        });
      }

      if (hadNavigationChanges) {
        steps.push({
          label: "navigation",
          run: () =>
            fetchWithRetry("/api/navigation", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items: draftNavigation }),
            }),
        });
      }

      const responses: Response[] = [];
      for (const step of steps) {
        const res = await step.run();
        if (step.label.includes("layout") && !bumpedRevision && res.ok) {
          bumpedRevision = true;
        }
        if (!res.ok) {
          const data = await res
            .json()
            .catch(() => ({} as { message?: string; code?: string; revision?: number }));
          if (res.status === 409 || data.code === "LAYOUT_REVISION_CONFLICT") {
            if (typeof data.revision === "number") setLayoutRevision(data.revision);
            setRevisionConflictOpen(true);
            setConfirmOpen(false);
            if (completedSteps.length > 0) {
              const failedIdx = steps.findIndex((s) => s.label === step.label);
              setPublishResume({
                completed: [...completedSteps],
                failed: step.label,
                pending: steps.slice(failedIdx + 1).map((s) => s.label),
              });
              toast.message("Partial publish", {
                description: `Already live: ${completedSteps.join(", ")}. Resolve the conflict, then retry the rest.`,
              });
            }
            return;
          }
          const failedIdx = steps.findIndex((s) => s.label === step.label);
          setPublishResume({
            completed: [...completedSteps],
            failed: step.label,
            pending: steps.slice(failedIdx + 1).map((s) => s.label),
          });
          const prefix =
            completedSteps.length > 0
              ? `Published ${completedSteps.join(", ")}, then failed on ${step.label}: `
              : "";
          throw new Error(`${prefix}${data.message ?? `Failed to publish ${step.label}`}`);
        }
        completedSteps.push(step.label);
        responses.push(res);
      }

      const themeRes = responses[0]!;
      let responseIdx = 1;
      const layoutRes = homeDirty ? responses[responseIdx++] : null;
      const productLayoutRes = productDirty ? responses[responseIdx++] : null;
      const collectionLayoutRes = collectionDirty ? responses[responseIdx++] : null;
      const blogPostLayoutRes = blogPostDirty ? responses[responseIdx++] : null;
      const pageStepCount = steps.filter((s) => s.label.startsWith("page ")).length;
      const pageResponses = Array.from({ length: pageStepCount }, () => responses[responseIdx++]);
      const navigationRes = hadNavigationChanges ? responses[responseIdx] : null;
      void blogPostLayoutRes;
      void navigationRes;

      const { store: updated } = await themeRes.json();
      let homeLayout = saved.homeLayout;
      let productLayout = saved.productLayout;
      let collectionLayout = saved.collectionLayout;
      if (layoutRes) {
        const { layout, revision } = await layoutRes.json();
        homeLayout = layout;
        if (typeof revision === "number") setLayoutRevision(revision);
      }
      if (productLayoutRes) {
        const { layout, revision } = await productLayoutRes.json();
        productLayout = layout;
        if (typeof revision === "number") setLayoutRevision(revision);
      }
      if (collectionLayoutRes) {
        const { layout, revision } = await collectionLayoutRes.json();
        collectionLayout = layout;
        if (typeof revision === "number") setLayoutRevision(revision);
      }

      let nextPages = pages;
      for (let i = 0; i < pageResponses.length; i++) {
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
        textColor: updated.textColor ?? undefined,
        mutedColor: updated.mutedColor ?? undefined,
        borderColor: updated.borderColor ?? undefined,
        buttonRadius: updated.buttonRadius ?? undefined,
        websiteTemplateId:
          (pendingWebsiteTemplateId as StoreThemeData["websiteTemplateId"]) ??
          saved.websiteTemplateId,
        homeLayout,
        productLayout,
        collectionLayout,
        updatedAt: new Date().toISOString(),
      };

      setSaved(newSaved);
      setPendingWebsiteTemplateId(null);
      setPages(nextPages);
      initFromStore({
        theme: newSaved.theme,
        primaryColor: newSaved.primaryColor,
        secondaryColor: newSaved.secondaryColor,
        font: newSaved.font,
        logo: newSaved.logo,
        textColor: newSaved.textColor,
        mutedColor: newSaved.mutedColor,
        borderColor: newSaved.borderColor,
        buttonRadius: newSaved.buttonRadius,
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
      if (storeId) clearLayoutDrafts(storeId);
      setDraftSaveStatus("idle");
      setLastDraftSavedAt(null);
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
      if (blogPostDirty) {
        summaryParts.push("blog post template");
      }
      if (customPageDirtyKeys.length > 0) {
        summaryParts.push(
          `${customPageDirtyKeys.length} page layout${customPageDirtyKeys.length === 1 ? "" : "s"}`
        );
      }
      if (hadNavigationChanges) summaryParts.push("navigation");
      const summary =
        summaryParts.length > 0 ? summaryParts.join(" and ") : "your website";
      setLastPublishSummary(summary);
      setPublishSuccessOpen(true);
      setPublishResume(null);
      markLaunchChecklistPublished();
      forceLayoutOverwriteRef.current = false;
      setA11yStatus(`Published: ${summary}`);
      toast.success("Published", {
        description: `Live store updated: ${summary}.`,
      });

      const snapshotLayouts: Partial<Record<string, HomeLayout>> = {};
      if (homeDirty) snapshotLayouts.home = layoutCache.home?.draft ?? draftLayout;
      if (productDirty && layoutCache.product?.draft) {
        snapshotLayouts.product = layoutCache.product.draft;
      }
      if (collectionDirty && layoutCache.collection?.draft) {
        snapshotLayouts.collection = layoutCache.collection.draft;
      }
      if (blogPostDirty && layoutCache["blog-post"]?.draft) {
        snapshotLayouts["blog-post"] = layoutCache["blog-post"].draft;
      }
      void fetch("/api/store/publish-snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record",
          snapshot: {
            id:
              typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `snap-${Date.now()}`,
            revision:
              layoutRevision +
              (homeDirty || productDirty || collectionDirty || blogPostDirty ? 1 : 0),
            createdAt: new Date().toISOString(),
            summary,
            layouts: Object.keys(snapshotLayouts).length > 0 ? snapshotLayouts : undefined,
            ...(hadThemeChanges
              ? {
                  theme: {
                    theme: previewDraft.theme,
                    primaryColor: previewDraft.primaryColor,
                    secondaryColor: previewDraft.secondaryColor,
                    font: previewDraft.font,
                    logo: previewDraft.logo ?? null,
                  },
                }
              : {}),
            ...(hadNavigationChanges ? { navigation: draftNavigation } : {}),
          },
        }),
      }).catch(() => undefined);
    } catch (error) {
      forceLayoutOverwriteRef.current = false;
      setA11yStatus("Publish failed");
      toast.error(error instanceof Error ? error.message : "Failed to go live");
    } finally {
      setPublishing(false);
      setConfirmOpen(false);
    }
  };

  const handlePublishClick = useCallback(() => {
    setConfirmOpen(true);
  }, []);

  const handleOverwriteLive = () => {
    forceLayoutOverwriteRef.current = true;
    setRevisionConflictOpen(false);
    setPublishResume(null);
    void publish();
  };

  return {
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
  };
}
