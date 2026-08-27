import type { Evidence } from "@/lib/intelligence/engine-types";
import { INTELLIGENCE_THRESHOLDS as T } from "@/lib/intelligence/thresholds";

export type DataQualityWarning = {
  id: string;
  code: "DATA_QUALITY_WARNING";
  severity: "low" | "medium" | "high";
  message: string;
  evidence: Evidence[];
};

export function assessDataQuality(input: {
  totalRevenue: number;
  realRevenue7d: number;
  pendingRealOrders: number;
  pendingRealGmv: number;
  top2SharePct: number;
  domainsConnected: number;
  domainsConnectedSuccess: number;
  sparklines?: { revenue: number[]; orders: number[] };
}): DataQualityWarning[] {
  const warnings: DataQualityWarning[] = [];

  if (input.totalRevenue < 0 || input.realRevenue7d < 0) {
    warnings.push({
      id: "dq-negative-revenue",
      code: "DATA_QUALITY_WARNING",
      severity: "high",
      message: "Negative revenue values detected — intelligence may be unreliable.",
      evidence: [
        { label: "totalRevenue", value: input.totalRevenue, source: "platform.gmv" },
        { label: "realRevenue7d", value: input.realRevenue7d, source: "platform.gmv" },
      ],
    });
  }

  if (
    input.pendingRealOrders === 0 &&
    input.pendingRealGmv > 0
  ) {
    warnings.push({
      id: "dq-pending-gmv-mismatch",
      code: "DATA_QUALITY_WARNING",
      severity: "medium",
      message: "Pending GMV present without pending order count.",
      evidence: [
        {
          label: "pendingRealOrders",
          value: input.pendingRealOrders,
          source: "platform.overview",
        },
        {
          label: "pendingRealGmv",
          value: input.pendingRealGmv,
          source: "platform.overview",
        },
      ],
    });
  }

  if (input.top2SharePct < 0 || input.top2SharePct > 100) {
    warnings.push({
      id: "dq-share-out-of-range",
      code: "DATA_QUALITY_WARNING",
      severity: "high",
      message: "Top-2 GMV share outside 0–100%.",
      evidence: [
        { label: "top2SharePct", value: input.top2SharePct, source: "platform.gmv" },
      ],
    });
  }

  if (
    input.domainsConnectedSuccess > input.domainsConnected
  ) {
    warnings.push({
      id: "dq-domain-counts",
      code: "DATA_QUALITY_WARNING",
      severity: "medium",
      message: "Domain success count exceeds connected count.",
      evidence: [
        {
          label: "domainsConnected",
          value: input.domainsConnected,
          source: "domains.live",
        },
        {
          label: "domainsConnectedSuccess",
          value: input.domainsConnectedSuccess,
          source: "domains.live",
        },
      ],
    });
  }

  const rev = input.sparklines?.revenue ?? [];
  if (rev.some((v) => !Number.isFinite(v) || v < 0)) {
    warnings.push({
      id: "dq-sparkline-invalid",
      code: "DATA_QUALITY_WARNING",
      severity: "low",
      message: "Sparkline contains invalid revenue points.",
      evidence: [
        { label: "invalidPoints", value: true, source: "platform.sparklines" },
      ],
    });
  }

  void T;
  return warnings;
}
