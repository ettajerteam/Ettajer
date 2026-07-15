"use client";

import { Check, Layers, Navigation, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { THEME_TEMPLATES } from "@/lib/themes";
import type { ThemeId } from "@/lib/themes";

interface EditorPublishPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  publishing: boolean;
  themeDirty: boolean;
  layoutDirty: boolean;
  navigationDirty?: boolean;
  themeChanged: boolean;
  liveTheme: ThemeId;
  selectedTheme: ThemeId;
  sectionCount: number;
  hiddenSectionCount: number;
  navigationItemCount?: number;
}

export function EditorPublishPanel({
  open,
  onOpenChange,
  onConfirm,
  publishing,
  themeDirty,
  layoutDirty,
  navigationDirty = false,
  themeChanged,
  liveTheme,
  selectedTheme,
  sectionCount,
  hiddenSectionCount,
  navigationItemCount = 0,
}: EditorPublishPanelProps) {
  const liveTemplate = THEME_TEMPLATES.find((t) => t.id === liveTheme);
  const activeTemplate = THEME_TEMPLATES.find((t) => t.id === selectedTheme);

  const changes: { icon: typeof Palette; label: string; detail: string }[] = [];

  if (themeDirty) {
    changes.push({
      icon: Palette,
      label: themeChanged ? "Theme template" : "Brand & colors",
      detail: themeChanged
        ? `${liveTemplate?.name ?? liveTheme} → ${activeTemplate?.name ?? selectedTheme}`
        : "Colors, logo, or typography updated",
    });
  }

  if (layoutDirty) {
    changes.push({
      icon: Layers,
      label: "Home page sections",
      detail: `${sectionCount} section${sectionCount === 1 ? "" : "s"}${hiddenSectionCount > 0 ? ` (${hiddenSectionCount} hidden)` : ""}`,
    });
  }

  if (navigationDirty) {
    changes.push({
      icon: Navigation,
      label: "Navigation menu",
      detail: `${navigationItemCount} menu item${navigationItemCount === 1 ? "" : "s"}`,
    });
  }

  const isThemeSwitch = themeChanged;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isThemeSwitch ? `Switch to ${activeTemplate?.name}?` : "Publish changes?"}</DialogTitle>
          <DialogDescription>
            {isThemeSwitch
              ? `You're changing from ${liveTemplate?.name} to ${activeTemplate?.name}. Review what will go live.`
              : "These updates will be visible on your live storefront immediately."}
          </DialogDescription>
        </DialogHeader>

        {changes.length > 0 ? (
          <ul className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50/80 p-3">
            {changes.map((change) => (
              <li key={change.label} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                  <change.icon className="h-3.5 w-3.5 text-[#007AFF]" />
                </span>
                <span>
                  <span className="font-medium text-neutral-900">{change.label}</span>
                  <span className="block text-xs text-neutral-500">{change.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500">No pending changes to publish.</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} loading={publishing} className="gap-1.5 bg-[#007AFF]">
            <Check className="h-3.5 w-3.5" />
            Publish now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
