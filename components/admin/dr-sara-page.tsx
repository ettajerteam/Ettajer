"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Circle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatAdminInt } from "@/lib/admin/format";
import type {
  SaraAction,
  SaraBriefing,
  SaraDimensionStatus,
  SaraExplanation,
  SaraFeedItem,
  SaraOpportunity,
  SaraPriority,
  SaraRisk,
  SaraSegment,
  SaraSeverity,
} from "@/lib/intelligence/types";

function severityClass(severity: SaraSeverity | string) {
  if (severity === "high" || severity === "critical") {
    return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10";
  }
  if (severity === "medium") {
    return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10";
  }
  if (severity === "positive") {
    return "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10";
  }
  return "text-neutral-600 bg-neutral-100 dark:text-neutral-300 dark:bg-white/10";
}

function dimDot(status: SaraDimensionStatus) {
  if (status === "critical") return "bg-red-500";
  if (status === "attention") return "bg-orange-500";
  if (status === "watch") return "bg-amber-400";
  return "bg-emerald-500";
}

function WhyDisclosure({ explanation }: { explanation: SaraExplanation }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 border-t border-black/[0.04] pt-2 dark:border-white/[0.06]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 transition-colors hover:text-[#007AFF]"
      >
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        Why?
      </button>
      {open ? (
        <dl className="mt-2 space-y-1.5 rounded-lg bg-black/[0.02] px-3 py-2.5 text-[11px] leading-relaxed dark:bg-white/[0.03]">
          <div>
            <dt className="font-medium text-neutral-500">Signal</dt>
            <dd className="text-neutral-800 dark:text-neutral-200">
              {explanation.signal}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-neutral-500">Evidence</dt>
            <dd className="text-neutral-800 dark:text-neutral-200">
              {explanation.evidence}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-neutral-500">Rule</dt>
            <dd className="font-mono text-[10px] text-neutral-700 dark:text-neutral-300">
              {explanation.rule}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-neutral-500">Impact</dt>
            <dd className="text-neutral-800 dark:text-neutral-200">
              {explanation.impact}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-neutral-500">Recommendation</dt>
            <dd className="text-neutral-800 dark:text-neutral-200">
              {explanation.recommendation}
            </dd>
          </div>
          <p className="pt-1 text-[10px] text-neutral-400">
            Deterministic platform rule — not LLM-generated.
          </p>
        </dl>
      ) : null}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
      {children}
    </h2>
  );
}

function PriorityCard({ item }: { item: SaraPriority }) {
  return (
    <article className="rounded-xl border border-black/[0.06] bg-white p-4 dark:border-white/10 dark:bg-[#1C1C1E]">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide",
            severityClass(item.severity)
          )}
        >
          {item.severityLabel}
        </span>
        <span className="text-[10px] text-neutral-400">
          Affected · {formatAdminInt(item.affectedCount)}
        </span>
      </div>
      <h3 className="mt-2 text-[15px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
        {item.signal}
      </h3>
      <p className="mt-1 text-[13px] leading-snug text-neutral-500">
        {item.why}
      </p>
      <p className="mt-2 text-[12px] text-neutral-600 dark:text-neutral-300">
        {item.evidence}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link
          href={item.href}
          className="inline-flex items-center rounded-lg bg-[#007AFF] px-3 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
        >
          {item.cta}
        </Link>
      </div>
      <WhyDisclosure explanation={item.explanation} />
    </article>
  );
}

