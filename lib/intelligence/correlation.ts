import type {
  CorrelatedInsight,
  IntelligenceSignal,
  PlatformState,
} from "@/lib/intelligence/engine-types";
import { blendConfidence } from "@/lib/intelligence/scoring/confidence";

function byId(signals: IntelligenceSignal[], id: string) {
  return signals.find((s) => s.id === id);
}

/**
 * Correlate related signals into higher-order insights.
 * Deterministic — no LLM.
 */
export function correlateSignals(
  signals: IntelligenceSignal[],
  state: PlatformState
): CorrelatedInsight[] {
  const out: CorrelatedInsight[] = [];
  const zeroSale = byId(signals, "zero-sale-stores");
  const empty = byId(signals, "empty-active-stores");
  const dns = byId(signals, "dns-failure");
  const pending = byId(signals, "pending-cod");
  const concentration = byId(signals, "revenue-concentration");
  const momentum = byId(signals, "revenue-momentum");
  const support = byId(signals, "support-backlog");

  if (zeroSale && state.firstSaleHighIntent > 0) {
    const prioritize = Math.min(
      state.firstSaleHighIntent,
      state.firstSaleCount
    );
    out.push({
      id: "corr-first-sale-gap",
      title: "The main activation bottleneck is first-sale conversion.",
      explanation:
        "Most affected merchants have completed catalog setup but have not generated a real order. " +
        `${prioritize} show recent activity — prioritize them before cold inventory.`,
      signalIds: [zeroSale.id, ...(empty ? [empty.id] : [])],
      evidence: [
        {
          label: "storesWithProductsZeroOrders",
          value: state.firstSaleCount,
          source: "activation.funnel",
        },
        {
          label: "highIntentAmongThem",
          value: state.firstSaleHighIntent,
          source: "activation.temperature",
        },
        {
          label: "liveStores",
          value: state.liveStores,
          source: "platform.overview",
        },
      ],
      confidence: blendConfidence([
        zeroSale.confidence,
        state.firstSaleHighIntent > 0 ? 0.95 : 0.7,
      ]),
      recommendedAction: {
        label: `Prioritize ${prioritize} recently active first-sale merchants`,
        href: "/admin/activation?stage=listed",
      },
    });
  }

  if (empty && state.loggedInEmpty7d > 0 && !zeroSale) {
    out.push({
      id: "corr-empty-store-gap",
      title: "Activation bottleneck is catalog creation, not store creation.",
      explanation: `${state.loggedInEmpty7d} merchants logged in recently with zero products — high-probability activation targets.`,
      signalIds: [empty.id],
      evidence: [
        {
          label: "loggedInEmpty7d",
          value: state.loggedInEmpty7d,
          source: "activation.gap",
        },
      ],
      confidence: empty.confidence,
      recommendedAction: {
        label: "Open hot empty activation list",
        href: "/admin/activation?stage=empty&temp=hot",
      },
    });
  }

  if (zeroSale && dns) {
    out.push({
      id: "corr-first-sale-technical",
      title: "Technical domain issues may compound the first-sale gap.",
      explanation:
        "Merchants without healthy custom domains may struggle to share storefronts confidently while also sitting at zero real orders.",
      signalIds: [zeroSale.id, dns.id],
      evidence: [
        {
          label: "domainFailing",
          value: state.domainFailing,
          source: "domains.live",
        },
        {
          label: "firstSaleNoCustomDomain",
          value: state.firstSaleBottlenecks.noCustomDomain,
          source: "store.settings",
        },
      ],
      confidence: blendConfidence([zeroSale.confidence, dns.confidence]),
      recommendedAction: {
        label: "Diagnose domains",
        href: "/admin/domains",
      },
    });
  }

  if (momentum && concentration) {
    out.push({
      id: "corr-growth-concentrated",
      title: "Growth is strong but concentrated.",
      explanation:
        "GMV momentum is positive, yet a large share of revenue sits with a small merchant set. Mid-tier activation reduces concentration risk.",
      signalIds: [momentum.id, concentration.id],
      evidence: [
        {
          label: "revenueChange7d",
          value: state.revenueChange7d,
          source: "platform.analytics",
        },
        {
          label: "top2SharePct",
          value: state.top2SharePct,
          source: "platform.gmv",
        },
      ],
      confidence: blendConfidence([
        momentum.confidence,
        concentration.confidence,
      ]),
      recommendedAction: {
        label: "Activate mid-tier first-sale merchants",
        href: "/admin/activation?stage=listed",
      },
    });
  }

  if (pending && support) {
    out.push({
      id: "corr-ops-support",
      title: "Operational load and support backlog are both elevated.",
      explanation:
        "Pending COD and unanswered support can compound merchant distrust — clear the highest-urgency queue first.",
      signalIds: [pending.id, support.id],
      evidence: [
        {
          label: "pendingRealOrders",
          value: state.pendingRealOrders,
          source: "platform.overview",
        },
        {
          label: "openSupport",
          value: state.openSupport,
          source: "support.inbox",
        },
      ],
      confidence: blendConfidence([pending.confidence, support.confidence]),
      recommendedAction: {
        label: "Review pending COD",
        href: "/admin/payments?focus=pending",
      },
    });
  }

  return out;
}
