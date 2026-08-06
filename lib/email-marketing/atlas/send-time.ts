import { prisma } from "@/lib/db";
import { normalizeSubscriberEmail } from "@/lib/newsletter";

/**
 * Compute the next Date when this recipient should receive mail
 * based on SendTimeProfile / CustomerIntelligence (UTC hour buckets).
 * Returns null when no profile or already inside a ±1h optimal window.
 */
export async function nextOptimalSendAt(
  storeId: string,
  emailRaw: string,
  from: Date = new Date()
): Promise<Date | null> {
  const email = normalizeSubscriberEmail(emailRaw);
  const [profile, intel] = await Promise.all([
    prisma.sendTimeProfile.findUnique({
      where: { storeId_email: { storeId, email } },
      select: { bestHour: true, bestDow: true, sampleSize: true },
    }),
    prisma.customerIntelligence.findUnique({
      where: { storeId_email: { storeId, email } },
      select: { optimalSendHour: true, optimalSendDow: true },
    }),
  ]);

  const bestHour =
    profile?.bestHour ?? intel?.optimalSendHour ?? null;
  if (bestHour == null || (profile?.sampleSize ?? 0) < 3) {
    return null;
  }

  const currentHour = from.getUTCHours();
  // Already near optimal (±1 hour) — send now
  if (Math.abs(currentHour - bestHour) <= 1 || Math.abs(currentHour - bestHour) >= 23) {
    return null;
  }

  const target = new Date(from);
  target.setUTCMinutes(0, 0, 0);
  target.setUTCHours(bestHour);
  if (target.getTime() <= from.getTime()) {
    target.setUTCDate(target.getUTCDate() + 1);
  }

  const bestDow = profile?.bestDow ?? intel?.optimalSendDow ?? null;
  if (bestDow != null) {
    // Advance up to 6 days to hit preferred day-of-week
    for (let i = 0; i < 7; i++) {
      if (target.getUTCDay() === bestDow) break;
      target.setUTCDate(target.getUTCDate() + 1);
    }
  }

  // Cap deferral at 24h for campaign throughput (STO soft preference)
  const maxDeferMs = 24 * 60 * 60 * 1000;
  if (target.getTime() - from.getTime() > maxDeferMs) {
    const soft = new Date(from);
    soft.setUTCMinutes(0, 0, 0);
    soft.setUTCHours(bestHour);
    if (soft.getTime() <= from.getTime()) {
      soft.setUTCDate(soft.getUTCDate() + 1);
    }
    return soft;
  }

  return target;
}

/**
 * If the recipient has a strong send-time preference outside the current window,
 * release the claimed job back to pending with a deferred availableAt.
 * Returns true when deferred (caller should skip send).
 */
export async function maybeDeferJobForSendTime(input: {
  jobId: string;
  storeId: string;
  toEmail: string;
  /** Campaign blasts skip STO so merchant schedule wins */
  kind: string;
}): Promise<boolean> {
  if (input.kind === "campaign") return false;

  const next = await nextOptimalSendAt(input.storeId, input.toEmail);
  if (!next) return false;

  await prisma.emailJob.update({
    where: { id: input.jobId },
    data: {
      status: "pending",
      availableAt: next,
      scheduledAt: next,
      lockedAt: null,
      lockedBy: null,
      // Undo the claim increment so retries aren't burned by STO
      attempts: { decrement: 1 },
      lastError: null,
    },
  });
  return true;
}
