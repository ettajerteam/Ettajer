import type { PaymentProvider } from "@/lib/payments/constants";

export type PaymentAccountDTO = {
  id: string;
  provider: PaymentProvider;
  accountId: string;
  onboardingStatus: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  createdAt: string;
  updatedAt: string;
};
