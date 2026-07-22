import { sendEmail } from "@/lib/resend";
import { SUPPORT_EMAIL } from "@/lib/constants/support";
import { recordOutboundSupportMessage } from "@/lib/admin/record-outbound-support-message";
import {
  nameChangeConfirmedInboxMessage,
  nameChangeInviteInboxMessage,
} from "@/lib/admin/support-outbound-messages";
import {
  generateFounderCardAssets,
  getFounderAttachmentNames,
} from "@/lib/founder/founder-card-assets";
import {
  buildMagicLinkEmailHtml,
  buildOrderConfirmationEmailHtml,
  buildOrderStatusEmailHtml,
  buildAbandonedCartEmailHtml,
  buildPasswordChangedEmailHtml,
  buildPasswordResetEmailHtml,
  buildSupportConfirmationEmailHtml,
  buildSupportTicketEmailHtml,
  buildWelcomeEmailHtml,
  buildFounderWelcomeEmailHtml,
  buildFounderLaunchAnnounceEmailHtml,
  buildFounderBetaTestingEmailHtml,
  buildFounderAccessUnlockedEmailHtml,
  buildVerifyEmailReminderEmailHtml,
  buildMerchantNewOrderEmailHtml,
  buildStoreLiveEmailHtml,
  buildActivationCodeEmailHtml,
  buildNameChangeInviteEmailHtml,
  buildNameChangeConfirmedEmailHtml,
  FOUNDER_CARD_INLINE_CID,
} from "@/lib/email/templates";
import { getEmailCopy } from "@/lib/email/email-i18n";
import { parseEmailLocale } from "@/lib/email/email-locale";
import { getStoreUrl } from "@/lib/storefront-urls";
import type { LandingLocale } from "@/lib/landing/landing-i18n";
import type { OrderStatus } from "@/types";

export const EMAIL_AUTOMATIONS = {
  AUTH_MAGIC_LINK: "auth.magic_link",
  AUTH_PASSWORD_RESET: "auth.password_reset",
  AUTH_PASSWORD_CHANGED: "auth.password_changed",
  AUTH_WELCOME: "auth.welcome",
  AUTH_FOUNDER_WELCOME: "auth.founder_welcome",
  AUTH_ACTIVATION: "auth.activation",
  FOUNDER_LAUNCH_ANNOUNCE: "founder.launch_announce",
  FOUNDER_BETA_TESTING: "founder.beta_testing",
  FOUNDER_ACCESS_UNLOCKED: "founder.access_unlocked",
  FOUNDER_VERIFY_REMINDER: "founder.verify_reminder",
  MERCHANT_NEW_ORDER: "merchant.new_order",
  MERCHANT_STORE_LIVE: "merchant.store_live",
  SUPPORT_RECEIVED: "support.received",
  SUPPORT_TICKET: "support.ticket",
  NAME_CHANGE_INVITE: "account.name_change_invite",
  NAME_CHANGE_CONFIRMED: "account.name_change_confirmed",
  ORDER_CONFIRMED: "order.confirmed",
  ORDER_STATUS: "order.status",
  MARKETING_ABANDONED_CART: "marketing.abandoned_cart",
} as const;

export type EmailAutomationId =
  (typeof EMAIL_AUTOMATIONS)[keyof typeof EMAIL_AUTOMATIONS];

interface SendResult {
  success: boolean;
  error?: string;
  automation: EmailAutomationId;
}

function emailLocale(locale?: string | null): LandingLocale {
  return parseEmailLocale(locale);
}

async function dispatch(
  automation: EmailAutomationId,
  payload: {
    to: string;
    subject: string;
    html: string;
    replyTo?: string;
    attachments?: {
      filename: string;
      content: Buffer | string;
      contentType?: string;
      inlineContentId?: string;
    }[];
  },
): Promise<SendResult> {
  const result = await sendEmail({
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    replyTo: payload.replyTo,
    attachments: payload.attachments,
  });

  if (!result.success) {
    console.error(`[email:${automation}] failed:`, result.error);
  }

  return { ...result, automation };
}

export async function sendMagicLinkEmail(
  email: string,
  url: string,
  locale?: string | null,
): Promise<boolean> {
  const loc = emailLocale(locale);
  const copy = getEmailCopy(loc);
  const result = await dispatch(EMAIL_AUTOMATIONS.AUTH_MAGIC_LINK, {
    to: email,
    subject: copy.magicLink.subject,
    html: buildMagicLinkEmailHtml(url, email, loc),
  });
  return result.success;
}

