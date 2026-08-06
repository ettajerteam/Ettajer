import { prisma } from "@/lib/db";
import {
  normalizeSubscriberEmail,
  type NewsletterSubscriberStatus,
} from "@/lib/newsletter";
import { getAppUrl } from "@/lib/app-url";
import {
  generateUnsubscribeToken,
  signMarketingEmailToken,
  verifySignedMarketingEmailToken,
} from "@/lib/email-marketing/unsubscribe-token";

export {
  generateUnsubscribeToken,
  signMarketingEmailToken,
  verifySignedMarketingEmailToken,
} from "@/lib/email-marketing/unsubscribe-token";

export function buildEmailPreferenceUrls(token: string): {
  preferencesUrl: string;
  unsubscribeUrl: string;
} {
  const base = getAppUrl().replace(/\/$/, "");
  const q = encodeURIComponent(token);
  return {
    preferencesUrl: `${base}/email/preferences?t=${q}`,
    unsubscribeUrl: `${base}/api/email/unsubscribe?t=${q}`,
  };
}

export async function ensureSubscriberUnsubscribeToken(
  subscriberId: string
): Promise<string> {
  const row = await prisma.newsletterSubscriber.findUnique({
    where: { id: subscriberId },
    select: { unsubscribeToken: true },
  });
  if (!row) throw new Error("Subscriber not found");
  if (row.unsubscribeToken) return row.unsubscribeToken;

  for (let i = 0; i < 3; i++) {
    const token = generateUnsubscribeToken();
    try {
      await prisma.newsletterSubscriber.update({
        where: { id: subscriberId },
        data: { unsubscribeToken: token },
      });
      return token;
    } catch {
      // unique collision — retry
    }
  }
  throw new Error("Failed to allocate unsubscribe token");
}

export function isMarketingSendableStatus(status: string): boolean {
  return status === "active";
}

export async function canSendMarketingEmail(
  storeId: string,
  email: string
): Promise<boolean> {
  const normalized = normalizeSubscriberEmail(email);

  const { isEmailSuppressed } = await import(
    "@/lib/email-marketing/suppression"
  );
  const suppressed = await isEmailSuppressed(storeId, normalized);
  if (suppressed.suppressed) return false;

  const row = await prisma.newsletterSubscriber.findUnique({
    where: { storeId_email: { storeId, email: normalized } },
    select: { status: true },
  });
  if (!row) return true;
  return isMarketingSendableStatus(row.status);
}

export async function resolveMarketingCompliance(input: {
  storeId: string;
  email: string;
}): Promise<
  | { allowed: false; reason: string }
  | {
      allowed: true;
      token: string;
      preferencesUrl: string;
      unsubscribeUrl: string;
    }
> {
  const email = normalizeSubscriberEmail(input.email);

  const { isEmailSuppressed } = await import(
    "@/lib/email-marketing/suppression"
  );
  const suppressed = await isEmailSuppressed(input.storeId, email);
  if (suppressed.suppressed) {
    return {
      allowed: false,
      reason: `suppressed:${suppressed.reason || "unknown"}`,
    };
  }

  const row = await prisma.newsletterSubscriber.findUnique({
    where: {
      storeId_email: { storeId: input.storeId, email },
    },
    select: { id: true, status: true, unsubscribeToken: true },
  });

  if (row && !isMarketingSendableStatus(row.status)) {
    return { allowed: false, reason: `status:${row.status}` };
  }

  const token = row
    ? row.unsubscribeToken ||
      (await ensureSubscriberUnsubscribeToken(row.id))
    : signMarketingEmailToken({ storeId: input.storeId, email });

  const urls = buildEmailPreferenceUrls(token);
  return { allowed: true, token, ...urls };
}

export async function resolveTokenToContact(token: string): Promise<{
  storeId: string;
  email: string;
  subscriberId: string | null;
  status: NewsletterSubscriberStatus | null;
} | null> {
  const trimmed = token.trim();
  if (!trimmed) return null;

  const signed = verifySignedMarketingEmailToken(trimmed);
  if (signed) {
    const row = await prisma.newsletterSubscriber.findUnique({
      where: {
        storeId_email: { storeId: signed.storeId, email: signed.email },
      },
      select: { id: true, status: true },
    });
    return {
      storeId: signed.storeId,
      email: signed.email,
      subscriberId: row?.id ?? null,
      status: (row?.status as NewsletterSubscriberStatus) ?? null,
    };
  }

  const row = await prisma.newsletterSubscriber.findFirst({
    where: { unsubscribeToken: trimmed },
    select: { id: true, storeId: true, email: true, status: true },
  });
  if (!row) return null;
  return {
    storeId: row.storeId,
    email: row.email,
    subscriberId: row.id,
    status: row.status as NewsletterSubscriberStatus,
  };
}

