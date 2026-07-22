"use client";

import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditorBlockDesignGallery } from "@/components/website-editor/editor-block-design-gallery";
import { SaveComponentDialog } from "@/components/website-editor/save-component-dialog";
import {
  EditorPublishPanel,
  type PublishLayoutChange,
  type PublishPreflightIssue,
} from "@/components/website-editor/editor-publish-panel";
import { WebsiteTemplatePreviewDialog } from "@/components/website-templates/website-template-preview-dialog";
import { WebsiteTemplateApplyDialog } from "@/components/website-templates/website-template-apply-dialog";
import { getAbsoluteStoreUrl, getStoreUrl } from "@/lib/storefront-urls";
import { type LayoutDraftBundle } from "@/lib/builder/layout-draft-storage";
import type { BlockDesignPreset } from "@/lib/builder/block-design-presets";
import type { ApplyDesignMode } from "@/lib/builder/apply-design-preset";
import type { BlockId } from "@/lib/builder/types";
import type { NavItem } from "@/lib/navigation";
import type { StorePageRow } from "@/lib/pages";
import type { ThemeId } from "@/lib/themes";
import type { HomeLayout } from "@/lib/sections/types";
import type { WebsiteTemplate } from "@/lib/website-templates";
import type { PreviewPaths } from "@/types/theme";

export type PublishSnapshotListItem = {
  id: string;
  revision: number;
  createdAt: string;
  summary: string;
  hasLayouts?: boolean;
  hasTheme?: boolean;
  hasNavigation?: boolean;
};

export type PublishResumeState = {
  completed: string[];
  failed: string;
  pending: string[];
};

export type PendingDesignInsert = {
  blockId: BlockId;
  insertIndex?: number;
};

export interface EditorShellDialogsProps {
  storeSlug: string;
  storeId?: string;
  previewPaths: PreviewPaths;
  pages: StorePageRow[];

  discardOpen: boolean;
  onDiscardOpenChange: (open: boolean) => void;
  onDiscard: () => void;

  publishSuccessOpen: boolean;
  onPublishSuccessOpenChange: (open: boolean) => void;
  lastPublishSummary: string | null;
  onBackToThemes: () => void;

  publishSnapshotsOpen: boolean;
  onPublishSnapshotsOpenChange: (open: boolean) => void;
  publishSnapshotList: PublishSnapshotListItem[];
  onPublishSnapshotListChange: (list: PublishSnapshotListItem[]) => void;
  restoringSnapshot: boolean;
  onRestoringSnapshotChange: (restoring: boolean) => void;
  onApplyDraftRestore: (drafts: LayoutDraftBundle) => void;
  onSetDraft: (theme: Record<string, unknown>) => void;
  onSetDraftNavigation: (items: NavItem[]) => void;

  publishResume: PublishResumeState | null;
  onPublishResumeChange: (resume: PublishResumeState | null) => void;
  publishing: boolean;
  confirmOpen: boolean;
  onConfirmOpenChange: (open: boolean) => void;
  onPublish: () => void;
  themeDirty: boolean;
  layoutChanges: PublishLayoutChange[];
  preflightIssues: PublishPreflightIssue[];
  onJumpToIssue: (sectionId: string) => void;
  navigationDirty: boolean;
  themeChanged: boolean;
  liveTheme: ThemeId;
  selectedTheme: ThemeId;
  navigationItemCount: number;
  websiteTemplateName: string | null;

  revisionConflictOpen: boolean;
  onRevisionConflictOpenChange: (open: boolean) => void;
  onOverwriteLive: () => void;

  templatePreview: WebsiteTemplate | null;
  onTemplatePreviewChange: (template: WebsiteTemplate | null) => void;
  templateApply: WebsiteTemplate | null;
  onTemplateApplyChange: (template: WebsiteTemplate | null) => void;
  applyingTemplate: boolean;
  onConfirmApplyWebsiteTemplate: () => void;

  aiReplaceConfirmOpen: boolean;
  onAiReplaceConfirmOpenChange: (open: boolean) => void;
  pendingAiTitle: string;
  onClearPendingAiLayout: () => void;
  onConfirmAiReplacePage: () => void;

  saveComponentOpen: boolean;
  onSaveComponentOpenChange: (open: boolean) => void;
  onConfirmSaveComponent: (name: string, description?: string) => void;

  pendingDesignInsert: PendingDesignInsert | null;
  onPendingDesignInsertChange: (pending: PendingDesignInsert | null) => void;
  onPickDesignInsert: (
    preset: BlockDesignPreset,
    options?: { applyMode?: ApplyDesignMode }
  ) => void;
  onPickDefaultDesignInsert: () => void;
}

