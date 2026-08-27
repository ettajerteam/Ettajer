/**
 * In-memory intelligence graph V2 — richer relations, still not a graph DB.
 */

export type GraphEntityType =
  | "Platform"
  | "Merchant"
  | "Store"
  | "Order"
  | "Product"
  | "Domain"
  | "Support"
  | "Event"
  | "Signal"
  | "Diagnosis"
  | "Risk"
  | "Opportunity"
  | "Bottleneck"
  | "Intervention"
  | "Outcome"
  | "CausalHypothesis"
  | "Rule";

export type GraphRelationType =
  | "CAUSES"
  | "AFFECTS"
  | "BLOCKS"
  | "PRECEDES"
  | "FOLLOWS"
  | "RESOLVES"
  | "CORRELATES_WITH"
  | "TARGETS"
  | "RESULTED_IN"
  | "RECOMMENDS"
  | "FOLLOWED_BY"
  | "MAY_CONTRIBUTE_TO";

export type GraphNode = {
  id: string;
  type: GraphEntityType;
  label: string;
};

export type GraphEdge = {
  from: string;
  to: string;
  relation: GraphRelationType;
  ruleId?: string;
};

export type IntelligenceGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export function buildIntelligenceGraph(input: {
  signalIds: string[];
  diagnosisIds: string[];
  bottleneckCodes: string[];
  interventionIds: string[];
  causalIds: string[];
  merchantIds: string[];
  opportunityIds?: string[];
  riskIds?: string[];
  outcomeIds?: string[];
  dependencyEdges?: {
    from: string;
    to: string;
    relation: "PRECEDES" | "BLOCKS" | "MUTUALLY_EXCLUSIVE" | "SAME_RESOURCE";
    reason: string;
  }[];
}): IntelligenceGraph {
  const nodes: GraphNode[] = [
    { id: "platform", type: "Platform", label: "Ettajer Platform" },
  ];
  const edges: GraphEdge[] = [];

  for (const id of input.signalIds) {
    nodes.push({ id: `signal:${id}`, type: "Signal", label: id });
    edges.push({ from: `signal:${id}`, to: "platform", relation: "AFFECTS" });
  }
  for (const id of input.diagnosisIds) {
    nodes.push({ id: `diagnosis:${id}`, type: "Diagnosis", label: id });
    edges.push({ from: `diagnosis:${id}`, to: "platform", relation: "AFFECTS" });
  }
  for (const code of input.bottleneckCodes) {
    nodes.push({ id: `bottleneck:${code}`, type: "Bottleneck", label: code });
    edges.push({
      from: `bottleneck:${code}`,
      to: "platform",
      relation: "BLOCKS",
    });
  }
  for (const id of input.causalIds) {
    nodes.push({ id: `causal:${id}`, type: "CausalHypothesis", label: id });
    edges.push({
      from: `causal:${id}`,
      to: "platform",
      relation: "MAY_CONTRIBUTE_TO",
      ruleId: id,
    });
  }
  for (const id of input.interventionIds) {
    nodes.push({
      id: `intervention:${id}`,
      type: "Intervention",
      label: id,
    });
    edges.push({
      from: `intervention:${id}`,
      to: "platform",
      relation: "RECOMMENDS",
    });
  }
  for (const id of input.opportunityIds ?? []) {
    nodes.push({ id: `opportunity:${id}`, type: "Opportunity", label: id });
    edges.push({
      from: `opportunity:${id}`,
      to: "platform",
      relation: "AFFECTS",
    });
  }
  for (const id of input.riskIds ?? []) {
    nodes.push({ id: `risk:${id}`, type: "Risk", label: id });
    edges.push({ from: `risk:${id}`, to: "platform", relation: "AFFECTS" });
  }
  for (const id of input.outcomeIds ?? []) {
    nodes.push({ id: `outcome:${id}`, type: "Outcome", label: id });
    edges.push({
      from: `outcome:${id}`,
      to: "platform",
      relation: "RESULTED_IN",
    });
  }
  for (const id of input.merchantIds.slice(0, 20)) {
    nodes.push({ id: `merchant:${id}`, type: "Merchant", label: id });
    edges.push({
      from: "platform",
      to: `merchant:${id}`,
      relation: "TARGETS",
    });
  }

  for (const dep of input.dependencyEdges ?? []) {
    const relation: GraphRelationType =
      dep.relation === "PRECEDES"
        ? "PRECEDES"
        : dep.relation === "BLOCKS"
          ? "BLOCKS"
          : "FOLLOWS";
    edges.push({
      from: `intervention:${dep.from}`,
      to: `intervention:${dep.to}`,
      relation,
      ruleId: dep.reason,
    });
  }

  if (
    input.bottleneckCodes.includes("NO_FIRST_ORDER") &&
    input.causalIds.some((c) => c.includes("domain"))
  ) {
    edges.push({
      from: "bottleneck:NO_FIRST_ORDER",
      to: `causal:${input.causalIds.find((c) => c.includes("domain"))}`,
      relation: "CORRELATES_WITH",
    });
  }

  return { nodes, edges };
}
