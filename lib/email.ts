export {
  sendMagicLinkEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendWelcomeEmail,
  sendSupportConfirmationEmail,
  sendSupportTicketEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  EMAIL_AUTOMATIONS,
} from "@/lib/email/automations";

export type { EmailAutomationId } from "@/lib/email/automations";
