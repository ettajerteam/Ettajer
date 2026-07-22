"use client";

import {
  FileText,
  FileImage,
  Layers,
  LayoutTemplate,
  Menu,
  Palette,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type LeftRailDirty = "layout" | "theme" | "nav";

export type LeftRailItem = {
  value: string;
  icon: typeof FileText;
  title: string;
  showDirty?: LeftRailDirty;
};

export const LEFT_PANEL_RAIL_GROUPS: { id: string; items: LeftRailItem[] }[] = [
  {
    id: "structure",
    items: [
      { value: "pages", icon: FileText, title: "Your pages" },
      { value: "menu", icon: Menu, title: "Store menu", showDirty: "nav" },
      { value: "add", icon: Plus, title: "Add" },
      { value: "layers", icon: Layers, title: "Layers", showDirty: "layout" },
    ],
  },
  {
    id: "look",
    items: [
      { value: "templates", icon: LayoutTemplate, title: "Full storefronts" },
      { value: "design", icon: Palette, title: "Design", showDirty: "theme" },
    ],
  },
  {
    id: "media",
    items: [{ value: "assets", icon: FileImage, title: "Media library" }],
  },
];

export function LeftPanelRailButtons({
  activeTab,
  onSelectTab,
  anyLayoutDirty,
  themeDirty,
  navigationDirty,
}: {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  anyLayoutDirty: boolean;
  themeDirty: boolean;
  navigationDirty: boolean;
}) {
  return (
    <>
      {LEFT_PANEL_RAIL_GROUPS.map((group, groupIndex) => (
        <div key={group.id} className="flex flex-col items-center gap-1">
          {groupIndex > 0 ? (
            <div className="my-1 h-px w-6 bg-neutral-200" aria-hidden />
          ) : null}
          {group.items.map((item) => {
            const Icon = item.icon;
            const isDirty =
              item.showDirty === "layout"
                ? anyLayoutDirty
                : item.showDirty === "theme"
                  ? themeDirty
                  : item.showDirty === "nav"
                    ? navigationDirty
                    : false;
            return (
              <Button
                key={item.value}
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "relative h-9 w-9 rounded-lg",
                  activeTab === item.value && "bg-[#007AFF]/10 text-[#007AFF]"
                )}
                onClick={() => onSelectTab(item.value)}
                title={item.title}
                aria-label={item.title}
              >
                <Icon className="h-4 w-4" />
                {isDirty ? (
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                ) : null}
              </Button>
            );
          })}
        </div>
      ))}
    </>
  );
}
