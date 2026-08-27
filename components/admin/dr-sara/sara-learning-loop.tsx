"use client";

import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { SaraLabel } from "@/components/admin/dr-sara/sara-ui";
import { cn } from "@/lib/utils";

export function SaraLearningLoop({
  learningLoop,
}: {
  learningLoop: SaraExperienceViewModel["learningLoop"];
}) {
  const l = learningLoop;

  return (
    <section
      id="sara-section-learning"
      className="scroll-mt-28 py-16"
      aria-labelledby="sara-learn-heading"
    >
      <div className="mx-auto max-w-4xl">
        <SaraLabel>Learning</SaraLabel>
        <h2
          id="sara-learn-heading"
          className="mt-3 text-[22px] font-semibold tracking-[-0.02em] text-white"
        >
          Learning loop
        </h2>
        <p className="mt-2 text-[14px] text-white/40">
          Restraint is a feature. Unproven history stays unmarked.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          {l.steps.map((step, i) => {
            const active = i === l.activeStepIndex;
            return (
              <span key={step} className="flex items-center gap-2">
                {i > 0 ? (
                  <span className="text-white/15" aria-hidden>
                    →
                  </span>
                ) : null}
                <span
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[10px] font-medium tracking-[0.1em]",
                    active
                      ? "bg-white/10 text-sky-100"
                      : "text-white/30"
                  )}
                >
                  {step}
                </span>
              </span>
            );
          })}
        </div>

        {l.insufficientHistory ? (
          <p className="mt-8 text-[15px] font-medium text-amber-200/85">
            NOT ENOUGH HISTORY
          </p>
        ) : null}

        <ul className="mt-5 space-y-1 text-[13px] text-white/40">
          {l.evidenceNotes.slice(0, 4).map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>

        {l.confidenceAdjustment ? (
          <p className="mt-6 font-mono text-[13px] text-white/60">
            Confidence {Math.round(l.confidenceAdjustment.before * 100)}% →{" "}
            {Math.round(l.confidenceAdjustment.after * 100)}%
          </p>
        ) : null}
      </div>
    </section>
  );
}
