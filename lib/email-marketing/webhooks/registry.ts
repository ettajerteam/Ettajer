import type { NormalizedEmailEventInput } from "@/lib/email-marketing/email-analytics-types";

/**
 * Provider webhook adapters map raw payloads → NormalizedEmailEventInput[].
 * Add a new ESP by registering an adapter — ingest stays unchanged.
 */
export type EmailWebhookAdapter = {
  provider: string;
  /**
   * Verify signature / auth. Return false to reject with 401.
   * `secret` comes from env (e.g. RESEND_WEBHOOK_SECRET).
   */
  verify?: (input: {
    rawBody: string;
    headers: Headers;
    secret: string | undefined;
  }) => boolean | Promise<boolean>;
  normalize: (input: {
    payload: unknown;
    rawBody: string;
    headers: Headers;
  }) => NormalizedEmailEventInput[] | Promise<NormalizedEmailEventInput[]>;
};

const adapters = new Map<string, EmailWebhookAdapter>();

export function registerEmailWebhookAdapter(adapter: EmailWebhookAdapter) {
  adapters.set(adapter.provider.toLowerCase(), adapter);
}

export function getEmailWebhookAdapter(
  provider: string
): EmailWebhookAdapter | undefined {
  return adapters.get(provider.toLowerCase());
}

export function listEmailWebhookProviders(): string[] {
  return Array.from(adapters.keys());
}
