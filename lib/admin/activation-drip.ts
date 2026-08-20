import { prisma } from "@/lib/db";
import {
  listHotEmptyStoresForNudge,
  listShareStoreNudgeTargets,
} from "@/lib/admin/activation-stats";
import {
  sendFirstProductEmail,
  sendShareStoreEmail,
} from "@/lib/email/automations";
import { isResendConfigured } from "@/lib/resend";
import { normalizeEmail } from "@/lib/password-reset";

const FIRST_PRODUCT_PREFIX = "merchant-nudge:first-product:";
const SHARE_STORE_PREFIX = "merchant-nudge:share-store:";
const COOLDOWN_DAYS = 7;
/** Cap per cron run so we don't blast Resend. */
const MAX_PER_KIND = 25;

function nudgeIdentifier(prefix: string, email: string) {
  return `${prefix}${normalizeEmail(email)}`;
}

async function wasNudgedRecently(identifier: string): Promise<boolean> {
  const row = await prisma.verificationToken.findFirst({
    where: { identifier, expires: { gt: new Date() } },
  });
  return Boolean(row);
}

async function markNudged(identifier: string): Promise<void> {
  const expires = new Date(
    Date.now() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000,
  );
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: {
      identifier,
      token: `${identifier}::${Date.now()}`,
      expires,
    },
  });
}

export type ActivationDripSummary = {
  firstProduct: { considered: number; sent: number; skipped: number; failed: number };
  shareStore: { considered: number; sent: number; skipped: number; failed: number };
  resendConfigured: boolean;
};

export async function runMerchantActivationDrip(options?: {
  dryRun?: boolean;
  maxFirstProduct?: number;
  maxShareStore?: number;
}): Promise<ActivationDripSummary> {
  const dryRun = options?.dryRun ?? false;
  const maxFirstProduct = options?.maxFirstProduct ?? MAX_PER_KIND;
  const maxShareStore = options?.maxShareStore ?? MAX_PER_KIND;
  const resendConfigured = isResendConfigured();

  const summary: ActivationDripSummary = {
    firstProduct: { considered: 0, sent: 0, skipped: 0, failed: 0 },
    shareStore: { considered: 0, sent: 0, skipped: 0, failed: 0 },
    resendConfigured,
  };

  const hotEmpty = await listHotEmptyStoresForNudge();
  const byEmailEmpty = new Map<string, (typeof hotEmpty)[number]>();
  for (const row of hotEmpty) {
    if (!byEmailEmpty.has(row.ownerEmail)) {
      byEmailEmpty.set(row.ownerEmail, row);
    }
  }
  const emptyTargets = Array.from(byEmailEmpty.values()).slice(0, maxFirstProduct);
  summary.firstProduct.considered = emptyTargets.length;

  for (const t of emptyTargets) {
    const id = nudgeIdentifier(FIRST_PRODUCT_PREFIX, t.ownerEmail);
    if (await wasNudgedRecently(id)) {
      summary.firstProduct.skipped += 1;
      continue;
    }
    if (dryRun || !resendConfigured) {
      summary.firstProduct.skipped += 1;
      continue;
    }
    const ok = await sendFirstProductEmail({
      to: t.ownerEmail,
      merchantName: t.ownerName ?? "Merchant",
      storeName: t.storeName,
      locale: "fr",
    });
    if (ok) {
      await markNudged(id);
      summary.firstProduct.sent += 1;
    } else {
      summary.firstProduct.failed += 1;
    }
  }

  const shareTargets = (await listShareStoreNudgeTargets()).slice(
    0,
    maxShareStore,
  );
  summary.shareStore.considered = shareTargets.length;

  for (const t of shareTargets) {
    const id = nudgeIdentifier(SHARE_STORE_PREFIX, t.ownerEmail);
    if (await wasNudgedRecently(id)) {
      summary.shareStore.skipped += 1;
      continue;
    }
    if (dryRun || !resendConfigured) {
      summary.shareStore.skipped += 1;
      continue;
    }
    const ok = await sendShareStoreEmail({
      to: t.ownerEmail,
      merchantName: t.ownerName ?? "Merchant",
      storeName: t.storeName,
      storeSlug: t.slug,
      locale: "fr",
    });
    if (ok) {
      await markNudged(id);
      summary.shareStore.sent += 1;
    } else {
      summary.shareStore.failed += 1;
    }
  }

  return summary;
}

/** Mark today's manual blast so the cron doesn't re-send for 7 days. */
export async function seedNudgeCooldowns(params: {
  firstProductEmails: string[];
  shareStoreEmails: string[];
}): Promise<void> {
  for (const email of params.firstProductEmails) {
    await markNudged(nudgeIdentifier(FIRST_PRODUCT_PREFIX, email));
  }
  for (const email of params.shareStoreEmails) {
    await markNudged(nudgeIdentifier(SHARE_STORE_PREFIX, email));
  }
}