export function EditorShellDialogs({
  storeSlug,
  storeId,
  previewPaths,
  pages,
  discardOpen,
  onDiscardOpenChange,
  onDiscard,
  publishSuccessOpen,
  onPublishSuccessOpenChange,
  lastPublishSummary,
  onBackToThemes,
  publishSnapshotsOpen,
  onPublishSnapshotsOpenChange,
  publishSnapshotList,
  onPublishSnapshotListChange,
  restoringSnapshot,
  onRestoringSnapshotChange,
  onApplyDraftRestore,
  onSetDraft,
  onSetDraftNavigation,
  publishResume,
  onPublishResumeChange,
  publishing,
  confirmOpen,
  onConfirmOpenChange,
  onPublish,
  themeDirty,
  layoutChanges,
  preflightIssues,
  onJumpToIssue,
  navigationDirty,
  themeChanged,
  liveTheme,
  selectedTheme,
  navigationItemCount,
  websiteTemplateName,
  revisionConflictOpen,
  onRevisionConflictOpenChange,
  onOverwriteLive,
  templatePreview,
  onTemplatePreviewChange,
  templateApply,
  onTemplateApplyChange,
  applyingTemplate,
  onConfirmApplyWebsiteTemplate,
  aiReplaceConfirmOpen,
  onAiReplaceConfirmOpenChange,
  pendingAiTitle,
  onClearPendingAiLayout,
  onConfirmAiReplacePage,
  saveComponentOpen,
  onSaveComponentOpenChange,
  onConfirmSaveComponent,
  pendingDesignInsert,
  onPendingDesignInsertChange,
  onPickDesignInsert,
  onPickDefaultDesignInsert,
}: EditorShellDialogsProps) {
  return (
    <>
      <Dialog open={discardOpen} onOpenChange={onDiscardOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard unsaved changes?</DialogTitle>
            <DialogDescription>
              Your theme and section edits will be reset to the last published version.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onDiscardOpenChange(false)}>
              Keep editing
            </Button>
            <Button variant="destructive" onClick={onDiscard}>
              Discard changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={publishSuccessOpen} onOpenChange={onPublishSuccessOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#007AFF]" />
              Published
            </DialogTitle>
            <DialogDescription>
              {lastPublishSummary
                ? `Your storefront now reflects ${lastPublishSummary}. Shoppers see it immediately.`
                : "Your changes are live on your storefront."}
            </DialogDescription>
          </DialogHeader>
          <p className="rounded-lg bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-600">
            {getAbsoluteStoreUrl(storeSlug)}
          </p>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={onBackToThemes}>
              Back to themes
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const res = await fetch("/api/store/publish-snapshots");
                  if (!res.ok) throw new Error("Failed to load history");
                  const data = (await res.json()) as {
                    snapshots: PublishSnapshotListItem[];
                  };
                  onPublishSnapshotListChange(data.snapshots ?? []);
                  onPublishSnapshotsOpenChange(true);
                } catch {
                  toast.error("Could not load publish history");
                }
              }}
            >
              Version history
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(getAbsoluteStoreUrl(storeSlug));
                  toast.success("Store link copied");
                } catch {
                  toast.error("Could not copy link");
                }
              }}
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copy link
            </Button>
            <Button className="bg-[#007AFF]" asChild>
              <Link href={getStoreUrl(storeSlug)} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Open live site
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={publishSnapshotsOpen} onOpenChange={onPublishSnapshotsOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish history</DialogTitle>
            <DialogDescription>
              Restore a previous go-live snapshot into the editor (does not publish until you Go live
              again).
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {publishSnapshotList.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No snapshots yet. Publish once to start history.
              </p>
            ) : (
              publishSnapshotList.map((snap) => (
                <div
                  key={snap.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-800">{snap.summary}</p>
                    <p className="text-[11px] text-neutral-500">
                      Rev {snap.revision} · {new Date(snap.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={restoringSnapshot}
                    onClick={async () => {
                      onRestoringSnapshotChange(true);
                      try {
                        const res = await fetch("/api/store/publish-snapshots", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "get", id: snap.id }),
                        });
                        if (!res.ok) throw new Error("Snapshot missing");
                        const data = (await res.json()) as {
                          snapshot: {
                            layouts?: Partial<Record<string, HomeLayout>>;
                            theme?: Record<string, unknown>;
                            navigation?: NavItem[];
                          };
                        };
                        const snapData = data.snapshot;
                        if (snapData.layouts) {
                          onApplyDraftRestore({
                            updatedAt: Date.now(),
                            layouts: snapData.layouts,
                          });
                        }
                        if (snapData.theme) {
                          onSetDraft(snapData.theme);
                        }
                        if (snapData.navigation) {
                          onSetDraftNavigation(snapData.navigation);
                        }
                        onPublishSnapshotsOpenChange(false);
                        onPublishSuccessOpenChange(false);
                        toast.success("Snapshot loaded into editor", {
                          description: "Review changes, then Go live when ready.",
                        });
                      } catch {
                        toast.error("Could not restore snapshot");
                      } finally {
                        onRestoringSnapshotChange(false);
                      }
                    }}
                  >
                    Restore
                  </Button>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onPublishSnapshotsOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={publishResume != null}
        onOpenChange={(open) => !open && onPublishResumeChange(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish interrupted</DialogTitle>
            <DialogDescription>
              {publishResume
                ? publishResume.completed.length > 0
                  ? `Already live: ${publishResume.completed.join(", ")}. Failed on ${publishResume.failed}${
                      publishResume.pending.length
                        ? `. Still pending: ${publishResume.pending.join(", ")}`
                        : ""
                    }.`
                  : `Failed on ${publishResume.failed}. You can retry Go live.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onPublishResumeChange(null)}>
              Dismiss
            </Button>
            <Button
              className="bg-[#007AFF]"
              disabled={publishing}
              onClick={() => {
                onPublishResumeChange(null);
                onConfirmOpenChange(true);
              }}
            >
              Retry remaining
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditorPublishPanel
        open={confirmOpen}
        onOpenChange={onConfirmOpenChange}
        onConfirm={onPublish}
        publishing={publishing}
        themeDirty={themeDirty}
        layoutChanges={layoutChanges}
        preflightIssues={preflightIssues}
        onJumpToIssue={onJumpToIssue}
        navigationDirty={navigationDirty}
        themeChanged={themeChanged}
        liveTheme={liveTheme}
        selectedTheme={selectedTheme}
        navigationItemCount={navigationItemCount}
        websiteTemplateName={websiteTemplateName}
        storeSlug={storeSlug}
      />

      <Dialog open={revisionConflictOpen} onOpenChange={onRevisionConflictOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Storefront updated elsewhere</DialogTitle>
            <DialogDescription>
              Another session published layout changes since you opened the editor. Reload to
              continue with the latest live version, or overwrite to publish your draft now and
              replace what is live.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                onRevisionConflictOpenChange(false);
                window.location.reload();
              }}
            >
              Reload editor
            </Button>
            <Button className="bg-[#007AFF]" onClick={onOverwriteLive}>
              Overwrite & go live
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <WebsiteTemplatePreviewDialog
        open={templatePreview !== null}
        onOpenChange={(open) => {
          if (!open) onTemplatePreviewChange(null);
        }}
        template={templatePreview}
        storeSlug={storeSlug}
        previewPaths={previewPaths}
        onApply={() => {
          if (templatePreview) {
            onTemplateApplyChange(templatePreview);
            onTemplatePreviewChange(null);
          }
        }}
      />

      <WebsiteTemplateApplyDialog
        open={templateApply !== null}
        onOpenChange={(open) => {
          if (!open) onTemplateApplyChange(null);
        }}
        template={templateApply}
        existingPages={pages}
        applying={applyingTemplate}
        onConfirm={onConfirmApplyWebsiteTemplate}
      />

      <Dialog
        open={aiReplaceConfirmOpen}
        onOpenChange={(open) => {
          onAiReplaceConfirmOpenChange(open);
          if (!open) onClearPendingAiLayout();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace current page sections?</DialogTitle>
            <DialogDescription>
              This will replace this page’s sections with the AI layout for “{pendingAiTitle}”.
              You can undo afterward.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                onAiReplaceConfirmOpenChange(false);
                onClearPendingAiLayout();
              }}
            >
              Keep current
            </Button>
            <Button className="bg-[#007AFF]" onClick={onConfirmAiReplacePage}>
              Replace sections
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SaveComponentDialog
        open={saveComponentOpen}
        onOpenChange={onSaveComponentOpenChange}
        sectionCount={1}
        onSave={onConfirmSaveComponent}
      />

      <EditorBlockDesignGallery
        open={pendingDesignInsert !== null}
        blockId={pendingDesignInsert?.blockId ?? null}
        mode="insert"
        onOpenChange={(open) => {
          if (!open) onPendingDesignInsertChange(null);
        }}
        onPick={onPickDesignInsert}
        onPickDefault={onPickDefaultDesignInsert}
      />
    </>
  );
}
