import { getPlatformOverview } from "@/lib/admin/platform-stats";
import { getOpportunities } from "@/lib/intelligence/opportunities";
import { getRecommendedActions } from "@/lib/intelligence/recommendations/actions";
import { getOperationalRisks } from "@/lib/intelligence/risks/center";
import { scorePlatformHealth } from "@/lib/intelligence/scoring/health-score";
import { getMerchantSegments } from "@/lib/intelligence/segments/merchants";
import { getRevenueAndInsightSignals } from "@/lib/intelligence/signals/feed";
import {
  countCriticalSignals,
  getPrioritySignals,
} from "@/lib/intelligence/signals/priorities";
import type { SaraBriefing } from "@/lib/intelligence/types";

/**
 * Dr Sara briefing — composes existing platform overview into an
 * explainable operating layer. Does not re-query Prisma.
 */
export async function getDrSaraBriefing(): Promise<SaraBriefing> {
  const overview = await getPlatformOverview();
  const pulse = scorePlatformHealth(overview);
  const priorities = getPrioritySignals(overview, 5);
  const criticalCount = countCriticalSignals(overview);

  return {
    generatedAt: new Date(),
    headline: overview.attentionSentence || "Here's what matters right now.",
    pulse,
    priorities,
    feed: getRevenueAndInsightSignals(overview),
    opportunities: getOpportunities(overview),
    risks: getOperationalRisks(overview),
    segments: getMerchantSegments(overview),
    actions: getRecommendedActions(overview),
    criticalCount,
  };
}

/** Lightweight critical count for sidebar badge (reuses overview). */
export async function getDrSaraCriticalCount(): Promise<number> {
  const overview = await getPlatformOverview();
  return countCriticalSignals(overview);
}
