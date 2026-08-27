"use client";

import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { MetaChip, SaraLabel, SaraPanel } from "@/components/admin/dr-sara/sara-ui";

export function SaraScenarioLab({
  scenarioLab,
}: {
  scenarioLab: SaraExperienceViewModel["scenarioLab"];
}) {
  return (
    <section id="sara-section-scenario" className="scroll-mt-28 py-10" aria-labelledby="sara-scenario-heading">
      <SaraLabel>Scenarios</SaraLabel>
      <h2 id="sara-scenario-heading" className="mt-2 text-[18px] font-semibold tracking-[-0.02em] text-white">
        Scenario lab
      </h2>
      <p className="mt-1 text-[13px] text-white/40">
        Baseline vs simulated action vs expected range
      </p>

      <div className="mt-5 space-y-3">
        {scenarioLab.length === 0 ? (
          <p className="text-[13px] text-white/40">No scenarios available.</p>
        ) : (
          scenarioLab.map((row) => (
            <SaraPanel key={row.scenarioId}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] text-sky-300/80">{row.scenarioId}</p>
                  <p className="mt-1 text-[15px] font-semibold text-white">{row.label}</p>
                </div>
                <MetaChip
                  label="Confidence"
                  value={`${Math.round(row.confidence * 100)}%`}
                  tone="blue"
                />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-black/20 p-3">
                  <p className="text-[9px] font-medium tracking-[0.14em] text-white/35">BASELINE</p>
                  <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] text-white/60">
                    {JSON.stringify(row.baseline) || "—"}
                  </pre>
                </div>
                <div className="rounded-lg border border-sky-400/20 bg-sky-400/[0.06] p-3">
                  <p className="text-[9px] font-medium tracking-[0.14em] text-sky-300">SIMULATED</p>
                  <p className="mt-2 text-[13px] text-white">{row.simulated}</p>
                </div>
                <div className="rounded-lg bg-black/20 p-3">
                  <p className="text-[9px] font-medium tracking-[0.14em] text-white/35">EXPECTED RANGE</p>
                  <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] text-white/60">
                    {JSON.stringify(row.expectedRange) || "—"}
                  </pre>
                  <p className="mt-2 text-[10px] text-white/30">NOT A GUARANTEE</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <MetaChip label="Risk" value={row.risk} />
                <MetaChip label="Uncertainty" value={row.uncertainty} />
              </div>
            </SaraPanel>
          ))
        )}
      </div>
    </section>
  );
}
