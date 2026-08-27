/**
 * System map — visual layer over intelligence graph + platform metrics.
 * Design V2: deterministic coordinates + emphasis for TOP_DECISION path.
 */
import type { DrSaraSnapshot } from "@/lib/intelligence/engine-types";
import type {
  PlatformMapEdge,
  PlatformMapNode,
} from "@/lib/intelligence/presentation/experience-model";
import { SYSTEM_NODE_LAYOUT } from "@/lib/intelligence/presentation/design-layout";

const SYSTEM_NODES: Omit<
  PlatformMapNode,
  | "metric"
  | "metricValue"
  | "status"
  | "signals"
  | "risks"
  | "opportunities"
  | "connectedDecisions"
  | "x"
  | "y"
  | "size"
  | "emphasis"
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

const STATIC_EDGES: Omit<PlatformMapEdge, "active">[] = [
  { from: "activation", to: "commerce", label: "First sale path" },
  { from: "commerce", to: "revenue", label: "Orders → GMV" },
  { from: "domains", to: "commerce", label: "Store reach" },
  { from: "payments", to: "operations", label: "COD verification" },
  { from: "operations", to: "support", label: "Fulfillment pressure" },
  { from: "merchants", to: "activation", label: "Onboarding" },
];

function statusFromScore(score: number): PlatformMapNode["status"] {
  if (score < 45) return "critical";
  if (score < 60) return "attention";
  if (score < 75) return "watch";
  return "ok";
}

function parseMetric(value: unknown): { text: string; num: number | null } {
  if (typeof value === "number" && Number.isFinite(value)) {
    return { text: String(value), num: value };
  }
  if (value == null || value === "—") return { text: "—", num: null };
  const n = Number(value);
  return { text: String(value), num: Number.isFinite(n) ? n : null };
}

function sizeFromMetric(num: number | null, status: PlatformMapNode["status"]): number {
  const base =
    status === "critical" ? 1.25 : status === "attention" ? 1.1 : status === "watch" ? 1 : 0.9;
  if (num == null) return base;
  const scale = Math.min(1.4, Math.max(0.75, Math.log10(Math.max(num, 1) + 1) / 2 + 0.7));
  return Number((base * scale).toFixed(3));
}

function emphasisPath(decisionId: string | null): Set<string> {
  if (!decisionId) return new Set();
  if (decisionId.includes("COD") || decisionId.includes("PENDING")) {
    return new Set(["payments", "operations", "support"]);
  }
  if (decisionId.includes("DOMAIN") || decisionId.includes("DNS")) {
    return new Set(["domains", "commerce"]);
  }
  if (decisionId.includes("FIRST_SALE") || decisionId.includes("ACTIVAT")) {
    return new Set(["activation", "commerce", "merchants"]);
  }
  if (decisionId.includes("SUPPORT")) {
    return new Set(["support", "operations"]);
  }
  return new Set(["operations"]);
}

export function buildPlatformMapView(snapshot: DrSaraSnapshot): {
  nodes: PlatformMapNode[];
  edges: PlatformMapEdge[];
} {
  const twin = snapshot.digitalTwin;
  const m = twin?.metrics ?? {};
  const os = snapshot.intelligenceOS;
  const topDecision = snapshot.decision?.topDecision?.selectedAction.id ?? null;
  const emphasis = emphasisPath(topDecision);
  const merchantTotal = snapshot.merchantSegments.summary.reduce(
    (sum, s) => sum + s.count,
    0
  );

  const nodes: PlatformMapNode[] = SYSTEM_NODES.map((n) => {
    let raw: unknown = "—";
    let status: PlatformMapNode["status"] = "ok";
    const signals: string[] = [];
    const risks: string[] = [];
    const opportunities: string[] = [];
    const connectedDecisions: string[] = [];

    switch (n.id) {
      case "merchants":
        raw = m.totalStores ?? (merchantTotal || "—");
        status = statusFromScore(snapshot.health.dimensions.activation ?? 70);
        break;
      case "commerce":
        raw = m.realOrders7d ?? twin?.provenanced?.realRevenue7d ?? "—";
        status = statusFromScore(snapshot.health.dimensions.revenue ?? 70);
        break;
      case "payments":
        raw = twin?.provenanced?.pendingCOD ?? m.pendingCOD ?? "—";
        status =
          Number(twin?.provenanced?.pendingCOD ?? 0) >= 10 ? "attention" : "ok";
        if (topDecision === "REVIEW_PENDING_COD") {
          connectedDecisions.push("REVIEW_PENDING_COD");
        }
        break;
      case "domains":
        raw = twin?.provenanced?.domainFailures ?? "—";
        status =
          Number(twin?.provenanced?.domainFailures ?? 0) >= 3
            ? "attention"
            : statusFromScore(snapshot.health.dimensions.technical);
        break;
      case "support":
        raw = twin?.provenanced?.supportBacklog ?? "—";
        status = statusFromScore(snapshot.health.dimensions.support);
        break;
      case "revenue":
        raw = twin?.provenanced?.realRevenue7d ?? "—";
        status = statusFromScore(snapshot.health.dimensions.revenue);
        break;
      case "activation":
        raw = m.firstSalePool ?? snapshot.bottlenecks[0]?.affectedCount ?? "—";
        status = statusFromScore(snapshot.health.dimensions.activation);
        break;
      case "operations":
        raw = twin?.provenanced?.pendingCOD ?? "—";
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

    const parsed = parseMetric(raw);
    const layout = SYSTEM_NODE_LAYOUT[n.id] ?? { x: 50, y: 50 };

    return {
      ...n,
      metric: parsed.text,
      metricValue: parsed.num,
      status,
      signals: signals.slice(0, 3),
      risks: risks.slice(0, 2),
      opportunities: opportunities.slice(0, 2),
      connectedDecisions,
      x: layout.x,
      y: layout.y,
      size: sizeFromMetric(parsed.num, status),
      emphasis: emphasis.has(n.id),
    };
  });

  const edges: PlatformMapEdge[] = STATIC_EDGES.map((e) => ({
    ...e,
    active: emphasis.has(e.from) && emphasis.has(e.to),
  }));

  for (const gn of os?.graph.nodes.slice(0, 8) ?? []) {
    if (gn.type === "DECISION" || gn.type === "INTERVENTION") {
      const candidate = {
        from: "operations" as const,
        to: (gn.type === "DECISION" ? "payments" : "operations") as string,
        label: gn.label,
        active: false,
      };
      if (
        !edges.some((x) => x.from === candidate.from && x.to === candidate.to)
      ) {
        edges.push(candidate);
      }
    }
  }

  return { nodes, edges };
}
