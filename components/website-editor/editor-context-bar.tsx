"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Ellipsis,
  ExternalLink,
  FileText,
  Home,
  Keyboard,
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
import {
  dashboardGlassHeader,
  dashboardPill,
  dashboardPillActive,
  dashboardPillGroup,
  dashboardPillInactive,
  dashboardPrimaryBtn,
} from "@/lib/dashboard-ui";
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
  previewHref?: string;
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
  previewHref,
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
  const customPages = pages.filter((page) => !isEditorHiddenPageSlug(page.slug));
  const productsPage = pages.find((page) => page.slug === "products") ?? null;
  const dirtySet = new Set(dirtyPageKeys);

  const savedLabel =
    draftSaveStatus === "saving"
      ? "Saving…"
      : draftSaveStatus === "error"
        ? "Save failed"
        : draftSaveStatus === "saved" && lastDraftSavedAt
          ? "Draft saved"
          : null;

  return (
    <header className={cn(dashboardGlassHeader)}>
      <div className="flex items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-md text-neutral-500 hover:bg-black/[0.04] hover:text-neutral-900"
            asChild
          >
            <Link href="/dashboard/themes" aria-label="Back to themes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex max-w-[min(100%,200px)] items-center gap-1.5 rounded-md border border-black/[0.06] bg-white px-2.5 py-1.5 text-left text-[13px] transition-colors hover:bg-[#F5F5F7] sm:max-w-[240px]"
              >
                {activePage.type === "home" ? (
                  <Home className="h-3.5 w-3.5 shrink-0 text-[#007AFF]" />
                ) : (
                  <FileText className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                )}
                <span className="truncate font-medium tracking-[-0.01em] text-neutral-900">
                  {pageName}
                </span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-[12px] border-black/[0.06]">
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
            <span className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 sm:inline-flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
              {unpublishedPageCount > 1
                ? `${unpublishedPageCount} unpublished`
                : "Unpublished"}
            </span>
          ) : (
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          )}
          {savedLabel ? (
            <span
              className={cn(
                "hidden items-center rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline-flex",
                draftSaveStatus === "error"
                  ? "bg-red-50 text-red-700"
                  : draftSaveStatus === "saving"
                    ? "bg-[#F5F5F7] text-neutral-500"
                    : "bg-[#E8F2FF] text-[#007AFF]"
              )}
            >
              {savedLabel}
            </span>
          ) : null}
          {zoomPercent != null ? (
            <span className="hidden rounded-md bg-[#F5F5F7] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-neutral-500 lg:inline">
              {zoomPercent}%
            </span>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <div className={cn(dashboardPillGroup, "hidden sm:inline-flex")}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 gap-1 rounded-md px-2",
                undoAvailable
                  ? "text-neutral-800 hover:bg-[#F5F5F7] hover:text-[#007AFF]"
                  : "text-neutral-300"
              )}
              onClick={onUndo}
              disabled={!undoAvailable}
              title="Undo (Ctrl/Cmd+Z)"
              aria-label="Undo layout"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 gap-1 rounded-md px-2",
                redoAvailable
                  ? "text-neutral-800 hover:bg-[#F5F5F7] hover:text-[#007AFF]"
                  : "text-neutral-300"
              )}
              onClick={onRedo}
              disabled={!redoAvailable}
              title="Redo (Ctrl/Cmd+Shift+Z)"
              aria-label="Redo layout"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className={dashboardPillGroup} role="group" aria-label="Preview device">
            {DEVICE_MODES.map((mode) => {
              const Icon = DEVICE_ICONS[mode];
              const active = device === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onDeviceChange(mode)}
                  className={cn(
                    dashboardPill,
                    "inline-flex h-7 items-center gap-1 px-2",
                    active ? dashboardPillActive : dashboardPillInactive
                  )}
                  title={DEVICE_LABELS[mode]}
                  aria-label={DEVICE_LABELS[mode]}
                  aria-pressed={active}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden text-[11px] lg:inline">{DEVICE_LABELS[mode]}</span>
                </button>
              );
            })}
          </div>

          {onSaveDraft ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-md border-black/[0.06] bg-white px-2.5 text-[12px] shadow-none"
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
              className="h-8 w-8 rounded-md text-neutral-500 hover:bg-black/[0.04]"
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
            className={cn("h-8 gap-1.5 px-3", dashboardPrimaryBtn)}
            title={dirty ? "Go live (Ctrl/Cmd+Shift+S)" : "No unpublished changes"}
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md text-neutral-500 hover:bg-black/[0.04]"
                aria-label="More editor actions"
              >
                <Ellipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-[12px] border-black/[0.06]">
              {onOpenBrand ? (
                <DropdownMenuItem onClick={onOpenBrand}>
                  <Palette className="mr-2 h-4 w-4" />
                  Brand
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem asChild>
                <Link
                  href={previewHref ?? `/store/${storeSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {previewHref ? "Preview draft theme" : "View live store"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShortcutsOpenChange?.(true)}>
                <Keyboard className="mr-2 h-4 w-4" />
                Shortcuts
              </DropdownMenuItem>
              <div className="flex gap-1 border-t border-black/[0.06] p-1 sm:hidden">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 flex-1"
                  onClick={onUndo}
                  disabled={!undoAvailable}
                >
                  <Undo2 className="mr-1 h-3.5 w-3.5" />
                  Undo
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 flex-1"
                  onClick={onRedo}
                  disabled={!redoAvailable}
                >
                  <Redo2 className="mr-1 h-3.5 w-3.5" />
                  Redo
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <EditorShortcutsHelp
            open={shortcutsOpen}
            onOpenChange={onShortcutsOpenChange}
            hideTrigger
          />
        </div>
      </div>
    </header>
  );
}

/** @deprecated Use EditorTopBar */
export const EditorContextBar = EditorTopBar;
