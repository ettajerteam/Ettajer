/**
 * Dr Sara Design V2 — deterministic layout helpers (no randomness).
 */

/** Stable 32-bit hash from string — same id → same position always. */
export function stableHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function hashUnit(input: string): number {
  return (stableHash(input) % 10000) / 10000;
}

/** Deterministic polar position in [0,1] square from id + ring. */
export function polarLayout(
  id: string,
  ring: number,
  index: number,
  total: number
): { x: number; y: number } {
  const base = (index / Math.max(total, 1)) * Math.PI * 2;
  const jitter = (hashUnit(id) - 0.5) * 0.35;
  const angle = base + jitter;
  const r = 0.22 + ring * 0.18 + hashUnit(`${id}:r`) * 0.04;
  return {
    x: 0.5 + Math.cos(angle) * r,
    y: 0.5 + Math.sin(angle) * r,
  };
}

/** Fixed system-map node coordinates (100×100 viewBox). */
export const SYSTEM_NODE_LAYOUT: Record<string, { x: number; y: number }> = {
  merchants: { x: 18, y: 22 },
  activation: { x: 42, y: 14 },
  commerce: { x: 68, y: 22 },
  revenue: { x: 86, y: 42 },
  payments: { x: 22, y: 52 },
  operations: { x: 50, y: 58 },
  support: { x: 78, y: 62 },
  domains: { x: 36, y: 82 },
};

export const AGENT_NETWORK_LAYOUT: {
  id: string;
  label: string;
  subtitle: string;
  status: "ACTIVE" | "FUTURE";
  x: number;
  y: number;
}[] = [
  {
    id: "dr-sara",
    label: "DR SARA",
    subtitle: "Master Intelligence",
    status: "ACTIVE",
    x: 50,
    y: 50,
  },
  {
    id: "nora",
    label: "NORA",
    subtitle: "Content Intelligence",
    status: "FUTURE",
    x: 50,
    y: 18,
  },
  {
    id: "commerce",
    label: "COMMERCE",
    subtitle: "Commerce Agent",
    status: "FUTURE",
    x: 82,
    y: 38,
  },
  {
    id: "growth",
    label: "GROWTH",
    subtitle: "Growth Agent",
    status: "FUTURE",
    x: 78,
    y: 72,
  },
  {
    id: "operations",
    label: "OPERATIONS",
    subtitle: "Operations Agent",
    status: "FUTURE",
    x: 22,
    y: 72,
  },
  {
    id: "domain",
    label: "DOMAIN",
    subtitle: "Domain Agent",
    status: "FUTURE",
    x: 18,
    y: 38,
  },
];

const CATEGORY_RING: Record<string, number> = {
  REVENUE: 0,
  OPERATIONS: 1,
  ACTIVATION: 2,
  TECHNICAL: 1,
  MERCHANTS: 2,
  GROWTH: 0,
};

export function opportunityLayout(
  id: string,
  category: string,
  indexInCategory: number,
  categoryCount: number
): { x: number; y: number } {
  const ring = CATEGORY_RING[category] ?? 1;
  return polarLayout(id, ring, indexInCategory, categoryCount);
}

export function riskLayout(
  id: string,
  level: string,
  index: number,
  total: number
): { x: number; y: number; scale: number } {
  const severity =
    /critical|high/i.test(level) ? 0 : /medium/i.test(level) ? 1 : 2;
  const pos = polarLayout(id, severity * 0.5 + 0.4, index, total);
  const scale = /critical|high/i.test(level)
    ? 1.15
    : /medium/i.test(level)
      ? 1
      : 0.85;
  return { ...pos, scale };
}

export function greetingFromHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
