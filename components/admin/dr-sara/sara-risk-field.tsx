"use client";

import { useState } from "react";
import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import {
  SaraGlass,
  SaraLabel,
  SaraSectionHeading,
  SaraSectionLead,
} from "@/components/admin/dr-sara/sara-ui";
import { cn } from "@/lib/utils";

function levelTone(level: string) {
  if (/critical|high/i.test(level)) return "bg-red-300 text-red-100";
  if (/medium/i.test(level)) return "bg-amber-300 text-amber-100";
  return "bg-white/40 text-white/70";
}

export function SaraRiskField({
  riskField,
}: {
  riskField: SaraExperienceViewModel["riskField"];
}) {
  const [active, setActive] = useState<string | null>(riskField[0]?.id ?? null);
  const selected = riskField.find((r) => r.id === active);

  return (
    <section
      id="sara-section-risks"
      className="scroll-mt-28 py-14"
      aria-labelledby="sara-risk-heading"
    >
      <SaraGlass className="mx-auto max-w-3xl px-6 py-8 sm:px-8">
        <SaraLabel>Risks</SaraLabel>
        <SaraSectionHeading id="sara-risk-heading">
          Risk field
        </SaraSectionHeading>
        <SaraSectionLead>
          Points of pressure around the platform — not an alert dump.
        </SaraSectionLead>

        <div className="relative mx-auto mt-8 aspect-square w-full max-w-md">
          <div className="pointer-events-none absolute inset-[18%] rounded-full border border-white/[0.06]" />
          <div className="pointer-events-none absolute inset-[36%] rounded-full border border-[#007AFF]/15" />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#007AFF]/[0.06] blur-2xl"
          />

          {riskField.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setActive(r.id)}
              onMouseEnter={() => setActive(r.id)}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5AC8FA]",
                active === r.id ? "opacity-100" : "opacity-70 hover:opacity-100"
              )}
              style={{
                left: `${r.x * 100}%`,
                top: `${r.y * 100}%`,
                transform: `translate(-50%, -50%) scale(${r.scale})`,
              }}
              aria-label={`${r.title}, ${r.level}`}
            >
              <span className="sara-glass-chip max-w-[160px]">
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    levelTone(r.level).split(" ")[0]
                  )}
                />
                <span className="truncate text-[11px] text-white/80">
                  {r.title}
                </span>
              </span>
            </button>
          ))}
        </div>

        {selected ? (
          <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-4 text-center backdrop-blur-md">
            <p className="text-[15px] font-medium tracking-tight text-white">
              {selected.title}
            </p>
            <p className="mt-1 text-[12px] font-medium text-amber-200/75">
              {selected.level}
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-white/50">
              {selected.evidence}
            </p>
          </div>
        ) : null}

        <ul className="sr-only">
          {riskField.map((r) => (
            <li key={`a11y-${r.id}`}>
              {r.title}: {r.level}. {r.evidence}
            </li>
          ))}
        </ul>
      </SaraGlass>
    </section>
  );
}
