import { prisma } from "@/lib/db";
import { listIntelligenceByLabel } from "@/lib/email-marketing/atlas/intelligence";
import { chooseSmartIncentive } from "@/lib/email-marketing/atlas/recommendations";

export interface MerchantInsightWidget {
  id: string;
  title: string;
  value: string;
  detail: string;
  ctaLabel?: string;
  ctaHref?: string;
  severity?: "info" | "opportunity" | "alert";
}

export async function getMerchantInsightsBundle(storeId: string): Promise<{
  widgets: MerchantInsightWidget[];
  currency: string;
}> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { currency: true },
  });
  const currency = store?.currency || "MAD";

  const [
    likelyBuyers,
    abandoned,
    intelCount,
    campaigns,
  ] = await Promise.all([
    listIntelligenceByLabel(storeId, "likely_to_buy", 20),
    prisma.abandonedCheckout.count({
      where: { storeId, recoveredAt: null },
    }),
    prisma.customerIntelligence.count({ where: { storeId } }),
    prisma.newsletterSend.findMany({
      where: { storeId, status: { in: ["sent", "archived"] } },
      orderBy: { attributedRevenue: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        subject: true,
        attributedRevenue: true,
        attributedOrders: true,
        recipientCount: true,
      },
    }),
  ]);

  const recoverable = await prisma.abandonedCheckout.aggregate({
    where: { storeId, recoveredAt: null },
    _sum: { subtotal: true },
  });
  const recoverableRevenue = recoverable._sum.subtotal ?? 0;

  const topCampaign = campaigns[0];
  const expectedRoi =
    topCampaign && topCampaign.recipientCount > 0
      ? Math.round(
          ((topCampaign.attributedRevenue || 0) /
            Math.max(topCampaign.recipientCount * 0.001, 0.01)) *
            10
        ) / 10
      : 18;

  const sampleEmail = likelyBuyers[0]?.email;
  const incentive = sampleEmail
    ? await chooseSmartIncentive({ storeId, email: sampleEmail })
    : null;

  const widgets: MerchantInsightWidget[] = [
    {
      id: "likely_buy_today",
      title: "Likely to purchase",
      value: String(likelyBuyers.length),
      detail:
        likelyBuyers.length > 0
          ? `${likelyBuyers.length} contacts scored high propensity — prioritize a short flash campaign.`
          : intelCount === 0
            ? "Run intelligence scoring to unlock predictions."
            : "No high-propensity contacts right now.",
      ctaLabel: "Open insights",
      ctaHref: "/dashboard/marketing/email/insights",
      severity: "opportunity",
    },
    {
      id: "abandoned_carts",
      title: "Abandoned carts",
      value: String(abandoned),
      detail: `${abandoned} open carts · recoverable ~${formatMoney(
        recoverableRevenue,
        currency
      )}`,
      ctaLabel: "Cart recovery journey",
      ctaHref: "/dashboard/marketing/email/journeys",
      severity: abandoned > 5 ? "alert" : "info",
    },
    {
      id: "recoverable_revenue",
      title: "Expected recoverable revenue",
      value: formatMoney(recoverableRevenue, currency),
      detail: "From unrecovered checkouts in your store.",
      severity: "opportunity",
    },
    {
      id: "recommended_campaign",
      title: "Recommended campaign",
      value: abandoned > 3 ? "Flash Sale" : "VIP Early Access",
      detail: incentive
        ? `Suggested incentive: ${incentive.type}${
            incentive.value ? ` ${incentive.value}` : ""
          } — ${incentive.reason}`
        : "Use AI Flow Generator to scaffold journeys for your niche.",
      ctaLabel: "Generate flows",
      ctaHref: "/dashboard/marketing/email/journeys?ai=1",
      severity: "opportunity",
    },
    {
      id: "expected_roi",
      title: "Expected ROI",
      value: `${expectedRoi}×`,
      detail: topCampaign
        ? `Based on “${topCampaign.name || topCampaign.subject}” attribution`
        : "Baseline estimate until campaigns accrue attributed revenue.",
      severity: "info",
    },
  ];

  return { widgets, currency };
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.length === 3 ? currency : "MAD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${Math.round(amount)} ${currency}`;
  }
}
