import type { PlatformOverviewData } from "@/lib/admin/platform-stats";
import type { SaraSegment } from "@/lib/intelligence/types";

/**
 * Merchant segments — counts derived from overview / funnel.
 * Links into existing activation & analytics routes.
 */
export function getMerchantSegments(
  overview: PlatformOverviewData
): SaraSegment[] {
  const growingApprox = overview.concentration.filter((c) => c.orders > 0).length;
  const powerApprox = overview.concentration.filter(
    (c) => c.sharePct >= 10 || c.gmv > 0
  ).length;

  // Dormant / at-risk are not fully enumerated on overview — approximate from funnel gaps.
  const dormantApprox = Math.max(
    0,
    overview.funnel.noProducts - overview.loggedInEmpty7d
  );

  return [
    {
      id: "hot",
      label: "HOT",
      description: "Recently active + no products",
      count: overview.hotEmptyCount,
      href: "/admin/activation?stage=empty&temp=hot",
    },
    {
      id: "first-sale",
      label: "FIRST SALE",
      description: "Products live + zero real orders",
      count: overview.firstSale.count,
      href: "/admin/activation?stage=listed",
    },
    {
      id: "growing",
      label: "GROWING",
      description: "Recent real orders + positive momentum",
      count: growingApprox,
      href: "/admin/analytics?range=7",
    },
    {
      id: "power",
      label: "POWER",
      description: "High GMV / high order volume",
      count: powerApprox,
      href: "/admin/analytics?range=30",
    },
    {
      id: "at-risk",
      label: "AT RISK",
      description: "Waiting activation or blocked from commerce",
      count: overview.waitingUsers,
      href: "/admin/users?status=waiting",
    },
    {
      id: "dormant",
      label: "DORMANT",
      description: "Empty stores with no recent login",
      count: dormantApprox,
      href: "/admin/activation?stage=empty&temp=cold",
    },
  ];
}