export async function sendPasswordResetEmail(
  email: string,
  url: string,
  locale?: string | null,
): Promise<boolean> {
  const loc = emailLocale(locale);
  const copy = getEmailCopy(loc);
  const result = await dispatch(EMAIL_AUTOMATIONS.AUTH_PASSWORD_RESET, {
    to: email,
    subject: copy.passwordReset.subject,
    html: buildPasswordResetEmailHtml(url, email, loc),
  });
  return result.success;
}

export async function sendPasswordChangedEmail(
  email: string,
  locale?: string | null,
): Promise<boolean> {
  const loc = emailLocale(locale);
  const copy = getEmailCopy(loc);
  const result = await dispatch(EMAIL_AUTOMATIONS.AUTH_PASSWORD_CHANGED, {
    to: email,
    subject: copy.passwordChanged.subject,
    html: buildPasswordChangedEmailHtml(email, loc),
  });
  return result.success;
}

export async function sendWelcomeEmail(
  email: string,
  name?: string | null,
  locale?: string | null,
): Promise<boolean> {
  const loc = emailLocale(locale);
  const copy = getEmailCopy(loc);
  const result = await dispatch(EMAIL_AUTOMATIONS.AUTH_WELCOME, {
    to: email,
    subject: copy.welcome.subject,
    html: buildWelcomeEmailHtml(name ?? null, email, loc),
  });
  return result.success;
}

export async function sendActivationCodeEmail(
  email: string,
  name: string,
  code: string,
  locale?: string | null,
): Promise<boolean> {
  const loc = emailLocale(locale);
  const copy = getEmailCopy(loc);
  const result = await dispatch(EMAIL_AUTOMATIONS.AUTH_ACTIVATION, {
    to: email,
    subject: copy.activation.subject(code),
    html: buildActivationCodeEmailHtml(name, email, code, loc),
  });
  return result.success;
}

