/**
 * Execution trace V4 — staged immutable cycle log.
 */

export type TraceStage =
  | "OBSERVE"
  | "DETECT"
  | "DIAGNOSE"
  | "PREDICT"
  | "DECIDE"
  | "FILTER"
  | "RANK"
  | "INTERVENE"
  | "MEASURE"
  | "LEARN";

export type StageTraceEntry = {
  stage: TraceStage;
  detail: string;
  count?: number;
  durationMs?: number;
};

export type ExecutionTraceV4 = {
  cycleId: string;
  stages: StageTraceEntry[];
  topAction: string | null;
  warnings: number;
  executionTimeMs: number;
  rulesEvaluated: number;
  rulesFired: number;
  signalsGenerated: number;
  diagnoses: number;
  interventions: number;
  blockedInterventions: number;
  learningUpdate: string | null;
};

export function createTraceBuilder(cycleId: string) {
  const stages: StageTraceEntry[] = [];
  const t0 = Date.now();

  return {
    stage(stage: TraceStage, detail: string, count?: number) {
      stages.push({ stage, detail, count });
    },
    build(input: {
      topAction: string | null;
      warnings: number;
      rulesEvaluated: number;
      rulesFired: number;
      signalsGenerated: number;
      diagnoses: number;
      interventions: number;
      blockedInterventions: number;
      learningUpdate: string | null;
    }): ExecutionTraceV4 {
      return {
        cycleId,
        stages,
        topAction: input.topAction,
        warnings: input.warnings,
        executionTimeMs: Date.now() - t0,
        rulesEvaluated: input.rulesEvaluated,
        rulesFired: input.rulesFired,
        signalsGenerated: input.signalsGenerated,
        diagnoses: input.diagnoses,
        interventions: input.interventions,
        blockedInterventions: input.blockedInterventions,
        learningUpdate: input.learningUpdate,
      };
    },
  };
}
