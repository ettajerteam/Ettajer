"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { useTheme } from "next-themes";
import { Move3d, Pause, Play, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getCountryCode,
  getCountryMetricValue,
  getFeatureCentroid,
  GLOBE_ACTIVE_CAP,
  GLOBE_HOVER_CAP,
  GLOBE_IDLE_CAP,
  GLOBE_IDLE_CAP_DARK,
  GLOBE_SIDE,
  GLOBE_STROKE,
  visitorGlobeColor,
  type GlobeMetric,
} from "@/lib/globe-geo";
import {
  buildActivityArcs,
  buildCountryLabels,
  GLOBE_ATMOSPHERE,
  GLOBE_TEXTURES,
} from "@/lib/globe-visual";
import type { CountryFeature, CountryFeatureCollection, GlobeInstance } from "@/types/globe";
import type { LiveVisitorCountry } from "@/lib/live-view-types";

const DEFAULT_POV = { lat: 18, lng: 12, altitude: 2.05 };

export interface GlobePulse {
  id: string;
  code: string;
}

interface GlobePoint {
  lat: number;
  lng: number;
  code: string;
  size: number;
  color: string;
  altitude: number;
}

interface GlobeRing {
  lat: number;
  lng: number;
  id: string;
}

interface LiveGlobeCanvasProps {
  countries: LiveVisitorCountry[];
  activeCode: string | null;
  metric: GlobeMetric;
  pulses: GlobePulse[];
  onHoverCountry: (country: LiveVisitorCountry | null) => void;
  className?: string;
}

