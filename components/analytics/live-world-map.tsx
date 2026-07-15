"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe2, MapPin, Maximize2, Minimize2, Search } from "lucide-react";
import { LiveGlobeCanvas, type GlobePulse } from "@/components/analytics/live-globe-canvas";
import {
  dashboardCard,
  dashboardCardPad,
  dashboardMetric,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import {
  formatMetricValue,
  getCountryMetricValue,
  GLOBE_LEGEND_STOPS,
  type GlobeMetric,
} from "@/lib/globe-geo";
import { cn, formatCurrency } from "@/lib/utils";
import {
  getLiveMapRangeShortLabel,
  type LiveMapRange,
  type LiveVisitorCountry,
} from "@/lib/live-view-types";
import { Input } from "@/components/ui/input";

const RANGE_OPTIONS: { value: LiveMapRange; label: string }[] = [
  { value: 1, label: "1h" },
  { value: 24, label: "24h" },
  { value: 168, label: "7d" },
];

const METRIC_OPTIONS: { value: GlobeMetric; label: string }[] = [
  { value: "visitors", label: "Visitors" },
  { value: "orders", label: "Orders" },
  { value: "revenue", label: "Revenue" },
];

interface LiveWorldMapProps {
  countries: LiveVisitorCountry[];
  currency: string;
  range: LiveMapRange;
  pulses: GlobePulse[];
  focusCode: string | null;
  onFocusCountry: (code: string | null) => void;
  className?: string;
}

export function LiveWorldMap({
  countries,
  currency,
  range,
  pulses,
  focusCode,
  onFocusCountry,
  className,
}: LiveWorldMapProps) {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<LiveVisitorCountry | null>(null);
  const [pinnedCode, setPinnedCode] = useState<string | null>(null);
  const [metric, setMetric] = useState<GlobeMetric>("visitors");
  const [search, setSearch] = useState("");
  const [fullscreen, setFullscreen] = useState(false);

  const activeCode = focusCode ?? pinnedCode ?? hovered?.code ?? null;

  const maxMetric = Math.max(
    ...countries.map((country) => getCountryMetricValue(country, metric)),
    1
  );

  const rankedCountries = useMemo(
    () =>
      [...countries].sort(
        (a, b) => getCountryMetricValue(b, metric) - getCountryMetricValue(a, metric)
      ),
    [countries, metric]
  );

  const visibleCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rankedCountries.slice(0, 8);
    return rankedCountries
      .filter((country) => country.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [rankedCountries, search]);

  const totalMetric = countries.reduce(
    (sum, country) => sum + getCountryMetricValue(country, metric),
    0
  );

  function handleCountryHover(country: LiveVisitorCountry | null) {
    setHovered(country);
  }

  function handleCountrySelect(country: LiveVisitorCountry) {
    const next = pinnedCode === country.code ? null : country.code;
    setPinnedCode(next);
    setHovered(country);
    onFocusCountry(next);
  }

  function handleSearchSubmit() {
    const match = visibleCountries[0];
    if (match) handleCountrySelect(match);
  }

  const mapPanel = (
    <div className="relative min-h-[360px] border-b border-neutral-200/80 dark:border-white/10 xl:border-b-0 xl:border-r xl:bg-[#030712]">
      <LiveGlobeCanvas
        countries={countries}
        activeCode={activeCode}
        metric={metric}
        pulses={pulses}
        onHoverCountry={(country) => {
          setHovered(country);
          if (country) {
            setPinnedCode(country.code);
            onFocusCountry(country.code);
          }
        }}
        className={cn(
          "min-h-[360px] sm:min-h-[420px]",
          fullscreen && "min-h-[calc(100vh-120px)]"
        )}
      />

      <button
        type="button"
        onClick={() => setFullscreen((value) => !value)}
        className="absolute right-3 top-14 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 bg-black/40 text-white/85 shadow-lg backdrop-blur-md transition-colors hover:bg-black/55"
        aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
      </button>

      {hovered ? (
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-[260px] overflow-hidden rounded-xl border border-sky-300/20 bg-[#0b1528]/80 px-3.5 py-3 text-white shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/50 to-transparent" />
          <p className="text-sm font-semibold tracking-tight">{hovered.name}</p>
          <p className="mt-1.5 text-xs text-white/65">
            {hovered.visitors} visitors · {hovered.orders} orders
          </p>
          <p className="mt-1 text-sm font-medium text-sky-300">
            {formatCurrency(hovered.revenue, currency)}
          </p>
        </div>
      ) : null}

      <div className="pointer-events-none absolute bottom-4 right-4 hidden items-center gap-2 rounded-full border border-white/12 bg-black/45 px-3 py-1.5 text-[10px] text-white/75 shadow-lg backdrop-blur-md sm:flex">
        <span className="text-white/50">Low</span>
        <div className="flex h-2 w-24 overflow-hidden rounded-full shadow-inner">
          {GLOBE_LEGEND_STOPS.map((color) => (
            <span key={color} className="h-full flex-1" style={{ backgroundColor: color }} />
          ))}
        </div>
        <span className="text-white/50">High</span>
      </div>
    </div>
  );

  const content = (
    <section
      className={cn(
        dashboardCard,
        "overflow-hidden ring-1 ring-neutral-200/60 dark:ring-white/10",
        className
      )}
    >
      <div className={cn(dashboardCardPad, "border-b border-neutral-200/80 dark:border-white/10")}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#007AFF]/10">
              <Globe2 className="h-4 w-4 text-[#007AFF]" />
            </div>
            <div>
              <h2 className={dashboardTitle}>Live Earth</h2>
              <p className={dashboardSubtitle}>
                Interactive 3D visitor globe · {getLiveMapRangeShortLabel(range)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-lg border border-neutral-200/80 bg-neutral-50/80 p-0.5 dark:border-white/10 dark:bg-white/[0.03]">
              {RANGE_OPTIONS.map((option) => (
                <Link
                  key={option.value}
                  href={`${pathname}?range=${option.value}`}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                    range === option.value
                      ? "bg-white text-neutral-900 shadow-sm dark:bg-white/10 dark:text-white"
                      : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                  )}
                >
                  {option.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center rounded-lg border border-neutral-200/80 bg-neutral-50/80 p-0.5 dark:border-white/10 dark:bg-white/[0.03]">
              {METRIC_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMetric(option.value)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                    metric === option.value
                      ? "bg-white text-neutral-900 shadow-sm dark:bg-white/10 dark:text-white"
                      : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/80 px-3 py-2 text-right dark:border-white/10 dark:bg-white/[0.03]">
              <p className="text-[11px] text-neutral-500">Active regions</p>
              <p className={dashboardMetric}>{countries.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_250px]">
        {mapPanel}

        <aside className={cn(dashboardCardPad, "bg-neutral-50/40 dark:bg-white/[0.02]")}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSearchSubmit();
              }}
              placeholder="Search country..."
              className="h-8 rounded-lg border-neutral-200/80 bg-white pl-8 text-xs dark:border-white/10 dark:bg-white/[0.03]"
            />
          </div>

          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-neutral-400">
            Top regions
          </p>
          <p className="mt-0.5 text-[11px] text-neutral-500">
            {totalMetric > 0
              ? `${formatMetricValue(totalMetric, metric, currency)} total ${metric}`
              : "Waiting for activity"}
          </p>

          {visibleCountries.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
              <MapPin className="h-8 w-8 text-neutral-300" />
              <p className="mt-2 text-sm text-muted-foreground">No matching regions</p>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {visibleCountries.map((country, index) => {
                const value = getCountryMetricValue(country, metric);
                const width = `${(value / maxMetric) * 100}%`;
                const isActive = activeCode === country.code;

                return (
                  <li key={country.code}>
                    <button
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      onMouseEnter={() => handleCountryHover(country)}
                      onMouseLeave={() => handleCountryHover(null)}
                      className={cn(
                        "w-full rounded-lg border px-3 py-2.5 text-left transition-all duration-300",
                        isActive
                          ? "border-[#007AFF]/40 bg-gradient-to-r from-[#007AFF]/10 to-transparent shadow-[0_8px_24px_rgba(0,122,255,0.08)]"
                          : "border-transparent bg-white/70 hover:border-neutral-200/80 hover:bg-white dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-[10px] font-bold text-neutral-500 dark:bg-white/10">
                            {index + 1}
                          </span>
                          <span className="truncate text-xs font-medium text-neutral-800 dark:text-neutral-100">
                            {country.name}
                          </span>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-neutral-900 dark:text-white">
                          {formatMetricValue(value, metric, currency)}
                        </span>
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-neutral-200/80 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#60A5FA] to-[#007AFF] transition-all duration-500"
                          style={{ width }}
                        />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>
    </section>
  );

  if (!fullscreen) return content;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#030712]/95 p-3 backdrop-blur-sm sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-white">Live Earth · Fullscreen</p>
        <button
          type="button"
          onClick={() => setFullscreen(false)}
          className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/15"
        >
          Exit fullscreen
        </button>
      </div>
      <div className="flex-1 overflow-hidden rounded-2xl ring-1 ring-white/10">{content}</div>
    </div>
  );
}
