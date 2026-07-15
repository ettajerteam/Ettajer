"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Eye,
  FileText,
  Home,
  Loader2,
  Monitor,
  Redo2,
  RotateCcw,
  Smartphone,
  Tablet,
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
  onSelectPage: (target: EditorPageTarget) => void;
  onDeviceChange: (device: DeviceMode) => void;
  onPublish: () => void;
  onDiscard: () => void;
  onUndo: () => void;
  onRedo: () => void;
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
  onSelectPage,
  onDeviceChange,
  onPublish,
  onDiscard,
  onUndo,
  onRedo,
}: EditorTopBarProps) {
  const pageName =
    activePage.type === "home"
      ? "Home"
      : activePage.type === "custom"
        ? activePage.page.title
        : activePage.type === "product"
          ? "Product page"
          : "Collection page";
  const DeviceIcon = DEVICE_ICONS[device];

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
                Home
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelectPage({ type: "product" })}>
                <FileText className="mr-2 h-4 w-4 text-[#007AFF]" />
                Product template
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelectPage({ type: "collection" })}>
                <FileText className="mr-2 h-4 w-4 text-[#007AFF]" />
                Collection template
              </DropdownMenuItem>
              {pages.length > 0 ? <DropdownMenuSeparator /> : null}
              {pages.map((page) => (
                <DropdownMenuItem
                  key={page.id}
                  onClick={() => onSelectPage({ type: "custom", page })}
                >
                  <FileText className="mr-2 h-4 w-4 text-neutral-400" />
                  <span className="truncate">{page.title}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {dirty ? (
            <span
              className="hidden h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-500 sm:inline-block"
              title="Unsaved changes"
            />
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <div className="inline-flex items-center rounded-lg border border-neutral-200 bg-white p-0.5 shadow-sm">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={onUndo}
              disabled={!undoAvailable}
              title="Undo (Ctrl/Cmd+Z)"
              aria-label="Undo"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={onRedo}
              disabled={!redoAvailable}
              title="Redo (Ctrl/Cmd+Shift+Z)"
              aria-label="Redo"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
            <EditorShortcutsHelp />
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

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            asChild
            title="View live storefront"
          >
            <Link href={`/store/${storeSlug}`} target="_blank" aria-label="View live storefront">
              <Eye className="h-4 w-4" />
            </Link>
          </Button>

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
            title="Save changes (Ctrl/Cmd+S)"
          >
            {publishing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="hidden sm:inline">Saving…</span>
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Save</span>
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