export function LiveGlobeCanvas({
  countries,
  activeCode,
  metric,
  pulses,
  onHoverCountry,
  className,
}: LiveGlobeCanvasProps) {
  const globeRef = useRef<GlobeInstance | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const countriesRef = useRef(countries);
  const { resolvedTheme } = useTheme();

  const [dimensions, setDimensions] = useState({ width: 640, height: 420 });
  const [features, setFeatures] = useState<CountryFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoverFeature, setHoverFeature] = useState<CountryFeature | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [centroids, setCentroids] = useState<Map<string, { lat: number; lng: number }>>(new Map());
  const [ringPoints, setRingPoints] = useState<GlobeRing[]>([]);

  const isDark = resolvedTheme === "dark";
  countriesRef.current = countries;

  const visitorMap = useMemo(() => {
    const map = new Map<string, LiveVisitorCountry>();
    for (const country of countries) map.set(country.code, country);
    return map;
  }, [countries]);

  const maxMetric = useMemo(
    () => Math.max(...countries.map((country) => getCountryMetricValue(country, metric)), 1),
    [countries, metric]
  );

  const activityArcs = useMemo(
    () => buildActivityArcs(countries, centroids, metric),
    [centroids, countries, metric]
  );

  const countryLabels = useMemo(
    () => buildCountryLabels(countries, centroids, metric, activeCode),
    [activeCode, centroids, countries, metric]
  );

  const pinPoints = useMemo(() => {
    const hoverCode = hoverFeature ? getCountryCode(hoverFeature) : null;
    const points: GlobePoint[] = [];

    for (const country of countries) {
      const value = getCountryMetricValue(country, metric);
      if (value <= 0) continue;

      const centroid = centroids.get(country.code);
      if (!centroid) continue;

      const ratio = value / maxMetric;
      const isHighlighted = activeCode === country.code || hoverCode === country.code;

      points.push({
        lat: centroid.lat,
        lng: centroid.lng,
        code: country.code,
        size: isHighlighted ? 0.55 + ratio * 0.55 : 0.28 + ratio * 0.42,
        color: isHighlighted ? "#7DD3FC" : visitorGlobeColor(value, maxMetric),
        altitude: isHighlighted ? 0.04 : 0.025 + ratio * 0.02,
      });
    }

    return points;
  }, [activeCode, centroids, countries, hoverFeature, maxMetric, metric]);

  useEffect(() => {
    let cancelled = false;

    fetch("/world-map/countries.geojson")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load globe data");
        return response.json() as Promise<CountryFeatureCollection>;
      })
      .then((collection) => {
        if (cancelled) return;

        const validFeatures = collection.features.filter((feature) => getCountryCode(feature));
        const nextCentroids = new Map<string, { lat: number; lng: number }>();

        for (const feature of validFeatures) {
          const code = getCountryCode(feature);
          const centroid = getFeatureCentroid(feature);
          if (code && centroid) nextCentroids.set(code, centroid);
        }

        setFeatures(validFeatures);
        setCentroids(nextCentroids);
        setLoading(false);
      })
      .catch((fetchError) => {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : "Globe failed to load");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setDimensions({ width: Math.floor(width), height: Math.floor(height) });
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.controls().autoRotate = autoRotate;
  }, [autoRotate, loading]);

  useEffect(() => {
    if (!activeCode || !globeRef.current) return;
    const centroid = centroids.get(activeCode);
    if (!centroid) return;

    globeRef.current.pointOfView(
      { lat: centroid.lat, lng: centroid.lng, altitude: 1.55 },
      1000
    );
    globeRef.current.controls().autoRotate = false;
    setAutoRotate(false);
  }, [activeCode, centroids]);

  useEffect(() => {
    if (pulses.length === 0 || centroids.size === 0) return;

    const latest = pulses[pulses.length - 1];
    const centroid = centroids.get(latest.code);
    if (!centroid) return;

    setRingPoints((current) => [
      ...current.filter((ring) => ring.id !== latest.id),
      { id: latest.id, lat: centroid.lat, lng: centroid.lng },
    ]);

    const timeout = window.setTimeout(() => {
      setRingPoints((current) => current.filter((ring) => ring.id !== latest.id));
    }, 3200);

    return () => window.clearTimeout(timeout);
  }, [pulses, centroids]);

  const getCapColor = useCallback(
    (feature: object) => {
      const countryFeature = feature as CountryFeature;
      const code = getCountryCode(countryFeature);
      if (!code) return isDark ? GLOBE_IDLE_CAP_DARK : GLOBE_IDLE_CAP;

      if (activeCode === code) return GLOBE_ACTIVE_CAP;
      if (hoverFeature === countryFeature) return GLOBE_HOVER_CAP;

      const visitor = visitorMap.get(code);
      if (!visitor) return isDark ? GLOBE_IDLE_CAP_DARK : GLOBE_IDLE_CAP;
      return visitorGlobeColor(getCountryMetricValue(visitor, metric), maxMetric);
    },
    [activeCode, hoverFeature, isDark, maxMetric, metric, visitorMap]
  );

  const getAltitude = useCallback(
    (feature: object) => {
      const countryFeature = feature as CountryFeature;
      const code = getCountryCode(countryFeature);
      if (!code) return 0.006;

      const visitor = visitorMap.get(code);
      if (!visitor) return 0.008;

      const value = getCountryMetricValue(visitor, metric);
      if (hoverFeature === countryFeature || activeCode === code) return 0.055;
      if (value > 0) return 0.014 + (value / maxMetric) * 0.028;
      return 0.008;
    },
    [activeCode, hoverFeature, maxMetric, metric, visitorMap]
  );

  function handleGlobeReady() {
    const globe = globeRef.current;
    if (!globe) return;

    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.28;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minDistance = 115;
    controls.maxDistance = 400;

    globe.pointOfView(DEFAULT_POV, 0);
  }

  function handlePolygonClick(feature: object) {
    const countryFeature = feature as CountryFeature;
    const code = getCountryCode(countryFeature);
    if (!code) return;

    const match = countriesRef.current.find((country) => country.code === code);
    onHoverCountry(match ?? null);

    const centroid = centroids.get(code);
    if (centroid && globeRef.current) {
      globeRef.current.pointOfView({ lat: centroid.lat, lng: centroid.lng, altitude: 1.48 }, 900);
      globeRef.current.controls().autoRotate = false;
      setAutoRotate(false);
    }
  }

  function handlePolygonHover(feature: object | null) {
    const countryFeature = (feature as CountryFeature | null) ?? null;
    setHoverFeature(countryFeature);

    if (!countryFeature) {
      onHoverCountry(null);
      return;
    }

    const code = getCountryCode(countryFeature);
    const match = code ? countriesRef.current.find((country) => country.code === code) : undefined;
    onHoverCountry(match ?? null);
  }

  function resetView() {
    globeRef.current?.pointOfView(DEFAULT_POV, 1000);
  }

  function zoom(delta: number) {
    const globe = globeRef.current;
    if (!globe) return;
    const current = globe.pointOfView() ?? DEFAULT_POV;
    const altitude = Math.min(3.2, Math.max(1.2, current.altitude + delta));
    globe.pointOfView({ lat: current.lat, lng: current.lng, altitude }, 400);
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full min-h-[320px] w-full overflow-hidden",
        "bg-[radial-gradient(ellipse_at_50%_120%,rgba(0,122,255,0.16),transparent_55%),radial-gradient(circle_at_18%_12%,rgba(56,189,248,0.14),transparent_38%),radial-gradient(circle_at_82%_18%,rgba(99,102,241,0.1),transparent_34%),linear-gradient(180deg,#030712_0%,#0a1222_42%,#050a14_100%)]",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          backgroundImage: [
            "radial-gradient(1px 1px at 8% 14%, rgba(255,255,255,0.55), transparent)",
            "radial-gradient(1px 1px at 22% 78%, rgba(255,255,255,0.35), transparent)",
            "radial-gradient(1.2px 1.2px at 41% 22%, rgba(255,255,255,0.4), transparent)",
            "radial-gradient(1px 1px at 63% 11%, rgba(255,255,255,0.3), transparent)",
            "radial-gradient(1px 1px at 76% 58%, rgba(255,255,255,0.45), transparent)",
            "radial-gradient(1px 1px at 91% 34%, rgba(255,255,255,0.25), transparent)",
            "radial-gradient(1px 1px at 14% 46%, rgba(255,255,255,0.28), transparent)",
            "radial-gradient(1px 1px at 52% 88%, rgba(255,255,255,0.32), transparent)",
            "radial-gradient(1px 1px at 88% 82%, rgba(255,255,255,0.22), transparent)",
          ].join(", "),
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(78vw,520px)] w-[min(78vw,520px)] -translate-x-1/2 -translate-y-[46%] rounded-full border border-sky-300/10 shadow-[0_0_100px_rgba(56,189,248,0.12),inset_0_0_80px_rgba(0,122,255,0.06)]"
      />

      {!loading && !error ? (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl={GLOBE_TEXTURES.earth}
          bumpImageUrl={GLOBE_TEXTURES.bump}
          showAtmosphere
          atmosphereColor={GLOBE_ATMOSPHERE.color}
          atmosphereAltitude={GLOBE_ATMOSPHERE.altitude}
          polygonsData={features}
          polygonCapColor={getCapColor}
          polygonSideColor={() => GLOBE_SIDE}
          polygonStrokeColor={() => GLOBE_STROKE}
          polygonAltitude={getAltitude}
          polygonsTransitionDuration={400}
          onPolygonHover={handlePolygonHover}
          onPolygonClick={handlePolygonClick}
          onGlobeReady={handleGlobeReady}
          animateIn
          arcsData={activityArcs}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor={(arc) => {
            const strength = (arc as { strength: number }).strength ?? 0.5;
            return `rgba(56, 189, 248, ${0.18 + strength * 0.42})`;
          }}
          arcAltitude={0.12}
          arcStroke={(arc) => 0.35 + ((arc as { strength: number }).strength ?? 0.5) * 0.55}
          arcDashLength={0.45}
          arcDashGap={0.18}
          arcDashAnimateTime={2800}
          labelsData={countryLabels}
          labelLat="lat"
          labelLng="lng"
          labelText="text"
          labelSize="size"
          labelColor="color"
          labelDotRadius={0.18}
          labelResolution={2}
          pointsData={pinPoints}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointRadius="size"
          pointAltitude="altitude"
          ringsData={ringPoints}
          ringLat="lat"
          ringLng="lng"
          ringColor={() => "rgba(125, 211, 252, 0.75)"}
          ringMaxRadius={3.8}
          ringPropagationSpeed={2.1}
          ringRepeatPeriod={900}
        />
      ) : null}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_32%,rgba(2,6,23,0.55)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050a14]/80 to-transparent" />

      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/12 bg-black/40 px-2.5 py-1 text-[10px] text-white/75 shadow-lg shadow-black/20 backdrop-blur-md">
        <Move3d className="h-3 w-3 text-sky-300/80" />
        <span className="hidden sm:inline">Drag to rotate · Scroll to zoom</span>
        <span className="sm:hidden">Drag · Pinch to zoom</span>
      </div>

      <div className="absolute right-3 top-3 flex items-center gap-1">
        {[
          { label: "Zoom in", icon: ZoomIn, action: () => zoom(-0.18) },
          { label: "Zoom out", icon: ZoomOut, action: () => zoom(0.18) },
          {
            label: autoRotate ? "Pause rotation" : "Resume rotation",
            icon: autoRotate ? Pause : Play,
            action: () => setAutoRotate((value) => !value),
          },
          { label: "Reset globe view", icon: RotateCcw, action: resetView },
        ].map(({ label, icon: Icon, action }) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg border border-white/12 bg-black/40 text-white/85 shadow-lg shadow-black/20 backdrop-blur-md hover:border-sky-300/25 hover:bg-black/55 hover:text-white"
            onClick={action}
            aria-label={label}
          >
            <Icon className="h-3.5 w-3.5" />
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-white/60">
          Loading 3D globe…
        </div>
      ) : null}
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-red-300">
          {error}
        </div>
      ) : null}
    </div>
  );
}
