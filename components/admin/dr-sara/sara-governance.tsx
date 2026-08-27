"use client";

import { ChevronRight } from "lucide-react";
import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import {
  MetaChip,
  SaraGlass,
  SaraLabel,
  SaraSectionHeading,
  SaraSectionLead,
} from "@/components/admin/dr-sara/sara-ui";

export function SaraGovernance({
  execution,
}: {
  execution: SaraExperienceViewModel["execution"];
}) {
  return (
    <section
      id="sara-section-execution"
      className="scroll-mt-28 py-14"
      aria-labelledby="sara-gov-heading"
    >
      <SaraGlass className="mx-auto max-w-3xl px-6 py-8 sm:px-8">
        <SaraLabel>Governance</SaraLabel>
        <SaraSectionHeading id="sara-gov-heading">
          Trust surface
        </SaraSectionHeading>
        <SaraSectionLead>
          Intelligence recommends. Humans authorize. Production stays sealed.
        </SaraSectionLead>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {execution.flow.map((step, i) => (
            <span key={`${step}-${i}`} className="flex items-center gap-2">
              {i > 0 ? <ChevronRight className="h-3 w-3 text-white/20" /> : null}
              <span className="sara-glass-chip text-[11px] font-medium text-white/65">
                {step}
              </span>
            </span>
          ))}
        </div>

        <div className="mt-6 space-y-2 rounded-2xl border border-amber-400/15 bg-amber-400/[0.05] px-4 py-4 text-[13px]">
          {execution.productionExecutionDisabled ? (
            <p className="font-medium text-amber-200/85">
              Production execution disabled
            </p>
          ) : null}
          <p className="text-white/45">autoExecute: false</p>
          <p className="text-white/45">productionMutation: NONE</p>
        </div>

        <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-white/50">
          {execution.note}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <MetaChip label="Status" value={execution.status} />
          <MetaChip label="Kill switch" value={execution.killSwitch} tone="amber" />
          <MetaChip label="Governor" value={execution.governanceVerdict} />
        </div>
      </SaraGlass>
    </section>
  );
}
