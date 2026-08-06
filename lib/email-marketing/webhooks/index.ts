import "@/lib/email-marketing/webhooks/resend";
import "@/lib/email-marketing/webhooks/postmark";
import "@/lib/email-marketing/webhooks/sendgrid";
import "@/lib/email-marketing/webhooks/ses";

export {
  getEmailWebhookAdapter,
  listEmailWebhookProviders,
  registerEmailWebhookAdapter,
} from "@/lib/email-marketing/webhooks/registry";
