"use client";

import { ChevronRight } from "lucide-react";
import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { MetaChip, SaraLabel } from "@/components/admin/dr-sara/sara-ui";

export function SaraGovernance({
  execution,
}: {
  execution: SaraExperienceViewModel["execution"];
}) {
  return (
    <section
      id="sara-section-execution"
      className="scroll-mt-28 py-16"
      aria-labelledby="sara-gov-heading"
    >
      <div className="mx-auto max-w-3xl">
        <SaraLabel>Governance</SaraLabel>
        <h2
          id="sara-gov-heading"
          className="mt-3 text-[22px] font-semibold tracking-[-0.02em] text-white"
        >
          Trust surface
        </h2>
        <p className="mt-2 text-[14px] text-white/40">
          Intelligence recommends. Humans authorize. Production stays sealed.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-2">
          {execution.flow.map((step, i) => (
            <span key={`${step}-${i}`} className="flex items-center gap-2">
              {i > 0 ? <ChevronRight className="h-3 w-3 text-white/15" /> : null}
              <span className="text-[11px] font-medium tracking-[0.08em] text-white/55">
                {step}
              </span>
            </span>
          ))}
        </div>

        <div className="mt-8 space-y-2 text-[13px]">
          {execution.productionExecutionDisabled ? (
            <p className="text-amber-200/80">PRODUCTION EXECUTION DISABLED</p>
          ) : null}
          <p className="text-white/40">autoExecute: false</p>
          <p className="text-white/40">productionMutation: NONE</p>
        </div>

        <p className="mt-6 max-w-xl text-[14px] text-white/45">{execution.note}</p>

        <div className="mt-6 flex flex-wrap gap-4">
          <MetaChip label="Status" value={execution.status} />
          <MetaChip label="Kill switch" value={execution.killSwitch} tone="amber" />
          <MetaChip label="Governor" value={execution.governanceVerdict} />
        </div>
      </div>
    </section>
  );
}
