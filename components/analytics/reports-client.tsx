"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ReportsData } from "@/lib/reports";
import { ReportsBrief } from "@/components/analytics/reports-brief";
import { ReportsKpiGrid } from "@/components/analytics/reports-kpi-grid";
import { ReportsOrdersBreakdown } from "@/components/analytics/reports-orders-breakdown";
import { ReportsRevenueChart } from "@/components/analytics/reports-revenue-chart";
import { ReportsToolbar } from "@/components/analytics/reports-toolbar";
import { ReportsTopProducts } from "@/components/analytics/reports-top-products";
import { ReportsTopRegions } from "@/components/analytics/reports-top-regions";

interface ReportsClientProps {
  data: ReportsData;
}

export function ReportsClient({ data }: ReportsClientProps) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();

  function handleRefresh() {
    startRefresh(() => router.refresh());
  }

  function handleExportSummary() {
    const lines = [
      `Report,${data.rangeLabel}`,
      `Revenue,${data.revenue}`,
      `Orders,${data.orders}`,
      `Avg order,${data.averageOrderValue}`,
      `Units sold,${data.unitsSold}`,
      `Refunds,${data.refundedOrders}`,
      "",
      "Top products,Units,Revenue,Share",
      ...data.topProducts.map(
        (product) =>
          `"${product.title}",${product.units},${product.revenue},${product.share.toFixed(1)}%`
      ),
      "",
      "Top regions,Orders,Revenue,Share",
      ...data.topRegions.map(
        (region) =>
          `"${region.name}",${region.orders},${region.revenue},${region.share.toFixed(1)}%`
      ),
      "",
      "Status,Count,Share",
      ...data.ordersByStatus.map(
        (item) => `${item.status},${item.count},${item.share.toFixed(1)}%`
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `report-summary-${data.range}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  }

  return (
    <div className="space-y-4">
      <ReportsToolbar
        rangeLabel={data.rangeLabel}
        lastUpdated={data.lastUpdated}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onExport={handleExportSummary}
      />

      <ReportsBrief
        message={data.brief.message}
        tone={data.brief.tone}
        rangeLabel={data.rangeLabel}
        revenue={data.revenue}
        revenueChange={data.revenueChange}
        orders={data.orders}
        ordersChange={data.ordersChange}
        currency={data.currency}
      />

      <ReportsKpiGrid data={data} />

      <ReportsRevenueChart
        trend={data.revenueTrend}
        previousTrend={data.previousRevenueTrend}
        range={data.range}
        currency={data.currency}
        totalRevenue={data.revenue}
        revenueChange={data.revenueChange}
        peakRevenue={data.peakRevenue}
        peakLabel={data.peakLabel}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ReportsTopProducts products={data.topProducts} currency={data.currency} />
        <ReportsTopRegions regions={data.topRegions} currency={data.currency} />
      </div>

      <ReportsOrdersBreakdown ordersByStatus={data.ordersByStatus} />
    </div>
  );
}
