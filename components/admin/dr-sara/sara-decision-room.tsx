"use client";

import { useState } from "react";
import Link from "next/link";
import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { MetaChip, riskTone, SaraLabel, SoftDivider } from "@/components/admin/dr-sara/sara-ui";

export function SaraDecisionRoom({
  decisionRoom,
}: {
  decisionRoom: SaraExperienceViewModel["decisionRoom"];
}) {
  const [showEvidence, setShowEvidence] = useState(false);

  if (!decisionRoom) {
    return (
      <section id="sara-section-decision" className="scroll-mt-28 py-16">
        <div className="mx-auto max-w-3xl">
          <SaraLabel>Decision</SaraLabel>
          <p className="mt-4 text-[14px] text-white/40">
            No dominant decision in the current snapshot.
          </p>
        </div>
      </section>
    );
  }

  const d = decisionRoom;

  return (
    <section
      id="sara-section-decision"
      className="scroll-mt-28 py-16"
      aria-labelledby="sara-decision-heading"
    >
      <div className="mx-auto max-w-3xl">
        <SaraLabel>Decision</SaraLabel>
        <p className="mt-3 text-[10px] tracking-[0.16em] text-white/30">TOP DECISION</p>
        <p className="mt-2 font-mono text-[12px] text-sky-300/80">{d.decisionId}</p>
        <h2
          id="sara-decision-heading"
          className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-white sm:text-[34px]"
        >
          {d.title}
        </h2>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
          <MetaChip label="Confidence" value={d.confidenceLabel} tone="blue" />
          <MetaChip label="Risk" value={d.risk} tone={riskTone(d.risk)} />
          <MetaChip label="Mode" value={d.mode} />
          <MetaChip label="Governance" value={d.governance} tone="amber" />
          <MetaChip label="Blast" value={d.blastRadius} />
          <MetaChip label="Score" value={String(d.score)} />
        </div>

        <SoftDivider className="my-10" />

        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <p className="text-[10px] tracking-[0.14em] text-white/30">WHY THIS</p>
            <ul className="mt-3 space-y-2 text-[14px] text-white/55">
              {d.whyThis.slice(0, 4).map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setShowEvidence((v) => !v)}
              className="mt-4 text-[11px] text-white/35 underline-offset-2 hover:text-white/60 hover:underline"
            >
              {showEvidence ? "Hide engine evidence" : "View engine evidence"}
            </button>
            {showEvidence ? (
              <ul className="mt-3 space-y-1 text-[12px] text-white/35">
                {d.beforeExecution.map((b) => (
                  <li key={b}>· {b}</li>
                ))}
                {d.whyNot.slice(0, 3).map((w) => (
                  <li key={w.id}>
                    · Not {w.title}: {w.reasons[0]}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] tracking-[0.14em] text-white/30">
                IF WE DO NOTHING
              </p>
              <p className="mt-2 text-[14px] text-white/60">
                {Object.keys(d.ifNothing.baseline).length
                  ? Object.entries(d.ifNothing.baseline)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" · ")
                  : "Baseline held at current levels."}
              </p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.14em] text-sky-300/70">
                IF WE ACT
              </p>
              <p className="mt-2 text-[14px] text-white/70">
                {Object.keys(d.ifAct.expected).length
                  ? Object.entries(d.ifAct.expected)
                      .map(([k, v]) =>
                        Array.isArray(v) ? `${k}: [${v[0]}, ${v[1]}]` : `${k}: ${v}`
                      )
                      .join(" · ")
                  : "No measurable projection available from current evidence."}
              </p>
              <p className="mt-2 text-[10px] tracking-[0.08em] text-white/25">
                SIMULATED · NOT A GUARANTEE
              </p>
            </div>
          </div>
        </div>

        <Link
          href={d.href}
          className="mt-10 inline-flex rounded-full bg-white px-6 py-3 text-[13px] font-medium text-neutral-950 transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
        >
          {d.cta}
        </Link>
      </div>
    </section>
  );
}
