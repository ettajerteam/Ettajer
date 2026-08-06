import { prisma } from "@/lib/db";
import {
  deriveOnboardingStatus,
  PAYMENT_ONBOARDING_STATUS,
  type PaymentProvider,
} from "@/lib/payments/constants";
import type { PaymentAccountDTO } from "@/lib/payments/types";
import {
  getStripe,
  getStripeConnectUrls,
  isStripeConnectConfigured,
} from "@/lib/payments/stripe";

export type { PaymentAccountDTO } from "@/lib/payments/types";

function toDTO(row: {
  id: string;
  provider: string;
  accountId: string;
  onboardingStatus: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  createdAt: Date;
  updatedAt: Date;
}): PaymentAccountDTO {
  return {
    id: row.id,
    provider: row.provider as PaymentProvider,
    accountId: row.accountId,
    onboardingStatus: row.onboardingStatus,
    chargesEnabled: row.chargesEnabled,
    payoutsEnabled: row.payoutsEnabled,
    detailsSubmitted: row.detailsSubmitted,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listPaymentAccounts(userId: string): Promise<PaymentAccountDTO[]> {
  const rows = await prisma.paymentAccount.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toDTO);
}

export async function getPaymentAccount(
  userId: string,
  provider: PaymentProvider
): Promise<PaymentAccountDTO | null> {
  const row = await prisma.paymentAccount.findUnique({
    where: { userId_provider: { userId, provider } },
  });
  return row ? toDTO(row) : null;
}

/** Sync Stripe Account object → PaymentAccount + optional store paymentGateways.stripeAccountId */
export async function syncStripeAccountFromStripe(
  userId: string,
  accountId: string
): Promise<PaymentAccountDTO> {
  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(accountId);

  const chargesEnabled = Boolean(account.charges_enabled);
  const payoutsEnabled = Boolean(account.payouts_enabled);
  const detailsSubmitted = Boolean(account.details_submitted);
  const disabled = Boolean(account.requirements?.disabled_reason);
  const onboardingStatus = deriveOnboardingStatus({
    detailsSubmitted,
    chargesEnabled,
    payoutsEnabled,
    disabled,
  });

  const row = await prisma.paymentAccount.upsert({
    where: { userId_provider: { userId, provider: "stripe" } },
    create: {
      userId,
      provider: "stripe",
      accountId,
      onboardingStatus,
      chargesEnabled,
      payoutsEnabled,
      detailsSubmitted,
      metadata: {
        country: account.country ?? null,
        email: account.email ?? null,
        businessType: account.business_type ?? null,
      },
    },
    update: {
      accountId,
      onboardingStatus,
      chargesEnabled,
      payoutsEnabled,
      detailsSubmitted,
      metadata: {
        country: account.country ?? null,
        email: account.email ?? null,
        businessType: account.business_type ?? null,
      },
    },
  });

  // Keep legacy JSON field in sync for storefront / settings toggles
  const store = await prisma.store.findFirst({
    where: { userId },
    include: { settings: true },
  });
  if (store?.settings) {
    const gateways =
      typeof store.settings.paymentGateways === "object" &&
      store.settings.paymentGateways !== null
        ? { ...(store.settings.paymentGateways as Record<string, unknown>) }
        : {};
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        paymentGateways: {
          ...gateways,
          stripeAccountId: accountId,
          // Only auto-enable cards when Connect can actually charge
          stripe: chargesEnabled
            ? true
            : Boolean(gateways.stripe),
        },
      },
    });
  }

  return toDTO(row);
}

/**
 * Create (or reuse) a Stripe Express connected account and return an Account Link URL.
 */
export async function createStripeConnectOnboardingLink(params: {
  userId: string;
  email: string;
  country?: string;
}): Promise<{ url: string; accountId: string }> {
  if (!isStripeConnectConfigured()) {
    throw new Error("Stripe is not configured on this server");
  }

  const stripe = getStripe();
  const existing = await prisma.paymentAccount.findUnique({
    where: { userId_provider: { userId: params.userId, provider: "stripe" } },
  });

  let accountId = existing?.accountId;
  if (!accountId) {
    // Default MA for Ettajer merchants — Stripe may reject if Connect not available there.
    // Merchants outside MA can still complete onboarding; country is a starting hint.
    const country = (params.country || "MA").toUpperCase();
    const account = await stripe.accounts.create({
      type: "express",
      country,
      email: params.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: {
        ettajerUserId: params.userId,
      },
    });
    accountId = account.id;
    await prisma.paymentAccount.create({
      data: {
        userId: params.userId,
        provider: "stripe",
        accountId,
        onboardingStatus: PAYMENT_ONBOARDING_STATUS.PENDING,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      },
    });
  }

  const { returnUrl, refreshUrl } = getStripeConnectUrls();
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });

  await syncStripeAccountFromStripe(params.userId, accountId);
  return { url: link.url, accountId };
}

export async function disconnectStripeAccount(userId: string): Promise<void> {
  const existing = await prisma.paymentAccount.findUnique({
    where: { userId_provider: { userId, provider: "stripe" } },
  });
  if (!existing) return;

  // Best-effort: do not delete the Stripe account remotely (merchant may reuse it).
  // We only unlink from Ettajer.
  await prisma.paymentAccount.delete({
    where: { id: existing.id },
  });

  const store = await prisma.store.findFirst({
    where: { userId },
    include: { settings: true },
  });
  if (store?.settings) {
    const gateways =
      typeof store.settings.paymentGateways === "object" &&
      store.settings.paymentGateways !== null
        ? { ...(store.settings.paymentGateways as Record<string, unknown>) }
        : {};
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        paymentGateways: {
          ...gateways,
          stripe: false,
          stripeAccountId: null,
        },
      },
    });
  }
}

/** Find Ettajer user from Stripe connected account id (webhook). */
export async function findUserIdByStripeAccountId(
  accountId: string
): Promise<string | null> {
  const row = await prisma.paymentAccount.findFirst({
    where: { provider: "stripe", accountId },
    select: { userId: true },
  });
  return row?.userId ?? null;
}
