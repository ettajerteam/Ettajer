"use client";

import { useState } from "react";
import Link from "next/link";
import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { SaraLabel, SaraPanel } from "@/components/admin/dr-sara/sara-ui";
import { cn } from "@/lib/utils";

const CATEGORY_COLOR: Record<string, string> = {
  REVENUE: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  OPERATIONS: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  ACTIVATION: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  TECHNICAL: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  MERCHANTS: "border-white/20 bg-white/[0.05] text-white/75",
  GROWTH: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
};

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
      className="scroll-mt-28 py-10"
      aria-labelledby="sara-opp-heading"
    >
      <SaraLabel>Opportunities</SaraLabel>
      <h2 id="sara-opp-heading" className="mt-2 text-[18px] font-semibold tracking-[-0.02em] text-white">
        Opportunity radar
      </h2>
      <p className="mt-1 text-[13px] text-white/40">
        Deterministic positions from stable opportunity IDs.
      </p>

      <SaraPanel className="mt-5">
        <div className="relative mx-auto aspect-square w-full max-w-md">
          <div className="pointer-events-none absolute inset-[10%] rounded-full border border-dashed border-white/[0.05]" />
          <div className="pointer-events-none absolute inset-[30%] rounded-full border border-dashed border-white/[0.06]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/50" />

          {opportunities.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setActive(o.id)}
              onMouseEnter={() => setActive(o.id)}
              className={cn(
                "absolute max-w-[120px] -translate-x-1/2 -translate-y-1/2 truncate rounded-full border px-2.5 py-1.5 text-[10px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300",
                CATEGORY_COLOR[o.category] ?? CATEGORY_COLOR.MERCHANTS,
                active === o.id && "ring-1 ring-white/25"
              )}
              style={{
                left: `${o.x * 100}%`,
                top: `${o.y * 100}%`,
              }}
              aria-label={`${o.category}: ${o.title}`}
              title={o.title}
            >
              {o.title.length > 18 ? `${o.title.slice(0, 16)}…` : o.title}
            </button>
          ))}
        </div>

        {selected ? (
          <div className="mt-5 rounded-xl border border-white/[0.06] bg-black/20 p-4 text-[12px] text-white/55">
            <p className="text-[10px] font-medium tracking-[0.12em] text-sky-300">
              {selected.category}
            </p>
            <p className="mt-1 text-[14px] font-medium text-white">{selected.title}</p>
            <p className="mt-2">{selected.signal}</p>
            <p className="mt-2 text-white/35">
              {selected.impact} · {selected.affected} ·{" "}
              {Math.round(selected.confidence * 100)}%
            </p>
            {selected.href ? (
              <Link
                href={selected.href}
                className="mt-3 inline-flex text-[12px] font-medium text-sky-300 hover:underline"
              >
                {selected.action}
              </Link>
            ) : (
              <p className="mt-3 text-[12px] text-white/45">{selected.action}</p>
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
      </SaraPanel>
    </section>
  );
}
