"use client";

import { ChevronRight } from "lucide-react";
import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { MetaChip, SaraLabel, SaraPanel } from "@/components/admin/dr-sara/sara-ui";

export function SaraGovernance({
  execution,
}: {
  execution: SaraExperienceViewModel["execution"];
}) {
  return (
    <section id="sara-section-execution" className="scroll-mt-28 py-10" aria-labelledby="sara-gov-heading">
      <SaraLabel>Governance</SaraLabel>
      <h2 id="sara-gov-heading" className="mt-2 text-[18px] font-semibold tracking-[-0.02em] text-white">
        Controlled execution
      </h2>
      <p className="mt-1 text-[13px] text-white/40">
        Intelligence recommends. Humans authorize. No autonomous production mutation.
      </p>

      <SaraPanel className="mt-5">
        <div className="flex flex-wrap gap-2">
          {execution.sandboxReady ? (
            <span className="rounded-md border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-[10px] font-medium text-emerald-300">
              SANDBOX READY
            </span>
          ) : null}
          {execution.productionExecutionDisabled ? (
            <span className="rounded-md border border-amber-400/25 bg-amber-400/10 px-2 py-1 text-[10px] font-medium text-amber-300">
              PRODUCTION EXECUTION DISABLED
            </span>
          ) : null}
          <span className="rounded-md border border-white/[0.08] px-2 py-1 text-[10px] text-white/50">
            autoExecute: false
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {execution.flow.map((step, i) => (
            <span key={`${step}-${i}`} className="flex items-center gap-2">
              {i > 0 ? <ChevronRight className="h-3 w-3 text-white/20" /> : null}
              <span className="rounded-md bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-white/65">
                {step}
              </span>
            </span>
          ))}
        </div>

        <p className="mt-5 text-[13px] text-white/45">{execution.note}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <MetaChip label="Status" value={execution.status} />
          <MetaChip label="Kill switch" value={execution.killSwitch} tone="amber" />
          <MetaChip label="Governor" value={execution.governanceVerdict} />
        </div>
      </SaraPanel>
    </section>
  );
}
