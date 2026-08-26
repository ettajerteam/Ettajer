/**
 * SCENARIO_REGISTRY — explicit deterministic scenario definitions.
 * Simulation is READ-ONLY: never mutates production.
 */
import type { PlatformDigitalTwin } from "@/lib/intelligence/twin/types";
import { INTELLIGENCE_SCORING_CONFIG as C } from "@/lib/intelligence/config/scoring";
import { assumptionsForScenario } from "@/lib/intelligence/assumptions/registry";

export type TimeToImpact =
  | "immediate"
  | "<24h"
  | "1–3 days"
  | "3–7 days"
  | "7–14 days"
  | "14–30 days";

export type ScenarioCategory =
  | "operations"
  | "technical"
  | "activation"
  | "support"
  | "growth"
  | "baseline";

export type HorizonTradeoff = "SHORT_TERM" | "MEDIUM_TERM" | "LONG_TERM";

export type RegisteredScenario = {
  scenarioId: string;
  name: string;
  description: string;
  category: ScenarioCategory;
  inputs: string[];
  affectedDimensions: string[];
  assumptionIds: string[];
  expectedEffects: string[];
  confidence: number;
  reversibility: number;
  actionability: number;
  timeToImpact: TimeToImpact;
  horizon: HorizonTradeoff;
  limitations: string[];
  /** Maps to intervention type used by existing simulators when applicable */
  interventionType: string | null;
};

