"use client";

import { Check, Copy, ExternalLink, FileText, Layers, Navigation, Palette, Rocket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
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
import { getAbsoluteStoreUrl, getStoreUrl } from "@/lib/storefront-urls";
import { cn } from "@/lib/utils";

export type PublishLayoutChange = {
  label: string;
  detail: string;
  sectionId?: string;
  pageKey?: string;
};

export type PublishPreflightIssue = {
  level: "error" | "warning";
  message: string;
  sectionId?: string | null;
};

interface EditorPublishPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  publishing: boolean;
  themeDirty: boolean;
  layoutChanges: PublishLayoutChange[];
  preflightIssues?: PublishPreflightIssue[];
  onJumpToIssue?: (sectionId: string) => void;
  navigationDirty?: boolean;
  themeChanged: boolean;
  liveTheme: ThemeId;
  selectedTheme: ThemeId;
  navigationItemCount?: number;
  websiteTemplateName?: string | null;
  storeSlug?: string;
}

export function EditorPublishPanel({
  open,
  onOpenChange,
  onConfirm,
  publishing,
  themeDirty,
  layoutChanges,
  preflightIssues = [],
  onJumpToIssue,
  navigationDirty = false,
  themeChanged,
  liveTheme,
  selectedTheme,
  navigationItemCount = 0,
  websiteTemplateName,
  storeSlug,
}: EditorPublishPanelProps) {
  const [copied, setCopied] = useState(false);
  const liveTemplate = THEME_TEMPLATES.find((t) => t.id === liveTheme);
  const activeTemplate = THEME_TEMPLATES.find((t) => t.id === selectedTheme);
  const livePath = storeSlug ? getStoreUrl(storeSlug) : null;
  const liveAbsolute = storeSlug ? getAbsoluteStoreUrl(storeSlug) : null;

  const scopeItems: {
    icon: typeof Palette;
    label: string;
    detail: string;
    sectionId?: string;
  }[] = [];

  if (themeDirty) {
    scopeItems.push({
      icon: Palette,
      label: themeChanged ? "Theme style" : "Brand & colors",
      detail: themeChanged
        ? `${liveTemplate?.name ?? liveTheme} → ${activeTemplate?.name ?? selectedTheme}`
        : "Colors, logo, or typography",
    });
  }

  if (websiteTemplateName) {
    scopeItems.push({
      icon: Layers,
      label: "Website design",
      detail: `${websiteTemplateName} becomes your active template`,
    });
  }

  for (const layoutChange of layoutChanges) {
    scopeItems.push({
      icon: layoutChange.label.toLowerCase().includes("page") ? FileText : Layers,
      label: layoutChange.label,
      detail: layoutChange.detail,
      sectionId: layoutChange.sectionId,
    });
  }

  if (navigationDirty) {
    scopeItems.push({
      icon: Navigation,
      label: "Navigation menu",
      detail: `${navigationItemCount} menu item${navigationItemCount === 1 ? "" : "s"}`,
    });
  }

  const hasScope = scopeItems.length > 0;
  const errors = preflightIssues.filter((i) => i.level === "error");
  const warnings = preflightIssues.filter((i) => i.level === "warning");
  const canPublish = hasScope && errors.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#007AFF]/10 text-[#007AFF]">
              <Rocket className="h-4 w-4" />
            </span>
            Go live
          </DialogTitle>
          <DialogDescription>
            {themeChanged
              ? `Switch from ${liveTemplate?.name ?? "current style"} to ${activeTemplate?.name ?? "the new style"} and push everything below to your live store.`
              : "One action for your whole storefront. Review the scope, then push it live for customers."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {(errors.length > 0 || warnings.length > 0) && (
            <div className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Preflight
              </p>
              <ul className="max-h-36 space-y-1.5 overflow-y-auto">
                {errors.map((issue, idx) => (
                  <li key={`e-${idx}`} className="text-xs text-red-700">
                    {issue.sectionId && onJumpToIssue ? (
                      <button
                        type="button"
                        className="text-left underline-offset-2 hover:underline"
                        onClick={() => {
                          onJumpToIssue(issue.sectionId!);
                          onOpenChange(false);
                        }}
                      >
                        {issue.message}
                      </button>
                    ) : (
                      issue.message
                    )}
                  </li>
                ))}
                {warnings.map((issue, idx) => (
                  <li key={`w-${idx}`} className="text-xs text-amber-800">
                    {issue.sectionId && onJumpToIssue ? (
                      <button
                        type="button"
                        className="text-left underline-offset-2 hover:underline"
                        onClick={() => {
                          onJumpToIssue(issue.sectionId!);
                          onOpenChange(false);
                        }}
                      >
                        {issue.message}
                      </button>
                    ) : (
                      issue.message
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Scope
            </p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                hasScope
                  ? "bg-[#007AFF]/10 text-[#007AFF]"
                  : "bg-neutral-100 text-neutral-500"
              )}
            >
              {hasScope
                ? `${scopeItems.length} change${scopeItems.length === 1 ? "" : "s"}`
                : "Nothing pending"}
            </span>
          </div>

          {hasScope ? (
            <ul className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-50/80 p-3">
              {scopeItems.map((item, idx) => {
                const content = (
                  <>
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                      <item.icon className="h-3.5 w-3.5 text-[#007AFF]" />
                    </span>
                    <span>
                      <span className="font-medium text-neutral-900">{item.label}</span>
                      <span className="block text-xs text-neutral-500">{item.detail}</span>
                    </span>
                  </>
                );
                return (
                  <li key={`${item.label}-${item.detail}-${idx}`} className="flex items-start gap-2.5 text-sm">
                    {item.sectionId && onJumpToIssue ? (
                      <button
                        type="button"
                        className="flex w-full items-start gap-2.5 text-left hover:opacity-80"
                        onClick={() => {
                          onJumpToIssue(item.sectionId!);
                          onOpenChange(false);
                        }}
                      >
                        {content}
                      </button>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center text-sm text-neutral-500">
              No unpublished changes. Edit your site, then come back to go live.
            </p>
          )}

          {storeSlug && livePath && liveAbsolute ? (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5">
              <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-neutral-600">
                {liveAbsolute}
              </p>
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" asChild>
                <Link href={livePath} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Open live
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg text-xs"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(liveAbsolute);
                    setCopied(true);
                    toast.success("Store link copied");
                    window.setTimeout(() => setCopied(false), 1800);
                  } catch {
                    toast.error("Could not copy link");
                  }
                }}
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep editing
          </Button>
          <Button
            onClick={onConfirm}
            loading={publishing}
            disabled={!canPublish}
            className="gap-1.5 bg-[#007AFF] hover:bg-[#0071EB]"
          >
            <Check className="h-3.5 w-3.5" />
            Go live
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
