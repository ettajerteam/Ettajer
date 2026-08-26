/**
 * Dr Sara V11 — Experience view model (presentation only; engine unchanged).
 */
import type { DrSaraSnapshot } from "@/lib/intelligence/engine-types";
import {
  EXPERIENCE_VERSION,
  type ExperienceSectionId,
  type OpportunityRadarItem,
  type SaraExperienceViewModel,
  type WhyChainStep,
} from "@/lib/intelligence/presentation/experience-model";
import { buildAgentNetworkView } from "@/lib/intelligence/presentation/agent-network";
import { buildDecisionRoomView } from "@/lib/intelligence/presentation/decision-view";
import { buildPlatformMapView } from "@/lib/intelligence/presentation/platform-map";
import {
  buildLearningLoopView,
  buildRiskFieldView,
} from "@/lib/intelligence/presentation/risk-view";
import { buildScenarioLabView } from "@/lib/intelligence/presentation/scenario-view";
import { buildTimelineView } from "@/lib/intelligence/presentation/timeline";

const NAVIGATION: { id: ExperienceSectionId; label: string }[] = [
  { id: "now", label: "Now" },
  { id: "why", label: "Why" },
  { id: "system", label: "Platform map" },
  { id: "scenario", label: "Scenario lab" },
  { id: "decision", label: "Decision room" },
  { id: "execution", label: "Execution" },
  { id: "outcome", label: "Timeline" },
  { id: "learning", label: "Learning" },
  { id: "opportunities", label: "Opportunities" },
  { id: "risks", label: "Risk field" },
];

function categorizeOpportunity(
  title: string,
  action: string
): OpportunityRadarItem["category"] {
  const text = `${title} ${action}`.toLowerCase();
  if (text.includes("activ") || text.includes("first sale") || text.includes("onboard")) {
    return "ACTIVATION";
  }
  if (text.includes("revenue") || text.includes("gmv") || text.includes("sale")) {
    return "REVENUE";
  }
  if (text.includes("cod") || text.includes("support") || text.includes("fulfill")) {
    return "OPERATIONS";
  }
  if (text.includes("domain") || text.includes("dns") || text.includes("technical")) {
    return "TECHNICAL";
  }
  if (text.includes("merchant") || text.includes("store")) {
    return "MERCHANTS";
  }
  if (text.includes("growth") || text.includes("intent")) {
    return "GROWTH";
  }
  return "OPERATIONS";
}

function buildWhyChain(snapshot: DrSaraSnapshot): WhyChainStep[] {
  const td = snapshot.decision?.topDecision;
  const iv = snapshot.intervention;
  const steps: WhyChainStep[] = [];

  const relatedSignal =
    snapshot.signals.find((s) =>
      td?.whyThis.some((w) => w.toLowerCase().includes(s.title.toLowerCase().slice(0, 8)))
    ) ?? snapshot.signals[0];
  if (relatedSignal) {
    steps.push({
      id: "signal",
      label: "SIGNAL",
      detail: relatedSignal.title,
    });
  }

  const diagnosis =
    snapshot.diagnoses.find((d) =>
      td?.selectedAction.title.toLowerCase().includes(d.title.toLowerCase().slice(0, 6))
    ) ?? snapshot.diagnoses[0];
  if (diagnosis) {
    steps.push({
      id: "diagnosis",
      label: "DIAGNOSIS",
      detail: diagnosis.title,
    });
  }

  if (td) {
    steps.push({
      id: "decision",
      label: "DECISION",
      detail: td.selectedAction.title,
      href: td.selectedAction.route,
    });
  }

  const scenarioLabel =
    snapshot.topScenario?.label ??
    iv?.type ??
    td?.scenarioSupport.scenarioId ??
    null;
  if (scenarioLabel) {
    steps.push({
      id: "scenario",
      label: "SCENARIO",
      detail: String(scenarioLabel),
    });
  }

  if (iv) {
    steps.push({
      id: "intervention",
      label: "INTERVENTION",
      detail: `${iv.type} · ${iv.approval === "REQUIRED" ? "Approval required" : iv.status}`,
      href: iv.reviewHref,
    });
  }

  const primary = iv?.measurement.primaryMetric;
  const base = primary ? iv.measurement.baseline[primary] : undefined;
  const expected = primary ? iv?.measurement.expectedAfter[primary] : undefined;
  const insufficient =
    snapshot.dataQualityV2?.insufficientEvidence === true ||
    !expected ||
    base == null;

  steps.push({
    id: "outcome",
    label: "EXPECTED OUTCOME",
    detail: insufficient
      ? "INSUFFICIENT EVIDENCE"
      : expected && base != null
        ? `${primary}: ${base} → [${expected[0]}, ${expected[1]}]`
        : td?.expectedOutcome.note ?? "Outcome projection unavailable",
  });

  return steps;
}