function FeedCard({ item }: { item: SaraFeedItem }) {
  return (
    <article className="rounded-xl border border-black/[0.06] bg-white p-4 dark:border-white/10 dark:bg-[#1C1C1E]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#007AFF]">
        {item.category}
      </p>
      <p className="mt-2 text-[14px] font-medium text-neutral-900 dark:text-white">
        {item.signal}
      </p>
      <ol className="mt-3 space-y-2 border-l border-black/[0.08] pl-3 text-[12px] dark:border-white/10">
        <li>
          <span className="text-neutral-400">Context · </span>
          <span className="text-neutral-700 dark:text-neutral-300">
            {item.context}
          </span>
        </li>
        <li>
          <span className="text-neutral-400">Interpretation · </span>
          <span className="text-neutral-700 dark:text-neutral-300">
            {item.interpretation}
          </span>
        </li>
        <li>
          <span className="text-neutral-400">Conclusion · </span>
          <span className="text-neutral-700 dark:text-neutral-300">
            {item.conclusion}
          </span>
        </li>
        <li>
          <span className="text-neutral-400">Recommendation · </span>
          <span className="text-neutral-700 dark:text-neutral-300">
            {item.recommendation}
          </span>
        </li>
      </ol>
      <Link
        href={item.href}
        className="mt-3 inline-flex text-[12px] font-medium text-[#007AFF] hover:underline"
      >
        {item.cta}
      </Link>
      <WhyDisclosure explanation={item.explanation} />
    </article>
  );
}

function OpportunityCard({ item }: { item: SaraOpportunity }) {
  return (
    <article className="rounded-xl border border-black/[0.06] bg-white p-4 dark:border-white/10 dark:bg-[#1C1C1E]">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[14px] font-semibold text-neutral-900 dark:text-white">
          {item.title}
        </h3>
        <span className="shrink-0 text-[18px] font-semibold tracking-tight text-[#007AFF]">
          {formatAdminInt(item.merchantCount)}
        </span>
      </div>
      <p className="mt-1 text-[11px] font-medium text-neutral-400">
        {item.potentialImpact}
      </p>
      <p className="mt-2 text-[12px] text-neutral-600 dark:text-neutral-300">
        {item.reason}
      </p>
      <Link
        href={item.href}
        className="mt-3 inline-flex text-[12px] font-medium text-[#007AFF] hover:underline"
      >
        {item.cta}
      </Link>
      <WhyDisclosure explanation={item.explanation} />
    </article>
  );
}

function RiskCard({ item }: { item: SaraRisk }) {
  return (
    <article className="rounded-xl border border-black/[0.06] bg-white p-4 dark:border-white/10 dark:bg-[#1C1C1E]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
          {item.category}
        </p>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
            severityClass(item.riskLevel === "none" ? "low" : item.riskLevel)
          )}
        >
          {item.riskLevel}
        </span>
      </div>
      <h3 className="mt-2 text-[14px] font-semibold text-neutral-900 dark:text-white">
        {item.title}
      </h3>
      <p className="mt-1 text-[22px] font-semibold tracking-tight text-neutral-900 dark:text-white">
        {item.metric}
      </p>
      <p className="mt-1 text-[12px] text-neutral-500">{item.detail}</p>
      <Link
        href={item.href}
        className="mt-3 inline-flex text-[12px] font-medium text-[#007AFF] hover:underline"
      >
        {item.cta}
      </Link>
      <WhyDisclosure explanation={item.explanation} />
    </article>
  );
}

