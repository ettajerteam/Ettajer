"use client";

import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCampaignStatusLabel } from "@/lib/email-marketing/campaign-types";

export type EmailHubChecklistItem = {
  id: string;
  label: string;
  done: boolean;
  href: string;
};

export type EmailHubRecentItem = {
  id: string;
  title: string;
  status: string;
  href: string;
  createdAt: string;
};

export type EmailHubStats = {
  activeSubscribers: number;
  totalSubscribers: number;
  templates: number;
  automationsOn: number;
};

interface EmailHubClientProps {
  checklist: EmailHubChecklistItem[];
  stats: EmailHubStats;
  recent: EmailHubRecentItem[];
}

const ACTIONS = [
  {
    title: "Campaigns",
    body: "Send one email to your list",
    href: "/dashboard/marketing/email/campaigns",
  },
  {
    title: "Automations",
    body: "Email customers when they act",
    href: "/dashboard/marketing/email/automations",
  },
  {
    title: "Subscribers",
    body: "Grow and clean your list",
    href: "/dashboard/marketing/email/subscribers",
  },
  {
    title: "Analytics",
    body: "Opens, clicks, results",
    href: "/dashboard/marketing/email/analytics",
  },
] as const;

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export function EmailHubClient({
  checklist,
  stats,
  recent,
}: EmailHubClientProps) {
  const doneCount = checklist.filter((item) => item.done).length;
  const setupComplete = doneCount === checklist.length;
  const nextStep = checklist.find((item) => !item.done);

  return (
    <div className="mx-auto max-w-3xl space-y-10 py-2">
      {/* Hero */}
      <header className="space-y-5">
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-400">
            Email
          </p>
          <h2 className="text-[28px] font-semibold tracking-[-0.04em] text-neutral-950 dark:text-white sm:text-[32px]">
            {setupComplete ? "Ready to send" : "Set up email"}
          </h2>
          <p className="max-w-md text-[14px] leading-relaxed text-neutral-500">
            {setupComplete
              ? "Campaigns, automations, and your subscriber list — in one place."
              : "A few steps, then you can send your first campaign."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={
              nextStep?.href ?? "/dashboard/marketing/email/campaigns"
            }
            className="inline-flex h-9 items-center rounded-full bg-neutral-950 px-4 text-[13px] font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            {nextStep ? "Continue setup" : "New campaign"}
          </Link>
          {!setupComplete ? (
            <p className="text-[12px] tabular-nums text-neutral-400">
              {doneCount} of {checklist.length} done
            </p>
          ) : (
            <Link
              href="/dashboard/marketing/email/templates"
              className="text-[13px] font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white"
            >
              Browse templates
            </Link>
          )}
        </div>
      </header>

      {/* Setup — only when incomplete; horizontal minimal steps */}
      {!setupComplete ? (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
              Setup
            </h3>
            <div className="h-1 w-24 overflow-hidden rounded-full bg-neutral-100 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-neutral-900 transition-all duration-500 dark:bg-white"
                style={{
                  width: `${Math.round((doneCount / checklist.length) * 100)}%`,
                }}
              />
            </div>
          </div>
          <ol className="divide-y divide-neutral-100 rounded-2xl border border-neutral-100 dark:divide-white/10 dark:border-white/10">
            {checklist.map((item, index) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-50 dark:hover:bg-white/[0.03]"
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums",
                      item.done
                        ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                        : "bg-neutral-100 text-neutral-400 dark:bg-white/10",
                    )}
                  >
                    {item.done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : index + 1}
                  </span>
                  <span
                    className={cn(
                      "flex-1 text-[13px] font-medium",
                      item.done
                        ? "text-neutral-400 line-through"
                        : "text-neutral-900 dark:text-white",
                    )}
                  >
                    {item.label}
                  </span>
                  {!item.done ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-neutral-300" />
                  ) : null}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* Metrics — one quiet row, no cards */}
      <section className="grid grid-cols-2 gap-x-8 gap-y-6 border-y border-neutral-100 py-6 sm:grid-cols-4 dark:border-white/10">
        {[
          { label: "Subscribers", value: stats.activeSubscribers },
          { label: "Templates", value: stats.templates },
          { label: "Automations", value: stats.automationsOn },
          { label: "On list", value: stats.totalSubscribers },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-[11px] text-neutral-400">{item.label}</p>
            <p className="mt-1 text-[22px] font-semibold tabular-nums tracking-[-0.04em] text-neutral-950 dark:text-white">
              {item.value.toLocaleString()}
            </p>
          </div>
        ))}
      </section>

      {/* Actions — text list, not icon boxes */}
      <section>
        <h3 className="mb-3 text-[13px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
          Go to
        </h3>
        <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-100 dark:divide-white/10 dark:border-white/10">
          {ACTIONS.map((action) => (
            <li key={action.href}>
              <Link
                href={action.href}
                className="group flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-neutral-50 dark:hover:bg-white/[0.03]"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-neutral-950 dark:text-white">
                    {action.title}
                  </p>
                  <p className="mt-0.5 text-[12px] text-neutral-400">
                    {action.body}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-300 transition-colors group-hover:text-neutral-600 dark:group-hover:text-neutral-200" />
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[12px] text-neutral-400">
          Advanced:{" "}
          <Link
            href="/dashboard/marketing/email/journeys"
            className="text-neutral-600 underline-offset-2 hover:underline dark:text-neutral-300"
          >
            Email flows
          </Link>
          {" · "}
          <Link
            href="/dashboard/marketing/email/insights"
            className="text-neutral-600 underline-offset-2 hover:underline dark:text-neutral-300"
          >
            Ideas
          </Link>
          {" · "}
          <Link
            href="/dashboard/settings?tab=email"
            className="text-neutral-600 underline-offset-2 hover:underline dark:text-neutral-300"
          >
            Email settings
          </Link>
        </p>
      </section>

      {/* Recent */}
      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
            Recent
          </h3>
          <Link
            href="/dashboard/marketing/email/campaigns"
            className="text-[12px] font-medium text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-white"
          >
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 px-4 py-10 text-center dark:border-white/15">
            <p className="text-[13px] font-medium text-neutral-800 dark:text-white">
              No campaigns yet
            </p>
            <p className="mx-auto mt-1 max-w-xs text-[12px] text-neutral-400">
              Create a template, then send your first campaign.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-100 dark:divide-white/10 dark:border-white/10">
            {recent.slice(0, 4).map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-50 dark:hover:bg-white/[0.03]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-neutral-950 dark:text-white">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-400">
                      {formatCampaignStatusLabel(item.status)}
                    </p>
                  </div>
                  <time className="shrink-0 text-[11px] tabular-nums text-neutral-400">
                    {formatWhen(item.createdAt)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
