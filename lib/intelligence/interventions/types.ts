/**
 * Dr Sara V8 — Intervention Orchestration types.
 * Plans only — never executes. Distinct from V3 Intervention in engine.ts.
 */

export type InterventionStatus =
  | "PROPOSED"
  | "BLOCKED"
  | "READY_FOR_APPROVAL"
  | "APPROVED"
  | "EXECUTION_READY"
  | "EXECUTED"
  | "FAILED"
  | "ROLLED_BACK"
  | "MEASURED"
  | "DUPLICATE"
  | "ALREADY_IN_PROGRESS";

export type SafetyLevel = "SAFE" | "CAUTION" | "BLOCKED";

export type BlastRadiusLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type OverallRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ApprovalLevel = "NONE" | "RECOMMENDED" | "REQUIRED" | "BLOCKED";

export type ExecutionMode =
  | "SIMULATION_ONLY"
  | "RECOMMENDATION_ONLY"
  | "READY_FOR_APPROVAL";

export type OrchestratedInterventionType =
  | "COD_VERIFICATION"
  | "DNS_DIAGNOSIS"
  | "SUPPORT_ESCALATION"
  | "MERCHANT_ONBOARDING"
  | "FIRST_SALE_ASSISTANCE"
  | "ACTIVATION_OUTREACH"
  | "REVENUE_CONCENTRATION_REVIEW"
  | "NO_ACTION";

export type SafetyCheckResult = {
  checkId: string;
  status: "PASS" | "WARN" | "FAIL";
  reason: string;
  evidence: string[];
};

export type PrerequisiteResult = {
  prerequisiteId: string;
  status: "PASS" | "FAIL";
  reason: string;
  evidence: string[];
};

export type RiskAssessment = {
  operationalRisk: OverallRiskLevel;
  merchantRisk: OverallRiskLevel;
  customerRisk: OverallRiskLevel;
  financialRisk: OverallRiskLevel;
  technicalRisk: OverallRiskLevel;
  reputationRisk: OverallRiskLevel;
  overallRisk: OverallRiskLevel;
  explanations: string[];
};

export type BlastRadius = {
  targetCount: number;
  affectedMerchants: number;
  affectedOrders: number;
  affectedDomains: number;
  affectedRevenue: number;
  level: BlastRadiusLevel;
  note: string;
};

export type ApprovalAssessment = {
  level: ApprovalLevel;
  reasons: string[];
  humanRequired: boolean;
};

export type ExecutionStep = {
  step: number;
  name: string;
  description: string;
  isExecutionBoundary: boolean;
};

export type ExecutionPlan = {
  steps: ExecutionStep[];
  preconditions: string[];
  expectedState: string;
  actionBoundary: string;
  approvalRequirement: ApprovalLevel;
  timeout: string;
  retryPolicy: string;
  idempotencyKey: string;
  rollbackTrigger: string;
  note: string;
};

export type RollbackPlan = {
  possible: boolean;
  reversibility: "HIGH" | "MEDIUM" | "LOW" | "NONE";
  strategy: string;
  limitations: string[];
};

export type MeasurementPlan = {
  primaryMetric: string;
  secondaryMetrics: string[];
  measurementWindow: string;
  baseline: Record<string, number>;
  expectedAfter: Record<string, [number, number]>;
  successCriteria: string;
  failureCriteria: string;
  partialCriteria: string;
};

export type InterventionTraceStage = {
  stage: string;
  detail: string;
};

export type InterventionPlan = {
  interventionId: string;
  type: OrchestratedInterventionType;
  target: {
    label: string;
    count: number;
    route: string;
  };
  objective: string;
  priority: number;
  rationale: string[];
  prerequisites: PrerequisiteResult[];
  safetyChecks: SafetyCheckResult[];
  safetyLevel: SafetyLevel;
  blastRadius: BlastRadius;
  risk: RiskAssessment;
  approval: ApprovalAssessment;
  execution: ExecutionPlan;
  rollback: RollbackPlan;
  measurement: MeasurementPlan;
  status: InterventionStatus;
  executionMode: ExecutionMode;
  conflicts: string[];
  duplicateOf: string | null;
  trace: InterventionTraceStage[];
  reviewHref: string;
};

export type RegistryInterventionDef = {
  type: OrchestratedInterventionType;
  objective: string;
  requiredEvidence: string[];
  prerequisites: string[];
  riskLevel: OverallRiskLevel;
  reversibility: RollbackPlan["reversibility"];
  approvalRequirement: ApprovalLevel;
  allowedTargets: string[];
  forbiddenTargets: string[];
  measurementMetrics: string[];
  rollbackStrategy: string;
  route: string;
  mutable: boolean;
};
