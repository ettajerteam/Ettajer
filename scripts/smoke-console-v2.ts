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
  const search = await searchPlatformAdmin("store");
  const domains = await getPlatformDomains();
  const sample = act.emptyAll[0] ?? act.activeNoOrders[0];
  const health = sample ? healthFromActivationRow(sample) : null;

  const out = {
    ms: Date.now() - t0,
    users: overview.totalUsers,
    stores: overview.totalStores,
    realOrders: overview.realOrders,
    realGmv: overview.totalRevenue,
    attentionSentence: overview.attentionSentence,
    attentionCount: overview.attentionItems.length,
    attentionTop: overview.attentionItems.slice(0, 4).map((i) => ({
      id: i.id,
      count: i.count,
      title: i.title,
      href: i.href,
    })),
    funnel: overview.funnel,
    concentrationRisk: overview.concentrationRisk,
    insights: overview.insights.slice(0, 3).map((i) => ({
      id: i.id,
      category: i.category,
      signal: i.signal,
    })),
    sampleHealth: sample
      ? {
          store: sample.storeName,
          score: health?.score,
          band: health?.bandLabel,
          bottleneck: health?.bottleneck,
        }
      : null,
    liveFeedSample: feed.slice(0, 3).map((e) => ({
      category: e.category,
      title: e.title,
    })),
    paymentsPending:
      payments.ordersByStatus.find((r) => r.status === "pending")?._count ?? 0,
    searchHits: {
      users: search.users.length,
      stores: search.stores.length,
      orders: search.orders.length,
    },
    domains: { total: domains.total, ok: domains.ok, failing: domains.failing },
  };

  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
