/**
 * Deterministic action conflict resolution + dependency graph.
 */
import type { Intervention } from "@/lib/intelligence/interventions/engine";

export type DependencyEdge = {
  from: string;
  to: string;
  relation: "PRECEDES" | "BLOCKS" | "MUTUALLY_EXCLUSIVE" | "SAME_RESOURCE";
  reason: string;
};

export type ConflictResolution = {
  allowed: Intervention[];
  blocked: {
    intervention: Intervention;
    blockedBy: string[];
    reasons: string[];
  }[];
  dependencyGraph: DependencyEdge[];
};

const PREREQUISITES: Record<string, string[]> = {
  ACTIVATION_OUTREACH: ["DNS_DIAGNOSIS", "DOMAIN_SETUP_ASSIST"],
  FIRST_SALE_ASSIST: ["DNS_DIAGNOSIS", "COD_CONFIGURATION_ASSIST"],
  DOMAIN_SETUP_ASSIST: ["DNS_DIAGNOSIS"],
  GROWTH_REINFORCEMENT: [],
};

/** Platform ops take precedence over merchant activation when both present */
const PLATFORM_PRIORITY = [
  "COD_VERIFICATION",
  "DNS_DIAGNOSIS",
  "SUPPORT_ESCALATION",
];

export function resolveInterventionConflicts(
  interventions: Intervention[]
): ConflictResolution {
  const dependencyGraph: DependencyEdge[] = [];
  const present = new Set<string>(interventions.map((i) => i.type));
  const blocked: ConflictResolution["blocked"] = [];
  const allowed: Intervention[] = [];

  // Build prerequisite edges
  for (const i of interventions) {
    const prereqs = PREREQUISITES[i.type] ?? [];
    for (const p of prereqs) {
      if (present.has(p)) {
        dependencyGraph.push({
          from: p,
          to: i.type,
          relation: "PRECEDES",
          reason: `${p} must complete before ${i.type}`,
        });
      }
    }
  }

  // Same merchant: prefer technical fix over activation
  const byMerchant = new Map<string, Intervention[]>();
  for (const i of interventions) {
    if (!i.merchantId) continue;
    const list = byMerchant.get(i.merchantId) ?? [];
    list.push(i);
    byMerchant.set(i.merchantId, list);
  }
  const blockedIds = new Set<string>();

  for (const [, list] of byMerchant) {
    const hasDns = list.some(
      (i) => i.type === "DNS_DIAGNOSIS" || i.type === "DOMAIN_SETUP_ASSIST"
    );
    if (hasDns) {
      for (const i of list) {
        if (
          i.type === "ACTIVATION_OUTREACH" ||
          i.type === "FIRST_SALE_ASSIST" ||
          i.type === "GROWTH_REINFORCEMENT"
        ) {
          blockedIds.add(i.id);
          blocked.push({
            intervention: i,
            blockedBy: list
              .filter(
                (x) =>
                  x.type === "DNS_DIAGNOSIS" || x.type === "DOMAIN_SETUP_ASSIST"
              )
              .map((x) => x.id),
            reasons: [
              "Merchant domain/DNS must be healthy before activation interventions.",
            ],
          });
          dependencyGraph.push({
            from: "DNS_DIAGNOSIS",
            to: i.type,
            relation: "BLOCKS",
            reason: "Broken domain blocks activation",
          });
        }
      }
    }
  }

  // Platform ops: do not stack mutually exclusive COD+activation as top peers —
  // activation remains allowed but ranked lower; only block duplicates of same type
  const seenTypeTarget = new Set<string>();
  for (const i of interventions) {
    if (blockedIds.has(i.id)) continue;
    const key = `${i.type}:${i.merchantId ?? "platform"}`;
    if (seenTypeTarget.has(key)) {
      blockedIds.add(i.id);
      blocked.push({
        intervention: i,
        blockedBy: [],
        reasons: ["Duplicate intervention for same target."],
      });
      dependencyGraph.push({
        from: i.type,
        to: i.type,
        relation: "MUTUALLY_EXCLUSIVE",
        reason: "Duplicate",
      });
      continue;
    }
    seenTypeTarget.add(key);
    allowed.push(i);
  }

  // Annotate platform priority edges
  for (let i = 0; i < PLATFORM_PRIORITY.length - 1; i++) {
    const a = PLATFORM_PRIORITY[i]!;
    const b = PLATFORM_PRIORITY[i + 1]!;
    if (present.has(a) && present.has(b)) {
      dependencyGraph.push({
        from: a,
        to: b,
        relation: "PRECEDES",
        reason: "Operational queue precedence",
      });
    }
  }

  return {
    allowed: allowed.sort((a, b) => b.priority - a.priority),
    blocked,
    dependencyGraph,
  };
}
