/**
 * V9 Execution Registry — only registered interventions may execute.
 * Handlers mutate sandbox state only — never Prisma / production.
 */
import type {
  ExecutionRegistryDef,
  Permission,
} from "@/lib/intelligence/execution/types";
import type { OrchestratedInterventionType } from "@/lib/intelligence/interventions/types";
import type { PlatformState } from "@/lib/intelligence/engine-types";
import type { SandboxMutation } from "@/lib/intelligence/execution/types";

export type InterventionHandler = (input: {
  state: PlatformState;
  targetCount: number;
  baseline: Record<string, number>;
}) => { state: PlatformState; mutations: SandboxMutation[] };

const HANDLERS: Partial<
  Record<OrchestratedInterventionType, InterventionHandler>
> = {
  COD_VERIFICATION: ({ state, baseline }) => {
    const before = state.pendingRealOrders;
    // Deterministic sandbox effect: move toward midpoint of expected [4,7] → 5
    const after = Math.max(0, Math.min(before, 5));
    const next = { ...state, pendingRealOrders: after };
    const mutations: SandboxMutation[] = [
      {
        opId: "cod_pending_reduce",
        metric: "pendingCOD",
        before,
        after,
        reversible: true,
      },
    ];
    void baseline;
    return { state: next, mutations };
  },
  DNS_DIAGNOSIS: ({ state }) => {
    // Diagnosis-only sandbox: no mutation of domain counts (read path)
    return {
      state,
      mutations: [
        {
          opId: "dns_diagnose_readonly",
          metric: "domainFailing",
          before: state.domainFailing,
          after: state.domainFailing,
          reversible: true,
        },
      ],
    };
  },
  SUPPORT_ESCALATION: ({ state }) => {
    const before = state.openSupport;
    const after = Math.max(0, before - 1);
    return {
      state: { ...state, openSupport: after },
      mutations: [
        {
          opId: "support_escalate_one",
          metric: "supportBacklog",
          before,
          after,
          reversible: true,
        },
      ],
    };
  },
  FIRST_SALE_ASSISTANCE: ({ state }) => ({
    state,
    mutations: [
      {
        opId: "first_sale_assist_readonly",
        metric: "firstSalePool",
        before: state.firstSaleCount,
        after: state.firstSaleCount,
        reversible: true,
      },
    ],
  }),
  ACTIVATION_OUTREACH: ({ state }) => ({
    state,
    mutations: [
      {
        opId: "activation_outreach_queued",
        metric: "emptyStores",
        before: state.hotEmptyCount,
        after: state.hotEmptyCount,
        reversible: true,
      },
    ],
  }),
  MERCHANT_ONBOARDING: ({ state }) => ({
    state,
    mutations: [
      {
        opId: "onboarding_campaign_pauseable",
        metric: "totalStores",
        before: state.totalStores,
        after: state.totalStores,
        reversible: false,
      },
    ],
  }),
  REVENUE_CONCENTRATION_REVIEW: ({ state }) => ({
    state,
    mutations: [
      {
        opId: "concentration_review_readonly",
        metric: "top2SharePct",
        before: state.top2SharePct,
        after: state.top2SharePct,
        reversible: true,
      },
    ],
  }),
  NO_ACTION: ({ state }) => ({
    state,
    mutations: [],
  }),
};

