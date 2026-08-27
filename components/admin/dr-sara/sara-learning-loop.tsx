"use client";

import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import {
  SaraGlass,
  SaraLabel,
  SaraSectionHeading,
  SaraSectionLead,
} from "@/components/admin/dr-sara/sara-ui";
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
      className="scroll-mt-28 py-14"
      aria-labelledby="sara-learn-heading"
    >
      <SaraGlass className="mx-auto max-w-4xl px-6 py-8 sm:px-8">
        <SaraLabel>Learning</SaraLabel>
        <SaraSectionHeading id="sara-learn-heading">
          Learning loop
        </SaraSectionHeading>
        <SaraSectionLead>
          Restraint is a feature. Unproven history stays unmarked.
        </SaraSectionLead>

        <div className="mt-8 flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
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
                    "rounded-full px-3 py-1.5 text-[11px] font-medium tracking-[-0.01em]",
                    active
                      ? "border border-[#007AFF]/30 bg-[#007AFF]/15 text-[#5AC8FA]"
                      : "border border-white/[0.06] bg-white/[0.03] text-white/35"
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
            Not enough history
          </p>
        ) : null}

        <ul className="mt-5 space-y-1 text-[13px] text-white/45">
          {l.evidenceNotes.slice(0, 4).map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>

        {l.confidenceAdjustment ? (
          <p className="mt-6 font-mono text-[13px] text-white/65">
            Confidence {Math.round(l.confidenceAdjustment.before * 100)}% →{" "}
            {Math.round(l.confidenceAdjustment.after * 100)}%
          </p>
        ) : null}
      </SaraGlass>
    </section>
  );
}
