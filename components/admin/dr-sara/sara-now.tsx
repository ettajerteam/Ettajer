"use client";

import Link from "next/link";
import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { MetaChip, riskTone, SoftDivider } from "@/components/admin/dr-sara/sara-ui";

export function SaraNow({
  now,
}: {
  now: SaraExperienceViewModel["now"];
}) {
  return (
    <section
      id="sara-section-now"
      className="scroll-mt-28 pb-20 pt-4"
      aria-labelledby="sara-now-heading"
    >
      <div className="relative mx-auto max-w-3xl text-center motion-safe:animate-[saraFadeUp_0.55s_ease-out_0.15s_both]">
        <p className="text-[11px] font-medium tracking-[0.32em] text-sky-300/80">
          NOW
        </p>
        <p className="mt-5 text-[11px] tracking-[0.18em] text-white/35">
          {now.domain}
        </p>

        <h2
          id="sara-now-heading"
          className="mt-4 text-[32px] font-semibold leading-[1.1] tracking-[-0.035em] text-white sm:text-[48px]"
        >
          {now.headline}
        </h2>

        {now.primaryMetricValue != null ? (
          <div className="mt-10">
            <p className="text-[72px] font-semibold leading-none tracking-[-0.05em] text-white sm:text-[96px]">
              {now.primaryMetricValue}
            </p>
            <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
              {now.primaryMetricLabel ?? "METRIC"}
            </p>
          </div>
        ) : null}

        <SoftDivider className="mx-auto mt-10 max-w-[120px]" />

        <div className="mx-auto mt-8 max-w-md space-y-2">
          {now.narrative.slice(0, 2).map((line) => (
            <p key={line} className="text-[15px] leading-relaxed text-white/50">
              {line}
            </p>
          ))}
        </div>

        {now.relatedPath.length > 0 ? (
          <p className="mt-8 text-[11px] tracking-[0.14em] text-sky-300/60">
            {now.relatedPath.join(" → ")}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
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

        <div className="mt-10">
          <Link
            href={now.href}
            className="inline-flex rounded-full bg-white px-6 py-3 text-[13px] font-medium text-neutral-950 transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          >
            {now.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