export const SCENARIO_REGISTRY: RegisteredScenario[] = [
  {
    scenarioId: "NO_ACTION",
    name: "No action baseline",
    description: "What happens if we do nothing.",
    category: "baseline",
    inputs: ["pendingCOD", "velocity"],
    affectedDimensions: ["operations", "trust"],
    assumptionIds: assumptionsForScenario("NO_ACTION").map((a) => a.id),
    expectedEffects: ["Current velocity continues within bounded range"],
    confidence: 0.7,
    reversibility: 1,
    actionability: 0,
    timeToImpact: "1–3 days",
    horizon: "SHORT_TERM",
    limitations: ["Does not model exogenous shocks"],
    interventionType: null,
  },
  {
    scenarioId: "COD_VERIFICATION_CLEARANCE",
    name: "Clear pending COD",
    description: "Verify pending real COD orders through existing ops workflow.",
    category: "operations",
    inputs: ["pendingCOD", "pendingGMV"],
    affectedDimensions: ["operations", "trust"],
    assumptionIds: assumptionsForScenario("COD_VERIFICATION_CLEARANCE").map(
      (a) => a.id
    ),
    expectedEffects: [
      `pendingCOD reduced by ~${C.twin.defaultCodClearanceRange[0] * 100}–${C.twin.defaultCodClearanceRange[1] * 100}% (historical deterministic range)`,
    ],
    confidence: 0.85,
    reversibility: 0.95,
    actionability: 1,
    timeToImpact: "immediate",
    horizon: "SHORT_TERM",
    limitations: ["Does not guarantee courier handoff timing"],
    interventionType: "COD_VERIFICATION",
  },
  {
    scenarioId: "DNS_FAILURE_REMEDIATION",
    name: "Remediate failing DNS",
    description: "Fix custom domains failing live DNS checks.",
    category: "technical",
    inputs: ["domainFailures"],
    affectedDimensions: ["technical", "activation"],
    assumptionIds: assumptionsForScenario("DNS_FAILURE_REMEDIATION").map(
      (a) => a.id
    ),
    expectedEffects: [
      "domainFailures decline within configured clearance band",
      "EXPECTED_OPPORTUNITY: storefront reach may improve",
    ],
    confidence: 0.8,
    reversibility: 0.75,
    actionability: 0.9,
    timeToImpact: "<24h",
    horizon: "SHORT_TERM",
    limitations: ["Does not invent visit/traffic metrics"],
    interventionType: "DNS_DIAGNOSIS",
  },
  {
    scenarioId: "FIRST_SALE_ACTIVATION",
    name: "Activate first-sale cohort",
    description: "Assist high-intent catalog-ready merchants toward first sale.",
    category: "activation",
    inputs: ["firstSaleCount", "firstSaleHighIntent"],
    affectedDimensions: ["activation", "revenue"],
    assumptionIds: assumptionsForScenario("FIRST_SALE_ACTIVATION").map(
      (a) => a.id
    ),
    expectedEffects: [
      "EXPECTED_OPPORTUNITY increases — not guaranteed orders",
    ],
    confidence: 0.55,
    reversibility: 0.6,
    actionability: 0.7,
    timeToImpact: "7–14 days",
    horizon: "MEDIUM_TERM",
    limitations: ["Insufficient traffic data → opportunity only"],
    interventionType: "FIRST_SALE_ASSIST",
  },
  {
    scenarioId: "ACTIVATION_OUTREACH",
    name: "Activation outreach to empty stores",
    description: "Reach recently active empty-store merchants.",
    category: "activation",
    inputs: ["emptyStores", "loggedInEmpty"],
    affectedDimensions: ["activation"],
    assumptionIds: assumptionsForScenario("ACTIVATION_OUTREACH").map(
      (a) => a.id
    ),
    expectedEffects: ["EXPECTED_OPPORTUNITY: catalog creation may rise"],
    confidence: 0.55,
    reversibility: 0.7,
    actionability: 0.75,
    timeToImpact: "3–7 days",
    horizon: "MEDIUM_TERM",
    limitations: ["Blocked if domain unhealthy for target merchants"],
    interventionType: "ACTIVATION_OUTREACH",
  },
  {
    scenarioId: "SUPPORT_BACKLOG_REDUCTION",
    name: "Reduce support backlog",
    description: "Clear unanswered support threads.",
    category: "support",
    inputs: ["supportBacklog"],
    affectedDimensions: ["support", "trust"],
    assumptionIds: assumptionsForScenario("SUPPORT_BACKLOG_REDUCTION").map(
      (a) => a.id
    ),
    expectedEffects: ["openSupport declines within clearance band"],
    confidence: 0.8,
    reversibility: 0.9,
    actionability: 0.95,
    timeToImpact: "immediate",
    horizon: "SHORT_TERM",
    limitations: ["Does not model merchant satisfaction scores (unavailable)"],
    interventionType: "SUPPORT_ESCALATION",
  },
  {
    scenarioId: "MERCHANT_ONBOARDING",
    name: "Merchant onboarding growth",
    description:
      "Hypothetical additional merchant onboarding — opportunity only, capacity-aware.",
    category: "growth",
    inputs: ["totalStores", "activationCapacity"],
    affectedDimensions: ["activation", "operations"],
    assumptionIds: assumptionsForScenario("MERCHANT_ONBOARDING").map(
      (a) => a.id
    ),
    expectedEffects: [
      "Long-term pool growth; short-term operational load ↑",
    ],
    confidence: 0.4,
    reversibility: 0.3,
    actionability: 0.4,
    timeToImpact: "14–30 days",
    horizon: "LONG_TERM",
    limitations: [
      "INSUFFICIENT EVIDENCE for precise GMV from onboarding without cohort history",
    ],
    interventionType: null,
  },
  {
    scenarioId: "REVENUE_CONCENTRATION_REDUCTION",
    name: "Reduce revenue concentration risk",
    description:
      "Diversify attention toward non-top merchants — opportunity framing only.",
    category: "growth",
    inputs: ["top2SharePct", "concentration"],
    affectedDimensions: ["revenue", "risk"],
    assumptionIds: assumptionsForScenario("REVENUE_CONCENTRATION_REDUCTION").map(
      (a) => a.id
    ),
    expectedEffects: [
      "INSUFFICIENT EVIDENCE for precise GMV redistribution without intervention history",
    ],
    confidence: 0.35,
    reversibility: 0.5,
    actionability: 0.4,
    timeToImpact: "14–30 days",
    horizon: "LONG_TERM",
    limitations: [
      "Does not invent competitor share; marks concentration risk only",
    ],
    interventionType: null,
  },
];

export function getScenarioDefinition(
  scenarioId: string
): RegisteredScenario | null {
  return SCENARIO_REGISTRY.find((s) => s.scenarioId === scenarioId) ?? null;
}

export function listScenariosForTwin(twin: PlatformDigitalTwin): RegisteredScenario[] {
  return SCENARIO_REGISTRY.filter((s) => {
    if (s.scenarioId === "NO_ACTION") return true;
    if (s.scenarioId === "COD_VERIFICATION_CLEARANCE")
      return twin.metrics.pendingCOD > 0;
    if (s.scenarioId === "DNS_FAILURE_REMEDIATION")
      return twin.metrics.domainFailures > 0;
    if (s.scenarioId === "SUPPORT_BACKLOG_REDUCTION")
      return twin.metrics.supportBacklog > 0;
    if (s.scenarioId === "FIRST_SALE_ACTIVATION")
      return twin.metrics.firstSaleCount > 0;
    if (s.scenarioId === "ACTIVATION_OUTREACH")
      return twin.metrics.emptyStores > 0;
    if (s.scenarioId === "MERCHANT_ONBOARDING") return true;
    if (s.scenarioId === "REVENUE_CONCENTRATION_REDUCTION")
      return twin.metrics.top2SharePct >= 50;
    return false;
  });
}