function SegmentTile({ item }: { item: SaraSegment }) {
  return (
    <Link
      href={item.href}
      className="group rounded-xl border border-black/[0.06] bg-white p-3.5 transition-colors hover:border-[#007AFF]/40 dark:border-white/10 dark:bg-[#1C1C1E]"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold tracking-[0.08em] text-[#007AFF]">
          {item.label}
        </p>
        <span className="text-[16px] font-semibold text-neutral-900 dark:text-white">
          {formatAdminInt(item.count)}
        </span>
      </div>
      <p className="mt-1 text-[11px] leading-snug text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300">
        {item.description}
      </p>
    </Link>
  );
}

function ActionRow({ item }: { item: SaraAction }) {
  return (
    <Link
      href={item.href}
      className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-white px-3.5 py-3 transition-colors hover:border-[#007AFF]/35 dark:border-white/10 dark:bg-[#1C1C1E]"
    >
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-white">
          {item.label}
        </p>
        <p className="truncate text-[11px] text-neutral-500">{item.description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {item.urgency !== "normal" ? (
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase",
              severityClass(item.urgency === "critical" ? "high" : "medium")
            )}
          >
            {item.urgency}
          </span>
        ) : null}
        <ChevronRight className="h-4 w-4 text-neutral-300" />
      </div>
    </Link>
  );
}

export function DrSaraPage({ briefing }: { briefing: SaraBriefing }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 font-sans sm:px-6 lg:px-8">
      {/* Header */}
      <header className="space-y-4 border-b border-black/[0.06] pb-5 dark:border-white/10">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Console
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#007AFF]/10 text-[#007AFF]">
                <Sparkles className="h-4 w-4" strokeWidth={2} />
              </span>
              <div>
                <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                  Dr Sara
                </h1>
                <p className="text-[12px] text-neutral-500">
                  Platform Intelligence
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-500">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-2.5 py-1 dark:border-white/10 dark:bg-[#1C1C1E]">
              <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
              Live
            </span>
            <span>
              Last updated:{" "}
              <span className="text-neutral-700 dark:text-neutral-300">
                just now
              </span>
            </span>
            <span className="hidden rounded border border-black/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-neutral-400 sm:inline dark:border-white/10">
              ⌘K
            </span>
          </div>
        </div>

        <p className="text-[15px] font-medium tracking-[-0.01em] text-neutral-800 dark:text-neutral-100">
          Here&apos;s what matters right now.
        </p>
        {briefing.headline &&
        briefing.headline !== "Here's what matters right now." ? (
          <p className="text-[13px] text-neutral-500">{briefing.headline}</p>
        ) : null}
      </header>

      {/* Platform Pulse */}
      <section className="mt-8">
        <SectionLabel>Platform pulse</SectionLabel>
        <div className="mt-3 rounded-xl border border-black/[0.06] bg-white p-5 dark:border-white/10 dark:bg-[#1C1C1E]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                Platform health
              </p>
              <p className="mt-1 text-[40px] font-semibold leading-none tracking-tight text-neutral-900 dark:text-white">
                {briefing.pulse.score}
                <span className="text-[18px] font-medium text-neutral-400">
                  {" "}
                  / 100
                </span>
              </p>
              <p className="mt-2 text-[13px] font-medium text-[#007AFF]">
                {briefing.pulse.label}
              </p>
              <p className="mt-1 max-w-md text-[13px] text-neutral-500">
                {briefing.pulse.summary}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {briefing.pulse.dimensions.map((dim) => (
              <div
                key={dim.id}
                className="rounded-lg border border-black/[0.04] px-3 py-2.5 dark:border-white/[0.06]"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn("h-1.5 w-1.5 rounded-full", dimDot(dim.status))}
                  />
                  <p className="text-[11px] font-medium text-neutral-800 dark:text-neutral-200">
                    {dim.label}
                  </p>
                </div>
                <p className="mt-1 text-[11px] text-neutral-500">
                  {dim.statusLabel}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Priorities */}
      <section className="mt-10">
        <SectionLabel>What needs your attention</SectionLabel>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {briefing.priorities.length === 0 ? (
            <p className="text-[13px] text-neutral-500">
              No high-priority signals right now.
            </p>
          ) : (
            briefing.priorities.map((p) => (
              <PriorityCard key={p.id} item={p} />
            ))
          )}
        </div>
      </section>

      {/* Signals feed */}
      <section className="mt-10">
        <SectionLabel>Signals</SectionLabel>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {briefing.feed.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Opportunities */}
      <section className="mt-10">
        <SectionLabel>Opportunities</SectionLabel>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {briefing.opportunities.map((item) => (
            <OpportunityCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Risk center */}
      <section className="mt-10">
        <SectionLabel>Risk center</SectionLabel>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {briefing.risks.map((item) => (
            <RiskCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Merchant intelligence */}
      <section className="mt-10">
        <SectionLabel>Merchant intelligence</SectionLabel>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {briefing.segments.map((s) => (
            <SegmentTile key={s.id} item={s} />
          ))}
        </div>
      </section>

      {/* Action center */}
      <section className="mt-10 pb-10">
        <SectionLabel>Action center</SectionLabel>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {briefing.actions.map((a) => (
            <ActionRow key={a.id} item={a} />
          ))}
        </div>
      </section>
    </div>
  );
}
