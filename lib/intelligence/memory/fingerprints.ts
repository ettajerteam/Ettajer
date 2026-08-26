/**
 * Deterministic state fingerprints — comparable situations, no random IDs.
 */
import type { PlatformState } from "@/lib/intelligence/engine-types";
import { MEMORY_THRESHOLDS as T } from "@/lib/intelligence/memory/config";

export function buildStateFingerprints(state: PlatformState): string[] {
  const tags: string[] = [];

  if (state.pendingRealOrders >= T.codHigh) tags.push("COD_BACKLOG_HIGH");
  else if (state.pendingRealOrders >= T.codMedium)
    tags.push("COD_BACKLOG_MEDIUM");
  else if (state.pendingRealOrders > 0) tags.push("COD_BACKLOG_LOW");

  if (state.firstSaleHighIntent >= T.firstSaleHigh)
    tags.push("FIRST_SALE_HIGH_INTENT");
  else if (state.firstSaleCount > 0) tags.push("FIRST_SALE_POOL");

  if (state.domainFailing >= T.dnsCluster) tags.push("DNS_FAILURE_CLUSTER");
  else if (state.domainFailing > 0) tags.push("DNS_FAILURE");

  if (state.openSupport >= T.supportBacklog) tags.push("SUPPORT_BACKLOG");
  else if (state.openSupport > 0) tags.push("SUPPORT_OPEN");

  if (state.top2SharePct >= T.concentrationPct || state.concentrationElevated) {
    tags.push("REVENUE_CONCENTRATION");
  }

  if (state.hotEmptyCount > 0 || state.loggedInEmpty7d > 0) {
    tags.push("EMPTY_STORE_ACTIVITY");
  }

  if (tags.length === 0) tags.push("PLATFORM_QUIET");

  return tags.sort();
}

/** Stable primary fingerprint key for grouping comparable states. */
export function primaryStateFingerprint(state: PlatformState): string {
  return buildStateFingerprints(state).join("+");
}

/** Opaque deterministic hash of fingerprint + key metrics (no timestamps). */
export function fingerprintHash(state: PlatformState): string {
  const payload = JSON.stringify({
    fp: buildStateFingerprints(state),
    pending: state.pendingRealOrders,
    dns: state.domainFailing,
    support: state.openSupport,
    firstSale: state.firstSaleCount,
    top2: state.top2SharePct,
  });
  let h = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    h ^= payload.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
