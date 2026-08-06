"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowUpRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MerchantInsightWidget } from "@/lib/email-marketing/atlas/insights";

interface EmailInsightsClientProps {
  initialWidgets: MerchantInsightWidget[];
  currency: string;
}

export function EmailInsightsClient({
  initialWidgets,
  currency: _currency,
}: EmailInsightsClientProps) {
  const [widgets, setWidgets] = useState(initialWidgets);
  const [busy, setBusy] = useState<string | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);

  const hero =
    widgets.find((w) => w.id === "recoverable_revenue") ?? widgets[0];
  const secondary = widgets.filter((w) => w.id !== hero?.id);

  async function refresh() {
    setBusy("refresh");
    try {
      const res = await fetch("/api/email/atlas?view=insights");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Refresh failed");
      setWidgets(data.widgets || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setBusy(null);
    }
  }

  async function runScoring() {
    setBusy("score");
    setToolsOpen(false);
    try {
      const res = await fetch("/api/email/atlas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "score_store" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Scoring failed");
      toast.success(`Scored ${data.scored} contacts`);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Scoring failed");
    } finally {
      setBusy(null);
    }
  }

  async function ensureSegments() {
    setBusy("segments");
    setToolsOpen(false);
    try {
      const res = await fetch("/api/email/atlas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ensure_predictive_segments" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed");
      toast.success("Segments ready");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function attribute() {
    setBusy("attr");
    setToolsOpen(false);
    try {
      const res = await fetch("/api/email/atlas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "attribute_store" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Attribution failed");
      toast.success(`Updated ${data.updated} campaigns`);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Attribution failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="relative flex items-center gap-3">
          <button
            type="button"
            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            aria-label="More tools"
            onClick={() => setToolsOpen((v) => !v)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={busy === "refresh"}
            onClick={() => void refresh()}
            className="text-[12px] font-medium text-neutral-400 hover:text-neutral-900 disabled:opacity-50 dark:hover:text-white"
          >
            {busy === "refresh" ? "…" : "Refresh"}
          </button>
          {toolsOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 cursor-default"
                aria-label="Close menu"
                onClick={() => setToolsOpen(false)}
              />
              <div className="absolute right-0 top-8 z-50 w-52 overflow-hidden rounded-2xl border border-neutral-100 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#1C1C1E]">
                {[
                  {
                    id: "score",
                    label: "Score audience",
                    run: runScoring,
                  },
                  {
                    id: "segments",
                    label: "Sync segments",
                    run: ensureSegments,
                  },
                  {
                    id: "attr",
                    label: "Refresh attribution",
                    run: attribute,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={busy != null}
                    onClick={() => void item.run()}
                    className="flex w-full px-3.5 py-2.5 text-left text-[12px] font-medium text-neutral-900 hover:bg-neutral-50 disabled:opacity-50 dark:text-white dark:hover:bg-white/[0.04]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {hero ? (
        <section className="space-y-3 border-b border-neutral-100 pb-8 dark:border-white/10">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400">
            {hero.title}
          </p>
          <p className="text-[36px] font-semibold tracking-[-0.045em] text-neutral-950 dark:text-white sm:text-[40px]">
            {hero.value}
          </p>
          <p className="max-w-md text-[14px] leading-relaxed text-neutral-500">
            {hero.detail}
          </p>
          {hero.ctaHref && hero.ctaLabel ? (
            <Link
              href={hero.ctaHref}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-neutral-950 px-4 text-[13px] font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
            >
              {hero.ctaLabel}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </section>
      ) : null}

      {secondary.length > 0 ? (
        <ul className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-100 dark:divide-white/10 dark:border-white/10">
          {secondary.map((w) => (
            <li key={w.id}>
              <div className="flex items-start justify-between gap-4 px-4 py-4">
                <div className="min-w-0">
                  <p className="text-[11px] text-neutral-400">{w.title}</p>
                  <p className="mt-1 text-[18px] font-semibold tabular-nums tracking-[-0.03em] text-neutral-950 dark:text-white">
                    {w.value}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-neutral-400">
                    {w.detail}
                  </p>
                </div>
                {w.ctaHref && w.ctaLabel ? (
                  <Link
                    href={w.ctaHref}
                    className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
                  >
                    {w.ctaLabel}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {widgets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 px-6 py-12 text-center dark:border-white/15">
          <p className="text-[13px] font-medium text-neutral-950 dark:text-white">
            No ideas yet
          </p>
          <p className="mx-auto mt-1 max-w-sm text-[12px] text-neutral-400">
            Score your audience to unlock suggestions.
          </p>
          <button
            type="button"
            disabled={busy === "score"}
            onClick={() => void runScoring()}
            className="mt-5 inline-flex h-9 items-center rounded-full bg-neutral-950 px-4 text-[13px] font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-950"
          >
            {busy === "score" ? "Scoring…" : "Score audience"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
