import {
  sendEmail as sendViaResend,
  isResendConfigured,
  getEmailFrom,
} from "@/lib/resend";
import { buildProviderDnsExpectations } from "@/lib/email-marketing/providers/dns-expectations";
import type {
  EmailProviderStatus,
  EmailSendAdapter,
  EmailSendMessage,
  EmailSendResult,
} from "@/lib/email-marketing/providers/types";

export const resendSendAdapter: EmailSendAdapter = {
  id: "resend",
  label: "Resend",
  docsUrl: "https://resend.com/docs",
  isConfigured: () => isResendConfigured(),
  getStatus(input) {
    const configured = isResendConfigured();
    return {
      id: "resend",
      label: "Resend",
      configured,
      active: false,
      health: configured ? "configured" : "missing_credentials",
      webhookPath: "/api/webhooks/email/resend",
      webhookRegistered: Boolean(input?.webhookRegistered),
      envHints: ["RESEND_API_KEY", "RESEND_WEBHOOK_SECRET", "EMAIL_FROM"],
      docsUrl: "https://resend.com/docs",
    } satisfies EmailProviderStatus;
  },
  async send(message: EmailSendMessage): Promise<EmailSendResult> {
    const result = await sendViaResend({
      ...message,
      from: message.from ?? getEmailFrom(),
    });
    return {
      success: result.success,
      id: result.id,
      error: result.error,
      retryable: !result.success,
      provider: "resend",
    };
  },
  getDnsExpectations(domain) {
    return buildProviderDnsExpectations("resend", domain);
  },
};
