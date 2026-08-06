/** Merchant payment account statuses (provider-agnostic). */
export const PAYMENT_PROVIDERS = ["stripe", "paypal", "payoneer", "mangopay"] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export const PAYMENT_ONBOARDING_STATUS = {
  NOT_STARTED: "not_started",
  PENDING: "pending",
  RESTRICTED: "restricted",
  ACTIVE: "active",
  DISABLED: "disabled",
} as const;

export type PaymentOnboardingStatus =
  (typeof PAYMENT_ONBOARDING_STATUS)[keyof typeof PAYMENT_ONBOARDING_STATUS];

export function deriveOnboardingStatus(input: {
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  disabled?: boolean;
}): PaymentOnboardingStatus {
  if (input.disabled) return PAYMENT_ONBOARDING_STATUS.DISABLED;
  if (input.chargesEnabled && input.payoutsEnabled) {
    return PAYMENT_ONBOARDING_STATUS.ACTIVE;
  }
  if (input.detailsSubmitted) return PAYMENT_ONBOARDING_STATUS.PENDING;
  if (!input.detailsSubmitted && !input.chargesEnabled) {
    return PAYMENT_ONBOARDING_STATUS.NOT_STARTED;
  }
  return PAYMENT_ONBOARDING_STATUS.RESTRICTED;
}
