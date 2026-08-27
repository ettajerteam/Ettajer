/**
 * Risk field + learning loop presentation (Design V2 positions).
 */
import type { DrSaraSnapshot } from "@/lib/intelligence/engine-types";
import type {
  LearningLoopView,
  RiskFieldItem,
} from "@/lib/intelligence/presentation/experience-model";
import { riskLayout } from "@/lib/intelligence/presentation/design-layout";

export function buildRiskFieldView(snapshot: DrSaraSnapshot): RiskFieldItem[] {
  const items: RiskFieldItem[] = [];

  if (snapshot.intervention) {
    items.push({
      id: "intervention-risk",
      title: `${snapshot.intervention.type} intervention`,
      impact: snapshot.intervention.overallRisk,
      evidence: `Blast ${snapshot.intervention.blastRadius} · Safety ${snapshot.intervention.safetyLevel}`,
      scope: `${snapshot.intervention.target.count} targets`,
      reversibility: snapshot.intervention.rollback.reversibility,
      level: snapshot.intervention.overallRisk,
      x: 0,
      y: 0,
      scale: 1,
    });
  }

  for (const w of snapshot.intelligenceOS?.warnings ?? []) {
    items.push({
      id: w.id,
      title: w.title,
      impact: w.severity,
      evidence: w.evidence.join(" · ") || w.trajectory,
      scope: w.recommendedResponse,
      reversibility: "Varies",
      level: w.severity,
      x: 0,
      y: 0,
      scale: 1,
    });
  }

  for (const r of snapshot.risks.slice(0, 6)) {
    items.push({
      id: r.id,
      title: r.title,
      impact: r.riskLevel,
      evidence: r.detail,
      scope: r.metric,
      reversibility: "Review",
      level: r.riskLevel === "none" ? "LOW" : r.riskLevel.toUpperCase(),
      x: 0,
      y: 0,
      scale: 1,
    });
  }

  const sliced = items.slice(0, 8);
  return sliced.map((item, index) => {
    const layout = riskLayout(item.id, item.level, index, sliced.length);
    return { ...item, ...layout };
  });
}

export function buildLearningLoopView(snapshot: DrSaraSnapshot): LearningLoopView {
  const os = snapshot.intelligenceOS;
  const learning = os?.learning;
  const sampleTotal = snapshot.memory?.decisionHistorySummary.totalRecords ?? 0;
  const insufficient =
    sampleTotal < 5 ||
    learning?.evidenceNotes.some((n) => n.includes("INSUFFICIENT")) === true;

  const steps = [
    "DECIDE",
    "INTERVENE",
    "MEASURE",
    "OBSERVE",
    "LEARN",
    "ADAPT",
  ];

  // Active step from real cycle state — not fabricated progress.
  let activeStepIndex = 0;
  if (snapshot.decision?.topDecision) activeStepIndex = 0;
  if (snapshot.intervention) activeStepIndex = 1;
  if (snapshot.intervention?.measurement.primaryMetric) activeStepIndex = 2;
  if (sampleTotal > 0) activeStepIndex = Math.min(3, activeStepIndex + 1);
  if (!insufficient && learning?.confidenceAdjustment) activeStepIndex = 4;

  return {
    steps,
    activeStepIndex,
    evidenceNotes: learning?.evidenceNotes ?? [
      insufficient ? "NOT ENOUGH HISTORY" : "Learning trace available",
    ],
    confidenceAdjustment: learning?.confidenceAdjustment ?? null,
    insufficientHistory: insufficient,
  };
}
