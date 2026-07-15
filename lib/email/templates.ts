import type { OrderStatus } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { formatFounderNumber } from "@/lib/founder/constants";
import type { LandingLocale } from "@/lib/landing/landing-i18n";
import {
  emailGreetingName,
  getEmailCopy,
} from "@/lib/email/email-i18n";
import { buildModernEmailHtml, escapeHtml, getAppUrl } from "@/lib/email/base-template";

function emailOpts(locale: LandingLocale = "en") {
  const copy = getEmailCopy(locale);
  return { locale, shell: copy.shell, copy };
}

export function buildMagicLinkEmailHtml(
  url: string,
  email: string,
  locale: LandingLocale = "en",
): string {
  const { copy, shell, locale: loc } = emailOpts(locale);
  const t = copy.magicLink;

  return buildModernEmailHtml({
    locale: loc,
    shell,
    previewText: t.previewText,
    title: t.title,
    greeting: t.greeting,
    body: t.body(escapeHtml(email)),
    cta: { label: t.cta, url },
    expiryNote: t.expiryNote,
    steps: t.steps,
    footerNote: t.footerNote,
  });
}

export function buildPasswordResetEmailHtml(
  url: string,
  email: string,
  locale: LandingLocale = "en",
): string {
  const { copy, shell, locale: loc } = emailOpts(locale);
  const t = copy.passwordReset;

  return buildModernEmailHtml({
    locale: loc,
    shell,
    previewText: t.previewText,
    title: t.title,
    greeting: t.greeting,
    body: t.body(escapeHtml(email)),
    cta: { label: t.cta, url },
    expiryNote: t.expiryNote,
    steps: t.steps,
    footerNote: t.footerNote,
  });
}

export function buildPasswordChangedEmailHtml(
  email: string,
  locale: LandingLocale = "en",
): string {
  const { copy, shell, locale: loc } = emailOpts(locale);
  const t = copy.passwordChanged;
  const loginUrl = `${getAppUrl()}/login?reset=success&email=${encodeURIComponent(email)}`;

  return buildModernEmailHtml({
    locale: loc,
    shell,
    previewText: t.previewText,
    title: t.title,
    badge: t.badge,
    badgeColor: "#ecfdf5",
    greeting: t.greeting,
    body: t.body(escapeHtml(email)),
    cta: { label: t.cta, url: loginUrl },
    steps: t.steps,
    footerNote: t.footerNote,
  });
}

export function buildActivationCodeEmailHtml(
  name: string,
  email: string,
  code: string,
  locale: LandingLocale = "en",
): string {
  const { copy, shell, locale: loc } = emailOpts(locale);
  const t = copy.activation;
  const displayName = emailGreetingName(name, locale === "ar" ? "صديقنا" : locale === "fr" ? "vous" : "there");
  const activateUrl = `${getAppUrl()}/activate?email=${encodeURIComponent(email)}`;

  const codeBlock = `
    <div style="margin:28px 0;text-align:center;">
      <p style="margin:0 0 12px;color:#737373;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(t.codeLabel)}</p>
      <div style="display:inline-block;padding:18px 32px;border-radius:16px;background:#171717;border:1px solid #262626;">
        <span style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:32px;font-weight:700;letter-spacing:0.35em;color:#ffffff;">${escapeHtml(code)}</span>
      </div>
      <p style="margin:14px 0 0;color:#a3a3a3;font-size:12px;line-height:1.55;">${escapeHtml(t.codeHint)}</p>
    </div>`;

  return buildModernEmailHtml({
    locale: loc,
    shell,
    previewText: t.previewText(code),
    title: t.title,
    badge: t.badge,
    badgeColor: "#eff6ff",
    greeting: t.greeting(displayName),
    body: t.body,
    customBlock: codeBlock,
    cta: { label: t.cta, url: activateUrl },
    steps: t.steps,
    expiryNote: t.expiryNote,
    footerNote: t.footerNote,
  });
}

