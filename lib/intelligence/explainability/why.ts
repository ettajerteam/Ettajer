import type {
  Diagnosis,
  IntelligenceSignal,
  PrioritizedItem,
  RecommendedAction,
  WhyExplanation,
} from "@/lib/intelligence/engine-types";
import { describeRule } from "@/lib/intelligence/rules/catalog";

export function explainSignal(signal: IntelligenceSignal): WhyExplanation {
  return {
    ruleId: signal.ruleId,
    ruleDescription: describeRule(signal.ruleId),
    evidence: signal.evidence,
    calculation: `severity=${signal.severity}; confidence=${signal.confidence}; affected=${signal.affectedCount ?? "n/a"}`,
    conclusion: signal.summary,
    source: "live platform data",
    engine: "deterministic intelligence",
  };
}

export function explainPriority(item: PrioritizedItem): WhyExplanation {
  return {
    ruleId: item.ruleId,
    ruleDescription: describeRule(item.ruleId),
    evidence: item.evidence,
    calculation: item.calculation,
    conclusion: `${item.title} — priority band ${item.band} (score ${item.priorityScore}).`,
    source: "live platform data",
    engine: "deterministic intelligence",
  };
}

export function explainDiagnosis(d: Diagnosis): WhyExplanation {
  return {
    ruleId: d.diagnosisId,
    ruleDescription: d.title,
    evidence: d.evidence,
    calculation: `confidence=${d.confidence}; signals=${d.signalIds.join(",") || "none"}`,
    conclusion: d.explanation,
    source: "live platform data",
    engine: "deterministic intelligence",
  };
}

export function explainAction(action: RecommendedAction): WhyExplanation {
  return {
    ruleId: action.ruleId ?? action.id,
    ruleDescription: action.label,
    evidence: [
      {
        label: "href",
        value: action.href,
        source: "admin.routes",
      },
      {
        label: "relatedSignals",
        value: (action.relatedSignalIds ?? []).join(",") || "none",
        source: "intelligence.engine",
      },
    ],
    calculation: `urgency=${action.urgency}`,
    conclusion: action.description,
    source: "live platform data",
    engine: "deterministic intelligence",
  };
}

/** UI-facing Why shape used by existing Dr Sara cards */
export function toUiExplanation(why: WhyExplanation): {
  signal: string;
  evidence: string;
  rule: string;
  impact: string;
  recommendation: string;
  source: "deterministic";
} {
  const evidenceText = why.evidence
    .map((e) => `${e.label}=${String(e.value)}`)
    .join(" · ");
  return {
    signal: why.ruleDescription,
    evidence: evidenceText || why.conclusion,
    rule: why.ruleId,
    impact: why.conclusion,
    recommendation: why.calculation,
    source: "deterministic",
  };
}
