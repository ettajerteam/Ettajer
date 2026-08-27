"use client";

import Link from "next/link";
import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { MetaChip, riskTone, SaraLabel } from "@/components/admin/dr-sara/sara-ui";

export function SaraNow({
  now,
}: {
  now: SaraExperienceViewModel["now"];
}) {
  return (
    <section
      id="sara-section-now"
      className="scroll-mt-28 py-10"
      aria-labelledby="sara-now-heading"
    >
      <SaraLabel>Now</SaraLabel>

      <article className="relative mt-4 overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent px-6 py-10 text-center motion-safe:animate-[saraFadeUp_0.5s_ease-out_both] sm:px-12 sm:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent"
        />

        <p className="text-[11px] font-medium tracking-[0.28em] text-sky-300/90">
          NOW
        </p>
        <p className="mt-4 inline-flex items-center gap-2 text-[11px] text-white/45">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400 motion-safe:animate-pulse" />
          {now.domain}
        </p>

        <h2
          id="sara-now-heading"
          className="mx-auto mt-5 max-w-2xl text-[28px] font-semibold leading-tight tracking-[-0.03em] text-white sm:text-[40px]"
        >
          {now.headline}
        </h2>

        {now.primaryMetricValue != null ? (
          <div className="mt-8">
            <p className="text-[56px] font-semibold leading-none tracking-[-0.04em] text-white sm:text-[72px]">
              {now.primaryMetricValue}
            </p>
            <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">
              {now.primaryMetricLabel ?? "METRIC"}
            </p>
          </div>
        ) : null}

        <div className="mx-auto mt-6 h-px w-24 bg-white/10" />

        <div className="mx-auto mt-6 max-w-lg space-y-2">
          {now.narrative.slice(0, 2).map((line) => (
            <p key={line} className="text-[14px] leading-relaxed text-white/55">
              {line}
            </p>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <MetaChip label="Risk" value={now.risk} tone={riskTone(now.risk)} />
          <MetaChip
            label="Confidence"
            value={
              now.confidence != null
                ? `${Math.round(now.confidence * 100)}%`
                : now.confidenceLabel
            }
            tone="blue"
          />
          <MetaChip label="Governance" value={now.approval} tone="amber" />
        </div>

        <div className="mt-8">
          <Link
            href={now.href}
            className="inline-flex rounded-xl bg-sky-500 px-5 py-2.5 text-[13px] font-medium text-white transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          >
            {now.cta}
          </Link>
        </div>

        {now.relatedPath.length > 0 ? (
          <p className="mt-8 text-[11px] tracking-[0.08em] text-white/30">
            {now.relatedPath.join(" → ")}
          </p>
        ) : null}
      </article>
    </section>
  );
}
