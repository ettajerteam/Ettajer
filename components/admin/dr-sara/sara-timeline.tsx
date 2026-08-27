"use client";

import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { SaraLabel, SaraPanel } from "@/components/admin/dr-sara/sara-ui";
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
    <section id="sara-section-outcome" className="scroll-mt-28 py-10" aria-labelledby="sara-time-heading">
      <SaraLabel>Time</SaraLabel>
      <h2 id="sara-time-heading" className="mt-2 text-[18px] font-semibold tracking-[-0.02em] text-white">
        Memory timeline
      </h2>
      <p className="mt-1 text-[13px] text-white/40">
        Past observations · current state · simulated expectation
      </p>

      <SaraPanel className="mt-5">
        <div className="mb-6 flex items-center justify-between gap-2 text-[10px] font-medium tracking-[0.16em] text-white/35">
          <span>PAST</span>
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-sky-300">NOW</span>
          <span className="h-px flex-1 bg-white/10" />
          <span>EXPECTED</span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <TimelineCol title="Past" items={past} />
          <TimelineCol title="Now" items={now} accent />
          <TimelineCol title="Expected" items={expected} />
        </div>
      </SaraPanel>
    </section>
  );
}

function TimelineCol({
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
        "rounded-xl border p-4",
        accent
          ? "border-sky-400/25 bg-sky-400/[0.06]"
          : "border-white/[0.06] bg-black/10"
      )}
    >
      <p className="text-[10px] font-medium tracking-[0.14em] text-white/40">{title}</p>
      <div className="mt-3 space-y-3">
        {items.length === 0 ? (
          <p className="text-[12px] text-white/35">—</p>
        ) : (
          items.map((seg) => (
            <article key={seg.id}>
              <p className="text-[13px] font-medium text-white">{seg.label}</p>
              <p
                className={cn(
                  "mt-1 text-[12px]",
                  seg.insufficientEvidence ? "text-amber-300" : "text-white/50"
                )}
              >
                {seg.detail}
              </p>
              {seg.simulated ? (
                <p className="mt-2 text-[10px] tracking-[0.08em] text-white/30">
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
