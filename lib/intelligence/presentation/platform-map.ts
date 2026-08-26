/**
 * System map — visual layer over intelligence graph + platform metrics.
 */
import type { DrSaraSnapshot } from "@/lib/intelligence/engine-types";
import type {
  PlatformMapEdge,
  PlatformMapNode,
} from "@/lib/intelligence/presentation/experience-model";

const SYSTEM_NODES: Omit<
  PlatformMapNode,
  "metric" | "status" | "signals" | "risks" | "opportunities" | "connectedDecisions"
>[] = [
  { id: "merchants", label: "Merchants", category: "MERCHANTS" },
  { id: "commerce", label: "Commerce", category: "COMMERCE" },
  { id: "payments", label: "Payments", category: "PAYMENTS" },
  { id: "domains", label: "Domains", category: "DOMAINS" },
  { id: "support", label: "Support", category: "SUPPORT" },
  { id: "revenue", label: "Revenue", category: "REVENUE" },
  { id: "activation", label: "Activation", category: "ACTIVATION" },
  { id: "operations", label: "Operations", category: "OPERATIONS" },
];

const STATIC_EDGES: PlatformMapEdge[] = [
  { from: "activation", to: "commerce", label: "First sale path" },
  { from: "commerce", to: "revenue", label: "Orders → GMV" },
  { from: "domains", to: "commerce", label: "Store reach" },
  { from: "payments", to: "operations", label: "COD verification" },
  { from: "operations", to: "support", label: "Fulfillment pressure" },
];

function statusFromScore(score: number): PlatformMapNode["status"] {
  if (score < 45) return "critical";
  if (score < 60) return "attention";
  if (score < 75) return "watch";
  return "ok";
}

export function buildPlatformMapView(snapshot: DrSaraSnapshot): {
  nodes: PlatformMapNode[];
  edges: PlatformMapEdge[];
} {
  const twin = snapshot.digitalTwin;
  const m = twin?.metrics ?? {};
  const os = snapshot.intelligenceOS;
  const topDecision = snapshot.decision?.topDecision?.selectedAction.id ?? null;

  const warningsByResponse = new Map<string, string[]>();
  for (const w of os?.warnings ?? []) {
    const key = w.recommendedResponse.split("_")[0]?.toLowerCase() ?? w.id;
    warningsByResponse.set(key, w.evidence);
  }

  const nodes: PlatformMapNode[] = SYSTEM_NODES.map((n) => {
    let metric = "—";
    let status: PlatformMapNode["status"] = "ok";
    const signals: string[] = [];
    const risks: string[] = [];
    const opportunities: string[] = [];
    const connectedDecisions: string[] = [];

    const merchantTotal = snapshot.merchantSegments.summary.reduce(
      (sum, s) => sum + s.count,
      0
    );

    switch (n.id) {
      case "merchants":
        metric = String(m.totalStores ?? (merchantTotal || "—"));
        status = statusFromScore(snapshot.health.dimensions.activation ?? 70);
        break;
      case "commerce":
        metric = String(m.realOrders7d ?? twin?.provenanced?.realRevenue7d ?? "—");
        status = statusFromScore(snapshot.health.dimensions.revenue ?? 70);
        break;
      case "payments":
        metric = String(twin?.provenanced?.pendingCOD ?? m.pendingCOD ?? "—");
        status =
          Number(twin?.provenanced?.pendingCOD ?? 0) >= 10 ? "attention" : "ok";
        if (topDecision === "REVIEW_PENDING_COD") {
          connectedDecisions.push("REVIEW_PENDING_COD");
        }
        break;
      case "domains":
        metric = String(twin?.provenanced?.domainFailures ?? "—");
        status =
          Number(twin?.provenanced?.domainFailures ?? 0) >= 3
            ? "attention"
            : statusFromScore(snapshot.health.dimensions.technical);
        break;
      case "support":
        metric = String(twin?.provenanced?.supportBacklog ?? "—");
        status = statusFromScore(snapshot.health.dimensions.support);
        break;
      case "revenue":
        metric = String(twin?.provenanced?.realRevenue7d ?? "—");
        status = statusFromScore(snapshot.health.dimensions.revenue);
        break;
      case "activation":
        metric = String(m.firstSalePool ?? snapshot.bottlenecks[0]?.affectedCount ?? "—");
        status = statusFromScore(snapshot.health.dimensions.activation);
        break;
      case "operations":
        metric = String(twin?.provenanced?.pendingCOD ?? "—");
        status = statusFromScore(snapshot.health.dimensions.operations);
        break;
    }

    for (const s of snapshot.signals.slice(0, 3)) {
      if (s.title.toLowerCase().includes(n.id.slice(0, 4))) {
        signals.push(s.title);
      }
    }
    for (const w of os?.warnings ?? []) {
      if (w.title.toLowerCase().includes(n.label.toLowerCase().slice(0, 4))) {
        risks.push(w.title);
      }
    }
    for (const o of os?.opportunities ?? []) {
      if (o.recommendedAction.toLowerCase().includes(n.id.slice(0, 4))) {
        opportunities.push(o.title);
      }
    }

    return {
      ...n,
      metric,
      status,
      signals: signals.slice(0, 3),
      risks: risks.slice(0, 2),
      opportunities: opportunities.slice(0, 2),
      connectedDecisions,
    };
  });

  const graphEdges: PlatformMapEdge[] = [...STATIC_EDGES];
  for (const gn of os?.graph.nodes.slice(0, 8) ?? []) {
    if (gn.type === "DECISION" || gn.type === "INTERVENTION") {
      graphEdges.push({
        from: "operations",
        to: gn.type === "DECISION" ? "payments" : "operations",
        label: gn.label,
      });
    }
  }

  const uniqueEdges = graphEdges.filter(
    (e, i, arr) =>
      arr.findIndex((x) => x.from === e.from && x.to === e.to) === i
  );

  return { nodes, edges: uniqueEdges };
}