function buildNowView(snapshot: DrSaraSnapshot): SaraExperienceViewModel["now"] {
  const td = snapshot.decision?.topDecision;
  const iv = snapshot.intervention;
  const insufficient = snapshot.dataQualityV2?.insufficientEvidence === true;

  if (!td) {
    return {
      headline: snapshot.headline || "Platform state",
      narrative: snapshot.health.reasons.slice(0, 3),
      cta: snapshot.topAction?.label ?? "Open console",
      href: snapshot.topAction?.href ?? "/admin",
      confidence: insufficient ? null : snapshot.confidence.overall,
      confidenceLabel: insufficient ? "INSUFFICIENT EVIDENCE" : "Platform confidence",
      risk: snapshot.health.status.toUpperCase(),
      approval: snapshot.execution?.governor.verdict ?? "REVIEW",
      decisionId: null,
      interventionType: iv?.type ?? null,
    };
  }

  const conf = td.confidenceAfterMemory ?? td.confidence;
  const narrative = [
    td.whyThis[0] ?? "One decision is currently dominant.",
    td.expectedOutcome.note,
    iv ? `${iv.target.count} targets · ${iv.overallRisk} risk` : null,
  ].filter(Boolean) as string[];

  return {
    headline: td.selectedAction.title,
    narrative,
    cta: snapshot.topAction?.label ?? td.selectedAction.title,
    href: td.selectedAction.route,
    confidence: insufficient ? null : conf,
    confidenceLabel:
      td.historicalReliability === "INSUFFICIENT"
        ? `${Math.round(conf * 100)}% · INSUFFICIENT EVIDENCE for reliability`
        : `Confidence ${Math.round(conf * 100)}%`,
    risk: iv?.overallRisk ?? td.uncertainty.level,
    approval:
      iv?.approval === "REQUIRED"
        ? "APPROVAL REQUIRED"
        : snapshot.intelligenceOS?.governance.decision ?? "RECOMMENDED",
    decisionId: td.selectedAction.id,
    interventionType: iv?.type ?? null,
  };
}

function buildOpportunities(snapshot: DrSaraSnapshot): OpportunityRadarItem[] {
  const items: OpportunityRadarItem[] = [];

  for (const o of snapshot.intelligenceOS?.opportunities ?? []) {
    items.push({
      id: o.id,
      category: categorizeOpportunity(o.title, o.recommendedAction),
      title: o.title,
      signal: o.evidence[0] ?? o.impact,
      impact: o.impact,
      affected: o.recommendedAction,
      action: o.recommendedAction,
      confidence: o.confidence,
    });
  }

  for (const o of snapshot.opportunities.slice(0, 6)) {
    if (items.some((x) => x.id === o.id)) continue;
    items.push({
      id: o.id,
      category: categorizeOpportunity(o.title, o.cta),
      title: o.title,
      signal: o.reason,
      impact: o.impact,
      affected: `${o.affectedCount} entities`,
      action: o.cta,
      confidence: o.confidence,
      href: o.href,
    });
  }

  return items.slice(0, 12);
}

function buildExecutionView(snapshot: DrSaraSnapshot): SaraExperienceViewModel["execution"] {
  const exec = snapshot.execution;
  const iv = snapshot.intervention;
  const os = snapshot.intelligenceOS;

  const productionDisabled =
    exec?.killSwitch === "DISABLED" ||
    exec?.outcome?.productionMutation === "NONE" ||
    os?.productionMutation === "NONE";

  const sandboxReady =
    iv != null &&
    exec != null &&
    exec.killSwitch !== "DISABLED" &&
    iv.status !== "BLOCKED";

  return {
    status: exec?.status ?? "NOT_RUN",
    killSwitch: exec?.killSwitch ?? "UNKNOWN",
    autoExecute: false,
    approvalRequired: exec?.approval?.requiresApproval ?? iv?.approval === "REQUIRED",
    governanceVerdict: os?.governance.decision ?? exec?.governor.verdict ?? "PENDING",
    productionExecutionDisabled: productionDisabled,
    sandboxReady,
    flow: [
      "INTELLIGENCE",
      "RECOMMENDATION",
      iv?.approval === "REQUIRED" ? "APPROVAL" : "GOVERNANCE",
      "GOVERNANCE",
      sandboxReady ? "SANDBOX READY" : "EXECUTION BLOCKED",
    ],
    note:
      exec?.note ??
      "Dr Sara recommends; humans approve. Production mutation remains NONE by default.",
  };
}

function platformStateSummary(snapshot: DrSaraSnapshot): string {
  const os = snapshot.intelligenceOS;
  if (os?.health.note) return os.health.note;
  if (snapshot.headline) return snapshot.headline;
  return `Platform health ${snapshot.health.score}/100 · ${snapshot.health.status}`;
}

export function buildSaraExperienceViewModel(
  snapshot: DrSaraSnapshot
): SaraExperienceViewModel {
  const td = snapshot.decision?.topDecision;
  const os = snapshot.intelligenceOS;

  return {
    version: EXPERIENCE_VERSION,
    generatedAt: snapshot.generatedAt,
    engineVersion: snapshot.metadata.version,
    cycleId: os?.cycleId ?? snapshot.executionTraceV4?.cycleId ?? null,
    cycleStatus: os?.status ?? null,
    platformStateSummary: platformStateSummary(snapshot),
    live: !snapshot.dataQualityV2?.insufficientEvidence,
    autoExecute: false,
    productionMutation: "NONE",
    now: buildNowView(snapshot),
    whyChain: buildWhyChain(snapshot),
    platformMap: buildPlatformMapView(snapshot),
    timeline: buildTimelineView(snapshot),
    scenarioLab: buildScenarioLabView(snapshot),
    decisionRoom: buildDecisionRoomView(snapshot),
    execution: buildExecutionView(snapshot),
    learningLoop: buildLearningLoopView(snapshot),
    opportunities: buildOpportunities(snapshot),
    riskField: buildRiskFieldView(snapshot),
    agentNetwork: buildAgentNetworkView(),
    preserved: {
      topAction: snapshot.topAction?.label ?? null,
      topScenario: snapshot.topScenario?.scenarioId ?? null,
      topDecision: td?.selectedAction.id ?? null,
    },
    navigation: NAVIGATION,
  };
}
