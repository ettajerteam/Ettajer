import { listEmailWebhookProviders } from "@/lib/email-marketing/webhooks";
import {
  getActiveEmailProviderId,
  getEmailProvidersStatus,
} from "@/lib/email-marketing/providers";
import { getSenderReputation } from "@/lib/email-marketing/reputation";
import {
  countEmailSuppressions,
  listEmailSuppressions,
} from "@/lib/email-marketing/suppression";
import { listSendingDomains } from "@/lib/email-marketing/sending-domains";
import {
  EMAIL_QUEUE_MAX_ATTEMPTS,
  computeBackoffMs,
} from "@/lib/email-marketing/email-queue-types";
import { parseEmailFromHeader } from "@/lib/email-marketing/providers/types";
import { getEmailFrom } from "@/lib/resend";

export async function getDeliverabilityBundle(storeId: string) {
  const [reputation, domains, suppressions, suppressionCount] =
    await Promise.all([
      getSenderReputation(storeId, 30),
      listSendingDomains(storeId),
      listEmailSuppressions(storeId, { take: 50 }),
      countEmailSuppressions(storeId),
    ]);

  const providers = getEmailProvidersStatus();
  const activeProvider = getActiveEmailProviderId();
  const from = getEmailFrom();
  const { domain: fromDomain } = parseEmailFromHeader(from);

  return {
    reputation,
    providers,
    activeProvider,
    webhookProviders: listEmailWebhookProviders(),
    domains,
    suppressions,
    suppressionCount,
    sender: {
      from,
      domain: fromDomain,
    },
    retries: {
      maxAttempts: EMAIL_QUEUE_MAX_ATTEMPTS,
      backoffSeconds: [1, 2, 3, 4, 5].map((attempt) =>
        Math.round(computeBackoffMs(attempt) / 1000)
      ),
      description:
        "Failed sends retry automatically with exponential backoff. Hard bounces and complaints are suppressed and never retried.",
    },
  };
}

export type DeliverabilityBundle = Awaited<
  ReturnType<typeof getDeliverabilityBundle>
>;
