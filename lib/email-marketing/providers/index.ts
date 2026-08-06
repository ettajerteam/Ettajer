import { resendSendAdapter } from "@/lib/email-marketing/providers/resend";
import { postmarkSendAdapter } from "@/lib/email-marketing/providers/postmark";
import { sendgridSendAdapter } from "@/lib/email-marketing/providers/sendgrid";
import { sesSendAdapter } from "@/lib/email-marketing/providers/ses";
import {
  EMAIL_SEND_PROVIDERS,
  isEmailSendProviderId,
  type EmailProviderStatus,
  type EmailSendAdapter,
  type EmailSendMessage,
  type EmailSendProviderId,
  type EmailSendResult,
} from "@/lib/email-marketing/providers/types";
import { listEmailWebhookProviders } from "@/lib/email-marketing/webhooks/registry";

const ADAPTERS: Record<EmailSendProviderId, EmailSendAdapter> = {
  resend: resendSendAdapter,
  postmark: postmarkSendAdapter,
  sendgrid: sendgridSendAdapter,
  ses: sesSendAdapter,
};

/**
 * Active outbound ESP — set EMAIL_PROVIDER=resend|postmark|sendgrid|ses
 * Falls back to the first configured provider, preferring Resend.
 */
export function getActiveEmailProviderId(): EmailSendProviderId {
  const preferred = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (preferred && isEmailSendProviderId(preferred)) {
    return preferred;
  }
  for (const id of EMAIL_SEND_PROVIDERS) {
    if (ADAPTERS[id].isConfigured()) return id;
  }
  return "resend";
}

export function getEmailSendAdapter(
  providerId?: EmailSendProviderId | string | null
): EmailSendAdapter {
  if (providerId && isEmailSendProviderId(providerId)) {
    return ADAPTERS[providerId];
  }
  return ADAPTERS[getActiveEmailProviderId()];
}

export function listEmailSendAdapters(): EmailSendAdapter[] {
  return EMAIL_SEND_PROVIDERS.map((id) => ADAPTERS[id]);
}

export function isAnyEmailProviderConfigured(): boolean {
  return listEmailSendAdapters().some((a) => a.isConfigured());
}

export async function sendMarketingEmail(
  message: EmailSendMessage,
  providerId?: EmailSendProviderId | null,
  options?: {
    storeId?: string | null;
    emailJobId?: string | null;
    campaignId?: string | null;
    category?: string | null;
  }
): Promise<EmailSendResult> {
  // MailHub: prefer merchant-configured provider when store-scoped
  if (options?.storeId) {
    try {
      const { sendViaMailHub } = await import("@/lib/mailhub/providers");
      const result = await sendViaMailHub({
        storeId: options.storeId,
        purpose: "marketing",
        message,
        category: options.category ?? "marketing",
        campaignId: options.campaignId ?? null,
        emailJobId: options.emailJobId ?? null,
      });
      return {
        success: result.success,
        id: result.id,
        error: result.error,
        retryable: result.retryable,
        provider: (isEmailSendProviderId(result.provider)
          ? result.provider
          : getActiveEmailProviderId()) as EmailSendProviderId,
      };
    } catch (error) {
      console.error("[sendMarketingEmail/mailhub]", error);
      // fall through to platform ESP
    }
  }

  const adapter = getEmailSendAdapter(providerId);
  if (!adapter.isConfigured()) {
    return {
      success: false,
      error: `${adapter.label} is not configured`,
      retryable: true,
      provider: adapter.id,
    };
  }
  return adapter.send(message);
}

export function getEmailProvidersStatus(): EmailProviderStatus[] {
  const webhookProviders = new Set(
    listEmailWebhookProviders().map((p) => p.toLowerCase())
  );
  const activeId = getActiveEmailProviderId();
  return listEmailSendAdapters().map((adapter) => {
    const status = adapter.getStatus({
      webhookRegistered: webhookProviders.has(adapter.id),
    });
    return {
      ...status,
      active: adapter.id === activeId && status.configured,
      health:
        adapter.id === activeId && !status.configured
          ? "degraded"
          : status.health === "configured" && adapter.id !== activeId
            ? "inactive"
            : status.health,
    };
  });
}

export type {
  EmailSendAdapter,
  EmailSendMessage,
  EmailSendResult,
  EmailSendProviderId,
  EmailProviderStatus,
} from "@/lib/email-marketing/providers/types";
