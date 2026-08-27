/**
 * Timeline / memory presentation from V5–V7 trends and learning.
 */
import type { DrSaraSnapshot } from "@/lib/intelligence/engine-types";
import type { TimelineSegment } from "@/lib/intelligence/presentation/experience-model";

export function buildTimelineView(snapshot: DrSaraSnapshot): TimelineSegment[] {
  const out: TimelineSegment[] = [];

  for (const t of snapshot.temporalTrends.slice(0, 4)) {
    const insufficient =
      t.confidence < 0.5 ||
      snapshot.dataQualityV2?.insufficientEvidence === true;
    out.push({
      id: `past-${t.id}`,
      phase: "PAST",
      label: t.label,
      detail: `${t.previous} → ${t.current} (${t.direction})`,
      evidence: [t.basis, `delta=${t.deltaPct}%`].filter(Boolean),
      insufficientEvidence: insufficient,
    });
  }

  const td = snapshot.decision?.topDecision;
  const iv = snapshot.intervention;
  out.push({
    id: "now-state",
    phase: "NOW",
    label: td?.selectedAction.title ?? snapshot.topAction?.label ?? "Platform state",
    detail:
      snapshot.headline ||
      snapshot.health.reasons[0] ||
      "Current operational posture.",
    evidence: td?.whyThis?.slice(0, 3) ?? [],
    insufficientEvidence: false,
  });

  if (iv?.measurement.primaryMetric) {
    const base = iv.measurement.baseline[iv.measurement.primaryMetric];
    const exp = iv.measurement.expectedAfter[iv.measurement.primaryMetric];
    const rel = snapshot.memory?.reliability.find(
      (r) => r.decisionType === td?.selectedAction.id
    );
    const insufficient =
      !exp ||
      rel?.band === "INSUFFICIENT" ||
      snapshot.dataQualityV2?.insufficientEvidence === true;
    out.push({
      id: "expected-outcome",
      phase: "EXPECTED",
      label: iv.measurement.primaryMetric,
      detail:
        exp && base != null
          ? `${base} → [${exp[0]}, ${exp[1]}]`
          : insufficient
            ? "INSUFFICIENT EVIDENCE"
            : "Expected range unavailable",
      evidence: [
        "SIMULATED",
        "EXPECTED RANGE",
        "NOT A GUARANTEE",
        iv.measurement.measurementWindow,
        rel?.note ?? "historical reliability pending",
      ].filter(Boolean),
      insufficientEvidence: insufficient,
      simulated: true,
    });
  } else if (snapshot.forecasts.length > 0) {
    const f = snapshot.forecasts[0]!;
    out.push({
      id: "expected-forecast",
      phase: "EXPECTED",
      label: f.metric,
      detail: f.statement,
      evidence: [f.basis, `confidence=${f.confidence}`],
      insufficientEvidence: f.confidence < 0.5,
    });
  }

  return out;
}
