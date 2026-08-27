"use client";

import { useEffect, useId, useState } from "react";
import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import {
  SaraGlass,
  SaraLabel,
  SaraSectionHeading,
  SaraSectionLead,
  SoftDivider,
} from "@/components/admin/dr-sara/sara-ui";

function statusColor(status: string) {
  if (status === "critical") return "#f87171";
  if (status === "attention") return "#fb923c";
  if (status === "watch") return "#fbbf24";
  return "#7dd3fc";
}

export function SaraSystemMap({
  platformMap,
}: {
  platformMap: SaraExperienceViewModel["platformMap"];
}) {
  const [active, setActive] = useState<string | null>(
    platformMap.nodes.find((n) => n.emphasis)?.id ?? null
  );
  const [animateFlow, setAnimateFlow] = useState(false);
  const gid = useId();
  const node = platformMap.nodes.find((n) => n.id === active);
  const byId = new Map(platformMap.nodes.map((n) => [n.id, n]));

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setAnimateFlow(!media.matches);
    const onChange = () => setAnimateFlow(!media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <section
      id="sara-section-system"
      className="scroll-mt-28 py-16"
      aria-labelledby="sara-system-heading"
    >
      <SaraGlass className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <SaraLabel>System</SaraLabel>
        <SaraSectionHeading id="sara-system-heading">
          Platform field
        </SaraSectionHeading>
        <SaraSectionLead>
          Ettajer as a living system. The active path follows the current top
          decision.
        </SaraSectionLead>

        <div className="mt-8 overflow-x-auto">
          <svg
            viewBox="0 0 100 100"
            className="mx-auto h-auto w-full min-w-[340px] max-w-3xl"
            role="img"
            aria-label="Ettajer platform system map"
          >
            <defs>
              <filter id={`${gid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.1" result="coloredBlur" />
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
                    stroke={
                      edge.active
                        ? "rgba(125,211,252,0.45)"
                        : "rgba(255,255,255,0.08)"
                    }
                    strokeWidth={edge.active ? 0.4 : 0.2}
                  />
                  {edge.active && animateFlow ? (
                    <circle r="0.65" fill="#7dd3fc">
                      <animateMotion
                        dur="3.8s"
                        repeatCount="indefinite"
                        path={`M ${a.x},${a.y} L ${b.x},${b.y}`}
                      />
                    </circle>
                  ) : null}
                </g>
              );
            })}

            {platformMap.nodes.map((n) => {
              const r = 2.8 * n.size;
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
                  {n.emphasis ? (
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={r + 1.6}
                      fill="none"
                      stroke="rgba(125,211,252,0.25)"
                      strokeWidth={0.35}
                      className="motion-safe:opacity-90"
                    />
                  ) : null}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={r}
                    fill={
                      selected || n.emphasis
                        ? "rgba(14,165,233,0.16)"
                        : "rgba(255,255,255,0.03)"
                    }
                    stroke={statusColor(n.status)}
                    strokeWidth={selected ? 0.5 : 0.28}
                    filter={n.emphasis ? `url(#${gid}-glow)` : undefined}
                  />
                  <text
                    x={n.x}
                    y={n.y - r - 1.6}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.55)"
                    fontSize="2.2"
                    fontFamily="Inter, system-ui, sans-serif"
                  >
                    {n.label}
                  </text>
                  <text
                    x={n.x}
                    y={n.y + 0.85}
                    textAnchor="middle"
                    fill="white"
                    fontSize="2.6"
                    fontWeight="600"
                    fontFamily="Inter, system-ui, sans-serif"
                  >
                    {n.metric}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {node ? (
          <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-4 text-center text-[13px] text-white/45 backdrop-blur-md">
            <p className="text-[14px] text-white/85">
              {node.label}
              <span className="text-white/30"> · </span>
              {node.status}
            </p>
            {node.signals[0] ? <p className="mt-2">{node.signals[0]}</p> : null}
            {node.connectedDecisions.length > 0 ? (
              <p className="mt-2 text-[#5AC8FA]/80">
                Connected decision · {node.connectedDecisions.join(", ")}
              </p>
            ) : null}
          </div>
        ) : null}

        <SoftDivider className="mx-auto mt-10 max-w-xs" />

        <ul className="sr-only">
          {platformMap.nodes.map((n) => (
            <li key={`a11y-${n.id}`}>
              {n.label}: {n.metric} ({n.status})
            </li>
          ))}
        </ul>
      </SaraGlass>
    </section>
  );
}
