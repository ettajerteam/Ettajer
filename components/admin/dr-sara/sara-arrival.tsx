"use client";

import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { LivePulse, SaraLabel } from "@/components/admin/dr-sara/sara-ui";

export function SaraArrival({
  arrival,
  live,
}: {
  arrival: SaraExperienceViewModel["arrival"];
  live: boolean;
}) {
  return (
    <section
      id="sara-section-arrival"
      className="relative overflow-hidden border-b border-white/[0.06] pb-10 pt-8"
      aria-label="Dr Sara arrival"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 motion-reduce:opacity-20"
      >
        <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-sky-500/[0.07] blur-3xl motion-safe:animate-[pulse_7s_ease-in-out_infinite]" />
      </div>

      <div className="relative space-y-6">
        <div className="flex flex-wrap items-center gap-3 motion-safe:animate-[saraFadeUp_0.45s_ease-out_both]">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-sky-400/30 bg-sky-400/10">
            <span className="h-2 w-2 rounded-full bg-sky-300 motion-safe:animate-pulse" />
          </div>
          <div>
            <SaraLabel>Dr Sara</SaraLabel>
            <p className="text-[13px] font-medium tracking-wide text-white/80">
              Master Intelligence
            </p>
          </div>
          {live ? (
            <LivePulse label="LIVE PLATFORM OBSERVATION" />
          ) : (
            <LivePulse label="EVIDENCE DEGRADED" />
          )}
        </div>

        <p className="text-[12px] text-white/40 motion-safe:animate-[saraFadeUp_0.45s_ease-out_0.1s_both]">
          {arrival.syncLabel}
        </p>

        <div className="space-y-2 motion-safe:animate-[saraFadeUp_0.45s_ease-out_0.2s_both]">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-sky-300/80">
            {arrival.greeting}, {arrival.operatorName}.
          </p>
          <p className="max-w-xl text-[22px] font-semibold leading-snug tracking-[-0.02em] text-white sm:text-[28px]">
            {arrival.headline}
          </p>
        </div>

        <div
          className="flex items-center gap-2 text-[11px] text-white/30 motion-safe:animate-[saraFadeUp_0.45s_ease-out_0.32s_both]"
          aria-hidden
        >
          <span className="h-px w-8 bg-white/20" />
          <span>↓</span>
          <span>Now</span>
        </div>
      </div>
    </section>
  );
}
