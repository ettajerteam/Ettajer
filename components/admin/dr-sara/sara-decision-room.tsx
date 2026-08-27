"use client";

import Link from "next/link";
import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { MetaChip, riskTone, SaraLabel, SaraPanel } from "@/components/admin/dr-sara/sara-ui";

export function SaraDecisionRoom({
  decisionRoom,
}: {
  decisionRoom: SaraExperienceViewModel["decisionRoom"];
}) {
  if (!decisionRoom) {
    return (
      <section id="sara-section-decision" className="scroll-mt-28 py-10">
        <SaraLabel>Decision</SaraLabel>
        <p className="mt-3 text-[13px] text-white/40">No dominant decision in current snapshot.</p>
      </section>
    );
  }

  const d = decisionRoom;

  return (
    <section id="sara-section-decision" className="scroll-mt-28 py-10" aria-labelledby="sara-decision-heading">
      <SaraLabel>Decision</SaraLabel>
      <h2 id="sara-decision-heading" className="mt-2 text-[18px] font-semibold tracking-[-0.02em] text-white">
        Decision room
      </h2>

      <SaraPanel className="mt-5">
        <p className="text-[10px] font-medium tracking-[0.16em] text-white/35">TOP DECISION</p>
        <p className="mt-2 font-mono text-[12px] text-sky-300">{d.decisionId}</p>
        <p className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-white">{d.title}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <MetaChip label="Score" value={String(d.score)} tone="blue" />
          <MetaChip label="Confidence" value={d.confidenceLabel} tone="blue" />
          <MetaChip label="Mode" value={d.mode} />
          <MetaChip label="Governance" value={d.governance} tone="amber" />
          <MetaChip label="Risk" value={d.risk} tone={riskTone(d.risk)} />
          <MetaChip label="Blast" value={d.blastRadius} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-[10px] font-medium tracking-[0.14em] text-white/35">WHY THIS</p>
            <ul className="mt-2 space-y-1 text-[13px] text-white/60">
              {d.whyThis.map((w) => (
                <li key={w}>· {w}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-[0.14em] text-white/35">
              BEFORE EXECUTION
            </p>
            <ul className="mt-2 space-y-1 text-[13px] text-white/60">
              {d.beforeExecution.map((b) => (
                <li key={b}>· {b}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
            <p className="text-[10px] font-medium tracking-[0.14em] text-white/35">
              IF WE DO NOTHING
            </p>
            <pre className="mt-2 font-mono text-[12px] text-white/65">
              {JSON.stringify(d.ifNothing.baseline, null, 2)}
            </pre>
          </div>
          <div className="rounded-xl border border-sky-400/20 bg-sky-400/[0.06] p-4">
            <p className="text-[10px] font-medium tracking-[0.14em] text-sky-300">
              IF WE ACT
            </p>
            <pre className="mt-2 font-mono text-[12px] text-white/80">
              {JSON.stringify(d.ifAct.expected, null, 2)}
            </pre>
            <p className="mt-2 text-[10px] text-white/30">
              SIMULATED · EXPECTED RANGE · NOT A GUARANTEE
            </p>
          </div>
        </div>

        <Link
          href={d.href}
          className="mt-6 inline-flex rounded-xl bg-sky-500 px-5 py-2.5 text-[13px] font-medium text-white transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
        >
          {d.cta}
        </Link>
      </SaraPanel>
    </section>
  );
}
