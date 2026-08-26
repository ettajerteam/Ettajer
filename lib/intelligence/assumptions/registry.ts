/**
 * Central assumption registry for V5 simulations — deterministic, auditable.
 */

export type AssumptionStatus =
  | "ACTIVE"
  | "WEAK"
  | "UNSUPPORTED"
  | "INVALIDATED";

export type IntelligenceAssumption = {
  id: string;
  description: string;
  rule: string;
  evidence: string;
  confidence: number;
  status: AssumptionStatus;
  category: string;
};

export const INTELLIGENCE_ASSUMPTIONS: IntelligenceAssumption[] = [
  {
    id: "A-COD-001",
    description:
      "Verified COD orders transition toward processing within existing observed operational behavior.",
    rule: "COD clearance uses configured historical clearance bands only.",
    evidence: "Live pendingRealOrders + historical intervention memory when available.",
    confidence: 0.8,
    status: "ACTIVE",
    category: "operations",
  },
  {
    id: "A-DNS-001",
    description:
      "Remediating failing DNS restores storefront reach for affected custom domains.",
    rule: "DNS remediation uses configured clearance bands; does not invent traffic.",
    evidence: "domainFailing from live DNS checks.",
    confidence: 0.75,
    status: "ACTIVE",
    category: "technical",
  },
  {
    id: "A-ACT-001",
    description:
      "High-intent first-sale merchants behave similarly to recent activation cohorts.",
    rule: "Activation scenarios improve EXPECTED_OPPORTUNITY only — never guaranteed orders.",
    evidence: "firstSaleHighIntent / loggedInEmpty7d from activation funnel.",
    confidence: 0.55,
    status: "WEAK",
    category: "activation",
  },
  {
    id: "A-GROWTH-001",
    description:
      "Recent GMV velocity remains within deterministic bounded range for trajectory.",
    rule: "Trajectory uses velocity extrapolation with explicit ranges, not point precision.",
    evidence: "revenueChange7d / realRevenue7d period comparison.",
    confidence: 0.65,
    status: "ACTIVE",
    category: "revenue",
  },
  {
    id: "A-SUP-001",
    description:
      "Support backlog clearance follows observed operational throughput bands.",
    rule: "Support scenarios use configured clearance ranges.",
    evidence: "openSupport from support inbox.",
    confidence: 0.7,
    status: "ACTIVE",
    category: "support",
  },
  {
    id: "A-ISO-001",
    description:
      "Scenario simulation is read-only and never mutates production state.",
    rule: "simulate() clones twin inputs; no Prisma writes in simulation path.",
    evidence: "Code path isolation.",
    confidence: 1,
    status: "ACTIVE",
    category: "safety",
  },
];

export function assumptionsForScenario(scenarioId: string): IntelligenceAssumption[] {
  const map: Record<string, string[]> = {
    COD_VERIFICATION_CLEARANCE: ["A-COD-001", "A-ISO-001"],
    DNS_FAILURE_REMEDIATION: ["A-DNS-001", "A-ISO-001"],
    FIRST_SALE_ACTIVATION: ["A-ACT-001", "A-ISO-001"],
    SUPPORT_BACKLOG_REDUCTION: ["A-SUP-001", "A-ISO-001"],
    MERCHANT_ONBOARDING: ["A-ACT-001", "A-GROWTH-001", "A-ISO-001"],
    ACTIVATION_OUTREACH: ["A-ACT-001", "A-ISO-001"],
    NO_ACTION: ["A-GROWTH-001", "A-ISO-001"],
    REVENUE_CONCENTRATION_REDUCTION: ["A-GROWTH-001", "A-ISO-001"],
  };
  const ids = map[scenarioId] ?? ["A-ISO-001"];
  return INTELLIGENCE_ASSUMPTIONS.filter((a) => ids.includes(a.id));
}

export function activeAssumptionIds(assumptions: IntelligenceAssumption[]): string[] {
  return assumptions.filter((a) => a.status === "ACTIVE" || a.status === "WEAK").map((a) => a.id);
}
