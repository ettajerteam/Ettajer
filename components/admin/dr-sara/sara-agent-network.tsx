"use client";

import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { SaraLabel } from "@/components/admin/dr-sara/sara-ui";
import { cn } from "@/lib/utils";

export function SaraAgentNetwork({
  agentNetwork,
}: {
  agentNetwork: SaraExperienceViewModel["agentNetwork"];
}) {
  const modules = agentNetwork.modules;
  const master = modules.find((m) => m.status === "ACTIVE") ?? modules[0];

  return (
    <section
      id="sara-section-network"
      className="scroll-mt-28 py-16"
      aria-labelledby="sara-network-heading"
    >
      <div className="mx-auto max-w-3xl">
        <SaraLabel>Network</SaraLabel>
        <h2
          id="sara-network-heading"
          className="mt-3 text-[22px] font-semibold tracking-[-0.02em] text-white"
        >
          Intelligence network
        </h2>
        <p className="mt-2 text-[14px] text-white/40">
          Today one intelligence. Tomorrow a specialized network.
        </p>

        <div className="relative mx-auto mt-12 aspect-square w-full max-w-lg">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
            {modules
              .filter((m) => m.status === "FUTURE")
              .map((m) =>
                master ? (
                  <line
                    key={`line-${m.id}`}
                    x1={master.x}
                    y1={master.y}
                    x2={m.x}
                    y2={m.y}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="0.25"
                  />
                ) : null
              )}
          </svg>

          {modules.map((m) => (
            <div
              key={m.id}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 text-center",
                m.status === "ACTIVE" ? "z-10" : "opacity-55"
              )}
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
            >
              <p
                className={cn(
                  "text-[11px] font-semibold tracking-[0.1em]",
                  m.status === "ACTIVE" ? "text-sky-100" : "text-white/40"
                )}
              >
                {m.label}
              </p>
              <p className="mt-0.5 text-[10px] text-white/30">{m.subtitle}</p>
              <p
                className={cn(
                  "mt-1 text-[9px] tracking-[0.12em]",
                  m.status === "ACTIVE" ? "text-emerald-300/80" : "text-white/20"
                )}
              >
                {m.status === "ACTIVE" ? "● ACTIVE" : "○ FUTURE MODULE"}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-[12px] text-white/30">
          {agentNetwork.placeholder}
        </p>
      </div>
    </section>
  );
}
