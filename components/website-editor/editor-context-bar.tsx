"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ExternalLink,
  FileText,
  Home,
  LayoutGrid,
  Loader2,
  Monitor,
  Palette,
  Redo2,
  RotateCcw,
  Save,
  ShoppingBag,
  Smartphone,
  Tablet,
  Tag,
  Undo2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { EditorPageTarget } from "@/components/website-editor/editor-pages-panel";
import { EditorShortcutsHelp } from "@/components/website-editor/editor-shortcuts-help";
import { DEVICE_LABELS } from "@/lib/builder/responsive-styles";
import type { DeviceMode } from "@/lib/builder/types";
import { dashboardGlassHeader, dashboardPrimaryBtn } from "@/lib/dashboard-ui";
import type { StorePageRow } from "@/lib/pages";
import { isEditorHiddenPageSlug } from "@/lib/editor-system-pages";
import { getEditorPageLabel } from "@/lib/editor-pages-config";
import { cn } from "@/lib/utils";

const DEVICE_MODES: DeviceMode[] = ["desktop", "tablet", "mobile"];

const DEVICE_ICONS: Record<DeviceMode, typeof Monitor> = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
};

interface EditorTopBarProps {
  activePage: EditorPageTarget;
  pages: StorePageRow[];
  device: DeviceMode;
  dirty: boolean;
  publishing: boolean;
  undoAvailable: boolean;
  redoAvailable: boolean;
  storeSlug: string;
  zoomPercent?: number;
  draftSaveStatus?: "idle" | "saving" | "saved" | "error";
  lastDraftSavedAt?: number | null;
  unpublishedPageCount?: number;
  dirtyPageKeys?: string[];
  shortcutsOpen?: boolean;
  onShortcutsOpenChange?: (open: boolean) => void;
  onSelectPage: (target: EditorPageTarget) => void;
  onDeviceChange: (device: DeviceMode) => void;
  onSaveDraft?: () => void;
  onPublish: () => void;
  onDiscard: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onOpenBrand?: () => void;
}

