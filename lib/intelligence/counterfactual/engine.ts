/**
 * Deterministic counterfactuals — only with sufficient historical evidence.
 */
import type { RulePerformance } from "@/lib/intelligence/memory/types";
import type { PlatformDigitalTwin } from "@/lib/intelligence/twin/types";
import { INTELLIGENCE_SCORING_CONFIG as C } from "@/lib/intelligence/config/scoring";

export type EvidenceStrength = "STRONG" | "MODERATE" | "WEAK" | "INSUFFICIENT";

export type Counterfactual = {
  id: string;
  statement: string;
  evidenceStrength: EvidenceStrength;
  evidence: string[];
  assumedIntervention: string;
  expectedDelta: string;
  confidence: number;
};

function strengthFor(perf: RulePerformance | undefined): EvidenceStrength {
  if (!perf || perf.successRate == null) return "INSUFFICIENT";
  if (perf.attempts >= 10 && perf.successRate >= 0.7) return "STRONG";
  if (perf.attempts >= C.decisionV4.minHistoryForEffectiveness) return "MODERATE";
  return "WEAK";
}

export function buildCounterfactuals(input: {
  twin: PlatformDigitalTwin;
  performance: RulePerformance[];
}): Counterfactual[] {
  const out: Counterfactual[] = [];
  const cod = input.performance.find((p) => p.type === "COD_VERIFICATION");
  const dns = input.performance.find(
    (p) => p.type === "DNS_DIAGNOSIS" || p.type === "FIX_DOMAIN"
  );

  if (input.twin.metrics.pendingCOD > 0) {
    const s = strengthFor(cod);
    if (s !== "INSUFFICIENT") {
      const clear = Math.round(
        input.twin.metrics.pendingCOD * C.outcome.expectedCodClearanceRatio
      );
      out.push({
        id: "cf-cod-yesterday",
        statement: `IF COD backlog had been verified earlier, pendingCOD may have been ~${Math.max(0, input.twin.metrics.pendingCOD - clear)} instead of ${input.twin.metrics.pendingCOD}.`,
        evidenceStrength: s,
        evidence: [cod!.note, `attempts=${cod!.attempts}`],
        assumedIntervention: "COD_VERIFICATION",
        expectedDelta: `pendingCOD −${clear} (historical deterministic range)`,
        confidence: Math.round((cod!.successRate ?? 0.5) * 100) / 100,
      });
    } else {
      out.push({
        id: "cf-cod-insufficient",
        statement:
          "Counterfactual for earlier COD verification withheld — insufficient historical evidence.",
        evidenceStrength: "INSUFFICIENT",
        evidence: ["No comparable measured COD_VERIFICATION outcomes in memory."],
        assumedIntervention: "COD_VERIFICATION",
        expectedDelta: "n/a",
        confidence: 0,
      });
    }
  }

  if (input.twin.metrics.domainFailures > 0) {
    const s = strengthFor(dns);
    if (s === "INSUFFICIENT") {
      out.push({
        id: "cf-dns-insufficient",
        statement:
          "Counterfactual for healthier domains withheld — insufficient historical evidence.",
        evidenceStrength: "INSUFFICIENT",
        evidence: ["No comparable DNS remediation outcomes in memory."],
        assumedIntervention: "FIX_DOMAIN",
        expectedDelta: "n/a",
        confidence: 0,
      });
    } else {
      out.push({
        id: "cf-dns",
        statement: `IF domains had been healthy, activation interventions would not be blocked by DOMAIN_FAILURE.`,
        evidenceStrength: s,
        evidence: [dns!.note],
        assumedIntervention: "FIX_DOMAIN",
        expectedDelta: "domainFailures → near 0 (historical deterministic range)",
        confidence: Math.round((dns!.successRate ?? 0.5) * 100) / 100,
      });
    }
  }

  return out;
}
