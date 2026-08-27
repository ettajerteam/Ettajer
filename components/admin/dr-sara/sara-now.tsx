"use client";

import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import {
  MetaChip,
  riskTone,
  SaraCta,
  SaraGlass,
  SoftDivider,
} from "@/components/admin/dr-sara/sara-ui";

export function SaraNow({
  now,
}: {
  now: SaraExperienceViewModel["now"];
}) {
  return (
    <section
      id="sara-section-now"
      className="scroll-mt-28 pb-16 pt-2"
      aria-labelledby="sara-now-heading"
    >
      <SaraGlass
        strong
        className="relative mx-auto max-w-3xl overflow-hidden px-6 py-10 text-center sm:px-10 sm:py-12 motion-safe:animate-[saraFadeUp_0.55s_ease-out_0.15s_both]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#007AFF]/[0.08] to-transparent"
        />

        <p className="relative text-[12px] font-medium tracking-[-0.01em] text-[#5AC8FA]">
          Now
        </p>
        <p className="relative mt-3 text-[12px] text-white/40">{now.domain}</p>

        <h2
          id="sara-now-heading"
          className="relative mt-4 text-[30px] font-semibold leading-[1.08] tracking-tight text-white sm:text-[44px]"
        >
          {now.headline}
        </h2>

        {now.primaryMetricValue != null ? (
          <div className="relative mt-8">
            <p className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-[64px] font-semibold leading-none tracking-tight text-transparent sm:text-[84px]">
              {now.primaryMetricValue}
            </p>
            <p className="mt-3 text-[12px] font-medium text-white/40">
              {now.primaryMetricLabel ?? "Metric"}
            </p>
          </div>
        ) : null}

        <SoftDivider className="relative mx-auto mt-8 max-w-[120px]" />

        <div className="relative mx-auto mt-6 max-w-md space-y-2">
          {now.narrative.slice(0, 2).map((line) => (
            <p key={line} className="text-[15px] leading-relaxed text-white/50">
              {line}
            </p>
          ))}
        </div>

        {now.relatedPath.length > 0 ? (
          <p className="relative mt-6 text-[12px] text-[#5AC8FA]/70">
            {now.relatedPath.join(" → ")}
          </p>
        ) : null}

        <div className="relative mt-7 flex flex-wrap items-center justify-center gap-2">
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

        <div className="relative mt-9">
          <SaraCta href={now.href}>{now.cta}</SaraCta>
        </div>
      </SaraGlass>
    </section>
  );
}
