"use client";

import type { TrafficSource } from "@/types/dashboard";
import { homeCard, homeCardPad, homeSubtitle, homeTitle } from "./home-ui";

interface HomeTrafficSourcesProps {
  sources: TrafficSource[];
}

const COLORS = ["#007AFF", "#34C759", "#FF9500", "#AF52DE", "#5856D6", "#FF2D55"];

export function HomeTrafficSources({ sources }: HomeTrafficSourcesProps) {
  const total = sources.reduce((sum, source) => sum + source.percentage, 0) || 100;
  let cumulative = 0;

  const segments = sources.map((source, index) => {
    const start = (cumulative / total) * 360;
    cumulative += source.percentage;
    const end = (cumulative / total) * 360;
    const largeArc = end - start > 180 ? 1 : 0;
    const startRadians = ((start - 90) * Math.PI) / 180;
    const endRadians = ((end - 90) * Math.PI) / 180;
    const radius = 40;
    const center = 52;

    const x1 = center + radius * Math.cos(startRadians);
    const y1 = center + radius * Math.sin(startRadians);
    const x2 = center + radius * Math.cos(endRadians);
    const y2 = center + radius * Math.sin(endRadians);

    return {
      ...source,
      color: COLORS[index % COLORS.length],
      path: `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
    };
  });

  return (
    <section className={`${homeCard} ${homeCardPad}`}>
      <h2 className={homeTitle}>Traffic</h2>
      <p className={homeSubtitle}>Visitor sources</p>

      <div className="mt-3 flex items-center gap-4">
        <svg width="104" height="104" viewBox="0 0 104 104" aria-label="Traffic sources">
          {segments.map((segment) => (
            <path key={segment.id} d={segment.path} fill={segment.color} />
          ))}
          <circle cx="52" cy="52" r="22" fill="white" className="dark:fill-[#161616]" />
        </svg>

        <div className="grid flex-1 gap-1.5">
          {segments.map((segment) => (
            <div key={segment.id} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />
                {segment.label}
              </span>
              <span className="font-medium text-neutral-900 dark:text-white">{segment.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
