/**
 * Decision room presentation — V6 → V8 → V9 chain.
 */
import type { DrSaraSnapshot } from "@/lib/intelligence/engine-types";
import type { DecisionRoomView } from "@/lib/intelligence/presentation/experience-model";

export function buildDecisionRoomView(
  snapshot: DrSaraSnapshot
): DecisionRoomView | null {
  const td = snapshot.decision?.topDecision;
  if (!td) return null;

  const iv = snapshot.intervention;
  const exec = snapshot.execution;
  const baseline = td.expectedOutcome.baseline;
  const expected = td.expectedOutcome.expectedAfter;

  const beforeExecution: string[] = [];
  if (iv?.status === "BLOCKED") beforeExecution.push(`Plan status: ${iv.status}`);
  if (iv?.approval === "REQUIRED") {
    beforeExecution.push("Human approval required");
  }
  if (exec?.killSwitch === "DISABLED") {
    beforeExecution.push("Kill switch DISABLED — production execution blocked");
  }
  if (exec?.governor.verdict) {
    beforeExecution.push(`Governor: ${exec.governor.verdict}`);
  }
  for (const c of td.constraints.filter((c) => c.status !== "PASS")) {
    beforeExecution.push(`${c.constraintId}: ${c.reason}`);
  }
  if (beforeExecution.length === 0) {
    beforeExecution.push("Approval and governance gates must pass before V9 execute");
  }

  const conf = td.confidenceAfterMemory ?? td.confidence;
  const rel = td.historicalReliability ?? "INSUFFICIENT";

  return {
    decisionId: td.selectedAction.id,
    title: td.selectedAction.title,
    score: td.score,
    confidence: conf,
    confidenceLabel:
      rel === "INSUFFICIENT"
        ? `${Math.round(conf * 100)}% · INSUFFICIENT EVIDENCE for reliability`
        : `${Math.round(conf * 100)}% · reliability ${rel}`,
    mode: td.mode,
    governance:
      snapshot.intelligenceOS?.governance.decision ??
      exec?.governor.verdict ??
      "APPROVAL_REQUIRED",
    risk: iv?.overallRisk ?? "UNKNOWN",
    blastRadius: iv?.blastRadius ?? "UNKNOWN",
    whyThis: td.whyThis,
    whyNot: td.whyNot.map((w) => ({
      id: w.actionId,
      title: w.title,
      reasons: w.reasons,
    })),
    ifNothing: {
      label: "Baseline if no action",
      baseline: Object.fromEntries(
        Object.entries(baseline).map(([k, v]) => [k, v])
      ),
    },
    ifAct: {
      label: iv?.type ?? td.selectedAction.title,
      expected: Object.fromEntries(
        Object.entries(expected).map(([k, v]) => [k, v as [number, number]])
      ),
    },
    beforeExecution,
    href: td.selectedAction.route,
    cta: "Review decision",
  };
}
