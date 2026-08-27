"use client";

import { useState } from "react";
import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { SaraLabel, SaraPanel } from "@/components/admin/dr-sara/sara-ui";
import { cn } from "@/lib/utils";

function levelColor(level: string) {
  if (/critical|high/i.test(level)) return "border-red-400/40 bg-red-400/10 text-red-200";
  if (/medium/i.test(level)) return "border-amber-400/35 bg-amber-400/10 text-amber-200";
  return "border-white/15 bg-white/[0.04] text-white/70";
}

export function SaraRiskField({
  riskField,
}: {
  riskField: SaraExperienceViewModel["riskField"];
}) {
  const [active, setActive] = useState<string | null>(riskField[0]?.id ?? null);
  const selected = riskField.find((r) => r.id === active);

  return (
    <section id="sara-section-risks" className="scroll-mt-28 py-10" aria-labelledby="sara-risk-heading">
      <SaraLabel>Risks</SaraLabel>
      <h2 id="sara-risk-heading" className="mt-2 text-[18px] font-semibold tracking-[-0.02em] text-white">
        Risk field
      </h2>
      <p className="mt-1 text-[13px] text-white/40">
        What can hurt Ettajer right now — monitored, not alarming for noise.
      </p>

      <SaraPanel className="mt-5">
        <div className="relative mx-auto aspect-square w-full max-w-md">
          <div className="pointer-events-none absolute inset-[12%] rounded-full border border-white/[0.04]" />
          <div className="pointer-events-none absolute inset-[28%] rounded-full border border-white/[0.05]" />
          <div className="pointer-events-none absolute inset-[44%] rounded-full border border-white/[0.06]" />

          {riskField.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setActive(r.id)}
              onMouseEnter={() => setActive(r.id)}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-2.5 py-1.5 text-[10px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300",
                levelColor(r.level),
                active === r.id && "ring-1 ring-white/30"
              )}
              style={{
                left: `${r.x * 100}%`,
                top: `${r.y * 100}%`,
                transform: `translate(-50%, -50%) scale(${r.scale})`,
              }}
              aria-label={`${r.title}, ${r.level}`}
            >
              {r.title.length > 22 ? `${r.title.slice(0, 20)}…` : r.title}
            </button>
          ))}
        </div>

        {selected ? (
          <div className="mt-5 rounded-xl border border-white/[0.06] bg-black/20 p-4 text-[12px] text-white/55">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[14px] font-medium text-white">{selected.title}</p>
              <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-amber-300">
                {selected.level}
              </span>
            </div>
            <p className="mt-2">{selected.evidence}</p>
            <p className="mt-2 text-white/35">
              Scope: {selected.scope} · Reversibility: {selected.reversibility}
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
      </SaraPanel>
    </section>
  );
}