export async function sendFounderWelcomeEmail(
  email: string,
  name: string,
  founderNumber: number,
  locale?: string | null,
): Promise<boolean> {
  const loc = emailLocale(locale);
  const copy = getEmailCopy(loc);
  const padded = String(founderNumber).padStart(4, "0");

  try {
    const assets = await generateFounderCardAssets(name, founderNumber);
    const filenames = getFounderAttachmentNames(founderNumber);

    const result = await dispatch(EMAIL_AUTOMATIONS.AUTH_FOUNDER_WELCOME, {
      to: email,
      subject: copy.founderWelcome.subject(padded),
      html: buildFounderWelcomeEmailHtml(name, founderNumber, {
        cid: FOUNDER_CARD_INLINE_CID,
      }, loc),
      attachments: [
        {
          filename: "founder-card-inline.png",
          content: assets.pngBuffer,
          contentType: "image/png",
          inlineContentId: FOUNDER_CARD_INLINE_CID,
        },
        { filename: filenames.png, content: assets.pngBuffer, contentType: "image/png" },
        {
          filename: filenames.pdf,
          content: assets.pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    return result.success;
  } catch (error) {
    console.error("[email:auth.founder_welcome] asset generation failed:", error);

    const fallback = await dispatch(EMAIL_AUTOMATIONS.AUTH_FOUNDER_WELCOME, {
      to: email,
      subject: copy.founderWelcome.subject(padded),
      html: buildFounderWelcomeEmailHtml(name, founderNumber, undefined, loc),
    });

    return fallback.success;
  }
}

const LAUNCH_DATE_LABEL: Record<LandingLocale, string> = {
  en: "Thursday 23 July 2026",
  fr: "jeudi 23 juillet 2026",
  ar: "الخميس 23 يوليو 2026",
};

export async function sendFounderLaunchAnnounceEmail(
  email: string,
  name: string | null,
  founderNumber: number,
  locale?: string | null,
): Promise<boolean> {
  const loc = emailLocale(locale);
  const copy = getEmailCopy(loc);
  const result = await dispatch(EMAIL_AUTOMATIONS.FOUNDER_LAUNCH_ANNOUNCE, {
    to: email,
    subject: copy.founderLaunchAnnounce.subject,
    html: buildFounderLaunchAnnounceEmailHtml(
      name,
      founderNumber,
      LAUNCH_DATE_LABEL[loc],
      loc,
    ),
  });
  return result.success;
}

export async function sendFounderBetaTestingEmail(
  email: string,
  name: string | null,
  founderNumber: number,
  locale?: string | null,
): Promise<boolean> {
  const loc = emailLocale(locale);
  const copy = getEmailCopy(loc);
  const result = await dispatch(EMAIL_AUTOMATIONS.FOUNDER_BETA_TESTING, {
    to: email,
    subject: copy.founderBetaTesting.subject,
    html: buildFounderBetaTestingEmailHtml(
      name,
      founderNumber,
      LAUNCH_DATE_LABEL[loc],
      loc,
    ),
    replyTo: SUPPORT_EMAIL,
  });
  return result.success;
}

export async function sendFounderAccessUnlockedEmail(
  email: string,
  name: string | null,
  founderNumber: number,
  locale?: string | null,
): Promise<boolean> {
  const loc = emailLocale(locale);
  const copy = getEmailCopy(loc);
  const result = await dispatch(EMAIL_AUTOMATIONS.FOUNDER_ACCESS_UNLOCKED, {
    to: email,
    subject: copy.founderAccessUnlocked.subject,
    html: buildFounderAccessUnlockedEmailHtml(name, founderNumber, loc),
  });
  return result.success;
}

export async function sendVerifyEmailReminderEmail(
  email: string,
  name: string | null,
  locale?: string | null,
): Promise<boolean> {
  const loc = emailLocale(locale);
  const copy = getEmailCopy(loc);
  const result = await dispatch(EMAIL_AUTOMATIONS.FOUNDER_VERIFY_REMINDER, {
    to: email,
    subject: copy.verifyEmailReminder.subject,
    html: buildVerifyEmailReminderEmailHtml(
      name,
      email,
      LAUNCH_DATE_LABEL[loc],
      loc,
    ),
  });
  return result.success;
}

export async function sendMerchantNewOrderEmail(params: {
  to: string;
  merchantName: string;
  orderNumber: string;
  customerName: string;
  total: number;
  currency: string;
  orderId: string;
  locale?: string | null;
}): Promise<boolean> {
  const loc = emailLocale(params.locale);
  const copy = getEmailCopy(loc);
  const result = await dispatch(EMAIL_AUTOMATIONS.MERCHANT_NEW_ORDER, {
    to: params.to,
    subject: copy.merchantNewOrder.subject(params.orderNumber),
    html: buildMerchantNewOrderEmailHtml(
      {
        merchantName: params.merchantName,
        orderNumber: params.orderNumber,
        customerName: params.customerName,
        total: params.total,
        currency: params.currency,
        orderId: params.orderId,
      },
      loc,
    ),
  });
  return result.success;
}

export async function sendStoreLiveEmail(params: {
  to: string;
  merchantName: string;
  storeName: string;
  storeSlug: string;
  locale?: string | null;
}): Promise<boolean> {
  const loc = emailLocale(params.locale);
  const copy = getEmailCopy(loc);
  const result = await dispatch(EMAIL_AUTOMATIONS.MERCHANT_STORE_LIVE, {
    to: params.to,
    subject: copy.storeLive.subject(params.storeName),
    html: buildStoreLiveEmailHtml(
      params.merchantName,
      params.storeName,
      params.storeSlug,
      loc,
    ),
  });
  return result.success;
}

export async function sendSupportConfirmationEmail(
  email: string,
  name: string,
  topic: string,
  locale?: string | null,
): Promise<boolean> {
  const loc = emailLocale(locale);
  const copy = getEmailCopy(loc);
  const result = await dispatch(EMAIL_AUTOMATIONS.SUPPORT_RECEIVED, {
    to: email,
    subject: copy.supportConfirmation.subject,
    html: buildSupportConfirmationEmailHtml(name, topic, loc),
    replyTo: SUPPORT_EMAIL,
  });
  return result.success;
}

export async function sendSupportTicketEmail(params: {
  name: string;
  email: string;
  topic: string;
  message: string;
  articleRef?: string;
  subject: string;
  locale?: string | null;
}): Promise<boolean> {
  const loc = emailLocale(params.locale);
  const result = await dispatch(EMAIL_AUTOMATIONS.SUPPORT_TICKET, {
    to: SUPPORT_EMAIL,
    subject: params.subject,
    html: buildSupportTicketEmailHtml(params, loc),
    replyTo: params.email,
  });
  return result.success;
}

export async function sendNameChangeInviteEmail(params: {
  email: string;
  name: string;
  currentName: string;
  url: string;
  locale?: string | null;
}): Promise<boolean> {
  const loc = emailLocale(params.locale);
  const copy = getEmailCopy(loc);
  const result = await dispatch(EMAIL_AUTOMATIONS.NAME_CHANGE_INVITE, {
    to: params.email,
    subject: copy.nameChangeInvite.subject,
    html: buildNameChangeInviteEmailHtml(
      {
        name: params.name,
        currentName: params.currentName,
        url: params.url,
      },
      loc,
    ),
    replyTo: SUPPORT_EMAIL,
  });

  if (result.success) {
    await recordOutboundSupportMessage({
      email: params.email,
      topic: copy.nameChangeInvite.subject,
      message: nameChangeInviteInboxMessage(params.currentName, loc),
    });
  }

  return result.success;
}

export async function sendNameChangeConfirmedEmail(params: {
  email: string;
  name: string;
  previousName: string | null;
  locale?: string | null;
}): Promise<boolean> {
  const loc = emailLocale(params.locale);
  const copy = getEmailCopy(loc);
  const previous = params.previousName?.trim() || "—";
  const result = await dispatch(EMAIL_AUTOMATIONS.NAME_CHANGE_CONFIRMED, {
    to: params.email,
    subject: copy.nameChangeConfirmed.subject,
    html: buildNameChangeConfirmedEmailHtml(
      {
        name: params.name,
        previousName: previous,
        newName: params.name,
      },
      loc,
    ),
    replyTo: SUPPORT_EMAIL,
  });

  if (result.success) {
    await recordOutboundSupportMessage({
      email: params.email,
      topic: copy.nameChangeConfirmed.subject,
      message: nameChangeConfirmedInboxMessage(previous, params.name, loc),
    });
  }

  return result.success;
}

export async function sendOrderConfirmationEmail(params: {
  to: string;
  customerName: string;
  orderNumber: string;
  storeName: string;
  currency: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: { title: string; quantity: number; price: number }[];
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  locale?: string | null;
}): Promise<boolean> {
  const loc = emailLocale(params.locale);
  const copy = getEmailCopy(loc);
  const result = await dispatch(EMAIL_AUTOMATIONS.ORDER_CONFIRMED, {
    to: params.to,
    subject: copy.orderConfirmed.subject(params.orderNumber),
    html: buildOrderConfirmationEmailHtml(params, loc),
  });
  return result.success;
}

export async function sendOrderStatusEmail(params: {
  to: string;
  customerName: string;
  orderNumber: string;
  status: OrderStatus;
  storeName: string;
  total: number;
  currency: string;
  note?: string;
  locale?: string | null;
}): Promise<boolean> {
  const loc = emailLocale(params.locale);
  const copy = getEmailCopy(loc);
  const statusLabel = copy.orderStatus.statuses[params.status].label;
  const result = await dispatch(EMAIL_AUTOMATIONS.ORDER_STATUS, {
    to: params.to,
    subject: copy.orderStatus.subject(params.orderNumber, statusLabel),
    html: buildOrderStatusEmailHtml(params, loc),
  });
  return result.success;
}

export async function sendAbandonedCartEmail(params: {
  to: string;
  customerName: string;
  storeName: string;
  storeSlug: string;
  currency: string;
  subtotal: number;
  items: { title: string; quantity: number; price: number }[];
  locale?: string | null;
}): Promise<boolean> {
  const loc = emailLocale(params.locale);
  const copy = getEmailCopy(loc);
  const storeUrl = getStoreUrl(params.storeSlug);
  const result = await dispatch(EMAIL_AUTOMATIONS.MARKETING_ABANDONED_CART, {
    to: params.to,
    subject: copy.abandonedCart.subject(params.storeName),
    html: buildAbandonedCartEmailHtml(
      {
        customerName: params.customerName,
        storeName: params.storeName,
        storeUrl,
        currency: params.currency,
        subtotal: params.subtotal,
        items: params.items,
      },
      loc,
    ),
  });
  return result.success;
}
