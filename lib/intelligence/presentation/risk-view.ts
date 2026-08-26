/**
 * Risk field + learning loop presentation.
 */
import type { DrSaraSnapshot } from "@/lib/intelligence/engine-types";
import type {
  LearningLoopView,
  RiskFieldItem,
} from "@/lib/intelligence/presentation/experience-model";

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
    });
  }

  return items.slice(0, 8);
}

export function buildLearningLoopView(snapshot: DrSaraSnapshot): LearningLoopView {
  const os = snapshot.intelligenceOS;
  const learning = os?.learning;
  const sampleTotal = snapshot.memory?.decisionHistorySummary.totalRecords ?? 0;
  const insufficient =
    sampleTotal < 5 ||
    learning?.evidenceNotes.some((n) => n.includes("INSUFFICIENT")) === true;

  return {
    steps: [
      "DECIDE",
      "INTERVENE",
      "MEASURE",
      "OBSERVE OUTCOME",
      "LEARN",
      "ADAPT FUTURE DECISIONS",
    ],
    evidenceNotes: learning?.evidenceNotes ?? [
      insufficient ? "NOT ENOUGH HISTORY" : "Learning trace available",
    ],
    confidenceAdjustment: learning?.confidenceAdjustment ?? null,
    insufficientHistory: insufficient,
  };
}
