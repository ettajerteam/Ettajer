"use client";

import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import {
  SaraGlass,
  SaraLabel,
  SaraSectionHeading,
  SaraSectionLead,
} from "@/components/admin/dr-sara/sara-ui";
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
      className="scroll-mt-28 py-14"
      aria-labelledby="sara-network-heading"
    >
      <SaraGlass className="mx-auto max-w-3xl px-6 py-8 sm:px-8">
        <SaraLabel>Network</SaraLabel>
        <SaraSectionHeading id="sara-network-heading">
          Intelligence network
        </SaraSectionHeading>
        <SaraSectionLead>
          Today one intelligence. Tomorrow a specialized network.
        </SaraSectionLead>

        <div className="relative mx-auto mt-10 aspect-square w-full max-w-lg">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#007AFF]/[0.08] blur-3xl"
          />
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
                    stroke="rgba(0,122,255,0.18)"
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
                m.status === "ACTIVE" ? "z-10" : "opacity-60"
              )}
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
            >
              <div
                className={cn(
                  "rounded-2xl px-3 py-2 backdrop-blur-md",
                  m.status === "ACTIVE"
                    ? "border border-[#007AFF]/30 bg-[#007AFF]/[0.12]"
                    : "border border-white/[0.06] bg-white/[0.03]"
                )}
              >
                <p
                  className={cn(
                    "text-[11px] font-semibold tracking-tight",
                    m.status === "ACTIVE" ? "text-[#5AC8FA]" : "text-white/45"
                  )}
                >
                  {m.label}
                </p>
                <p className="mt-0.5 text-[10px] text-white/35">{m.subtitle}</p>
                <p
                  className={cn(
                    "mt-1 text-[10px]",
                    m.status === "ACTIVE"
                      ? "text-emerald-300/85"
                      : "text-white/25"
                  )}
                >
                  {m.status === "ACTIVE" ? "● Active" : "○ Future module"}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-[12px] text-white/35">
          {agentNetwork.placeholder}
        </p>
      </SaraGlass>
    </section>
  );
}
