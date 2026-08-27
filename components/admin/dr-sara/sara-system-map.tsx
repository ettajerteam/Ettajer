"use client";

import { useId, useState } from "react";
import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { SaraLabel, SaraPanel } from "@/components/admin/dr-sara/sara-ui";
import { cn } from "@/lib/utils";

function statusColor(status: string) {
  if (status === "critical") return "#f87171";
  if (status === "attention") return "#fb923c";
  if (status === "watch") return "#fbbf24";
  return "#38bdf8";
}

export function SaraSystemMap({
  platformMap,
}: {
  platformMap: SaraExperienceViewModel["platformMap"];
}) {
  const [active, setActive] = useState<string | null>(
    platformMap.nodes.find((n) => n.emphasis)?.id ?? null
  );
  const gid = useId();
  const node = platformMap.nodes.find((n) => n.id === active);
  const byId = new Map(platformMap.nodes.map((n) => [n.id, n]));

  return (
    <section id="sara-section-system" className="scroll-mt-28 py-10" aria-labelledby="sara-system-heading">
      <SaraLabel>System</SaraLabel>
      <h2 id="sara-system-heading" className="mt-2 text-[18px] font-semibold tracking-[-0.02em] text-white">
        Platform map
      </h2>
      <p className="mt-1 text-[13px] text-white/40">
        Living system relationships. Emphasized path follows the current top decision.
      </p>

      <SaraPanel className="mt-5 overflow-x-auto">
        <svg
          viewBox="0 0 100 100"
          className="mx-auto h-auto w-full min-w-[320px] max-w-3xl"
          role="img"
          aria-label="Ettajer platform system map"
        >
          <defs>
            <filter id={`${gid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {platformMap.edges.map((edge) => {
            const a = byId.get(edge.from);
            const b = byId.get(edge.to);
            if (!a || !b) return null;
            return (
              <g key={`${edge.from}-${edge.to}-${edge.label}`}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={edge.active ? "rgba(56,189,248,0.55)" : "rgba(255,255,255,0.12)"}
                  strokeWidth={edge.active ? 0.45 : 0.25}
                />
                {edge.active ? (
                  <circle r="0.7" fill="#38bdf8" className="motion-safe:opacity-80">
                    <animateMotion
                      dur="3.5s"
                      repeatCount="indefinite"
                      path={`M ${a.x},${a.y} L ${b.x},${b.y}`}
                    />
                  </circle>
                ) : null}
              </g>
            );
          })}

          {platformMap.nodes.map((n) => {
            const r = 3.2 * n.size;
            const selected = active === n.id;
            return (
              <g
                key={n.id}
                className="cursor-pointer"
                onMouseEnter={() => setActive(n.id)}
                onFocus={() => setActive(n.id)}
                onClick={() => setActive(n.id)}
                tabIndex={0}
                role="button"
                aria-label={`${n.label}: ${n.metric}, status ${n.status}`}
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={r + 1.2}
                  fill="transparent"
                  stroke={n.emphasis ? "rgba(56,189,248,0.35)" : "transparent"}
                  strokeWidth={0.4}
                  className={cn(n.emphasis && "motion-safe:opacity-90")}
                />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={r}
                  fill={selected || n.emphasis ? "rgba(14,165,233,0.18)" : "rgba(255,255,255,0.04)"}
                  stroke={statusColor(n.status)}
                  strokeWidth={selected ? 0.55 : 0.35}
                  filter={n.emphasis ? `url(#${gid}-glow)` : undefined}
                />
                <text
                  x={n.x}
                  y={n.y - r - 1.8}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.7)"
                  fontSize="2.4"
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {n.label}
                </text>
                <text
                  x={n.x}
                  y={n.y + 0.9}
                  textAnchor="middle"
                  fill="white"
                  fontSize="2.8"
                  fontWeight="600"
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {n.metric}
                </text>
              </g>
            );
          })}
        </svg>

        {node ? (
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/20 p-4 text-[12px] text-white/60">
            <p className="text-[13px] font-medium text-white">
              {node.label} · {node.status}
            </p>
            {node.signals.length > 0 ? (
              <p className="mt-2">Signals: {node.signals.join(" · ")}</p>
            ) : null}
            {node.risks.length > 0 ? (
              <p className="mt-1">Risks: {node.risks.join(" · ")}</p>
            ) : null}
            {node.connectedDecisions.length > 0 ? (
              <p className="mt-1 text-sky-300">
                Decisions: {node.connectedDecisions.join(", ")}
              </p>
            ) : null}
          </div>
        ) : null}

        <ul className="sr-only">
          {platformMap.nodes.map((n) => (
            <li key={`a11y-${n.id}`}>
              {n.label}: {n.metric} ({n.status})
            </li>
          ))}
        </ul>
      </SaraPanel>
    </section>
  );
}
