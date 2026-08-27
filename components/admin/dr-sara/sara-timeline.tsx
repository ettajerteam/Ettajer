"use client";

import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { SaraLabel } from "@/components/admin/dr-sara/sara-ui";
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
      className="scroll-mt-28 py-16"
      aria-labelledby="sara-time-heading"
    >
      <div className="mx-auto max-w-4xl">
        <SaraLabel>Time</SaraLabel>
        <h2
          id="sara-time-heading"
          className="mt-3 text-[22px] font-semibold tracking-[-0.02em] text-white"
        >
          Memory timeline
        </h2>
        <p className="mt-2 text-[14px] text-white/40">
          Past observation · current state · simulated expectation
        </p>

        <div className="mt-10 flex items-center gap-3 text-[10px] font-medium tracking-[0.18em] text-white/30">
          <span>PAST</span>
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-sky-300/80">NOW</span>
          <span className="h-px flex-1 bg-white/10" />
          <span>EXPECTED</span>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <Col title="Past" items={past} />
          <Col title="Now" items={now} accent />
          <Col title="Expected" items={expected} />
        </div>
      </div>
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
    <div className={cn(accent && "md:-mt-1")}>
      <p className="text-[10px] tracking-[0.16em] text-white/30">{title}</p>
      <div className="mt-4 space-y-5">
        {items.length === 0 ? (
          <p className="text-[13px] text-white/30">—</p>
        ) : (
          items.map((seg) => (
            <article key={seg.id}>
              <p className="text-[14px] font-medium text-white/85">{seg.label}</p>
              <p
                className={cn(
                  "mt-1 text-[13px]",
                  seg.insufficientEvidence ? "text-amber-300/80" : "text-white/45"
                )}
              >
                {seg.detail}
              </p>
              {seg.simulated ? (
                <p className="mt-2 text-[10px] tracking-[0.1em] text-white/25">
                  SIMULATED · EXPECTED RANGE · NOT A GUARANTEE
                </p>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
