"use client";

import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { PresenceDot, SaraLabel } from "@/components/admin/dr-sara/sara-ui";

export function SaraArrival({
  arrival,
  live,
  presence,
}: {
  arrival: SaraExperienceViewModel["arrival"];
  live: boolean;
  presence: SaraExperienceViewModel["presence"];
}) {
  const tone =
    presence.status === "AWAITING_HUMAN_DECISION"
      ? "amber"
      : presence.status === "PRIORITY_IDENTIFIED"
        ? "sky"
        : "emerald";

  return (
    <section
      id="sara-section-arrival"
      className="relative pb-14 pt-10 text-center sm:pb-16 sm:pt-14"
      aria-label="Dr Sara arrival"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-8 h-40 w-40 -translate-x-1/2 rounded-full sara-ai-orb blur-xl motion-reduce:animate-none"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-16 h-24 w-24 -translate-x-1/2 rounded-full border border-[#007AFF]/20 sara-ai-ring motion-reduce:animate-none"
      />

      <div className="relative mx-auto max-w-2xl space-y-7 motion-safe:animate-[saraFadeUp_0.55s_ease-out_both]">
        <div className="space-y-3">
          <SaraLabel className="text-white/50">Dr Sara</SaraLabel>
          <p className="text-[13px] font-semibold tracking-tight text-white/70">
            Platform Intelligence
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <PresenceDot
              label={live ? "LIVE" : "DEGRADED"}
              tone={live ? "emerald" : "amber"}
            />
            <span className="sara-glass-chip text-[11px] text-white/40">
              {arrival.syncLabel}
            </span>
          </div>
        </div>

        <div className="space-y-3 motion-safe:animate-[saraFadeUp_0.55s_ease-out_0.12s_both]">
          <p className="text-[14px] text-white/45">
            {arrival.greeting},
            <span className="text-white/85"> {arrival.operatorName}</span>.
          </p>
          <p className="text-[15px] leading-relaxed text-white/50">
            {arrival.observationLine}
          </p>
          <p className="text-[32px] font-semibold leading-[1.08] tracking-tight text-white sm:text-[40px]">
            {arrival.headline}
          </p>
        </div>

        <div className="motion-safe:animate-[saraFadeUp_0.55s_ease-out_0.24s_both]">
          <PresenceDot label={presence.label} tone={tone} />
        </div>

        <p
          className="text-[11px] text-white/25 motion-safe:animate-[saraFadeUp_0.55s_ease-out_0.34s_both]"
          aria-hidden
        >
          ↓
        </p>
      </div>
    </section>
  );
}
