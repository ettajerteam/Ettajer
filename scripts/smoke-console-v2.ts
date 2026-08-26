import fs from "fs";
import {
  getPlatformOverview,
  getPlatformLiveFeed,
  getPlatformPayments,
  getPlatformDomains,
  searchPlatformAdmin,
} from "../lib/admin/platform-stats";
import { getActivationGap } from "../lib/admin/activation-stats";
import { healthFromActivationRow } from "../lib/admin/merchant-health";

function loadEnv(path: string) {
  if (!fs.existsSync(path)) return;
  for (const line of fs.readFileSync(path, "utf8").split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const k = line.slice(0, i);
    let v = line.slice(i + 1);
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

async function main() {
  loadEnv(".env");
  loadEnv(".env.local");

  const t0 = Date.now();
  const overview = await getPlatformOverview();
  const act = await getActivationGap();
  const feed = await getPlatformLiveFeed(10);
  const payments = await getPlatformPayments();
  const search = await searchPlatformAdmin("pending orders");
  const domains = await getPlatformDomains();
  const sample = act.emptyAll[0] ?? act.activeNoOrders[0];
  const health = sample ? healthFromActivationRow(sample) : null;

  const out = {
    ms: Date.now() - t0,
    users: overview.totalUsers,
    stores: overview.totalStores,
    liveStores: overview.liveStores,
    realOrders: overview.realOrders,
    realGmv: overview.totalRevenue,
    healthOverall: overview.health.overallLabel,
    healthStrip: overview.health.items.map((i) => ({
      label: i.label,
      status: i.statusLabel,
    })),
    attentionSentence: overview.attentionSentence,
    attentionTop: overview.attentionItems.slice(0, 4).map((i) => ({
      id: i.id,
      count: i.count,
      tier: i.tier,
      score: i.priorityScore,
      title: i.title,
    })),
    today: overview.today,
    last7d: {
      gmv: overview.realRevenue7d,
      orders: overview.realOrders7d,
      changes: overview.changes,
    },
    funnel: overview.funnel,
    helpToday: overview.helpToday.slice(0, 3).map((h) => ({
      merchant: h.ownerName || h.ownerEmail,
      intent: h.intent,
      health: h.healthScore,
    })),
    firstSale: overview.firstSale,
    liveFeedInline: overview.liveFeed.slice(0, 3).map((e) => e.title),
    concentrationRisk: overview.concentrationRisk,
    sampleHealth: sample
      ? {
          store: sample.storeName,
          score: health?.score,
          band: health?.bandLabel,
        }
      : null,
    liveFeedSample: feed.slice(0, 3).map((e) => ({
      category: e.category,
      title: e.title,
    })),
    paymentsPending:
      payments.ordersByStatus.find((r) => r.status === "pending")?._count ?? 0,
    searchShortcuts: search.shortcuts,
    domains: { total: domains.total, ok: domains.ok, failing: domains.failing },
  };

  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
