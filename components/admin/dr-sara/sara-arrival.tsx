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
      className="relative pb-16 pt-10 text-center sm:pb-20 sm:pt-14"
      aria-label="Dr Sara arrival"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-56 w-[min(720px,90%)] rounded-full bg-sky-500/[0.06] blur-3xl motion-reduce:opacity-30"
      />

      <div className="relative mx-auto max-w-2xl space-y-8 motion-safe:animate-[saraFadeUp_0.55s_ease-out_both]">
        <div className="space-y-3">
          <SaraLabel className="text-white/40">Dr Sara</SaraLabel>
          <p className="text-[12px] font-medium tracking-[0.22em] text-white/55">
            MASTER INTELLIGENCE
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <PresenceDot
              label={live ? "LIVE" : "DEGRADED"}
              tone={live ? "emerald" : "amber"}
            />
            <span className="text-[10px] tracking-[0.16em] text-white/30">
              {arrival.syncLabel.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="space-y-3 motion-safe:animate-[saraFadeUp_0.55s_ease-out_0.12s_both]">
          <p className="text-[13px] text-white/45">
            {arrival.greeting},
            <span className="text-white/80"> {arrival.operatorName}</span>.
          </p>
          <p className="text-[15px] text-white/50">{arrival.observationLine}</p>
          <p className="text-[28px] font-semibold leading-tight tracking-[-0.03em] text-white sm:text-[36px]">
            {arrival.headline}
          </p>
        </div>

        <div className="motion-safe:animate-[saraFadeUp_0.55s_ease-out_0.24s_both]">
          <PresenceDot label={presence.label} tone={tone} />
        </div>

        <p
          className="text-[11px] tracking-[0.2em] text-white/25 motion-safe:animate-[saraFadeUp_0.55s_ease-out_0.34s_both]"
          aria-hidden
        >
          ↓
        </p>
      </div>
    </section>
  );
}
