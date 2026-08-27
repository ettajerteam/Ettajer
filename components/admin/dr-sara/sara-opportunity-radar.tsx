"use client";

import { useState } from "react";
import Link from "next/link";
import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import {
  SaraGlass,
  SaraLabel,
  SaraSectionHeading,
  SaraSectionLead,
} from "@/components/admin/dr-sara/sara-ui";
import { cn } from "@/lib/utils";

export function SaraOpportunityRadar({
  opportunities,
}: {
  opportunities: SaraExperienceViewModel["opportunities"];
}) {
  const [active, setActive] = useState<string | null>(opportunities[0]?.id ?? null);
  const selected = opportunities.find((o) => o.id === active);

  return (
    <section
      id="sara-section-opportunities"
      className="scroll-mt-28 py-14"
      aria-labelledby="sara-opp-heading"
    >
      <SaraGlass className="mx-auto max-w-3xl px-6 py-8 sm:px-8">
        <SaraLabel>Opportunities</SaraLabel>
        <SaraSectionHeading id="sara-opp-heading">
          Opportunity constellation
        </SaraSectionHeading>
        <SaraSectionLead>
          Actionable points derived from stable opportunity IDs.
        </SaraSectionLead>

        <div className="relative mx-auto mt-8 aspect-square w-full max-w-md">
          <div className="pointer-events-none absolute inset-[12%] rounded-full border border-dashed border-white/[0.06]" />
          <div className="pointer-events-none absolute inset-[34%] rounded-full border border-dashed border-[#007AFF]/15" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#007AFF]/70 shadow-[0_0_16px_rgba(0,122,255,0.45)]" />

          {opportunities.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setActive(o.id)}
              onMouseEnter={() => setActive(o.id)}
              className={cn(
                "absolute max-w-[130px] -translate-x-1/2 -translate-y-1/2 truncate text-[11px] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5AC8FA]",
                active === o.id
                  ? "text-[#5AC8FA]"
                  : "text-white/45 hover:text-white/80"
              )}
              style={{ left: `${o.x * 100}%`, top: `${o.y * 100}%` }}
              aria-label={`${o.category}: ${o.title}`}
              title={o.title}
            >
              {o.title.length > 20 ? `${o.title.slice(0, 18)}…` : o.title}
            </button>
          ))}
        </div>

        {selected ? (
          <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-5 text-center backdrop-blur-md">
            <p className="text-[12px] font-medium text-[#5AC8FA]/80">
              {selected.category}
            </p>
            <p className="mt-2 text-[16px] font-medium tracking-tight text-white">
              {selected.title}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-white/50">
              {selected.signal}
            </p>
            <p className="mt-2 text-[12px] text-white/35">
              {selected.impact} · {selected.affected} ·{" "}
              {Math.round(selected.confidence * 100)}%
            </p>
            {selected.href ? (
              <Link
                href={selected.href}
                className="mt-4 inline-flex text-[12px] font-medium text-[#007AFF] hover:underline"
              >
                {selected.action}
              </Link>
            ) : (
              <p className="mt-4 text-[12px] text-white/40">{selected.action}</p>
            )}
          </div>
        ) : null}

        <ul className="sr-only">
          {opportunities.map((o) => (
            <li key={`a11y-${o.id}`}>
              {o.category}: {o.title}. {o.signal}
            </li>
          ))}
        </ul>
      </SaraGlass>
    </section>
  );
}
