"use client";

import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { MetaChip, SaraLabel } from "@/components/admin/dr-sara/sara-ui";

function hasPayload(value: Record<string, unknown>): boolean {
  return Object.keys(value).length > 0;
}

function formatPayload(value: Record<string, number | string | [number, number]>): string {
  return Object.entries(value)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}: [${v[0]}, ${v[1]}]`;
      return `${k}: ${v}`;
    })
    .join(" · ");
}

export function SaraScenarioLab({
  scenarioLab,
}: {
  scenarioLab: SaraExperienceViewModel["scenarioLab"];
}) {
  const primary = scenarioLab[0] ?? null;

  return (
    <section
      id="sara-section-scenario"
      className="scroll-mt-28 py-16"
      aria-labelledby="sara-scenario-heading"
    >
      <div className="mx-auto max-w-3xl">
        <SaraLabel>Scenarios</SaraLabel>
        <h2
          id="sara-scenario-heading"
          className="mt-3 text-[22px] font-semibold tracking-[-0.02em] text-white"
        >
          Scenario space
        </h2>
        <p className="mt-2 text-[14px] text-white/40">
          Alternate paths from the current platform state.
        </p>

        {!primary ? (
          <p className="mt-10 text-[14px] text-white/40">No scenarios available.</p>
        ) : (
          <div className="mt-10">
            <p className="font-mono text-[11px] text-sky-300/70">{primary.scenarioId}</p>
            <p className="mt-2 text-[20px] font-semibold text-white">{primary.label}</p>

            <div className="mt-10 grid gap-6 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
              <Branch
                title="No action"
                body={
                  hasPayload(primary.baseline)
                    ? formatPayload(primary.baseline)
                    : "No measurable projection available from current evidence."
                }
              />
              <div className="hidden pt-8 text-center text-white/20 sm:block" aria-hidden>
                │
              </div>
              <Branch
                title="Intervention"
                accent
                body={primary.simulated}
                footer={
                  hasPayload(primary.expectedRange)
                    ? formatPayload(
                        primary.expectedRange as Record<
                          string,
                          number | string | [number, number]
                        >
                      )
                    : "No measurable projection available from current evidence."
                }
                note="SIMULATED · EXPECTED RANGE · NOT A GUARANTEE"
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <MetaChip
                label="Confidence"
                value={`${Math.round(primary.confidence * 100)}%`}
                tone="blue"
              />
              <MetaChip label="Risk" value={primary.risk} />
              <MetaChip label="Uncertainty" value={primary.uncertainty} />
            </div>

            {scenarioLab.length > 1 ? (
              <div className="mt-10 space-y-3 border-t border-white/[0.06] pt-6">
                <p className="text-[10px] tracking-[0.14em] text-white/30">
                  OTHER PATHS
                </p>
                {scenarioLab.slice(1, 4).map((row) => (
                  <div key={row.scenarioId} className="flex items-baseline justify-between gap-3">
                    <p className="text-[13px] text-white/70">{row.label}</p>
                    <p className="font-mono text-[10px] text-white/25">{row.scenarioId}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

function Branch({
  title,
  body,
  footer,
  note,
  accent,
}: {
  title: string;
  body: string;
  footer?: string;
  note?: string;
  accent?: boolean;
}) {
  return (
    <div className={accent ? "rounded-2xl bg-sky-400/[0.06] px-4 py-5" : "px-1 py-5"}>
      <p className="text-[10px] tracking-[0.14em] text-white/30">{title}</p>
      <p className="mt-3 text-[14px] text-white/80">{body}</p>
      {footer ? <p className="mt-3 text-[13px] text-white/50">{footer}</p> : null}
      {note ? <p className="mt-3 text-[10px] tracking-[0.08em] text-white/25">{note}</p> : null}
    </div>
  );
}
