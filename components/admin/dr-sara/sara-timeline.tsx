"use client";

import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import {
  SaraGlass,
  SaraLabel,
  SaraSectionHeading,
  SaraSectionLead,
} from "@/components/admin/dr-sara/sara-ui";
import { cn } from "@/lib/utils";

export function SaraTimeline({
  timeline,
}: {
  timeline: SaraExperienceViewModel["timeline"];
}) {
  const past = timeline.filter((t) => t.phase === "PAST");
  const now = timeline.filter((t) => t.phase === "NOW");
  const expected = timeline.filter((t) => t.phase === "EXPECTED");

  return (
    <section
      id="sara-section-outcome"
      className="scroll-mt-28 py-14"
      aria-labelledby="sara-time-heading"
    >
      <SaraGlass className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <SaraLabel>Time</SaraLabel>
        <SaraSectionHeading id="sara-time-heading">
          Memory timeline
        </SaraSectionHeading>
        <SaraSectionLead>
          Past observation · current state · simulated expectation
        </SaraSectionLead>

        <div className="mt-8 flex items-center gap-3 text-[11px] font-medium text-white/35">
          <span>Past</span>
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-[#5AC8FA]">Now</span>
          <span className="h-px flex-1 bg-white/10" />
          <span>Expected</span>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Col title="Past" items={past} />
          <Col title="Now" items={now} accent />
          <Col title="Expected" items={expected} />
        </div>
      </SaraGlass>
    </section>
  );
}

function Col({
  title,
  items,
  accent,
}: {
  title: string;
  items: SaraExperienceViewModel["timeline"];
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-4 backdrop-blur-md",
        accent && "border-[#007AFF]/20 bg-[#007AFF]/[0.05]"
      )}
    >
      <p className="text-[12px] font-medium text-white/40">{title}</p>
      <div className="mt-4 space-y-5">
        {items.length === 0 ? (
          <p className="text-[13px] text-white/30">—</p>
        ) : (
          items.map((seg) => (
            <article key={seg.id}>
              <p className="text-[14px] font-medium tracking-tight text-white/85">
                {seg.label}
              </p>
              <p
                className={cn(
                  "mt-1 text-[13px] leading-relaxed",
                  seg.insufficientEvidence ? "text-amber-300/80" : "text-white/45"
                )}
              >
                {seg.detail}
              </p>
              {seg.simulated ? (
                <p className="mt-2 text-[11px] text-white/30">
                  Simulated · expected range · not a guarantee
                </p>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
