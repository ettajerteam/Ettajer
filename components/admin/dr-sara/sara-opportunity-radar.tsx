"use client";

import { useState } from "react";
import Link from "next/link";
import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { SaraLabel } from "@/components/admin/dr-sara/sara-ui";
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
      className="scroll-mt-28 py-16"
      aria-labelledby="sara-opp-heading"
    >
      <div className="mx-auto max-w-3xl">
        <SaraLabel>Opportunities</SaraLabel>
        <h2
          id="sara-opp-heading"
          className="mt-3 text-[22px] font-semibold tracking-[-0.02em] text-white"
        >
          Opportunity constellation
        </h2>
        <p className="mt-2 text-[14px] text-white/40">
          Actionable points derived from stable opportunity IDs.
        </p>

        <div className="relative mx-auto mt-10 aspect-square w-full max-w-md">
          <div className="pointer-events-none absolute inset-[12%] rounded-full border border-dashed border-white/[0.05]" />
          <div className="pointer-events-none absolute inset-[34%] rounded-full border border-dashed border-white/[0.06]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-300/60" />

          {opportunities.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setActive(o.id)}
              onMouseEnter={() => setActive(o.id)}
              className={cn(
                "absolute max-w-[130px] -translate-x-1/2 -translate-y-1/2 truncate text-[11px] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300",
                active === o.id ? "text-sky-100" : "text-white/45 hover:text-white/75"
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
          <div className="mx-auto mt-8 max-w-lg text-center">
            <p className="text-[10px] tracking-[0.14em] text-sky-300/70">
              {selected.category}
            </p>
            <p className="mt-2 text-[16px] text-white">{selected.title}</p>
            <p className="mt-2 text-[13px] text-white/45">{selected.signal}</p>
            <p className="mt-2 text-[12px] text-white/30">
              {selected.impact} · {selected.affected} ·{" "}
              {Math.round(selected.confidence * 100)}%
            </p>
            {selected.href ? (
              <Link
                href={selected.href}
                className="mt-4 inline-flex text-[12px] text-sky-200 hover:underline"
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
      </div>
    </section>
  );
}
