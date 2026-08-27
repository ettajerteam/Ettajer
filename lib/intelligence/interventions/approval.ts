/**
 * Approval gate — never silently approve dangerous actions.
 */
import type {
  ApprovalAssessment,
  ApprovalLevel,
  BlastRadius,
  RegistryInterventionDef,
  RiskAssessment,
  SafetyLevel,
} from "@/lib/intelligence/interventions/types";

const ORDER: ApprovalLevel[] = ["NONE", "RECOMMENDED", "REQUIRED", "BLOCKED"];

function elevate(a: ApprovalLevel, b: ApprovalLevel): ApprovalLevel {
  return ORDER.indexOf(b) > ORDER.indexOf(a) ? b : a;
}

export function evaluateApproval(input: {
  def: RegistryInterventionDef;
  safetyLevel: SafetyLevel;
  risk: RiskAssessment;
  blast: BlastRadius;
}): ApprovalAssessment {
  const reasons: string[] = [];
  let level: ApprovalLevel = input.def.approvalRequirement;

  if (input.safetyLevel === "BLOCKED") {
    return {
      level: "BLOCKED",
      reasons: ["Safety gate BLOCKED — approval not available."],
      humanRequired: true,
    };
  }

  if (input.def.mutable) {
    level = elevate(level, "REQUIRED");
    reasons.push("Mutable / financial-or-config boundary → approval REQUIRED.");
  }

  if (
    input.def.type === "FIRST_SALE_ASSISTANCE" ||
    input.def.type === "ACTIVATION_OUTREACH"
  ) {
    level = elevate(level, "REQUIRED");
    reasons.push("Merchant-facing communication → approval REQUIRED.");
  }

  if (input.blast.level === "HIGH" || input.blast.level === "CRITICAL") {
    level = elevate(level, "REQUIRED");
    reasons.push(`Blast radius ${input.blast.level} → approval REQUIRED.`);
  }

  if (input.risk.overallRisk === "HIGH" || input.risk.overallRisk === "CRITICAL") {
    level = elevate(level, "REQUIRED");
    reasons.push(`Overall risk ${input.risk.overallRisk} → approval REQUIRED.`);
  }

  if (input.def.reversibility === "LOW" || input.def.reversibility === "NONE") {
    level = elevate(level, "REQUIRED");
    reasons.push(
      `Low/none reversibility (${input.def.reversibility}) → elevated approval.`
    );
  }

  if (input.def.type === "NO_ACTION") {
    level = "NONE";
    reasons.push("NO_ACTION requires no approval.");
  }

  if (reasons.length === 0) {
    reasons.push(`Default registry approval: ${input.def.approvalRequirement}.`);
  }

  return {
    level,
    reasons,
    humanRequired: level === "REQUIRED" || level === "BLOCKED",
  };
}
