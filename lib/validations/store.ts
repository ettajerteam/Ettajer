import { z } from "zod";
import { CURRENCIES } from "@/types";
import { STORE_LANGUAGES } from "@/lib/morocco-cities";
import { STORE_FONTS, THEME_TEMPLATES } from "@/lib/themes";

const currencyValues = CURRENCIES.map((c) => c.value) as [string, ...string[]];
const languageValues = STORE_LANGUAGES.map((l) => l.value) as [string, ...string[]];
const themeValues = THEME_TEMPLATES.map((t) => t.id) as [string, ...string[]];
const fontValues = STORE_FONTS.map((f) => f.value) as [string, ...string[]];

const HEX_COLOR = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export const shippingZoneSchema = z
  .object({
    id: z.string(),
    name: z.string().min(1),
    /** ISO country codes this zone covers (e.g. MA, FR, US). */
    countries: z.array(z.string().min(2).max(2)).default([]),
    /** Optional city-level targeting within those countries. */
    cities: z.array(z.string()).default([]),
    freeShippingThreshold: z.number().min(0),
    /** 0 = always free for this zone. */
    rate: z.number().min(0),
  })
  .refine((z) => z.countries.length > 0 || z.cities.length > 0, {
    message: "Each shipping zone needs at least one country or city",
  });

export const paymentGatewaysSchema = z.object({
  stripe: z.boolean(),
  paypal: z.boolean().optional().default(false),
  cashOnDelivery: z.boolean(),
  stripeAccountId: z.string().nullable().optional(),
  /** PayPal REST app Client ID (public — used by checkout JS SDK). */
  paypalClientId: z.string().max(200).nullable().optional(),
  /** PayPal REST app Secret (server only — never sent to storefront). */
  paypalClientSecret: z.string().max(200).nullable().optional(),
  /** Optional business email shown to the merchant for reference. */
  paypalEmail: z.string().max(200).nullable().optional(),
  /** sandbox | live */
  paypalMode: z.enum(["sandbox", "live"]).optional().default("sandbox"),
});

export const ticketPrinterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  location: z.string().optional(),
});

export const marketingPlatformLinkSchema = z.object({
  enabled: z.boolean(),
  pixelId: z.string().nullable().optional(),
  connected: z.boolean().optional(),
  trackPageViews: z.boolean().optional(),
  trackViewContent: z.boolean().optional(),
  trackAddToCart: z.boolean().optional(),
  trackInitiateCheckout: z.boolean().optional(),
  trackPurchases: z.boolean().optional(),
  testMode: z.boolean().optional(),
  testEventCode: z.string().nullable().optional(),
  accountId: z.string().nullable().optional(),
  accessToken: z.string().nullable().optional(),
  catalogId: z.string().nullable().optional(),
  catalogFeedToken: z.string().nullable().optional(),
  adAccountId: z.string().nullable().optional(),
  purchasersAudienceId: z.string().nullable().optional(),
  abandonersAudienceId: z.string().nullable().optional(),
  purchasersAudienceSyncedAt: z.string().nullable().optional(),
  abandonersAudienceSyncedAt: z.string().nullable().optional(),
  audiencesAutoSync: z.boolean().optional(),
  domainVerificationCode: z.string().nullable().optional(),
  domainVerifiedAt: z.string().nullable().optional(),
});

export const marketingIntegrationsSchema = z.object({
  meta: marketingPlatformLinkSchema,
  tiktok: marketingPlatformLinkSchema,
  pinterest: marketingPlatformLinkSchema,
  google: marketingPlatformLinkSchema,
  snapchat: marketingPlatformLinkSchema,
  gtm: marketingPlatformLinkSchema,
});

