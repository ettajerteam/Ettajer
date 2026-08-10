"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, Pencil, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AiThemePreviewMockup } from "@/components/themes/ai-theme-preview-mockup";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  dashboardCard,
  dashboardPrimaryBtn,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

type AiThemeDocument = {
  theme?: {
    theme?: string;
    primaryColor?: string;
    secondaryColor?: string;
    font?: string;
  };
  templates?: {
    home?: {
      sections?: { id?: string; type?: string; settings?: Record<string, unknown> }[];
    };
  };
};

type AiTheme = {
  id: string;
  name: string;
  description: string | null;
  provider: string;
  status: string;
  sectionCount: number;
  updatedAt: string;
  document?: AiThemeDocument | null;
};

function formatRelative(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const diffSec = Math.round((Date.now() - t) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(t).toLocaleDateString();
}

function providerLabel(provider: string): string {
  const p = provider.trim().toLowerCase();
  if (p.includes("claude")) return "Claude";
  if (p.includes("cursor")) return "Cursor";
  if (p.includes("d4") || p.includes("workflow")) return "AI workflow";
  if (!p || p === "ai") return "AI";
  return provider;
}

function AiThemeCardSkeleton() {
  return (
    <article className="flex flex-col overflow-hidden rounded-[12px] border border-black/[0.06] bg-white dark:border-white/10 dark:bg-[#1C1C1E]">
      <div className="p-2 pb-0">
        <Skeleton className="aspect-[5/4] w-full rounded-[8px]" />
      </div>
      <div className="space-y-2 p-3">
        <Skeleton className="h-3.5 w-2/3 rounded-md" />
        <Skeleton className="h-2.5 w-full rounded-md" />
        <Skeleton className="h-2.5 w-1/2 rounded-md" />
        <div className="flex gap-1.5 pt-1">
          <Skeleton className="h-8 flex-1 rounded-md" />
          <Skeleton className="h-8 flex-1 rounded-md" />
        </div>
      </div>
    </article>
  );
}

export function ThemesAiDesignsSection({
  storeSlug,
  storeName,
}: {
  storeSlug: string;
  storeName?: string;
}) {
  const [themes, setThemes] = useState<AiTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/store-themes");
      const data = (await res.json()) as { themes?: AiTheme[] };
      setThemes(data.themes ?? []);
    } catch {
      toast.error("Could not load AI themes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const visible = useMemo(
    () => themes.filter((t) => t.status !== "archived"),
    [themes],
  );

  async function publish(themeId: string) {
    setPublishingId(themeId);
    try {
      const res = await fetch("/api/dashboard/store-themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish", themeId }),
      });
      if (!res.ok) {
        toast.error("Publish failed");
        return;
      }
      toast.success("Theme published");
      await load();
    } finally {
      setPublishingId(null);
    }
  }

  return (
    <section
      id="themes-ai-designs"
      className={cn(
        dashboardCard,
        "scroll-mt-20 overflow-hidden font-[family-name:var(--font-inter),-apple-system,BlinkMacSystemFont,sans-serif]",
      )}
    >
      <div className="flex items-end justify-between gap-3 border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
        <div>
          <h2 className={cn(dashboardTitle, "inline-flex items-center gap-1.5")}>
            <Sparkles className="h-3.5 w-3.5 text-[#007AFF]" aria-hidden />
            AI Designs
          </h2>
          <p className={dashboardSubtitle}>
            Private drafts from Claude, Cursor, and connected apps — preview before publish
          </p>
        </div>
        {!loading ? (
          <span className="text-[10px] tabular-nums text-neutral-400">
            {visible.length}
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-3">
          <AiThemeCardSkeleton />
          <AiThemeCardSkeleton />
          <AiThemeCardSkeleton />
        </div>
      ) : visible.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <div className="mx-auto mb-3 w-full max-w-[220px] overflow-hidden rounded-[10px] border border-dashed border-black/[0.08] opacity-80">
            <AiThemePreviewMockup storeName={storeName || "Store"} />
          </div>
          <p className="text-[13px] font-medium text-neutral-800 dark:text-white">
            No AI themes yet
          </p>
          <p className="mx-auto mt-1 max-w-sm text-[12px] text-neutral-500">
            Themes created by Claude or Cursor appear here as visual drafts. Connect an app in{" "}
            <Link
              href="/dashboard/developer"
              className="font-medium text-[#007AFF] hover:underline"
            >
              Developer
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-3">
          {visible.map((theme) => {
            const isLive = theme.status === "active";
            const previewHref = `/store/${storeSlug}?preview=true&previewThemeId=${encodeURIComponent(theme.id)}`;
            const font = theme.document?.theme?.font || "Inter";

            return (
              <article
                key={theme.id}
                className={cn(
                  "flex flex-col overflow-hidden rounded-[12px] border bg-white transition-colors dark:bg-[#1C1C1E]",
                  isLive
                    ? "border-[#007AFF]/40 ring-1 ring-[#007AFF]/20"
                    : "border-black/[0.06] dark:border-white/10",
                )}
              >
                <a
                  href={previewHref}
                  target="_blank"
                  rel="noreferrer"
                  className="relative block w-full p-2 pb-0 text-left"
                  aria-label={`Preview ${theme.name}`}
                >
                  <div className="relative overflow-hidden rounded-[8px] ring-1 ring-black/[0.06] dark:ring-white/10">
                    <AiThemePreviewMockup
                      document={theme.document}
                      storeName={storeName}
                    />
                    {isLive ? (
                      <span className="absolute left-1.5 top-1.5 z-40 inline-flex items-center gap-1 rounded-md bg-[#007AFF] px-1.5 py-0.5 text-[10px] font-medium text-white">
                        <Check className="h-2.5 w-2.5" />
                        Active
                      </span>
                    ) : (
                      <span className="absolute left-1.5 top-1.5 z-40 rounded-md bg-amber-500/95 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        Draft
                      </span>
                    )}
                  </div>
                </a>

                <div className="flex flex-1 flex-col gap-2 p-3">
                  <div>
                    <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
                      {theme.name}
                    </h3>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-neutral-500">
                      {theme.description?.trim() ||
                        `${providerLabel(theme.provider)} · ${theme.sectionCount} sections · ${font}`}
                    </p>
                    <p className="mt-1 text-[10px] text-neutral-400">
                      {providerLabel(theme.provider)}
                      {theme.updatedAt ? ` · ${formatRelative(theme.updatedAt)}` : null}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center gap-1 pt-1">
                    <Button
                      variant="ghost"
                      className="h-8 flex-1 rounded-md px-2.5 text-[12px] font-medium text-neutral-500 hover:bg-transparent hover:text-neutral-900"
                      asChild
                    >
                      <a href={previewHref} target="_blank" rel="noreferrer">
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Preview
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-8 flex-1 rounded-md px-2.5 text-[12px] font-medium text-neutral-500 hover:bg-transparent hover:text-neutral-900"
                      asChild
                    >
                      <Link href={`/dashboard/themes/editor?themeId=${theme.id}`}>
                        <Pencil className="mr-1 h-3 w-3" />
                        Edit
                      </Link>
                    </Button>
                    {theme.status === "draft" ? (
                      <Button
                        className={cn(dashboardPrimaryBtn, "h-8 flex-1")}
                        loading={publishingId === theme.id}
                        disabled={!!publishingId}
                        onClick={() => void publish(theme.id)}
                      >
                        Publish
                      </Button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