export async function applyUnsubscribeFromToken(token: string): Promise<{
  ok: boolean;
  email?: string;
  storeId?: string;
  message: string;
}> {
  const contact = await resolveTokenToContact(token);
  if (!contact) {
    return { ok: false, message: "Invalid or expired link" };
  }

  const existing = contact.subscriberId
    ? await prisma.newsletterSubscriber.findUnique({
        where: { id: contact.subscriberId },
      })
    : await prisma.newsletterSubscriber.findUnique({
        where: {
          storeId_email: {
            storeId: contact.storeId,
            email: contact.email,
          },
        },
      });

  if (existing) {
    if (existing.status === "unsubscribed") {
      return {
        ok: true,
        email: existing.email,
        storeId: existing.storeId,
        message: "You are already unsubscribed",
      };
    }
    await prisma.newsletterSubscriber.update({
      where: { id: existing.id },
      data: {
        status: "unsubscribed",
        unsubscribedAt: new Date(),
        unsubscribeToken:
          existing.unsubscribeToken || generateUnsubscribeToken(),
      },
    });
    void import("@/lib/email-marketing/suppression").then(
      ({ upsertEmailSuppression }) =>
        upsertEmailSuppression({
          storeId: existing.storeId,
          email: existing.email,
          reason: "unsubscribe",
          source: "system",
        })
    );
    void import("@/lib/email-marketing/email-events").then(
      ({ recordUnsubscribeEvent }) =>
        recordUnsubscribeEvent({
          storeId: existing.storeId,
          email: existing.email,
          subscriberId: existing.id,
        })
    );
    return {
      ok: true,
      email: existing.email,
      storeId: existing.storeId,
      message: "You have been unsubscribed",
    };
  }

  const created = await prisma.newsletterSubscriber.create({
    data: {
      storeId: contact.storeId,
      email: contact.email,
      status: "unsubscribed",
      source: "unsubscribe",
      unsubscribeToken: generateUnsubscribeToken(),
      unsubscribedAt: new Date(),
    },
  });

  void import("@/lib/email-marketing/email-events").then(
    ({ recordUnsubscribeEvent }) =>
      recordUnsubscribeEvent({
        storeId: created.storeId,
        email: created.email,
        subscriberId: created.id,
      })
  );

  return {
    ok: true,
    email: contact.email,
    storeId: contact.storeId,
    message: "You have been unsubscribed",
  };
}

export async function applyResubscribeFromToken(token: string): Promise<{
  ok: boolean;
  email?: string;
  storeId?: string;
  message: string;
}> {
  const contact = await resolveTokenToContact(token);
  if (!contact) {
    return { ok: false, message: "Invalid or expired link" };
  }

  const existing = contact.subscriberId
    ? await prisma.newsletterSubscriber.findUnique({
        where: { id: contact.subscriberId },
      })
    : await prisma.newsletterSubscriber.findUnique({
        where: {
          storeId_email: {
            storeId: contact.storeId,
            email: contact.email,
          },
        },
      });

  if (!existing) {
    await prisma.newsletterSubscriber.create({
      data: {
        storeId: contact.storeId,
        email: contact.email,
        status: "active",
        source: "preferences",
        unsubscribeToken: generateUnsubscribeToken(),
        unsubscribedAt: null,
      },
    });
    return {
      ok: true,
      email: contact.email,
      storeId: contact.storeId,
      message: "You are subscribed",
    };
  }

  if (existing.status === "active") {
    return {
      ok: true,
      email: existing.email,
      storeId: existing.storeId,
      message: "You are already subscribed",
    };
  }

  await prisma.newsletterSubscriber.update({
    where: { id: existing.id },
    data: {
      status: "active",
      unsubscribedAt: null,
      source: "preferences",
      unsubscribeToken:
        existing.unsubscribeToken || generateUnsubscribeToken(),
    },
  });

  return {
    ok: true,
    email: existing.email,
    storeId: existing.storeId,
    message: "You are subscribed again",
  };
}

export async function getStoreComplianceIdentity(storeId: string) {
  return prisma.store.findUnique({
    where: { id: storeId },
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      contactEmail: true,
      phone: true,
      primaryColor: true,
    },
  });
}
