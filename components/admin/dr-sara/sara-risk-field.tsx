"use client";

import { useState } from "react";
import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { SaraLabel } from "@/components/admin/dr-sara/sara-ui";
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
      className="scroll-mt-28 py-16"
      aria-labelledby="sara-risk-heading"
    >
      <div className="mx-auto max-w-3xl">
        <SaraLabel>Risks</SaraLabel>
        <h2
          id="sara-risk-heading"
          className="mt-3 text-[22px] font-semibold tracking-[-0.02em] text-white"
        >
          Risk field
        </h2>
        <p className="mt-2 text-[14px] text-white/40">
          Points of pressure around the platform — not an alert dump.
        </p>

        <div className="relative mx-auto mt-10 aspect-square w-full max-w-md">
          <div className="pointer-events-none absolute inset-[18%] rounded-full border border-white/[0.04]" />
          <div className="pointer-events-none absolute inset-[36%] rounded-full border border-white/[0.05]" />

          {riskField.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setActive(r.id)}
              onMouseEnter={() => setActive(r.id)}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300",
                active === r.id ? "opacity-100" : "opacity-70 hover:opacity-100"
              )}
              style={{
                left: `${r.x * 100}%`,
                top: `${r.y * 100}%`,
                transform: `translate(-50%, -50%) scale(${r.scale})`,
              }}
              aria-label={`${r.title}, ${r.level}`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    levelTone(r.level).split(" ")[0]
                  )}
                />
                <span className="max-w-[140px] truncate text-[11px] text-white/75">
                  {r.title}
                </span>
              </span>
            </button>
          ))}
        </div>

        {selected ? (
          <div className="mx-auto mt-8 max-w-lg text-center">
            <p className="text-[15px] text-white">{selected.title}</p>
            <p className="mt-1 text-[10px] tracking-[0.14em] text-amber-200/70">
              {selected.level}
            </p>
            <p className="mt-3 text-[13px] text-white/45">{selected.evidence}</p>
          </div>
        ) : null}

        <ul className="sr-only">
          {riskField.map((r) => (
            <li key={`a11y-${r.id}`}>
              {r.title}: {r.level}. {r.evidence}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
