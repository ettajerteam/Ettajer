/**
 * Execution plan description — V8 NEVER crosses the execution boundary.
 */
import type {
  ApprovalLevel,
  ExecutionPlan,
  RegistryInterventionDef,
} from "@/lib/intelligence/interventions/types";

export function buildExecutionPlan(input: {
  def: RegistryInterventionDef;
  idempotencyKey: string;
  approvalLevel: ApprovalLevel;
  targetLabel: string;
}): ExecutionPlan {
  const { def, idempotencyKey, approvalLevel, targetLabel } = input;

  const steps =
    def.type === "NO_ACTION"
      ? [
          {
            step: 1,
            name: "observe",
            description: "Continue observation; no intervention.",
            isExecutionBoundary: false,
          },
        ]
      : [
          {
            step: 1,
            name: "load_targets",
            description: `Load ${targetLabel} from live admin views.`,
            isExecutionBoundary: false,
          },
          {
            step: 2,
            name: "verify_eligibility",
            description: "Verify eligibility against prerequisites/safety.",
            isExecutionBoundary: false,
          },
          {
            step: 3,
            name: "present_queue",
            description: `Present review queue at ${def.route} (human UI).`,
            isExecutionBoundary: false,
          },
          {
            step: 4,
            name: "human_approval",
            description: "Obtain human approval when required.",
            isExecutionBoundary: false,
          },
          {
            step: 5,
            name: "execution_boundary",
            description:
              "EXECUTION BOUNDARY — V8 does not perform mutations. Future V9+ executor only after approval.",
            isExecutionBoundary: true,
          },
        ];

  return {
    steps,
    preconditions: def.prerequisites,
    expectedState: def.objective,
    actionBoundary:
      "V8 stops before any Prisma write, message send, DNS mutate, or order change.",
    approvalRequirement: approvalLevel,
    timeout: "24h",
    retryPolicy: "none — planning is idempotent; do not auto-retry execution",
    idempotencyKey,
    rollbackTrigger:
      "If a future executor reports failure or unsafe state → follow rollback plan.",
    note: "SIMULATION/RECOMMENDATION only. autoExecute=false.",
  };
}

/** Deterministic idempotency key — no random UUIDs. */
export function buildIdempotencyKey(input: {
  interventionType: string;
  stateFingerprint: string;
  decisionId: string;
  targetCount: number;
}): string {
  const payload = [
    input.interventionType,
    input.stateFingerprint,
    input.decisionId,
    String(input.targetCount),
  ].join("|");
  let h = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    h ^= payload.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `iv8_${(h >>> 0).toString(16).padStart(8, "0")}`;
}
