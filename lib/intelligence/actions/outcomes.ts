/**
 * Intelligence action tracking — deterministic closed loop.
 * Persists via AdminAuditLog with action prefix `dr_sara.` when DB available.
 * Pure measure helpers work without DB for tests.
 */

export type IntelligenceActionStatus =
  | "recommended"
  | "in_progress"
  | "completed"
  | "expired"
  | "cancelled";

export type IntelligenceAction = {
  id: string;
  type: string;
  targetType: "platform" | "merchant" | "store" | "order" | "domain" | "support";
  targetId: string;
  createdAt: Date;
  completedAt?: Date | null;
  status: IntelligenceActionStatus;
  expectedOutcome: string;
  measuredOutcome?: string | null;
  outcome?: "SUCCESS" | "FAILURE" | "UNKNOWN" | null;
  metadata?: Record<string, unknown>;
};

export type ActionOutcomeSummary = {
  totalTracked: number;
  successCount: number;
  failureCount: number;
  unknownCount: number;
  actionSuccessRate: number | null;
  notes: string[];
  actions: IntelligenceAction[];
};

/** Pure outcome measurement from expected predicate vs observed facts */
export function measureActionOutcome(input: {
  action: IntelligenceAction;
  observed: {
    pendingRealOrders?: number;
    openSupport?: number;
    domainFailing?: number;
    merchantRealOrders?: number;
  };
}): IntelligenceAction {
  const a = { ...input.action };
  const o = input.observed;
  let outcome: IntelligenceAction["outcome"] = "UNKNOWN";
  let measured = "Insufficient observation window";

  if (a.type === "PENDING_COD" || a.type === "Review pending COD") {
    if (typeof o.pendingRealOrders === "number") {
      if (o.pendingRealOrders === 0) {
        outcome = "SUCCESS";
        measured = "Pending COD queue cleared";
      } else if (
        a.metadata &&
        typeof a.metadata.baselinePending === "number" &&
        o.pendingRealOrders < (a.metadata.baselinePending as number)
      ) {
        outcome = "SUCCESS";
        measured = `Pending COD reduced to ${o.pendingRealOrders}`;
      } else {
        outcome = "FAILURE";
        measured = `Pending COD still ${o.pendingRealOrders}`;
      }
    }
  } else if (a.type === "SUPPORT_BACKLOG" || a.type.includes("support")) {
    if (typeof o.openSupport === "number") {
      outcome = o.openSupport === 0 ? "SUCCESS" : "FAILURE";
      measured = `Open support = ${o.openSupport}`;
    }
  } else if (a.type === "DNS_FAILURE" || a.type.includes("domain")) {
    if (typeof o.domainFailing === "number") {
      outcome = o.domainFailing === 0 ? "SUCCESS" : "FAILURE";
      measured = `Domain failing = ${o.domainFailing}`;
    }
  } else if (a.type.includes("FIRST_SALE") || a.type.includes("activation")) {
    if (typeof o.merchantRealOrders === "number") {
      outcome = o.merchantRealOrders > 0 ? "SUCCESS" : "FAILURE";
      measured = `Merchant real orders = ${o.merchantRealOrders}`;
    }
  }

  return {
    ...a,
    measuredOutcome: measured,
    outcome,
    status: outcome === "UNKNOWN" ? a.status : "completed",
    completedAt: outcome === "UNKNOWN" ? a.completedAt : new Date(),
  };
}

export function summarizeOutcomes(
  actions: IntelligenceAction[]
): ActionOutcomeSummary {
  const successCount = actions.filter((a) => a.outcome === "SUCCESS").length;
  const failureCount = actions.filter((a) => a.outcome === "FAILURE").length;
  const unknownCount = actions.filter(
    (a) => !a.outcome || a.outcome === "UNKNOWN"
  ).length;
  const decided = successCount + failureCount;
  return {
    totalTracked: actions.length,
    successCount,
    failureCount,
    unknownCount,
    actionSuccessRate: decided > 0 ? successCount / decided : null,
    notes:
      actions.length === 0
        ? ["No tracked interventions yet — recommendations are live only."]
        : [
            `Tracked ${actions.length} interventions; success rate ${
              decided > 0
                ? `${Math.round((successCount / decided) * 100)}%`
                : "n/a"
            }.`,
          ],
    actions,
  };
}

/** Build recommended actions as trackable IntelligenceAction records (ephemeral). */
export function recommendationsToTrackedActions(
  recs: {
    id: string;
    label: string;
    href: string;
    description: string;
  }[],
  now: Date,
  baselines: {
    pendingRealOrders: number;
    openSupport: number;
    domainFailing: number;
  }
): IntelligenceAction[] {
  return recs.slice(0, 5).map((r) => ({
    id: `ephemeral-${r.id}`,
    type: r.id,
    targetType: "platform" as const,
    targetId: "platform",
    createdAt: now,
    status: "recommended" as const,
    expectedOutcome: r.description,
    metadata: {
      href: r.href,
      label: r.label,
      baselinePending: baselines.pendingRealOrders,
      baselineSupport: baselines.openSupport,
      baselineDomains: baselines.domainFailing,
    },
  }));
}

/**
 * Optionally load prior Dr Sara actions from AdminAuditLog.
 * Safe no-op if prisma unavailable.
 */
export async function loadTrackedActionsFromAudit(): Promise<
  IntelligenceAction[]
> {
  try {
    const { prisma } = await import("@/lib/db");
    const rows = await prisma.adminAuditLog.findMany({
      where: { action: { startsWith: "dr_sara." } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return rows.map((r) => {
      const meta = (r.metadata ?? {}) as Record<string, unknown>;
      return {
        id: r.id,
        type: String(meta.type ?? r.action.replace("dr_sara.", "")),
        targetType: (meta.targetType as IntelligenceAction["targetType"]) ?? "platform",
        targetId: r.targetId ?? "platform",
        createdAt: r.createdAt,
        completedAt: (meta.completedAt as string)
          ? new Date(String(meta.completedAt))
          : null,
        status: (meta.status as IntelligenceAction["status"]) ?? "recommended",
        expectedOutcome: String(meta.expectedOutcome ?? ""),
        measuredOutcome: meta.measuredOutcome
          ? String(meta.measuredOutcome)
          : null,
        outcome: (meta.outcome as IntelligenceAction["outcome"]) ?? null,
        metadata: meta,
      };
    });
  } catch {
    return [];
  }
}
