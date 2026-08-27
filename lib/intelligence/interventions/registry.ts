/**
 * INTERVENTION_REGISTRY — explicit deterministic intervention definitions.
 */
import type { RegistryInterventionDef } from "@/lib/intelligence/interventions/types";

export const INTERVENTION_REGISTRY: RegistryInterventionDef[] = [
  {
    type: "COD_VERIFICATION",
    objective: "Reduce pending real COD verification backlog",
    requiredEvidence: ["pendingRealOrders", "pendingRealGmv"],
    prerequisites: ["pending_orders_gt_0", "orders_are_real"],
    riskLevel: "MEDIUM",
    reversibility: "HIGH",
    approvalRequirement: "REQUIRED",
    allowedTargets: ["pending_cod_orders"],
    forbiddenTargets: ["completed_orders", "test_orders"],
    measurementMetrics: ["pendingCOD", "pendingGMV"],
    rollbackStrategy:
      "Verification is operational workflow — stop further verification actions; already-verified orders follow normal ops path.",
    route: "/admin/payments?focus=pending",
    mutable: true,
  },
  {
    type: "DNS_DIAGNOSIS",
    objective: "Diagnose and remediate failing custom domains",
    requiredEvidence: ["domainFailing"],
    prerequisites: ["failing_domains_gt_0"],
    riskLevel: "MEDIUM",
    reversibility: "MEDIUM",
    approvalRequirement: "REQUIRED",
    allowedTargets: ["failing_domains"],
    forbiddenTargets: ["healthy_domains_mass_change"],
    measurementMetrics: ["domainFailures"],
    rollbackStrategy:
      "DNS changes may not be instantly reversible; document prior DNS records before changes. Diagnosis-only steps are read-only.",
    route: "/admin/domains",
    mutable: true,
  },
  {
    type: "SUPPORT_ESCALATION",
    objective: "Clear unanswered support backlog",
    requiredEvidence: ["openSupport"],
    prerequisites: ["open_support_gt_0"],
    riskLevel: "LOW",
    reversibility: "HIGH",
    approvalRequirement: "RECOMMENDED",
    allowedTargets: ["open_support_threads"],
    forbiddenTargets: ["closed_threads_bulk_reopen"],
    measurementMetrics: ["supportBacklog"],
    rollbackStrategy: "Stop escalation; threads remain in inbox state.",
    route: "/admin/messages",
    mutable: false,
  },
  {
    type: "FIRST_SALE_ASSISTANCE",
    objective: "Assist high-intent catalog-ready merchants toward first sale",
    requiredEvidence: ["firstSaleCount", "firstSaleHighIntent"],
    prerequisites: ["first_sale_pool_gt_0"],
    riskLevel: "LOW",
    reversibility: "MEDIUM",
    approvalRequirement: "REQUIRED",
    allowedTargets: ["first_sale_merchants"],
    forbiddenTargets: ["power_merchants_spam"],
    measurementMetrics: ["firstSalePool"],
    rollbackStrategy:
      "Cancel scheduled outreach; no guaranteed order outcomes to reverse.",
    route: "/admin/activation",
    mutable: false,
  },
  {
    type: "ACTIVATION_OUTREACH",
    objective: "Reach recently active empty-store merchants",
    requiredEvidence: ["hotEmptyCount", "loggedInEmpty7d"],
    prerequisites: ["empty_activity_gt_0"],
    riskLevel: "MEDIUM",
    reversibility: "MEDIUM",
    approvalRequirement: "REQUIRED",
    allowedTargets: ["empty_active_stores"],
    forbiddenTargets: ["unsubscribed_merchants"],
    measurementMetrics: ["emptyStores"],
    rollbackStrategy: "Cancel future outreach messages if queued.",
    route: "/admin/activation",
    mutable: false,
  },
  {
    type: "MERCHANT_ONBOARDING",
    objective: "Capacity-aware merchant onboarding growth (opportunity framing)",
    requiredEvidence: ["totalStores"],
    prerequisites: ["onboarding_capacity_available"],
    riskLevel: "HIGH",
    reversibility: "LOW",
    approvalRequirement: "REQUIRED",
    allowedTargets: ["new_merchant_cohort"],
    forbiddenTargets: ["force_activate_unready"],
    measurementMetrics: ["totalStores", "operationalLoad"],
    rollbackStrategy:
      "Onboarding is weakly reversible — pause acquisition campaigns; accounts already created remain.",
    route: "/admin/users",
    mutable: true,
  },
  {
    type: "REVENUE_CONCENTRATION_REVIEW",
    objective: "Review elevated revenue concentration risk",
    requiredEvidence: ["top2SharePct"],
    prerequisites: ["concentration_elevated"],
    riskLevel: "MEDIUM",
    reversibility: "HIGH",
    approvalRequirement: "RECOMMENDED",
    allowedTargets: ["top_merchants_review"],
    forbiddenTargets: ["force_throttle_merchants"],
    measurementMetrics: ["top2SharePct"],
    rollbackStrategy: "Review-only — no mutation; stop review workflow.",
    route: "/admin/analytics?range=30",
    mutable: false,
  },
  {
    type: "NO_ACTION",
    objective: "Defer intervention; continue observation",
    requiredEvidence: [],
    prerequisites: [],
    riskLevel: "LOW",
    reversibility: "HIGH",
    approvalRequirement: "NONE",
    allowedTargets: ["none"],
    forbiddenTargets: [],
    measurementMetrics: [],
    rollbackStrategy: "N/A — no action taken.",
    route: "/admin/sara",
    mutable: false,
  },
];

export function getInterventionDef(
  type: string
): RegistryInterventionDef | null {
  return (
    INTERVENTION_REGISTRY.find((d) => d.type === type) ?? null
  );
}

/** Map V6 decision ids → V8 intervention types */
export function decisionToInterventionType(
  decisionId: string
): RegistryInterventionDef["type"] {
  switch (decisionId) {
    case "REVIEW_PENDING_COD":
      return "COD_VERIFICATION";
    case "DIAGNOSE_DNS":
      return "DNS_DIAGNOSIS";
    case "ANSWER_SUPPORT":
      return "SUPPORT_ESCALATION";
    case "PRIORITIZE_FIRST_SALE":
      return "FIRST_SALE_ASSISTANCE";
    case "ACTIVATE_MID_TIER_MERCHANTS":
      return "ACTIVATION_OUTREACH";
    case "REVIEW_REVENUE_CONCENTRATION":
      return "REVENUE_CONCENTRATION_REVIEW";
    case "NO_ACTION":
      return "NO_ACTION";
    default:
      if (decisionId.includes("COD")) return "COD_VERIFICATION";
      if (decisionId.includes("DNS")) return "DNS_DIAGNOSIS";
      return "NO_ACTION";
  }
}
