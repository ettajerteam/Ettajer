import type { LiveVisitorCountry } from "@/lib/live-view-types";
import type { CountryFeature } from "@/types/globe";

export type GlobeMetric = "visitors" | "orders" | "revenue";

export const GLOBE_COLOR_STOPS = [
  "rgba(147, 197, 253, 0.45)",
  "rgba(96, 165, 250, 0.55)",
  "rgba(59, 130, 246, 0.68)",
  "rgba(37, 99, 235, 0.78)",
  "rgba(0, 122, 255, 0.88)",
] as const;

export const GLOBE_IDLE_CAP = "rgba(100, 116, 139, 0.12)";
export const GLOBE_IDLE_CAP_DARK = "rgba(71, 85, 105, 0.18)";
export const GLOBE_HOVER_CAP = "rgba(56, 189, 248, 0.82)";
export const GLOBE_ACTIVE_CAP = "rgba(125, 211, 252, 0.9)";
export const GLOBE_SIDE = "rgba(14, 116, 214, 0.28)";
export const GLOBE_STROKE = "rgba(186, 230, 253, 0.22)";
export function visitorGlobeColor(count: number, max: number): string {
  if (count <= 0 || max <= 0) return GLOBE_IDLE_CAP;
  const ratio = Math.min(count / max, 1);
  const index = Math.min(GLOBE_COLOR_STOPS.length - 1, Math.floor(ratio * GLOBE_COLOR_STOPS.length));
  return GLOBE_COLOR_STOPS[index] ?? GLOBE_COLOR_STOPS[GLOBE_COLOR_STOPS.length - 1];
}

/** Solid hex for UI elements (legend bars, sidebar) */
export const GLOBE_LEGEND_STOPS = ["#93C5FD", "#60A5FA", "#3B82F6", "#2563EB", "#007AFF"] as const;
export function getCountryMetricValue(country: LiveVisitorCountry, metric: GlobeMetric): number {
  if (metric === "orders") return country.orders;
  if (metric === "revenue") return country.revenue;
  return country.visitors;
}

export function formatMetricValue(value: number, metric: GlobeMetric, currency: string): string {
  if (metric === "revenue") {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  }
  return value.toLocaleString();
}
export function getCountryCode(feature: CountryFeature): string | null {
  const code = feature.properties?.ISO_A2;
  if (!code || code === "-99" || code.length !== 2) return null;
  return code;
}

function ringCentroid(ring: number[][]): { lat: number; lng: number } {
  let sumLat = 0;
  let sumLng = 0;
  const count = ring.length || 1;

  for (const [lng, lat] of ring) {
    sumLat += lat;
    sumLng += lng;
  }

  return { lat: sumLat / count, lng: sumLng / count };
}

export function getFeatureCentroid(feature: CountryFeature): { lat: number; lng: number } | null {
  const { geometry } = feature;
  if (!geometry) return null;

  if (geometry.type === "Polygon") {
    const ring = (geometry.coordinates as number[][][])[0];
    return ring ? ringCentroid(ring) : null;
  }

  if (geometry.type === "MultiPolygon") {
    const polygon = (geometry.coordinates as number[][][][])[0];
    const ring = polygon?.[0];
    return ring ? ringCentroid(ring) : null;
  }

  return null;
}
