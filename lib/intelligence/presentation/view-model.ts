/**
 * Dr Sara V11 + Design V2 — Experience view model (presentation only).
 */
import type { DrSaraSnapshot } from "@/lib/intelligence/engine-types";
import {
  DESIGN_VERSION,
  EXPERIENCE_VERSION,
  type ExperienceSectionId,
  type OpportunityRadarItem,
  type SaraExperienceViewModel,
  type WhyChainStep,
} from "@/lib/intelligence/presentation/experience-model";
import { buildAgentNetworkView } from "@/lib/intelligence/presentation/agent-network";
import { buildDecisionRoomView } from "@/lib/intelligence/presentation/decision-view";
import {
  greetingFromHour,
  opportunityLayout,
} from "@/lib/intelligence/presentation/design-layout";
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
  { id: "system", label: "System" },
  { id: "outcome", label: "Time" },
  { id: "scenario", label: "Scenarios" },
  { id: "decision", label: "Decision" },
  { id: "execution", label: "Governance" },
  { id: "learning", label: "Learning" },
  { id: "risks", label: "Risks" },
  { id: "opportunities", label: "Opportunities" },
  { id: "network", label: "Network" },
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

function decisionDomain(decisionId: string | null, interventionType: string | null): string {
  const key = `${decisionId ?? ""} ${interventionType ?? ""}`.toUpperCase();
  if (key.includes("COD") || key.includes("PENDING")) return "OPERATIONS";
  if (key.includes("DOMAIN") || key.includes("DNS")) return "TECHNICAL";
  if (key.includes("FIRST_SALE") || key.includes("ACTIVAT")) return "ACTIVATION";
  if (key.includes("SUPPORT")) return "SUPPORT";
  if (key.includes("REVENUE") || key.includes("GMV")) return "REVENUE";
  return "PLATFORM";
}

function relatedPathForDecision(decisionId: string | null): string[] {
  if (!decisionId) return [];
  if (decisionId.includes("COD") || decisionId.includes("PENDING")) {
    return ["PAYMENTS", "OPERATIONS", "SUPPORT"];
  }
  if (decisionId.includes("DOMAIN") || decisionId.includes("DNS")) {
    return ["DOMAINS", "COMMERCE"];
  }
  if (decisionId.includes("FIRST_SALE") || decisionId.includes("ACTIVAT")) {
    return ["ACTIVATION", "COMMERCE", "REVENUE"];
  }
  return ["OPERATIONS"];
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
      evidence: relatedSignal.evidence
        ?.slice(0, 3)
        .map((e) => `${e.label}: ${String(e.value)}`),
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
      evidence: [diagnosis.explanation].filter(Boolean),
    });
  }

  if (td) {
    steps.push({
      id: "decision",
      label: "DECISION",
      detail: td.selectedAction.title,
      evidence: td.whyThis.slice(0, 3),
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
      evidence: snapshot.topScenario?.whyChosen
        ? [snapshot.topScenario.whyChosen]
        : undefined,
    });
  }

  if (iv) {
    steps.push({
      id: "intervention",
      label: "INTERVENTION",
      detail: `${iv.type} · ${iv.approval === "REQUIRED" ? "Approval required" : iv.status}`,
      evidence: iv.rationale.slice(0, 3),
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
    evidence: insufficient
      ? ["SIMULATED · EXPECTED RANGE · NOT A GUARANTEE"]
      : ["SIMULATED", "EXPECTED RANGE", "NOT A GUARANTEE"],
  });

  return steps;
}