export const updateStoreSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens")
    .optional(),
  description: z.string().max(2000).optional().nullable(),
  logo: z.string().nullable().optional(),
  contactEmail: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() || null : v),
    z.string().email().nullable().optional()
  ),
  phone: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() || null : v),
    z.string().max(30).nullable().optional()
  ),
  address: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() || null : v),
    z.string().max(500).nullable().optional()
  ),
  currency: z.enum(currencyValues).optional(),
  language: z.enum(languageValues).optional(),
  theme: z.enum(themeValues).optional(),
  primaryColor: z.string().regex(HEX_COLOR).optional(),
  secondaryColor: z.string().regex(HEX_COLOR).optional(),
  font: z.enum(fontValues).optional(),
  shippingZones: z.array(shippingZoneSchema).optional(),
  paymentGateways: paymentGatewaysSchema.optional(),
  ticketPrinters: z.array(ticketPrinterSchema).optional(),
  marketingIntegrations: marketingIntegrationsSchema.optional(),
  customDomain: z.string().max(253).nullable().optional(),
  seo: z
    .object({
      title: z.string().max(70).optional().nullable(),
      description: z.string().max(160).optional().nullable(),
      keywords: z.array(z.string().max(40)).max(20).optional(),
      noIndex: z.boolean().optional(),
    })
    .optional(),
  shop: z
    .object({
      whatsapp: z.string().max(30).optional().nullable(),
      showContactOnStorefront: z.boolean().optional(),
      minOrderAmount: z.number().min(0).optional(),
      checkoutNote: z.string().max(280).optional(),
      codMessage: z.string().max(280).optional(),
      paypalMessage: z.string().max(280).optional(),
      codTitle: z.string().max(60).optional(),
      paypalTitle: z.string().max(60).optional(),
      codFee: z.number().min(0).optional(),
      announceBarEnabled: z.boolean().optional(),
      announceBarText: z.string().max(120).optional(),
      checkoutTheme: z.enum(["classic", "soft", "compact"]).optional(),
      checkoutLayout: z.enum(["steps", "single"]).optional(),
      showProgress: z.boolean().optional(),
      showCoupon: z.boolean().optional(),
      summaryOpenByDefault: z.boolean().optional(),
      continueLabel: z.string().max(40).optional(),
      placeOrderLabel: z.string().max(40).optional(),
      successMessage: z.string().max(280).optional(),
      requireTerms: z.boolean().optional(),
      phonePlaceholder: z.string().max(60).optional(),
      phoneHint: z.string().max(120).optional(),
      checkoutFields: z
        .object({
          email: z.enum(["required", "optional", "hidden"]).optional(),
          phone: z.enum(["required", "optional", "hidden"]).optional(),
          street: z.enum(["required", "optional", "hidden"]).optional(),
          city: z.enum(["required", "optional", "hidden"]).optional(),
          postalCode: z.enum(["required", "optional", "hidden"]).optional(),
          country: z.enum(["required", "optional", "hidden"]).optional(),
          orderNote: z.enum(["required", "optional", "hidden"]).optional(),
        })
        .optional(),
      eticket: z
        .object({
          template: z.enum(["classic", "compact", "bold"]).optional(),
          size: z.enum(["80x100", "58x40", "40x30"]).optional(),
          onePerUnit: z.boolean().optional(),
          showCustomer: z.boolean().optional(),
          showPrice: z.boolean().optional(),
          showBarcode: z.boolean().optional(),
          showStoreQr: z.boolean().optional(),
          footerNote: z.string().max(80).optional(),
        })
        .optional(),
      tax: z
        .object({
          enabled: z.boolean().optional(),
          ratePercent: z.number().min(0).max(100).optional(),
          pricesIncludeTax: z.boolean().optional(),
          label: z.string().max(20).optional(),
          showOnCheckout: z.boolean().optional(),
          showOnInvoice: z.boolean().optional(),
        })
        .optional(),
      alerts: z
        .object({
          orders: z.boolean().optional(),
          orderStatus: z.boolean().optional(),
          messages: z.boolean().optional(),
          stock: z.boolean().optional(),
          abandoned: z.boolean().optional(),
          merchantEmail: z.boolean().optional(),
        })
        .optional(),
      invoice: z
        .object({
          template: z.enum(["classic", "minimal", "branded"]).optional(),
          documentTitle: z.string().max(40).optional(),
          footerNote: z.string().max(160).optional(),
          showLogo: z.boolean().optional(),
          showPaymentStatus: z.boolean().optional(),
          companyDetails: z.string().max(280).optional(),
        })
        .optional(),
    })
    .optional(),
});

export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type ShippingZoneInput = z.infer<typeof shippingZoneSchema>;
export type PaymentGatewaysInput = z.infer<typeof paymentGatewaysSchema>;
export type TicketPrinterInput = z.infer<typeof ticketPrinterSchema>;
