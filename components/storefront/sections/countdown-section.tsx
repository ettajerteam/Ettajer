"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { parseSectionVisualSettings } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { CountdownSectionSettings } from "@/lib/sections/types";
import type { PublicStore } from "@/types/storefront";
import { resolveStoreNavHref } from "@/lib/storefront-urls";
import { cn } from "@/lib/utils";

interface CountdownSectionProps {
  store: PublicStore;
  settings: CountdownSectionSettings;
  previewDevice?: DeviceMode;
}

function getParts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds, ended: total <= 0 };
}

const PLACEHOLDER = { days: 0, hours: 0, minutes: 0, seconds: 0, ended: false };

export function CountdownSection({ store, settings }: CountdownSectionProps) {
  const visual = parseSectionVisualSettings(settings as Record<string, unknown>);
  const endAt = settings.endAt?.trim();

  // Never call Date.now() during SSR/first paint — that causes hydration mismatches
  // (server "52" vs client "43") and can take down the whole preview root.
  const [now, setNow] = useState<number | null>(null);
  const [fallbackEndMs, setFallbackEndMs] = useState<number | null>(null);

  useEffect(() => {
    const start = Date.now();
    setNow(start);
    if (!endAt) {
      setFallbackEndMs(start + 3 * 24 * 60 * 60 * 1000);
    } else {
      setFallbackEndMs(null);
    }
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [endAt]);

  const endMs = useMemo(() => {
    if (endAt) {
      const parsed = Date.parse(endAt);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return fallbackEndMs;
  }, [endAt, fallbackEndMs]);

  const ready = now != null && endMs != null;
  const parts = ready ? getParts(endMs - now) : PLACEHOLDER;
  const title = settings.title?.trim() || "Sale ends soon";
  const subtitle = settings.subtitle?.trim();
  const ctaText = settings.ctaText?.trim();
  const ctaLink = settings.ctaLink?.trim() || "/products";

  const units = [
    { label: "Days", value: parts.days },
    { label: "Hours", value: parts.hours },
    { label: "Min", value: parts.minutes },
    { label: "Sec", value: parts.seconds },
  ];

  return (
    <section
      className="px-6 py-14 text-center"
      style={{
        padding: visual.padding,
        margin: visual.margin,
        backgroundColor: visual.backgroundColor ?? "#0a0a0a",
        color: visual.textColor ?? "#ffffff",
      }}
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        {subtitle ? <p className="mt-3 text-sm opacity-70 sm:text-base">{subtitle}</p> : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {units.map((unit) => (
            <div
              key={unit.label}
              className="min-w-[4.5rem] rounded-2xl border border-white/10 bg-white/5 px-3 py-3"
            >
              <p
                className="font-mono text-2xl font-semibold tabular-nums sm:text-3xl"
                suppressHydrationWarning
              >
                {ready ? String(unit.value).padStart(2, "0") : "--"}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-wider opacity-60">{unit.label}</p>
            </div>
          ))}
        </div>
        {ready && parts.ended ? (
          <p className="mt-6 text-sm opacity-70">This offer has ended.</p>
        ) : ctaText ? (
          <Link
            href={resolveStoreNavHref(store.slug, ctaLink)}
            className={cn(
              "mt-8 inline-flex rounded-full bg-white px-6 py-2.5 text-sm font-medium text-neutral-900",
              "hover:bg-neutral-100"
            )}
          >
            {ctaText}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
