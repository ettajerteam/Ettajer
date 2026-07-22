"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EditorPanelListSkeleton } from "@/components/website-editor/editor-skeleton";
import { deleteMedia, fetchMedia, uploadMedia } from "@/lib/media/api";
import type { MediaAsset, MediaFolder, MediaKind } from "@/lib/media/types";
import { MediaAssetDetail } from "./media-asset-detail";
import { MediaFolderNav } from "./media-folder-nav";
import { MediaGridItem } from "./media-grid-item";
import { MediaUploadZone } from "./media-upload-zone";
import { cn } from "@/lib/utils";

type KindFilter = MediaKind | "all";

const KIND_FILTERS: { value: KindFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "image", label: "Images" },
  { value: "svg", label: "SVG" },
  { value: "logo", label: "Logos" },
  { value: "video", label: "Videos" },
];

interface MediaLibraryCoreProps {
  kind?: KindFilter;
  selectedUrl?: string | null;
  onSelect?: (asset: MediaAsset) => void;
  showDelete?: boolean;
  showFolders?: boolean;
  showDetail?: boolean;
  compactUpload?: boolean;
  /** Stacked layout for narrow editor sidebar */
  variant?: "default" | "sidebar";
  className?: string;
}

function KindFilterChips({
  value,
  onChange,
}: {
  value: KindFilter;
  onChange: (value: KindFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {KIND_FILTERS.map((filter) => {
        const active = value === filter.value;
        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={cn(
              "rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
              active
                ? "bg-[#007AFF] text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800"
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

export function MediaLibraryCore({
  kind: defaultKind = "all",
  selectedUrl,
  onSelect,
  showDelete = true,
  showFolders = true,
  showDetail = true,
  compactUpload,
  variant = "default",
  className,
}: MediaLibraryCoreProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<KindFilter>(defaultKind);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const [detailAsset, setDetailAsset] = useState<MediaAsset | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const pickerMode = Boolean(onSelect) && !showDetail;
  const sidebar = variant === "sidebar";
  const useCompactUpload = compactUpload ?? sidebar;

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMedia({
        q: query || undefined,
        kind: kindFilter,
        folderId: showFolders ? folderId : undefined,
      });
      setAssets(data.assets);
      if (data.folders) setFolders(data.folders);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [query, kindFilter, folderId, showFolders]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAssets();
    }, query ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [loadAssets, query]);

  const handleUpload = async (files: File[]) => {
    try {
      const uploadKind = kindFilter === "all" ? undefined : kindFilter;
      const uploaded = await uploadMedia(files, { kind: uploadKind, folderId });
      setAssets((prev) => [...uploaded, ...prev]);
      toast.success(uploaded.length === 1 ? "File uploaded" : `${uploaded.length} files uploaded`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMedia(deleteTarget.id);
      setAssets((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      if (detailAsset?.id === deleteTarget.id) {
        setDetailOpen(false);
        setDetailAsset(null);
      }
      toast.success("Asset deleted");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenDetail = (asset: MediaAsset) => {
    setDetailAsset(asset);
    setDetailOpen(true);
  };

  const handleAssetUpdated = (asset: MediaAsset) => {
    setAssets((prev) => prev.map((a) => (a.id === asset.id ? asset : a)));
    setDetailAsset(asset);
  };

  const handleFolderCreated = (folder: MediaFolder) => {
    setFolders((prev) => [...prev, folder].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const searchAndFilters = (
    <div className={cn("space-y-2", sidebar && "space-y-2")}>
      {showFolders && (pickerMode || sidebar) && folders.length > 0 && (
        <Select
          value={folderId ?? "root"}
          onValueChange={(v) => setFolderId(v === "root" ? null : v)}
        >
          <SelectTrigger className="h-8 rounded-lg text-xs">
            <SelectValue placeholder="All files" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="root">All files</SelectItem>
            {folders.map((folder) => (
              <SelectItem key={folder.id} value={folder.id}>
                {folder.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by filename, title, or alt…"
          className="h-8 rounded-lg pl-8 text-xs"
        />
      </div>

      {defaultKind === "all" ? (
        <KindFilterChips value={kindFilter} onChange={setKindFilter} />
      ) : null}
    </div>
  );

  const mediaGrid = loading ? (
    <EditorPanelListSkeleton
      rows={sidebar ? 4 : 6}
      variant="media"
      label="Loading media"
      className={sidebar ? "grid-cols-2" : "sm:grid-cols-3"}
    />
  ) : assets.length === 0 ? (
    <div
      className={cn(
        "rounded-lg border border-dashed border-neutral-200 bg-neutral-50/50 text-center",
        sidebar ? "px-3 py-6" : "px-6 py-10"
      )}
    >
      <p className="text-sm font-medium text-neutral-600">No media yet</p>
      <p className="mt-1 text-xs text-neutral-400">
        {folderId
          ? "This folder is empty. Upload files or move assets here."
          : "Upload images, SVG, logos, or videos to build your library."}
      </p>
    </div>
  ) : (
    <div className={cn("grid gap-2", sidebar ? "grid-cols-2" : "grid-cols-2 gap-3 sm:grid-cols-3")}>
      {assets.map((asset) => (
        <MediaGridItem
          key={asset.id}
          asset={asset}
          selected={selectedUrl === asset.url}
          onSelect={onSelect}
          onDelete={showDelete ? setDeleteTarget : undefined}
          onOpenDetail={showDetail && !pickerMode ? handleOpenDetail : undefined}
          pickerMode={pickerMode}
        />
      ))}
    </div>
  );

  return (
    <div className={cn(sidebar ? "space-y-2.5" : "space-y-4", className)}>
      {sidebar ? (
        <>
          <MediaUploadZone
            onUpload={handleUpload}
            kind={kindFilter}
            compact={useCompactUpload}
          />
          {searchAndFilters}
          {showFolders && !pickerMode ? (
            <MediaFolderNav
              folders={folders}
              currentFolderId={folderId}
              onFolderChange={setFolderId}
              onFolderCreated={handleFolderCreated}
            />
          ) : null}
          {mediaGrid}
        </>
      ) : (
        <div className={cn(showFolders && !pickerMode && "flex gap-4")}>
          {showFolders && !pickerMode && (
            <aside className="hidden w-36 shrink-0 sm:block">
              <MediaFolderNav
                folders={folders}
                currentFolderId={folderId}
                onFolderChange={setFolderId}
                onFolderCreated={handleFolderCreated}
              />
            </aside>
          )}

          <div className="min-w-0 flex-1 space-y-4">
            <MediaUploadZone
              onUpload={handleUpload}
              kind={kindFilter}
              compact={useCompactUpload}
            />
            {searchAndFilters}
            {mediaGrid}
          </div>
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete asset?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `"${deleteTarget.filename}" will be removed from your library. This cannot be undone.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showDetail && (
        <MediaAssetDetail
          asset={detailAsset}
          folders={folders}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onUpdated={handleAssetUpdated}
        />
      )}
    </div>
  );
}

export function MediaLibrary({
  variant = "sidebar",
  onSelect,
}: {
  variant?: "default" | "sidebar";
  onSelect?: (asset: MediaAsset) => void;
} = {}) {
  return (
    <div className="space-y-2.5">
      <div className="px-0.5">
        <p className="text-xs font-semibold text-neutral-800">Media library</p>
        <p className="mt-0.5 text-[11px] text-neutral-400">
          {onSelect
            ? "Click an asset to apply it to the selected image slot"
            : "Upload and manage images, logos, and videos"}
        </p>
      </div>
      <MediaLibraryCore
        showDelete={!onSelect}
        showFolders
        showDetail={!onSelect}
        variant={variant}
        onSelect={onSelect}
      />
    </div>
  );
}
