/** Stripe card checkout is built but not merchant-activatable yet. */
export const STRIPE_PAYMENTS_COMING_SOON = true;

/** Rough public ETA shown in Settings / Help. */
export const STRIPE_AVAILABLE_AROUND = "October 2026";

export const STRIPE_COMING_SOON_SHORT =
  "Coming in about 2 months — cards will turn on then.";

export const STRIPE_COMING_SOON_DETAIL =
  "Stripe card payments (Apple Pay & Google Pay) are not available to activate yet. We expect to turn this on around October 2026. Use COD and PayPal until then — money from PayPal already goes to your account.";

export function isStripePaymentsAvailable(): boolean {
  return !STRIPE_PAYMENTS_COMING_SOON;
}
