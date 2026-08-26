/**
 * Intervention dependency graph (declarative, deterministic).
 */
import type { DependencyEdge, DependencyRelation } from "@/lib/intelligence/os/types";

/** Static domain dependencies between intervention types / decisions */
const EDGES: DependencyEdge[] = [
  {
    from: "DNS_DIAGNOSIS",
    to: "FIRST_SALE_ASSISTANCE",
    relation: "ENABLES",
    reason: "Storefront accessibility unblocks first-sale activation.",
  },
  {
    from: "DNS_DIAGNOSIS",
    to: "ACTIVATION_OUTREACH",
    relation: "ENABLES",
    reason: "Reachable storefronts amplify activation outreach.",
  },
  {
    from: "COD_VERIFICATION",
    to: "SUPPORT_ESCALATION",
    relation: "AMPLIFIES",
    reason: "Clearing COD backlog reduces related support pressure.",
  },
  {
    from: "SUPPORT_ESCALATION",
    to: "ACTIVATION_OUTREACH",
    relation: "ENABLES",
    reason: "Support capacity frees activation bandwidth.",
  },
  {
    from: "MERCHANT_ONBOARDING",
    to: "SUPPORT_ESCALATION",
    relation: "CONFLICTS_WITH",
    reason: "Aggressive onboarding vs exhausted support capacity.",
  },
  {
    from: "ACTIVATION_OUTREACH",
    to: "REVENUE_CONCENTRATION_REVIEW",
    relation: "AMPLIFIES",
    reason: "Broadening activation may reduce concentration over time.",
  },
  {
    from: "FIRST_SALE_ASSISTANCE",
    to: "DNS_DIAGNOSIS",
    relation: "DEPENDS_ON",
    reason: "First-sale assist is weaker if domains are failing.",
  },
];

export function listDependencyEdges(): DependencyEdge[] {
  return [...EDGES].sort((a, b) =>
    `${a.from}:${a.to}`.localeCompare(`${b.from}:${b.to}`)
  );
}

export function dependenciesFor(
  types: string[]
): DependencyEdge[] {
  const set = new Set(types);
  return listDependencyEdges().filter(
    (e) => set.has(e.from) || set.has(e.to)
  );
}

export function unresolvedPrerequisites(input: {
  plannedTypes: string[];
  availableTypes: string[];
}): { blocked: string; requires: string; reason: string }[] {
  const available = new Set(input.availableTypes);
  const out: { blocked: string; requires: string; reason: string }[] = [];
  for (const e of listDependencyEdges()) {
    if (e.relation !== "DEPENDS_ON" && e.relation !== "REQUIRES") continue;
    if (!input.plannedTypes.includes(e.from)) continue;
    // from DEPENDS_ON to → to must be resolved/available
    if (e.relation === "DEPENDS_ON" && !available.has(e.to)) {
      // soft: if DNS failing and FIRST_SALE planned without DNS in plan
      out.push({ blocked: e.from, requires: e.to, reason: e.reason });
    }
  }
  return out;
}

export function topologicalOrder(types: string[]): string[] {
  const set = new Set(types);
  const indeg = new Map<string, number>();
  for (const t of types) indeg.set(t, 0);
  const adj = new Map<string, string[]>();
  for (const e of listDependencyEdges()) {
    if (!set.has(e.from) || !set.has(e.to)) continue;
    if (e.relation === "ENABLES" || e.relation === "BLOCKS") {
      // from before to
      adj.set(e.from, [...(adj.get(e.from) ?? []), e.to]);
      indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1);
    }
    if (e.relation === "DEPENDS_ON") {
      // to before from
      adj.set(e.to, [...(adj.get(e.to) ?? []), e.from]);
      indeg.set(e.from, (indeg.get(e.from) ?? 0) + 1);
    }
  }
  const q = types.filter((t) => (indeg.get(t) ?? 0) === 0).sort();
  const ordered: string[] = [];
  while (q.length) {
    const n = q.shift()!;
    ordered.push(n);
    for (const m of (adj.get(n) ?? []).sort()) {
      indeg.set(m, (indeg.get(m) ?? 0) - 1);
      if (indeg.get(m) === 0) q.push(m);
      q.sort();
    }
  }
  // append any leftover (cycles) deterministically
  for (const t of types.sort()) {
    if (!ordered.includes(t)) ordered.push(t);
  }
  return ordered;
}

export type { DependencyRelation };