export function buildWelcomeEmailHtml(
  name: string | null,
  email: string,
  locale: LandingLocale = "en",
): string {
  const { copy, shell, locale: loc } = emailOpts(locale);
  const t = copy.welcome;
  const displayName = emailGreetingName(name, locale === "ar" ? "صديقنا" : locale === "fr" ? "vous" : "there");
  const onboardingUrl = `${getAppUrl()}/onboarding`;

  return buildModernEmailHtml({
    locale: loc,
    shell,
    previewText: t.previewText,
    title: t.title,
    badge: t.badge,
    greeting: t.greeting(displayName),
    body: t.body(escapeHtml(email)),
    cta: { label: t.cta, url: onboardingUrl },
    steps: t.steps,
    highlight: {
      title: t.highlightTitle,
      body: t.highlightBody,
    },
    footerNote: t.footerNote,
  });
}

/** CID for inline founder card image in transactional emails (Resend). */
export const FOUNDER_CARD_INLINE_CID = "ettajer-founder-card";

export function buildFounderWelcomeEmailHtml(
  name: string,
  founderNumber: number,
  cardImage?: { cid?: string; base64?: string },
  locale: LandingLocale = "en",
): string {
  const { copy, shell, locale: loc } = emailOpts(locale);
  const t = copy.founderWelcome;
  const displayName = emailGreetingName(name, locale === "ar" ? "مؤسس" : "Founder");
  const padded = String(founderNumber).padStart(4, "0");
  const earlyAccessUrl = `${getAppUrl()}/early-access`;
  const founderLabel = escapeHtml(formatFounderNumber(founderNumber));

  const cardSrc = cardImage?.cid
    ? `cid:${cardImage.cid}`
    : cardImage?.base64
      ? `data:image/png;base64,${cardImage.base64}`
      : null;

  const cardBlock = cardSrc
    ? `
    <div style="margin-top:28px;text-align:center;">
      <p style="margin:0 0 14px;color:#737373;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(t.cardLabel)}</p>
      <img
        src="${cardSrc}"
        alt="Ettajer Founder Card #${padded}"
        width="440"
        style="display:block;margin:0 auto;max-width:100%;height:auto;border-radius:16px;box-shadow:0 24px 60px -18px rgba(0,0,0,0.45);border:1px solid rgba(0,0,0,0.06);"
      />
      <p style="margin:14px 0 0;color:#a3a3a3;font-size:12px;line-height:1.55;">
        ${escapeHtml(t.cardHint)}
      </p>
    </div>`
    : "";

  return buildModernEmailHtml({
    locale: loc,
    shell,
    previewText: t.previewText(padded),
    title: t.title,
    badge: t.badge(padded),
    badgeColor: "#eff6ff",
    greeting: t.greeting(displayName),
    body: t.body(founderLabel),
    customBlock: cardBlock,
    keyValues: [
      { label: t.founderNumber, value: `#${padded}`, highlight: true },
      { label: t.status, value: t.statusValue, highlight: true },
    ],
    cta: { label: t.cta, url: earlyAccessUrl },
    highlight: {
      title: t.highlightTitle,
      body: t.highlightBody,
    },
    footerNote: t.footerNote,
  });
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  draft: "#f5f5f5",
  pending: "#eff6ff",
  processing: "#fef3c7",
  shipped: "#ede9fe",
  delivered: "#ecfdf5",
  returned: "#fff7ed",
  cancelled: "#fef2f2",
};

