"use client";

import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { SaraLabel, SaraPanel } from "@/components/admin/dr-sara/sara-ui";
import { cn } from "@/lib/utils";

export function SaraLearningLoop({
  learningLoop,
}: {
  learningLoop: SaraExperienceViewModel["learningLoop"];
}) {
  const l = learningLoop;

  return (
    <section id="sara-section-learning" className="scroll-mt-28 py-10" aria-labelledby="sara-learn-heading">
      <SaraLabel>Learning</SaraLabel>
      <h2 id="sara-learn-heading" className="mt-2 text-[18px] font-semibold tracking-[-0.02em] text-white">
        Learning loop
      </h2>
      <p className="mt-1 text-[13px] text-white/40">
        Sara knows when she does not know.
      </p>

      <SaraPanel className="mt-5">
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          {l.steps.map((step, i) => {
            const active = i === l.activeStepIndex;
            return (
              <span key={step} className="flex items-center gap-2">
                {i > 0 ? (
                  <span className="text-white/20" aria-hidden>
                    →
                  </span>
                ) : null}
                <span
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[10px] font-medium tracking-[0.08em]",
                    active
                      ? "border-sky-400/40 bg-sky-400/15 text-sky-200 motion-safe:shadow-[0_0_20px_rgba(56,189,248,0.15)]"
                      : "border-white/[0.06] text-white/35"
                  )}
                >
                  {step}
                </span>
              </span>
            );
          })}
        </div>

        {l.insufficientHistory ? (
          <p className="mt-5 text-[14px] font-medium text-amber-300">NOT ENOUGH HISTORY</p>
        ) : null}

        <ul className="mt-4 space-y-1 text-[12px] text-white/45">
          {l.evidenceNotes.map((n) => (
            <li key={n}>· {n}</li>
          ))}
        </ul>

        {l.confidenceAdjustment ? (
          <p className="mt-4 font-mono text-[13px] text-white/70">
            Confidence {Math.round(l.confidenceAdjustment.before * 100)}% →{" "}
            {Math.round(l.confidenceAdjustment.after * 100)}%
            <span className="ml-2 text-[11px] text-white/35">
              {l.confidenceAdjustment.reason}
            </span>
          </p>
        ) : null}
      </SaraPanel>
    </section>
  );
}
