"use client";

import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { SaraLabel, SaraPanel } from "@/components/admin/dr-sara/sara-ui";
import { cn } from "@/lib/utils";

export function SaraAgentNetwork({
  agentNetwork,
}: {
  agentNetwork: SaraExperienceViewModel["agentNetwork"];
}) {
  const modules = agentNetwork.modules;
  const master = modules.find((m) => m.status === "ACTIVE") ?? modules[0];

  return (
    <section id="sara-section-network" className="scroll-mt-28 py-10" aria-labelledby="sara-network-heading">
      <SaraLabel>Network</SaraLabel>
      <h2 id="sara-network-heading" className="mt-2 text-[18px] font-semibold tracking-[-0.02em] text-white">
        Intelligence network
      </h2>
      <p className="mt-1 text-[13px] text-white/40">
        Today: one intelligence. Tomorrow: a specialized network.
      </p>

      <SaraPanel className="mt-5">
        <div className="relative mx-auto aspect-square w-full max-w-lg">
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
                    stroke="rgba(255,255,255,0.08)"
                    strokeDasharray="1.2 1.2"
                    strokeWidth="0.3"
                  />
                ) : null
              )}
          </svg>

          {modules.map((m) => (
            <div
              key={m.id}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-3 py-2 text-center",
                m.status === "ACTIVE"
                  ? "border-sky-400/40 bg-sky-400/10 shadow-[0_0_30px_rgba(56,189,248,0.12)]"
                  : "border-dashed border-white/15 bg-white/[0.02]"
              )}
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
            >
              <p
                className={cn(
                  "text-[11px] font-semibold tracking-[0.08em]",
                  m.status === "ACTIVE" ? "text-sky-200" : "text-white/45"
                )}
              >
                {m.label}
              </p>
              <p className="mt-0.5 text-[10px] text-white/35">{m.subtitle}</p>
              <p
                className={cn(
                  "mt-1 text-[9px] font-medium tracking-[0.12em]",
                  m.status === "ACTIVE" ? "text-emerald-300" : "text-white/25"
                )}
              >
                {m.status === "ACTIVE" ? "ACTIVE" : "FUTURE MODULE"}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-[12px] text-white/35">
          {agentNetwork.placeholder}
        </p>
      </SaraPanel>
    </section>
  );
}