export const EXECUTION_REGISTRY: ExecutionRegistryDef[] = [
  {
    interventionType: "COD_VERIFICATION",
    allowedActions: ["load_queue", "verify_eligibility", "present_queue"],
    requiredPermission: "intervention:cod_verify",
    safetyLevel: "CAUTION",
    maxBlastRadius: "HIGH",
    requiresApproval: true,
    reversible: true,
    rollbackStrategy: "Restore prior pendingCOD sandbox value if not committed externally.",
    idempotencyStrategy: "decision+type+target+approvedFingerprint",
    measurementStrategy: "pendingCOD after intervention window",
    verificationStrategy: "pendingCOD must not increase; prefer decrease toward expected range",
    productionMutationAllowed: false,
  },
  {
    interventionType: "DNS_DIAGNOSIS",
    allowedActions: ["read_dns", "diagnose"],
    requiredPermission: "intervention:dns_diagnose",
    safetyLevel: "CAUTION",
    maxBlastRadius: "MEDIUM",
    requiresApproval: true,
    reversible: true,
    rollbackStrategy: "Diagnosis-only — no config write in V9 sandbox.",
    idempotencyStrategy: "decision+type+target+approvedFingerprint",
    measurementStrategy: "domainFailures",
    verificationStrategy: "domainFailing must not increase from diagnosis",
    productionMutationAllowed: false,
  },
  {
    interventionType: "SUPPORT_ESCALATION",
    allowedActions: ["escalate_thread"],
    requiredPermission: "intervention:support_escalate",
    safetyLevel: "SAFE",
    maxBlastRadius: "LOW",
    requiresApproval: true,
    reversible: true,
    rollbackStrategy: "Re-open escalated thread count in sandbox.",
    idempotencyStrategy: "decision+type+target+approvedFingerprint",
    measurementStrategy: "supportBacklog",
    verificationStrategy: "openSupport must not increase",
    productionMutationAllowed: false,
  },
  {
    interventionType: "FIRST_SALE_ASSISTANCE",
    allowedActions: ["assist_queue"],
    requiredPermission: "intervention:first_sale",
    safetyLevel: "SAFE",
    maxBlastRadius: "MEDIUM",
    requiresApproval: true,
    reversible: true,
    rollbackStrategy: "Cancel queued assist actions (sandbox noop).",
    idempotencyStrategy: "decision+type+target+approvedFingerprint",
    measurementStrategy: "firstSalePool",
    verificationStrategy: "no regression of firstSaleCount",
    productionMutationAllowed: false,
  },
  {
    interventionType: "ACTIVATION_OUTREACH",
    allowedActions: ["queue_outreach"],
    requiredPermission: "intervention:activation",
    safetyLevel: "CAUTION",
    maxBlastRadius: "MEDIUM",
    requiresApproval: true,
    reversible: true,
    rollbackStrategy: "Cancel future outreach in sandbox.",
    idempotencyStrategy: "decision+type+target+approvedFingerprint",
    measurementStrategy: "emptyStores",
    verificationStrategy: "hotEmptyCount must not increase due to outreach mark",
    productionMutationAllowed: false,
  },
  {
    interventionType: "MERCHANT_ONBOARDING",
    allowedActions: ["campaign_adjust"],
    requiredPermission: "intervention:merchant_onboard",
    safetyLevel: "CAUTION",
    maxBlastRadius: "CRITICAL",
    requiresApproval: true,
    reversible: false,
    rollbackStrategy: "Weakly reversible — pause only; accounts remain.",
    idempotencyStrategy: "decision+type+target+approvedFingerprint",
    measurementStrategy: "totalStores",
    verificationStrategy: "no silent force-activate",
    productionMutationAllowed: false,
  },
  {
    interventionType: "REVENUE_CONCENTRATION_REVIEW",
    allowedActions: ["review_only"],
    requiredPermission: "intervention:concentration_review",
    safetyLevel: "SAFE",
    maxBlastRadius: "LOW",
    requiresApproval: true,
    reversible: true,
    rollbackStrategy: "Review-only — stop workflow.",
    idempotencyStrategy: "decision+type+target+approvedFingerprint",
    measurementStrategy: "top2SharePct",
    verificationStrategy: "read-only invariant",
    productionMutationAllowed: false,
  },
  {
    interventionType: "NO_ACTION",
    allowedActions: ["observe"],
    requiredPermission: "intervention:noop",
    safetyLevel: "SAFE",
    maxBlastRadius: "LOW",
    requiresApproval: false,
    reversible: true,
    rollbackStrategy: "N/A",
    idempotencyStrategy: "decision+type+target+approvedFingerprint",
    measurementStrategy: "none",
    verificationStrategy: "no mutation",
    productionMutationAllowed: false,
  },
];

export function getExecutionDef(
  type: string
): ExecutionRegistryDef | null {
  return EXECUTION_REGISTRY.find((d) => d.interventionType === type) ?? null;
}

export function getHandler(
  type: OrchestratedInterventionType
): InterventionHandler | null {
  return HANDLERS[type] ?? null;
}

export function permissionForType(
  type: OrchestratedInterventionType
): Permission | null {
  return getExecutionDef(type)?.requiredPermission ?? null;
}
