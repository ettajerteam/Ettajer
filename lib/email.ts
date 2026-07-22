export {
  sendMagicLinkEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendWelcomeEmail,
  sendFounderLaunchAnnounceEmail,
  sendFounderAccessUnlockedEmail,
  sendVerifyEmailReminderEmail,
  sendMerchantNewOrderEmail,
  sendStoreLiveEmail,
  sendSupportConfirmationEmail,
  sendSupportTicketEmail,
  sendNameChangeInviteEmail,
  sendNameChangeConfirmedEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  EMAIL_AUTOMATIONS,
} from "@/lib/email/automations";

export type { EmailAutomationId } from "@/lib/email/automations";
