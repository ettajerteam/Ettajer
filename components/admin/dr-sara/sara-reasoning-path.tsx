"use client";

import { useState } from "react";
import Link from "next/link";
import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { SaraLabel } from "@/components/admin/dr-sara/sara-ui";

export function SaraReasoningPath({
  whyChain,
}: {
  whyChain: SaraExperienceViewModel["whyChain"];
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section
      id="sara-section-why"
      className="scroll-mt-28 py-16"
      aria-labelledby="sara-why-heading"
    >
      <div className="mx-auto max-w-2xl">
        <SaraLabel>Why</SaraLabel>
        <h2
          id="sara-why-heading"
          className="mt-3 text-[22px] font-semibold tracking-[-0.02em] text-white"
        >
          Reasoning path
        </h2>
        <p className="mt-2 text-[14px] text-white/40">
          Auditable reasoning path from engine outputs.
        </p>

        <ol className="mt-10 space-y-0">
          {whyChain.map((step, i) => {
            const open = openId === step.id;
            const hasEvidence = Boolean(step.evidence?.length);
            return (
              <li key={step.id} className="relative pl-12">
                {i < whyChain.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute left-[15px] top-8 h-[calc(100%-12px)] w-px bg-white/[0.08]"
                  />
                ) : null}
                <span className="absolute left-0 top-1 font-mono text-[11px] text-white/25">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="pb-8">
                  <p className="text-[10px] font-medium tracking-[0.16em] text-sky-300/70">
                    {step.label}
                  </p>
                  {step.href ? (
                    <Link
                      href={step.href}
                      className="mt-1 block text-[16px] text-white hover:text-sky-200"
                    >
                      {step.detail}
                    </Link>
                  ) : (
                    <p className="mt-1 text-[16px] text-white/90">{step.detail}</p>
                  )}
                  {hasEvidence ? (
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : step.id)}
                      className="mt-2 text-[11px] text-white/35 underline-offset-2 hover:text-white/60 hover:underline"
                      aria-expanded={open}
                    >
                      {open ? "Hide evidence" : "View engine evidence"}
                    </button>
                  ) : null}
                  {open && step.evidence ? (
                    <ul className="mt-3 space-y-1 text-[12px] text-white/40">
                      {step.evidence.map((e) => (
                        <li key={e}>· {e}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
