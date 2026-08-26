/**
 * Configurable thresholds for Dr Sara — no scattered magic numbers.
 */
export const INTELLIGENCE_THRESHOLDS = {
  /** Top-2 GMV share (0–1) that elevates concentration risk */
  revenueConcentrationHigh: 0.6,
  /** Top-2 GMV share (0–1) that is critical */
  revenueConcentrationCritical: 0.75,
  /** Pending real COD orders → high severity */
  pendingOrdersHigh: 5,
  /** Pending real COD orders → critical severity */
  pendingOrdersCritical: 10,
  /** Open support threads → elevated */
  supportBacklogHigh: 3,
  /** Failed logins / 24h → technical attention */
  failedLoginsHigh: 10,
  /** Activation lookback window (days) */
  activationWindowDays: 7,
  /** Empty-store opportunity rules enabled */
  emptyStoreOpportunity: true,
  /** First-sale pool size that elevates activation diagnosis */
  firstSalePoolElevated: 20,
  /** Hot empty count that elevates activation attention */
  hotEmptyElevated: 5,
  /** GMV 7d change % considered strong positive momentum */
  revenueMomentumPositive: 20,
  /** Power segment: share of platform GMV */
  powerSharePct: 10,
  /** Growing: min real orders on tracked merchant */
  growingMinOrders: 1,
} as const;

export type IntelligenceThresholds = typeof INTELLIGENCE_THRESHOLDS;
