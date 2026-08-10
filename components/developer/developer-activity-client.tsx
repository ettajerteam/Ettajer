"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Activity, RefreshCw } from "lucide-react";
import { DeveloperBrandLoader } from "@/components/developer/developer-brand-loader";
import { cn } from "@/lib/utils";

type ActivityItem = {
  id: string;
  action: string;
  resource: string | null;
  resourceId: string | null;
  actorType: string;
  applicationName: string | null;
  createdAt: string;
};

function formatRelative(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

function actionTone(action: string) {
  const a = action.toLowerCase();
  if (a.includes("publish")) return "bg-amber-50 text-amber-800";
  if (a.includes("preview")) return "bg-sky-50 text-sky-800";
  if (a.includes("create") || a.includes("batch") || a.includes("update")) {
    return "bg-emerald-50 text-emerald-800";
  }
  if (a.includes("revoke") || a.includes("delete")) {
    return "bg-red-50 text-red-700";
  }
  return "bg-[#F5F5F7] text-neutral-700";
}

export function DeveloperActivityClient() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/developer/activity");
      const data = (await res.json()) as { activity?: ActivityItem[] };
      setItems(data.activity ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <DeveloperBrandLoader fullPage />;
  }

  return (
    <div>
      <section className="relative overflow-hidden bg-[#0B0D10] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 55% at 80% -10%, rgba(0,122,255,0.22), transparent 55%), radial-gradient(ellipse 40% 40% at 0% 100%, rgba(255,255,255,0.04), transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 pb-10 pt-10 sm:px-6 sm:pb-12 sm:pt-12">
          <p className="text-[13px] font-medium text-white/45">
            Ettajer for Developers
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0 max-w-xl">
              <h1 className="text-[30px] font-semibold leading-[1.08] text-white sm:text-[36px]">
                Activity
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-white/55">
                Recent actions from connected AI apps — theme creates, previews,
                and API calls.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void load()}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-4 text-[13px] font-semibold text-white transition hover:bg-white/[0.08]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
              <Link
                href="/dashboard/developer"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#007AFF] px-4 text-[13px] font-semibold text-white transition hover:bg-[#0071EB]"
              >
                Manage apps
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/[0.05] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <p className="text-[13px] text-neutral-500">
            <span className="font-semibold tabular-nums text-neutral-900">
              {items.length}
            </span>{" "}
            recent event{items.length === 1 ? "" : "s"}
          </p>
          <Link
            href="/help/tutorial-first-ai-theme-in-10-minutes"
            className="text-[12px] font-semibold text-[#007AFF] hover:underline"
          >
            Run the 10-minute tutorial
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-black/[0.06] bg-white px-5 py-10 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B0D10] text-white">
              <Activity className="h-4 w-4" />
            </div>
            <p className="mt-4 text-[16px] font-semibold text-neutral-900">
              No activity yet
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-neutral-500">
              Theme creates, previews, and other API actions will show up here
              once an agent is connected.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/dashboard/developer"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#007AFF] px-4 text-[13px] font-semibold text-white transition hover:bg-[#0071EB]"
              >
                Open console
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/help/tutorial-connect-claude-mcp"
                className="inline-flex h-9 items-center rounded-lg border border-black/[0.08] px-3.5 text-[12px] font-semibold text-neutral-800 transition hover:bg-[#F5F5F7]"
              >
                Connect Claude
              </Link>
            </div>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
            {items.map((item, i) => (
              <li
                key={item.id}
                className={cn(
                  "flex gap-3 px-4 py-3.5 sm:px-5",
                  i > 0 && "border-t border-black/[0.04]",
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F7] text-[11px] font-semibold text-neutral-600">
                  {(item.applicationName || item.actorType)[0]?.toUpperCase() ||
                    "A"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-medium text-neutral-900">
                      {item.applicationName || item.actorType}
                    </p>
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                        actionTone(item.action),
                      )}
                    >
                      {item.action}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-neutral-500">
                    {item.resource}
                    {item.resourceId ? ` ${item.resourceId}` : ""}
                    <span className="text-neutral-300"> · </span>
                    <span title={new Date(item.createdAt).toLocaleString()}>
                      {formatRelative(item.createdAt)}
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
