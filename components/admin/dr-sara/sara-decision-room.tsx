"use client";

import { useState } from "react";
import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import {
  MetaChip,
  riskTone,
  SaraCta,
  SaraGlass,
  SaraLabel,
  SaraSectionHeading,
  SoftDivider,
} from "@/components/admin/dr-sara/sara-ui";

export function SaraDecisionRoom({
  decisionRoom,
}: {
  decisionRoom: SaraExperienceViewModel["decisionRoom"];
}) {
  const [showEvidence, setShowEvidence] = useState(false);

  if (!decisionRoom) {
    return (
      <section id="sara-section-decision" className="scroll-mt-28 py-14">
        <SaraGlass className="mx-auto max-w-3xl px-6 py-8 sm:px-8">
          <SaraLabel>Decision</SaraLabel>
          <p className="mt-4 text-[14px] text-white/45">
            No dominant decision in the current snapshot.
          </p>
        </SaraGlass>
      </section>
    );
  }

  const d = decisionRoom;

  return (
    <section
      id="sara-section-decision"
      className="scroll-mt-28 py-14"
      aria-labelledby="sara-decision-heading"
    >
      <SaraGlass strong className="mx-auto max-w-3xl px-6 py-8 sm:px-8 sm:py-10">
        <SaraLabel>Decision</SaraLabel>
        <p className="mt-2 text-[11px] font-medium text-[#5AC8FA]/80">
          Top decision
        </p>
        <p className="mt-2 font-mono text-[12px] text-white/40">{d.decisionId}</p>
        <SaraSectionHeading id="sara-decision-heading" className="sm:text-[32px]">
          {d.title}
        </SaraSectionHeading>

        <div className="mt-6 flex flex-wrap gap-2">
          <MetaChip label="Confidence" value={d.confidenceLabel} tone="blue" />
          <MetaChip label="Risk" value={d.risk} tone={riskTone(d.risk)} />
          <MetaChip label="Mode" value={d.mode} />
          <MetaChip label="Governance" value={d.governance} tone="amber" />
          <MetaChip label="Blast" value={d.blastRadius} />
          <MetaChip label="Score" value={String(d.score)} />
        </div>

        <SoftDivider className="my-8" />

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-[12px] font-medium text-white/40">Why this</p>
            <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-white/60">
              {d.whyThis.slice(0, 4).map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setShowEvidence((v) => !v)}
              className="mt-4 text-[12px] text-white/40 underline-offset-2 hover:text-white/70 hover:underline"
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
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-4 backdrop-blur-md">
              <p className="text-[12px] font-medium text-white/40">
                If we do nothing
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-white/65">
                {Object.keys(d.ifNothing.baseline).length
                  ? Object.entries(d.ifNothing.baseline)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" · ")
                  : "Baseline held at current levels."}
              </p>
            </div>
            <div className="rounded-2xl border border-[#007AFF]/20 bg-[#007AFF]/[0.06] px-4 py-4 backdrop-blur-md">
              <p className="text-[12px] font-medium text-[#5AC8FA]">If we act</p>
              <p className="mt-2 text-[14px] leading-relaxed text-white/75">
                {Object.keys(d.ifAct.expected).length
                  ? Object.entries(d.ifAct.expected)
                      .map(([k, v]) =>
                        Array.isArray(v) ? `${k}: [${v[0]}, ${v[1]}]` : `${k}: ${v}`
                      )
                      .join(" · ")
                  : "No measurable projection available from current evidence."}
              </p>
              <p className="mt-2 text-[11px] text-white/30">
                Simulated · not a guarantee
              </p>
            </div>
          </div>
        </div>

        <SaraCta href={d.href} className="mt-9">
          {d.cta}
        </SaraCta>
      </SaraGlass>
    </section>
  );
}
