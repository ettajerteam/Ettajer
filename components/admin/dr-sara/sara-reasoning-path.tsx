"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { SaraLabel, SaraPanel } from "@/components/admin/dr-sara/sara-ui";
import { cn } from "@/lib/utils";

export function SaraReasoningPath({
  whyChain,
}: {
  whyChain: SaraExperienceViewModel["whyChain"];
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="sara-section-why" className="scroll-mt-28 py-10" aria-labelledby="sara-why-heading">
      <SaraLabel>Why</SaraLabel>
      <h2 id="sara-why-heading" className="mt-2 text-[18px] font-semibold tracking-[-0.02em] text-white">
        Structured reasoning path
      </h2>
      <p className="mt-1 text-[13px] text-white/40">
        Auditable chain from engine outputs — not hidden thought.
      </p>

      <SaraPanel className="mt-5">
        <ol className="space-y-0">
          {whyChain.map((step, i) => {
            const open = openId === step.id;
            return (
              <li key={step.id} className="relative pl-1">
                {i < whyChain.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-px bg-white/[0.08]"
                  />
                ) : null}
                <div className="flex gap-3 pb-5">
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sky-400/30 bg-sky-400/10 text-[10px] font-medium text-sky-300">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : step.id)}
                      className="flex w-full items-start justify-between gap-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                      aria-expanded={open}
                    >
                      <div>
                        <p className="text-[10px] font-medium tracking-[0.14em] text-sky-300/80">
                          {step.label}
                        </p>
                        {step.href ? (
                          <Link
                            href={step.href}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 block text-[14px] text-white hover:text-sky-300"
                          >
                            {step.detail}
                          </Link>
                        ) : (
                          <p className="mt-1 text-[14px] text-white">{step.detail}</p>
                        )}
                      </div>
                      {step.evidence && step.evidence.length > 0 ? (
                        open ? (
                          <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-white/30" />
                        ) : (
                          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-white/30" />
                        )
                      ) : null}
                    </button>
                    {open && step.evidence && step.evidence.length > 0 ? (
                      <ul
                        className={cn(
                          "mt-2 space-y-1 rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2 text-[12px] text-white/50"
                        )}
                      >
                        {step.evidence.map((e) => (
                          <li key={e}>· {e}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </SaraPanel>
    </section>
  );
}