export function EditorTopBar({
  activePage,
  pages,
  device,
  dirty,
  publishing,
  undoAvailable,
  redoAvailable,
  storeSlug,
  zoomPercent,
  draftSaveStatus = "idle",
  lastDraftSavedAt = null,
  unpublishedPageCount = 0,
  dirtyPageKeys = [],
  shortcutsOpen,
  onShortcutsOpenChange,
  onSelectPage,
  onDeviceChange,
  onSaveDraft,
  onPublish,
  onDiscard,
  onUndo,
  onRedo,
  onOpenBrand,
}: EditorTopBarProps) {
  const pageName = getEditorPageLabel(activePage);
  const DeviceIcon = DEVICE_ICONS[device];
  const customPages = pages.filter((page) => !isEditorHiddenPageSlug(page.slug));
  const productsPage = pages.find((page) => page.slug === "products") ?? null;
  const dirtySet = new Set(dirtyPageKeys);

  const savedLabel =
    draftSaveStatus === "saving"
      ? "Saving draft…"
      : draftSaveStatus === "error"
        ? "Draft save failed"
        : draftSaveStatus === "saved" && lastDraftSavedAt
          ? "Draft saved"
          : null;

  return (
    <header className={cn(dashboardGlassHeader, "border-b border-neutral-200/80")}>
      <div className="flex items-center justify-between gap-3 px-4 py-2 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg" asChild>
            <Link href="/dashboard/themes" aria-label="Back to themes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex max-w-[min(100%,220px)] items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-left text-sm shadow-sm transition-colors hover:bg-neutral-50"
              >
                {activePage.type === "home" ? (
                  <Home className="h-3.5 w-3.5 shrink-0 text-[#007AFF]" />
                ) : (
                  <FileText className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                )}
                <span className="truncate font-medium text-neutral-900">{pageName}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => onSelectPage({ type: "home" })}>
                <Home className="mr-2 h-4 w-4 text-[#007AFF]" />
                <span className="flex-1">Home</span>
                {dirtySet.has("home") ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                ) : null}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelectPage({ type: "product" })}>
                <ShoppingBag className="mr-2 h-4 w-4 text-[#007AFF]" />
                <span className="flex-1">Product template</span>
                {dirtySet.has("product") ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                ) : null}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelectPage({ type: "collection" })}>
                <Tag className="mr-2 h-4 w-4 text-[#007AFF]" />
                <span className="flex-1">Collection template</span>
                {dirtySet.has("collection") ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                ) : null}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelectPage({ type: "blog-post" })}>
                <FileText className="mr-2 h-4 w-4 text-[#007AFF]" />
                <span className="flex-1">Blog post</span>
                {dirtySet.has("blog-post") ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                ) : null}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (productsPage) onSelectPage({ type: "custom", page: productsPage });
                }}
                disabled={!productsPage}
              >
                <LayoutGrid className="mr-2 h-4 w-4 text-[#007AFF]" />
                <span className="flex-1">Shop catalog</span>
                {productsPage && dirtySet.has(`page:${productsPage.id}`) ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                ) : null}
              </DropdownMenuItem>
              {customPages.length > 0 ? <DropdownMenuSeparator /> : null}
              {customPages.map((page) => (
                <DropdownMenuItem
                  key={page.id}
                  onClick={() => onSelectPage({ type: "custom", page })}
                >
                  <FileText className="mr-2 h-4 w-4 text-neutral-400" />
                  <span className="flex-1 truncate">{page.title}</span>
                  {dirtySet.has(`page:${page.id}`) ? (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {dirty ? (
            <span className="hidden items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800 sm:inline-flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
              {unpublishedPageCount > 1
                ? `${unpublishedPageCount} pages unpublished`
                : "Unpublished changes"}
            </span>
          ) : (
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          )}
          {savedLabel ? (
            <span
              className={cn(
                "hidden items-center rounded-full border px-2.5 py-1 text-[11px] font-medium sm:inline-flex",
                draftSaveStatus === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : draftSaveStatus === "saving"
                    ? "border-neutral-200 bg-white text-neutral-500"
                    : "border-sky-200 bg-sky-50 text-sky-800"
              )}
            >
              {savedLabel}
            </span>
          ) : null}
          {zoomPercent != null ? (
            <span className="hidden rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-medium tabular-nums text-neutral-500 md:inline">
              {zoomPercent}%
            </span>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <div
            className={cn(
              "inline-flex items-center rounded-lg border p-0.5 shadow-sm transition-colors",
              undoAvailable || redoAvailable
                ? "border-[#007AFF]/30 bg-[#007AFF]/5"
                : "border-neutral-200 bg-white"
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 gap-1.5 rounded-md px-2",
                undoAvailable
                  ? "text-neutral-900 hover:bg-white hover:text-[#007AFF]"
                  : "text-neutral-300"
              )}
              onClick={onUndo}
              disabled={!undoAvailable}
              title="Undo layout change (Ctrl/Cmd+Z) — does not undo brand/colors"
              aria-label="Undo layout"
            >
              <Undo2 className="h-3.5 w-3.5" />
              <span className="hidden text-xs font-medium sm:inline">Undo</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 gap-1.5 rounded-md px-2",
                redoAvailable
                  ? "text-neutral-900 hover:bg-white hover:text-[#007AFF]"
                  : "text-neutral-300"
              )}
              onClick={onRedo}
              disabled={!redoAvailable}
              title="Redo layout change (Ctrl/Cmd+Shift+Z)"
              aria-label="Redo layout"
            >
              <Redo2 className="h-3.5 w-3.5" />
              <span className="hidden text-xs font-medium sm:inline">Redo</span>
            </Button>
            <EditorShortcutsHelp open={shortcutsOpen} onOpenChange={onShortcutsOpenChange} />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-lg border-neutral-200 bg-white px-2.5 shadow-sm"
              >
                <DeviceIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{DEVICE_LABELS[device]}</span>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {DEVICE_MODES.map((mode) => {
                const Icon = DEVICE_ICONS[mode];
                return (
                  <DropdownMenuItem
                    key={mode}
                    onClick={() => onDeviceChange(mode)}
                    className={cn(device === mode && "bg-neutral-50 font-medium")}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {DEVICE_LABELS[mode]}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {onOpenBrand ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium"
              onClick={onOpenBrand}
              title="Brand colors, logo, and fonts"
            >
              <Palette className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Brand</span>
            </Button>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium"
            asChild
            title="View live storefront"
          >
            <Link href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View live</span>
              <span className="sm:hidden">Live</span>
            </Link>
          </Button>

          {onSaveDraft ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-lg border-neutral-200 bg-white px-2.5 shadow-sm"
              onClick={onSaveDraft}
              disabled={draftSaveStatus === "saving" || (!dirty && draftSaveStatus !== "error")}
              title="Save draft (Ctrl/Cmd+S)"
            >
              {draftSaveStatus === "saving" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">Save</span>
            </Button>
          ) : null}

          {dirty ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={onDiscard}
              title="Discard changes"
              aria-label="Discard changes"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          ) : null}

          <Button
            size="sm"
            onClick={onPublish}
            disabled={!dirty || publishing}
            className={cn("h-8 gap-1.5 rounded-lg px-3", dashboardPrimaryBtn)}
            title={
              dirty
                ? "Go live (Ctrl/Cmd+Shift+S)"
                : "No unpublished changes"
            }
          >
            {publishing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="hidden sm:inline">Going live…</span>
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Go live</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}

/** @deprecated Use EditorTopBar */
export const EditorContextBar = EditorTopBar;
