import type { Evidence, PlatformState } from "@/lib/intelligence/engine-types";
import type { TemporalMetric } from "@/lib/intelligence/temporal";
import { INTELLIGENCE_SCORING_CONFIG as C } from "@/lib/intelligence/config/scoring";

export type IntelligenceAnomaly = {
  id: string;
  ruleId: string;
  title: string;
  metric: string;
  baseline: number;
  observed: number;
  delta: number;
  deltaPct: number;
  threshold: number;
  confidence: number;
  severity: "critical" | "high" | "medium" | "low";
  evidence: Evidence[];
  explanation: string;
};

export function detectAnomalies(
  state: PlatformState,
  temporal: TemporalMetric[]
): IntelligenceAnomaly[] {
  const out: IntelligenceAnomaly[] = [];
  const thr = C.anomaly.pctChangeThreshold;

  for (const t of temporal) {
    if (!t.anomaly && Math.abs(t.deltaPct) < thr) continue;
    if (t.previous < C.anomaly.minBaselineForPct && t.current <= 0) continue;

    const strong = Math.abs(t.deltaPct) >= C.anomaly.strongPctChange;
    out.push({
      id: `anomaly-${t.id}`,
      ruleId: t.direction === "up" ? "ANOMALY_SPIKE" : "ANOMALY_DROP",
      title:
        t.direction === "up"
          ? `Sudden rise in ${t.label}`
          : `Sudden drop in ${t.label}`,
      metric: t.id,
      baseline: t.previous,
      observed: t.current,
      delta: t.delta,
      deltaPct: t.deltaPct,
      threshold: thr,
      confidence: t.confidence,
      severity: strong ? "high" : "medium",
      evidence: [
        { label: "baseline", value: t.previous, source: "temporal" },
        { label: "observed", value: t.current, source: "temporal" },
        { label: "deltaPct", value: t.deltaPct, source: "temporal" },
        { label: "threshold", value: thr, source: "config.anomaly" },
      ],
      explanation: t.basis,
    });
  }

  if (state.pendingRealOrders >= 10) {
    out.push({
      id: "anomaly-cod-backlog",
      ruleId: "ANOMALY_COD_BACKLOG_ACCEL",
      title: "COD backlog elevated",
      metric: "pendingRealOrders",
      baseline: 0,
      observed: state.pendingRealOrders,
      delta: state.pendingRealOrders,
      deltaPct: 100,
      threshold: 10,
      confidence: 1,
      severity: "high",
      evidence: [
        {
          label: "pendingRealOrders",
          value: state.pendingRealOrders,
          source: "platform.overview",
        },
      ],
      explanation: "Pending COD exceeds critical operational threshold.",
    });
  }

  if (state.domainFailing >= 3) {
    out.push({
      id: "anomaly-dns",
      ruleId: "ANOMALY_DNS_FAILURE_SPIKE",
      title: "DNS failure spike",
      metric: "domainFailing",
      baseline: 0,
      observed: state.domainFailing,
      delta: state.domainFailing,
      deltaPct: 100,
      threshold: 3,
      confidence: 0.95,
      severity: "high",
      evidence: [
        {
          label: "domainFailing",
          value: state.domainFailing,
          source: "domains.live",
        },
      ],
      explanation: "Multiple custom domains failing live DNS checks.",
    });
  }

  return out;
}
