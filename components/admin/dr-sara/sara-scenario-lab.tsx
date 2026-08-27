"use client";

import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import {
  MetaChip,
  SaraGlass,
  SaraLabel,
  SaraSectionHeading,
  SaraSectionLead,
} from "@/components/admin/dr-sara/sara-ui";

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
      className="scroll-mt-28 py-14"
      aria-labelledby="sara-scenario-heading"
    >
      <SaraGlass className="mx-auto max-w-3xl px-6 py-8 sm:px-8">
        <SaraLabel>Scenarios</SaraLabel>
        <SaraSectionHeading id="sara-scenario-heading">
          Scenario space
        </SaraSectionHeading>
        <SaraSectionLead>
          Alternate paths from the current platform state.
        </SaraSectionLead>

        {!primary ? (
          <p className="mt-10 text-[14px] text-white/40">No scenarios available.</p>
        ) : (
          <div className="mt-8">
            <p className="font-mono text-[11px] text-[#5AC8FA]/80">
              {primary.scenarioId}
            </p>
            <p className="mt-2 text-[20px] font-semibold tracking-tight text-white">
              {primary.label}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
              <Branch
                title="No action"
                body={
                  hasPayload(primary.baseline)
                    ? formatPayload(primary.baseline)
                    : "No measurable projection available from current evidence."
                }
              />
              <div
                className="hidden pt-10 text-center text-white/20 sm:block"
                aria-hidden
              >
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
                note="Simulated · expected range · not a guarantee"
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <MetaChip
                label="Confidence"
                value={`${Math.round(primary.confidence * 100)}%`}
                tone="blue"
              />
              <MetaChip label="Risk" value={primary.risk} />
              <MetaChip label="Uncertainty" value={primary.uncertainty} />
            </div>

            {scenarioLab.length > 1 ? (
              <div className="mt-8 space-y-3 border-t border-white/[0.06] pt-6">
                <p className="text-[12px] font-medium text-white/40">Other paths</p>
                {scenarioLab.slice(1, 4).map((row) => (
                  <div
                    key={row.scenarioId}
                    className="flex items-baseline justify-between gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
                  >
                    <p className="text-[13px] text-white/75">{row.label}</p>
                    <p className="font-mono text-[10px] text-white/25">
                      {row.scenarioId}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </SaraGlass>
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
    <div
      className={
        accent
          ? "rounded-2xl border border-[#007AFF]/20 bg-[#007AFF]/[0.06] px-4 py-5 backdrop-blur-md"
          : "rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-5 backdrop-blur-md"
      }
    >
      <p className="text-[12px] font-medium text-white/40">{title}</p>
      <p className="mt-3 text-[14px] leading-relaxed text-white/80">{body}</p>
      {footer ? (
        <p className="mt-3 text-[13px] leading-relaxed text-white/50">{footer}</p>
      ) : null}
      {note ? <p className="mt-3 text-[11px] text-white/30">{note}</p> : null}
    </div>
  );
}
