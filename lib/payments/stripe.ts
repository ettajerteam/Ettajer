import Stripe from "stripe";
import { getAppUrl } from "@/lib/app-url";

export function getStripeSecretKey(): string | undefined {
  return (
    process.env.STRIPE_SECRET_KEY?.trim() ||
    process.env.STRIPE_API_KEY?.trim() ||
    undefined
  );
}

export function getStripeWebhookSecret(): string | undefined {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || undefined;
}

export function isStripeConnectConfigured(): boolean {
  return Boolean(getStripeSecretKey());
}

/** True when platform Stripe secret is a test key (sk_test_…). */
export function isStripeTestMode(): boolean {
  const key = getStripeSecretKey();
  return Boolean(key && key.startsWith("sk_test_"));
}


let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const key = getStripeSecretKey();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return stripeClient;
}

/** Connect return / refresh URLs into Ettajer Settings → Payments */
export function getStripeConnectUrls() {
  const base = getAppUrl();
  return {
    returnUrl: `${base}/dashboard/settings?tab=payment&stripe=return`,
    refreshUrl: `${base}/dashboard/settings?tab=payment&stripe=refresh`,
  };
}
