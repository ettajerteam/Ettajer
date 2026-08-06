import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { normalizeSubscriberEmail } from "@/lib/newsletter";
import type { EmailSuppressionReason } from "@/lib/email-marketing/providers/types";

const SOFT_BOUNCE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface EmailSuppressionRow {
  id: string;
  email: string;
  reason: EmailSuppressionReason | string;
  bounceType: string | null;
  source: string;
  expiresAt: string | null;
  createdAt: string;
}

export function serializeSuppression(row: {
  id: string;
  email: string;
  reason: string;
  bounceType: string | null;
  source: string;
  expiresAt: Date | null;
  createdAt: Date;
}): EmailSuppressionRow {
  return {
    id: row.id,
    email: row.email,
    reason: row.reason,
    bounceType: row.bounceType,
    source: row.source,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

/** True when address is currently suppressed (permanent or unexpired soft). */
export async function isEmailSuppressed(
  storeId: string,
  email: string
): Promise<{ suppressed: boolean; reason?: string }> {
  const normalized = normalizeSubscriberEmail(email);
  const row = await prisma.emailSuppression.findUnique({
    where: { storeId_email: { storeId, email: normalized } },
    select: { reason: true, expiresAt: true },
  });
  if (!row) return { suppressed: false };
  if (row.expiresAt && row.expiresAt.getTime() <= Date.now()) {
    await prisma.emailSuppression
      .delete({ where: { storeId_email: { storeId, email: normalized } } })
      .catch(() => undefined);
    return { suppressed: false };
  }
  return { suppressed: true, reason: row.reason };
}

export async function upsertEmailSuppression(input: {
  storeId: string;
  email: string;
  reason: EmailSuppressionReason;
  bounceType?: "hard" | "soft" | null;
  source?: string;
  metadata?: Record<string, unknown> | null;
}): Promise<void> {
  const email = normalizeSubscriberEmail(input.email);
  if (!email) return;

  const bounceType = input.bounceType ?? null;
  const expiresAt =
    input.reason === "bounce" && bounceType === "soft"
      ? new Date(Date.now() + SOFT_BOUNCE_TTL_MS)
      : null;

  // Soft bounce must not overwrite a permanent suppression
  if (bounceType === "soft") {
    const existing = await prisma.emailSuppression.findUnique({
      where: { storeId_email: { storeId: input.storeId, email } },
      select: { reason: true, bounceType: true, expiresAt: true },
    });
    if (
      existing &&
      (existing.reason === "complaint" ||
        existing.reason === "unsubscribe" ||
        existing.reason === "manual" ||
        existing.bounceType === "hard" ||
        (existing.expiresAt == null && existing.reason === "bounce"))
    ) {
      return;
    }
  }

  await prisma.emailSuppression.upsert({
    where: { storeId_email: { storeId: input.storeId, email } },
    create: {
      storeId: input.storeId,
      email,
      reason: input.reason,
      bounceType,
      source: input.source || "system",
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      expiresAt,
    },
    update: {
      reason: input.reason,
      bounceType,
      source: input.source || "system",
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      expiresAt,
    },
  });

  // Mirror onto subscriber status for audience UI
  if (input.reason === "bounce" || input.reason === "complaint") {
    const status =
      input.reason === "complaint"
        ? "complained"
        : bounceType === "soft"
          ? "active" // soft: keep sendable after TTL; temporary block via suppression only
          : "bounced";
    if (status !== "active") {
      await prisma.newsletterSubscriber
        .updateMany({
          where: { storeId: input.storeId, email, status: "active" },
          data: { status, unsubscribedAt: new Date() },
        })
        .catch(() => undefined);
    }
  } else if (input.reason === "unsubscribe") {
    await prisma.newsletterSubscriber
      .updateMany({
        where: { storeId: input.storeId, email, status: "active" },
        data: { status: "unsubscribed", unsubscribedAt: new Date() },
      })
      .catch(() => undefined);
  }
}

export async function removeEmailSuppression(storeId: string, email: string) {
  const normalized = normalizeSubscriberEmail(email);
  await prisma.emailSuppression.deleteMany({
    where: { storeId, email: normalized },
  });
}

export async function listEmailSuppressions(
  storeId: string,
  opts?: { take?: number; reason?: string }
) {
  const now = new Date();
  const rows = await prisma.emailSuppression.findMany({
    where: {
      storeId,
      ...(opts?.reason ? { reason: opts.reason } : {}),
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { createdAt: "desc" },
    take: opts?.take ?? 100,
  });
  return rows.map(serializeSuppression);
}

export async function countEmailSuppressions(storeId: string) {
  const now = new Date();
  return prisma.emailSuppression.count({
    where: {
      storeId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
  });
}

/** Infer hard vs soft bounce from provider metadata. */
export function inferBounceType(
  metadata: Record<string, unknown> | null | undefined
): "hard" | "soft" {
  if (!metadata) return "hard";
  const raw = JSON.stringify(metadata).toLowerCase();
  if (
    raw.includes("transient") ||
    raw.includes('"type":"soft"') ||
    raw.includes("soft_bounce") ||
    raw.includes("softbounce") ||
    raw.includes("mailbox_full") ||
    raw.includes("out_of_office") ||
    raw.includes('"bouncetype":"transient"')
  ) {
    return "soft";
  }
  return "hard";
}
