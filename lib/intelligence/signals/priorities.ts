import type { AttentionItem } from "@/lib/admin/attention-queue";
import type { PlatformOverviewData } from "@/lib/admin/platform-stats";
import { formatAdminInt } from "@/lib/admin/format";
import type { SaraPriority, SaraSeverity } from "@/lib/intelligence/types";

function severityFromTier(
  tier: AttentionItem["tier"]
): { severity: SaraSeverity; label: string } {
  if (tier === "high") return { severity: "high", label: "HIGH" };
  if (tier === "medium") return { severity: "medium", label: "MEDIUM" };
  if (tier === "opportunity") return { severity: "low", label: "OPPORTUNITY" };
  return { severity: "low", label: "WATCH" };
}

function ruleForAttention(id: string): string {
  const rules: Record<string, string> = {
    "pending-cod": "pendingRealOrders > 0",
    "waiting-users": "waitingUsers > 0",
    "hot-empty": "hotEmptyCount > 0",
    "domain-dns": "domainsConnected - domainsConnectedSuccess > 0",
    "open-support": "openSupport > 0",
    "failed-logins": "failedLogins24h >= threshold",
    "first-sale": "activeNoOrders > 0",
    "logged-in-empty": "loggedInEmpty7d > 0",
  };
  return rules[id] ?? `attention.${id}`;
}

/** Map Attention Center items into Dr Sara priority cards with explainability. */
export function getPrioritySignals(
  overview: PlatformOverviewData,
  limit = 5
): SaraPriority[] {
  return overview.attentionItems.slice(0, limit).map((item) => {
    const { severity, label } = severityFromTier(item.tier);
    return {
      id: item.id,
      severity,
      severityLabel: label,
      signal: item.count > 0 ? `${item.count} ${item.title}` : item.title,
      why: item.why,
      evidence: item.impact,
      recommendation: item.priorityReason,
      affectedLabel: item.count === 1 ? "item" : "items",
      affectedCount: item.count,
      href: item.href,
      cta: item.cta,
      explanation: {
        signal: item.count > 0 ? `${item.count} ${item.title}` : item.title,
        evidence: item.impact,
        rule: ruleForAttention(item.id),
        impact: item.why,
        recommendation: `${item.cta} → ${item.href}`,
        source: "deterministic",
      },
    };
  });
}

/** Critical unresolved signal count for sidebar badge. */
export function countCriticalSignals(overview: PlatformOverviewData): number {
  return overview.attentionItems.filter((i) => i.tier === "high").length;
}

export function formatPriorityAffected(p: SaraPriority): string {
  return `${formatAdminInt(p.affectedCount)} ${p.affectedLabel}`;
}
