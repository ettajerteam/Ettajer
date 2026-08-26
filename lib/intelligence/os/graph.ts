/**
 * Deterministic intelligence graph for the OS cycle.
 */
import type {
  IntelligenceGraph,
  IntelligenceGraphEdge,
  IntelligenceGraphNode,
} from "@/lib/intelligence/os/types";
import { stableHash } from "@/lib/intelligence/execution/idempotency";

export function buildIntelligenceGraph(input: {
  cycleId: string;
  timestamp: string;
  stateFingerprint: string;
  topDecisionId: string | null;
  topInterventionType: string | null;
  signalIds: string[];
  diagnosisIds: string[];
  scenarioIds: string[];
  warningIds: string[];
  opportunityIds: string[];
  learningNote: string;
}): IntelligenceGraph {
  const nodes: IntelligenceGraphNode[] = [];
  const edges: IntelligenceGraphEdge[] = [];
  const fp = input.stateFingerprint;
  const ts = input.timestamp;

  const obsId = nodeId("obs", input.cycleId);
  nodes.push(
    n(obsId, "OBSERVATION", ts, "platform", fp, 1, "OK", "Platform observation")
  );

  for (const sid of [...input.signalIds].sort()) {
    const id = nodeId("sig", sid);
    nodes.push(n(id, "SIGNAL", ts, "signals", fp, 0.7, "ACTIVE", sid));
    edges.push(e(obsId, id, "PRODUCES", [`signal=${sid}`]));
  }
  for (const did of [...input.diagnosisIds].sort()) {
    const id = nodeId("dx", did);
    nodes.push(n(id, "DIAGNOSIS", ts, "diagnosis", fp, 0.7, "ACTIVE", did));
    edges.push(e(obsId, id, "INFORMS", [`diagnosis=${did}`]));
  }
  for (const sc of [...input.scenarioIds].sort()) {
    const id = nodeId("sc", sc);
    nodes.push(n(id, "SCENARIO", ts, "scenarios", fp, 0.6, "SIMULATED", sc));
    edges.push(e(obsId, id, "PRODUCES", [`scenario=${sc}`]));
  }

  if (input.topDecisionId) {
    const dId = nodeId("dec", input.topDecisionId);
    nodes.push(
      n(dId, "DECISION", ts, "decisions", fp, 0.8, "RECOMMENDED", input.topDecisionId)
    );
    edges.push(e(obsId, dId, "INFORMS", ["TOP_DECISION"]));
    if (input.topInterventionType) {
      const iId = nodeId("iv", input.topInterventionType);
      nodes.push(
        n(
          iId,
          "INTERVENTION",
          ts,
          "interventions",
          fp,
          0.8,
          "PLANNED",
          input.topInterventionType
        )
      );
      edges.push(e(dId, iId, "PRODUCES", ["planIntervention"]));
      const learnId = nodeId("learn", input.cycleId);
      nodes.push(
        n(learnId, "LEARNING", ts, "memory", fp, 0.5, "READY", input.learningNote)
      );
      edges.push(e(iId, learnId, "FEEDS", ["outcome→learning"]));
    }
  }

  for (const w of [...input.warningIds].sort()) {
    nodes.push(n(nodeId("warn", w), "WARNING", ts, "warnings", fp, 0.7, "OPEN", w));
  }
  for (const o of [...input.opportunityIds].sort()) {
    nodes.push(
      n(nodeId("opp", o), "OPPORTUNITY", ts, "opportunities", fp, 0.6, "OPEN", o)
    );
  }

  nodes.sort((a, b) => a.id.localeCompare(b.id));
  edges.sort((a, b) => `${a.from}:${a.to}`.localeCompare(`${b.from}:${b.to}`));
  return { nodes, edges };
}

function nodeId(prefix: string, raw: string) {
  return `${prefix}_${stableHash(raw)}`;
}

function n(
  id: string,
  type: IntelligenceGraphNode["type"],
  timestamp: string,
  source: string,
  stateFingerprint: string,
  confidence: number,
  status: string,
  label: string
): IntelligenceGraphNode {
  return { id, type, timestamp, source, stateFingerprint, confidence, status, label };
}

function e(
  from: string,
  to: string,
  relationship: IntelligenceGraphEdge["relationship"],
  evidence: string[]
): IntelligenceGraphEdge {
  return { from, to, relationship, evidence };
}
