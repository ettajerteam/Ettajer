import { z } from "zod";
import { CURRENCIES } from "@/types";
import { STORE_LANGUAGES } from "@/lib/morocco-cities";
import { STORE_FONTS, THEME_TEMPLATES } from "@/lib/themes";

const currencyValues = CURRENCIES.map((c) => c.value) as [string, ...string[]];
const languageValues = STORE_LANGUAGES.map((l) => l.value) as [string, ...string[]];
const themeValues = THEME_TEMPLATES.map((t) => t.id) as [string, ...string[]];
const fontValues = STORE_FONTS.map((f) => f.value) as [string, ...string[]];

const HEX_COLOR = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export const shippingZoneSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  cities: z.array(z.string()).min(1),
  freeShippingThreshold: z.number().min(0),
  rate: z.number().min(0),
});

export const paymentGatewaysSchema = z.object({
  stripe: z.boolean(),
  cashOnDelivery: z.boolean(),
  stripeAccountId: z.string().nullable().optional(),
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
  accountId: z.string().nullable().optional(),
  accessToken: z.string().nullable().optional(),
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
  contactEmail: z.string().email().optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
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
});

export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type ShippingZoneInput = z.infer<typeof shippingZoneSchema>;
export type PaymentGatewaysInput = z.infer<typeof paymentGatewaysSchema>;
export type TicketPrinterInput = z.infer<typeof ticketPrinterSchema>;
