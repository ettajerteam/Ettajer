import type { LiveVisitorCountry } from "@/lib/live-view-types";
import { getCountryMetricValue, type GlobeMetric } from "@/lib/globe-geo";

export const GLOBE_TEXTURES = {
  earth: "/world-map/textures/earth-night.jpg",
  bump: "/world-map/textures/earth-topology.png",
} as const;

export const GLOBE_ATMOSPHERE = {
  color: "#5EB3FF",
  altitude: 0.14,
} as const;

export interface GlobeArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  strength: number;
}

export interface GlobeLabel {
  lat: number;
  lng: number;
  text: string;
  size: number;
  color: string;
}

export function buildActivityArcs(
  countries: LiveVisitorCountry[],
  centroids: Map<string, { lat: number; lng: number }>,
  metric: GlobeMetric,
  maxArcs = 6
): GlobeArc[] {
  const ranked = [...countries]
    .filter((country) => getCountryMetricValue(country, metric) > 0)
    .sort((a, b) => getCountryMetricValue(b, metric) - getCountryMetricValue(a, metric))
    .slice(0, maxArcs + 1);

  if (ranked.length < 2) return [];

  const hub = ranked[0];
  const hubCentroid = centroids.get(hub.code);
  if (!hubCentroid) return [];

  const maxValue = getCountryMetricValue(hub, metric);

  return ranked.slice(1).map((country) => {
    const end = centroids.get(country.code);
    if (!end) return null;

    return {
      startLat: hubCentroid.lat,
      startLng: hubCentroid.lng,
      endLat: end.lat,
      endLng: end.lng,
      strength: getCountryMetricValue(country, metric) / maxValue,
    };
  }).filter((arc): arc is GlobeArc => arc !== null);
}

export function buildCountryLabels(
  countries: LiveVisitorCountry[],
  centroids: Map<string, { lat: number; lng: number }>,
  metric: GlobeMetric,
  activeCode: string | null,
  maxLabels = 5
): GlobeLabel[] {
  const labels: GlobeLabel[] = [];

  const ranked = [...countries]
    .filter((country) => getCountryMetricValue(country, metric) > 0)
    .sort((a, b) => getCountryMetricValue(b, metric) - getCountryMetricValue(a, metric));

  for (const country of ranked) {
    if (labels.length >= maxLabels && country.code !== activeCode) continue;

    const centroid = centroids.get(country.code);
    if (!centroid) continue;

    const isActive = country.code === activeCode;
    labels.push({
      lat: centroid.lat,
      lng: centroid.lng,
      text: country.name,
      size: isActive ? 1.1 : 0.75,
      color: isActive ? "rgba(224, 242, 254, 0.95)" : "rgba(186, 230, 253, 0.72)",
    });

    if (labels.length >= maxLabels && !isActive) break;
  }

  return labels;
}

export function rgbaGlobeColor(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
