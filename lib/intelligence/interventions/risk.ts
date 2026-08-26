/**
 * Deterministic risk model for intervention plans.
 */
import type {
  BlastRadius,
  OverallRiskLevel,
  RegistryInterventionDef,
  RiskAssessment,
} from "@/lib/intelligence/interventions/types";

function maxRisk(...levels: OverallRiskLevel[]): OverallRiskLevel {
  const order: OverallRiskLevel[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  return levels.reduce((a, b) =>
    order.indexOf(b) > order.indexOf(a) ? b : a
  );
}

export function evaluateRisk(input: {
  def: RegistryInterventionDef;
  blast: BlastRadius;
  safetyLevel: string;
}): RiskAssessment {
  const { def, blast } = input;
  const explanations: string[] = [];

  let operationalRisk: OverallRiskLevel = def.riskLevel;
  let merchantRisk: OverallRiskLevel = "LOW";
  let customerRisk: OverallRiskLevel = "LOW";
  let financialRisk: OverallRiskLevel = "LOW";
  let technicalRisk: OverallRiskLevel = "LOW";
  let reputationRisk: OverallRiskLevel = "LOW";

  if (def.type === "COD_VERIFICATION") {
    financialRisk = blast.affectedRevenue > 0 ? "MEDIUM" : "LOW";
    customerRisk = blast.affectedOrders > 0 ? "MEDIUM" : "LOW";
    operationalRisk = "MEDIUM";
    explanations.push(
      "COD verification affects order fulfillment timing and pending GMV exposure."
    );
  } else if (def.type === "DNS_DIAGNOSIS") {
    technicalRisk = "MEDIUM";
    merchantRisk = "MEDIUM";
    reputationRisk = blast.affectedDomains >= 3 ? "MEDIUM" : "LOW";
    explanations.push("DNS remediation can affect storefront reach.");
  } else if (def.type === "SUPPORT_ESCALATION") {
    merchantRisk = "LOW";
    reputationRisk = "LOW";
    explanations.push("Support escalation is low operational risk.");
  } else if (
    def.type === "FIRST_SALE_ASSISTANCE" ||
    def.type === "ACTIVATION_OUTREACH"
  ) {
    merchantRisk = "MEDIUM";
    reputationRisk = "MEDIUM";
    explanations.push(
      "Outreach risks merchant fatigue if overused; no guaranteed sales."
    );
  } else if (def.type === "MERCHANT_ONBOARDING") {
    operationalRisk = "HIGH";
    merchantRisk = "MEDIUM";
    explanations.push(
      "Onboarding increases operational load; GMV impact uncertain."
    );
  } else if (def.type === "REVENUE_CONCENTRATION_REVIEW") {
    financialRisk = "MEDIUM";
    explanations.push("Review-only concentration risk assessment.");
  } else {
    explanations.push("NO_ACTION — observation only.");
  }

  if (blast.level === "HIGH") {
    operationalRisk = maxRisk(operationalRisk, "HIGH");
    explanations.push("Elevated blast radius increases operational risk.");
  }
  if (blast.level === "CRITICAL") {
    operationalRisk = "CRITICAL";
    financialRisk = maxRisk(financialRisk, "HIGH");
    explanations.push("Critical blast radius.");
  }

  if (input.safetyLevel === "BLOCKED") {
    explanations.push("Safety gate blocked — treat overall risk as elevated.");
  }

  const overallRisk = maxRisk(
    operationalRisk,
    merchantRisk,
    customerRisk,
    financialRisk,
    technicalRisk,
    reputationRisk
  );

  return {
    operationalRisk,
    merchantRisk,
    customerRisk,
    financialRisk,
    technicalRisk,
    reputationRisk,
    overallRisk,
    explanations,
  };
}
