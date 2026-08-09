"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { dashboardPrimaryBtn } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

type AiTheme = {
  id: string;
  name: string;
  description: string | null;
  provider: string;
  status: string;
  sectionCount: number;
  updatedAt: string;
};

export function ThemesAiDesignsSection({ storeSlug }: { storeSlug: string }) {
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

  if (loading) {
    return (
      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          AI Designs
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
      </section>
    );
  }

  if (themes.length === 0) {
    return (
      <section className="mt-10 rounded-2xl border border-dashed bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          AI Designs
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Private themes created by Claude, Cursor, or other connected AI apps will
          appear here. Connect an app in{" "}
          <Link href="/dashboard/developer" className="font-medium text-[#007AFF]">
            Developer
          </Link>
          .
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        AI Designs
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Private themes from connected AI tools. Preview before publishing — cart and
        checkout stay on Ettajer.
      </p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {themes.map((theme) => (
          <li
            key={theme.id}
            className="rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-neutral-900">{theme.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Created with {theme.provider} · Private · {theme.sectionCount} sections
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase",
                  theme.status === "active"
                    ? "bg-emerald-50 text-emerald-700"
                    : theme.status === "archived"
                      ? "bg-neutral-100 text-neutral-500"
                      : "bg-amber-50 text-amber-700",
                )}
              >
                {theme.status === "active"
                  ? "Active"
                  : theme.status === "archived"
                    ? "Archived"
                    : "Draft"}
              </span>
            </div>
            {theme.description ? (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {theme.description}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <a
                  href={`/store/${storeSlug}?preview=true&previewThemeId=${theme.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Preview
                </a>
              </Button>
              {theme.status !== "archived" ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/themes/editor?themeId=${theme.id}`}>
                    Customize
                  </Link>
                </Button>
              ) : null}
              {theme.status === "draft" ? (
                <Button
                  size="sm"
                  className={dashboardPrimaryBtn}
                  disabled={publishingId === theme.id}
                  onClick={() => void publish(theme.id)}
                >
                  {publishingId === theme.id ? "Publishing…" : "Publish"}
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
