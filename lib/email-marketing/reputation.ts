import { prisma } from "@/lib/db";
import { ratePercent } from "@/lib/email-marketing/email-analytics-types";

export type ReputationGrade =
  | "excellent"
  | "good"
  | "fair"
  | "poor"
  | "critical"
  | "insufficient_data";

export interface SenderReputation {
  score: number;
  grade: ReputationGrade;
  label: string;
  days: number;
  sent: number;
  delivered: number;
  bounced: number;
  complained: number;
  failed: number;
  deliveryRate: number;
  bounceRate: number;
  complaintRate: number;
  /** Guidance for the merchant */
  tips: string[];
}

function gradeFromScore(score: number, sent: number): ReputationGrade {
  if (sent < 10) return "insufficient_data";
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "fair";
  if (score >= 40) return "poor";
  return "critical";
}

function labelForGrade(grade: ReputationGrade): string {
  switch (grade) {
    case "excellent":
      return "Excellent";
    case "good":
      return "Good";
    case "fair":
      return "Fair";
    case "poor":
      return "Poor";
    case "critical":
      return "Critical";
    default:
      return "Building history";
  }
}

/**
 * Sender reputation from recent engagement events.
 * Score weights delivery positively; bounces and complaints heavily.
 */
export async function getSenderReputation(
  storeId: string,
  days = 30
): Promise<SenderReputation> {
  const since = new Date();
  since.setDate(since.getDate() - Math.max(1, Math.min(days, 90)));

  const grouped = await prisma.emailEvent.groupBy({
    by: ["type"],
    where: { storeId, occurredAt: { gte: since } },
    _count: { _all: true },
  });

  const counts: Record<string, number> = {};
  for (const row of grouped) {
    counts[row.type] = row._count._all;
  }

  const sent = counts.sent ?? 0;
  const delivered = counts.delivered ?? 0;
  const bounced = counts.bounced ?? 0;
  const complained = counts.complained ?? 0;
  const failed = counts.failed ?? 0;

  const denom = Math.max(sent, delivered + bounced + failed, 1);
  const deliveryRate = ratePercent(delivered, denom);
  const bounceRate = ratePercent(bounced, denom);
  const complaintRate = ratePercent(complained, Math.max(delivered, 1));

  // Start at 100; penalize bounce/complaint/fail; reward delivery
  let score = 100;
  score -= Math.min(50, bounceRate * 4);
  score -= Math.min(40, complaintRate * 80);
  score -= Math.min(20, ratePercent(failed, denom) * 1.5);
  if (deliveryRate > 0) {
    score = score * 0.7 + deliveryRate * 0.3;
  }
  score = Math.max(0, Math.min(100, Math.round(score)));

  const grade = gradeFromScore(score, sent);
  const tips: string[] = [];
  if (bounceRate > 2) {
    tips.push("Bounce rate is elevated — clean your list and verify addresses.");
  }
  if (complaintRate > 0.1) {
    tips.push("Spam complaints detected — review subject lines and cadence.");
  }
  if (sent < 10) {
    tips.push("Send a few campaigns to build a reliable reputation signal.");
  }
  if (grade === "excellent" || grade === "good") {
    tips.push("Keep authentication (SPF, DKIM, DMARC) verified and lists engaged.");
  }

  return {
    score,
    grade,
    label: labelForGrade(grade),
    days,
    sent,
    delivered,
    bounced,
    complained,
    failed,
    deliveryRate,
    bounceRate,
    complaintRate,
    tips,
  };
}