export function buildOrderStatusEmailHtml(
  params: {
    customerName: string;
    orderNumber: string;
    status: OrderStatus;
    storeName: string;
    total: number;
    currency: string;
    note?: string;
  },
  locale: LandingLocale = "en",
): string {
  const { copy, shell, locale: loc } = emailOpts(locale);
  const t = copy.orderStatus;
  const statusCopy = t.statuses[params.status];
  const statusLabel = statusCopy.label;

  return buildModernEmailHtml({
    locale: loc,
    shell,
    previewText: t.previewText(params.orderNumber, statusLabel),
    title: t.title(statusLabel),
    brandName: params.storeName,
    badge: statusLabel,
    badgeColor: STATUS_COLORS[params.status],
    greeting: t.greeting(params.customerName),
    body: statusCopy.message,
    keyValues: [
      { label: t.orderLabel, value: params.orderNumber, highlight: true },
      {
        label: t.totalLabel,
        value: formatCurrency(params.total, params.currency),
        highlight: true,
      },
      ...(params.note ? [{ label: t.noteLabel, value: params.note }] : []),
    ],
    footerNote: t.footerNote(params.storeName),
    showHelpLink: false,
    accentFrom: "#007AFF",
    accentTo: "#5856D6",
  });
}

export function buildOrderConfirmationEmailHtml(
  params: {
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
  },
  locale: LandingLocale = "en",
): string {
  const { copy, shell, locale: loc } = emailOpts(locale);
  const t = copy.orderConfirmed;

  const address = [
    params.shippingAddress.street,
    `${params.shippingAddress.city}, ${params.shippingAddress.postalCode}`,
    params.shippingAddress.country,
  ]
    .filter(Boolean)
    .join(" · ");

  return buildModernEmailHtml({
    locale: loc,
    shell,
    previewText: t.previewText(params.orderNumber),
    title: t.title,
    brandName: params.storeName,
    badge: t.badge,
    badgeColor: "#ecfdf5",
    greeting: t.greeting(params.customerName),
    body: t.body,
    keyValues: [
      { label: t.orderLabel, value: params.orderNumber, highlight: true },
      { label: t.shipToLabel, value: address },
    ],
    table: {
      headers: [t.itemsHeader, t.totalHeader],
      rows: [
        ...params.items.map((item) => ({
          left: `${item.title} × ${item.quantity}`,
          right: formatCurrency(item.price * item.quantity, params.currency),
        })),
        {
          left: t.subtotal,
          right: formatCurrency(params.subtotal, params.currency),
        },
        {
          left: t.shipping,
          right:
            params.shipping === 0
              ? t.shippingFree
              : formatCurrency(params.shipping, params.currency),
        },
        {
          left: t.total,
          right: formatCurrency(params.total, params.currency),
        },
      ],
    },
    footerNote: t.footerNote(params.storeName),
    showHelpLink: false,
    accentFrom: "#007AFF",
    accentTo: "#5856D6",
  });
}

export function buildSupportConfirmationEmailHtml(
  name: string,
  topic: string,
  locale: LandingLocale = "en",
): string {
  const { copy, shell, locale: loc } = emailOpts(locale);
  const t = copy.supportConfirmation;

  return buildModernEmailHtml({
    locale: loc,
    shell,
    previewText: t.previewText,
    title: t.title,
    greeting: t.greeting(name),
    body: t.body(escapeHtml(topic)),
    highlight: {
      title: t.highlightTitle,
      body: t.highlightBody(`${getAppUrl()}/help`),
    },
    footerNote: t.footerNote,
  });
}

export function buildSupportTicketEmailHtml(
  params: {
    name: string;
    email: string;
    topic: string;
    message: string;
    articleRef?: string;
  },
  locale: LandingLocale = "en",
): string {
  const { copy, shell, locale: loc } = emailOpts(locale);
  const t = copy.supportTicket;
  const messageHtml = escapeHtml(params.message).replace(/\n/g, "<br />");

  return buildModernEmailHtml({
    locale: loc,
    shell,
    previewText: t.previewText(params.topic),
    title: params.topic,
    badge: t.badge,
    greeting: t.greeting(params.name),
    body: `<div style="text-align:left;margin-top:8px;padding:16px;border-radius:12px;background:#fafafa;border:1px solid #f0f0f0;font-size:15px;line-height:1.6;">${messageHtml}</div>`,
    keyValues: [
      { label: t.emailLabel, value: params.email, highlight: true },
      ...(params.articleRef ? [{ label: t.articleLabel, value: params.articleRef }] : []),
    ],
    footerNote: t.footerNote,
    showHelpLink: false,
  });
}
