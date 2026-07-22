import { NextResponse } from "next/server";
import {
  buildMagicLinkEmailHtml,
  buildOrderConfirmationEmailHtml,
  buildOrderStatusEmailHtml,
  buildPasswordChangedEmailHtml,
  buildPasswordResetEmailHtml,
  buildSupportConfirmationEmailHtml,
  buildWelcomeEmailHtml,
  buildFounderWelcomeEmailHtml,
  buildFounderLaunchAnnounceEmailHtml,
  buildFounderAccessUnlockedEmailHtml,
  buildVerifyEmailReminderEmailHtml,
  buildMerchantNewOrderEmailHtml,
  buildStoreLiveEmailHtml,
  buildActivationCodeEmailHtml,
} from "@/lib/email/templates";
import { generateFounderCardAssets } from "@/lib/founder/founder-card-assets";
import { parseEmailLocale } from "@/lib/email/email-locale";
import type { LandingLocale } from "@/lib/landing/landing-i18n";

const PREVIEWS: Record<string, (locale: LandingLocale) => string | Promise<string>> = {
  "magic-link": (locale) =>
    buildMagicLinkEmailHtml(
      "https://ettajer.com/login?token=preview",
      "merchant@example.com",
      locale,
    ),
  "password-reset": (locale) =>
    buildPasswordResetEmailHtml(
      "https://ettajer.com/reset-password?token=preview",
      "merchant@example.com",
      locale,
    ),
  "password-changed": (locale) =>
    buildPasswordChangedEmailHtml("merchant@example.com", locale),
  welcome: (locale) => buildWelcomeEmailHtml("Youssef", "merchant@example.com", locale),
  "founder-welcome": async (locale) => {
    const assets = await generateFounderCardAssets("Youssef", 42);
    return buildFounderWelcomeEmailHtml("Youssef", 42, { base64: assets.pngBase64 }, locale);
  },
  "founder-launch": (locale) =>
    buildFounderLaunchAnnounceEmailHtml(
      "Youssef",
      7,
      locale === "fr"
        ? "jeudi 23 juillet 2026"
        : locale === "ar"
          ? "الخميس 23 يوليو 2026"
          : "Thursday 23 July 2026",
      locale,
    ),
  "founder-unlocked": (locale) =>
    buildFounderAccessUnlockedEmailHtml("Youssef", 7, locale),
  "verify-reminder": (locale) =>
    buildVerifyEmailReminderEmailHtml(
      "Youssef",
      "merchant@example.com",
      locale === "fr"
        ? "jeudi 23 juillet 2026"
        : locale === "ar"
          ? "الخميس 23 يوليو 2026"
          : "Thursday 23 July 2026",
      locale,
    ),
  "merchant-new-order": (locale) =>
    buildMerchantNewOrderEmailHtml(
      {
        merchantName: "Youssef",
        orderNumber: "ETT-1042",
        customerName: "Amina",
        total: 480,
        currency: "MAD",
        orderId: "preview-order-id",
      },
      locale,
    ),
  "store-live": (locale) =>
    buildStoreLiveEmailHtml("Youssef", "Ma Boutique", "ma-boutique", locale),
  activation: (locale) =>
    buildActivationCodeEmailHtml("Youssef", "merchant@example.com", "482913", locale),
  "support-received": (locale) =>
    buildSupportConfirmationEmailHtml("Youssef", "Billing & plans", locale),
  "order-confirmed": (locale) =>
    buildOrderConfirmationEmailHtml({
      customerName: "Amina",
      orderNumber: "ETT-1042",
      storeName: "Demo Store",
      currency: "MAD",
      subtotal: 450,
      shipping: 30,
      total: 480,
      items: [
        { title: "Leather bag", quantity: 1, price: 450 },
      ],
      shippingAddress: {
        street: "12 Rue Mohammed V",
        city: "Casablanca",
        postalCode: "20000",
        country: "Morocco",
      },
    }, locale),
  "order-shipped": (locale) =>
    buildOrderStatusEmailHtml({
      customerName: "Amina",
      orderNumber: "ETT-1042",
      status: "shipped",
      storeName: "Demo Store",
      total: 480,
      currency: "MAD",
    }, locale),
};

/**
 * Preview email templates in development.
 * GET /api/email/preview?type=magic-link
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Not available in production" }, { status: 403 });
  }

  const type = new URL(request.url).searchParams.get("type") ?? "magic-link";
  const locale = parseEmailLocale(new URL(request.url).searchParams.get("locale"));
  const builder = PREVIEWS[type];

  if (!builder) {
    return NextResponse.json(
      { message: "Unknown type", available: Object.keys(PREVIEWS) },
      { status: 400 },
    );
  }

  return new NextResponse(await builder(locale), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