function buildNowView(snapshot: DrSaraSnapshot): SaraExperienceViewModel["now"] {
  const td = snapshot.decision?.topDecision;
  const iv = snapshot.intervention;
  const insufficient = snapshot.dataQualityV2?.insufficientEvidence === true;
  const domain = decisionDomain(
    td?.selectedAction.id ?? null,
    iv?.type ?? null
  );
  const relatedPath = relatedPathForDecision(td?.selectedAction.id ?? null);

  if (!td) {
    return {
      headline: snapshot.headline || "Platform state",
      narrative: snapshot.health.reasons.slice(0, 3),
      cta: "Review decision",
      href: snapshot.topAction?.href ?? "/admin",
      confidence: insufficient ? null : snapshot.confidence.overall,
      confidenceLabel: insufficient ? "INSUFFICIENT EVIDENCE" : "Platform confidence",
      risk: snapshot.health.status.toUpperCase(),
      approval: snapshot.execution?.governor.verdict ?? "REVIEW",
      decisionId: null,
      interventionType: iv?.type ?? null,
      domain,
      primaryMetricLabel: null,
      primaryMetricValue: null,
      relatedPath,
    };
  }

  const conf = td.confidenceAfterMemory ?? td.confidence;
  const primaryMetric = iv?.measurement.primaryMetric ?? null;
  const primaryValue =
    primaryMetric != null
      ? (iv?.measurement.baseline[primaryMetric] ?? iv?.target.count ?? null)
      : (iv?.target.count ?? null);

  const narrative = [
    td.whyThis[0] ?? "One decision is currently dominant.",
    td.expectedOutcome.note,
    iv ? `${iv.target.count} targets · ${iv.overallRisk} risk` : null,
  ].filter(Boolean) as string[];

  return {
    headline: td.selectedAction.title,
    narrative,
    cta: "Review decision",
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
    domain,
    primaryMetricLabel: primaryMetric
      ? primaryMetric.replace(/([A-Z])/g, " $1").trim().toUpperCase()
      : iv
        ? "TARGETS"
        : null,
    primaryMetricValue: primaryValue,
    relatedPath,
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
      x: 0,
      y: 0,
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
      x: 0,
      y: 0,
    });
  }

  const sliced = items.slice(0, 12);
  const byCategory = new Map<string, OpportunityRadarItem[]>();
  for (const item of sliced) {
    const list = byCategory.get(item.category) ?? [];
    list.push(item);
    byCategory.set(item.category, list);
  }

  return sliced.map((item) => {
    const peers = byCategory.get(item.category) ?? [item];
    const index = peers.findIndex((p) => p.id === item.id);
    const layout = opportunityLayout(
      item.id,
      item.category,
      Math.max(index, 0),
      peers.length
    );
    return { ...item, ...layout };
  });
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

function buildArrival(snapshot: DrSaraSnapshot): SaraExperienceViewModel["arrival"] {
  const generatedAt = new Date(snapshot.generatedAt);
  const hour = generatedAt.getUTCHours();
  const attentionPlaces = new Set<string>();
  if (snapshot.decision?.topDecision) attentionPlaces.add("decision");
  for (const w of snapshot.intelligenceOS?.warnings ?? []) {
    if (/high|critical/i.test(w.severity)) attentionPlaces.add(w.id);
  }
  for (const r of snapshot.risks) {
    if (r.riskLevel === "high") {
      attentionPlaces.add(r.id);
    }
  }
  if (snapshot.intervention?.approval === "REQUIRED") {
    attentionPlaces.add("approval");
  }

  const count = Math.max(attentionPlaces.size, snapshot.decision?.topDecision ? 1 : 0);

  return {
    greeting: greetingFromHour(hour),
    operatorName: "Professor Salah",
    attentionCount: count,
    syncLabel: snapshot.dataQualityV2?.insufficientEvidence
      ? "Evidence degraded"
      : "Platform synchronized",
    observationLine: "I've been observing Ettajer.",
    headline:
      count > 0
        ? `${count} thing${count === 1 ? "" : "s"} require attention.`
        : "No dominant attention signals right now.",
  };
}

function buildPresence(snapshot: DrSaraSnapshot): SaraExperienceViewModel["presence"] {
  const needsApproval =
    snapshot.intervention?.approval === "REQUIRED" ||
    snapshot.execution?.approval?.requiresApproval === true;
  if (needsApproval && snapshot.decision?.topDecision) {
    return {
      status: "AWAITING_HUMAN_DECISION",
      label: "AWAITING HUMAN DECISION",
    };
  }
  if (snapshot.decision?.topDecision) {
    return {
      status: "PRIORITY_IDENTIFIED",
      label: "PRIORITY IDENTIFIED",
    };
  }
  return {
    status: "OBSERVING",
    label: "OBSERVING",
  };
}

export function buildSaraExperienceViewModel(
  snapshot: DrSaraSnapshot
): SaraExperienceViewModel {
  const td = snapshot.decision?.topDecision;
  const os = snapshot.intelligenceOS;

  return {
    version: EXPERIENCE_VERSION,
    designVersion: DESIGN_VERSION,
    generatedAt: new Date(snapshot.generatedAt).toISOString(),
    engineVersion: snapshot.metadata.version,
    cycleId: os?.cycleId ?? snapshot.executionTraceV4?.cycleId ?? null,
    cycleStatus: os?.status ?? null,
    platformStateSummary: platformStateSummary(snapshot),
    live: !snapshot.dataQualityV2?.insufficientEvidence,
    autoExecute: false,
    productionMutation: "NONE",
    arrival: buildArrival(snapshot),
    presence: buildPresence(snapshot),
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
