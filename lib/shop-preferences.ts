import type { StoreSeoSettings } from "@/lib/seo/storefront-metadata";
import { parseStoreSeo } from "@/lib/seo/storefront-metadata";

/** How a checkout form field behaves for customers. */
export type CheckoutFieldMode = "required" | "optional" | "hidden";

/** Visual density / layout for the storefront checkout form. */
export type CheckoutThemeId = "classic" | "soft" | "compact";

/** Multi-step wizard vs one long page. */
export type CheckoutLayoutId = "steps" | "single";

export const CHECKOUT_THEME_IDS = ["classic", "soft", "compact"] as const;
export const CHECKOUT_LAYOUT_IDS = ["steps", "single"] as const;

export interface CheckoutCustomerFields {
  email: CheckoutFieldMode;
  phone: CheckoutFieldMode;
  street: CheckoutFieldMode;
  city: CheckoutFieldMode;
  /** Postal / ZIP — often optional for Moroccan COD. */
  postalCode: CheckoutFieldMode;
  country: CheckoutFieldMode;
  /** Free-text note from the buyer (delivery instructions, etc.). */
  orderNote: CheckoutFieldMode;
}

export const DEFAULT_CHECKOUT_FIELDS: CheckoutCustomerFields = {
  email: "required",
  phone: "required",
  street: "required",
  city: "required",
  postalCode: "optional",
  country: "required",
  orderNote: "hidden",
};

/** Merchant shop controls stored under StoreSettings.seo.shop (no schema migration). */
export type TaxPreferences = {
  enabled: boolean;
  /** Percent, e.g. 20 for Morocco TVA */
  ratePercent: number;
  /** When true, catalog prices already include tax (tax is extracted for invoices) */
  pricesIncludeTax: boolean;
  label: string;
  showOnCheckout: boolean;
  showOnInvoice: boolean;
};

export type NotificationAlerts = {
  orders: boolean;
  /** In-app alerts when order status changes */
  orderStatus: boolean;
  messages: boolean;
  stock: boolean;
  /** Unrecovered abandoned checkouts in the bell */
  abandoned: boolean;
  /** Email the merchant when a new order arrives */
  merchantEmail: boolean;
};

export interface ShopPreferences {
  whatsapp: string | null;
  showContactOnStorefront: boolean;
  minOrderAmount: number;
  checkoutNote: string;
  codMessage: string;
  paypalMessage: string;
  /** Label shown on the COD payment tile (empty = default). */
  codTitle: string;
  /** Label shown on the PayPal payment tile (empty = default). */
  paypalTitle: string;
  /** Extra amount added when buyer picks COD (0 = none). */
  codFee: number;
  announceBarEnabled: boolean;
  announceBarText: string;
  checkoutTheme: CheckoutThemeId;
  checkoutLayout: CheckoutLayoutId;
  showProgress: boolean;
  showCoupon: boolean;
  summaryOpenByDefault: boolean;
  continueLabel: string;
  placeOrderLabel: string;
  successMessage: string;
  requireTerms: boolean;
  phonePlaceholder: string;
  phoneHint: string;
  checkoutFields: CheckoutCustomerFields;
  eticket: EticketPreferences;
  invoice: InvoicePreferences;
  alerts: NotificationAlerts;
  tax: TaxPreferences;
}

/** Thermal / label paper size for packing e-tickets. */
export type EticketSizeId = "80x100" | "58x40" | "40x30";

export const ETICKET_SIZE_IDS = ["80x100", "58x40", "40x30"] as const;

export type EticketTemplateId = "classic" | "compact" | "bold";
export type InvoiceTemplateId = "classic" | "minimal" | "branded";

export const ETICKET_TEMPLATE_IDS = ["classic", "compact", "bold"] as const;
export const INVOICE_TEMPLATE_IDS = ["classic", "minimal", "branded"] as const;

export interface EticketPreferences {
  template: EticketTemplateId;
  size: EticketSizeId;
  /** One ticket per quantity unit (default). Off = one ticket per line item. */
  onePerUnit: boolean;
  showCustomer: boolean;
  showPrice: boolean;
  showBarcode: boolean;
  showStoreQr: boolean;
  footerNote: string;
}

export interface InvoicePreferences {
  template: InvoiceTemplateId;
  /** Title on the PDF (e.g. Invoice / Facture). */
  documentTitle: string;
  footerNote: string;
  showLogo: boolean;
  showPaymentStatus: boolean;
  /** Extra company lines: ICE, address, bank — shown under store name. */
  companyDetails: string;
}

export const DEFAULT_ETICKET_PREFERENCES: EticketPreferences = {
  template: "classic",
  size: "80x100",
  onePerUnit: true,
  showCustomer: true,
  showPrice: true,
  showBarcode: true,
  showStoreQr: true,
  footerNote: "",
};

export const DEFAULT_INVOICE_PREFERENCES: InvoicePreferences = {
  template: "classic",
  documentTitle: "Invoice",
  footerNote: "Thank you for your purchase",
  showLogo: true,
  showPaymentStatus: true,
  companyDetails: "",
};

export const DEFAULT_TAX_PREFERENCES: TaxPreferences = {
  enabled: false,
  ratePercent: 20,
  pricesIncludeTax: false,
  label: "TVA",
  showOnCheckout: true,
  showOnInvoice: true,
};

export const DEFAULT_NOTIFICATION_ALERTS: NotificationAlerts = {
  orders: true,
  orderStatus: true,
  messages: true,
  stock: true,
  abandoned: true,
  merchantEmail: true,
};

export const DEFAULT_SHOP_PREFERENCES: ShopPreferences = {
  whatsapp: null,
  showContactOnStorefront: true,
  minOrderAmount: 0,
  checkoutNote: "",
  codMessage: "",
  paypalMessage: "",
  codTitle: "",
  paypalTitle: "",
  codFee: 0,
  announceBarEnabled: false,
  announceBarText: "",
  checkoutTheme: "classic",
  checkoutLayout: "steps",
  showProgress: true,
  showCoupon: true,
  summaryOpenByDefault: false,
  continueLabel: "",
  placeOrderLabel: "",
  successMessage: "",
  requireTerms: false,
  phonePlaceholder: "",
  phoneHint: "",
  checkoutFields: { ...DEFAULT_CHECKOUT_FIELDS },
  eticket: { ...DEFAULT_ETICKET_PREFERENCES },
  invoice: { ...DEFAULT_INVOICE_PREFERENCES },
  alerts: { ...DEFAULT_NOTIFICATION_ALERTS },
  tax: { ...DEFAULT_TAX_PREFERENCES },
};

const FIELD_MODES = new Set<CheckoutFieldMode>([
  "required",
  "optional",
  "hidden",
]);

function parseFieldMode(
  value: unknown,
  fallback: CheckoutFieldMode
): CheckoutFieldMode {
  return typeof value === "string" && FIELD_MODES.has(value as CheckoutFieldMode)
    ? (value as CheckoutFieldMode)
    : fallback;
}

function parseCheckoutFields(raw: unknown): CheckoutCustomerFields {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_CHECKOUT_FIELDS };
  const obj = raw as Record<string, unknown>;
  return {
    email: parseFieldMode(obj.email, DEFAULT_CHECKOUT_FIELDS.email),
    phone: parseFieldMode(obj.phone, DEFAULT_CHECKOUT_FIELDS.phone),
    street: parseFieldMode(obj.street, DEFAULT_CHECKOUT_FIELDS.street),
    city: parseFieldMode(obj.city, DEFAULT_CHECKOUT_FIELDS.city),
    postalCode: parseFieldMode(
      obj.postalCode,
      DEFAULT_CHECKOUT_FIELDS.postalCode
    ),
    country: parseFieldMode(obj.country, DEFAULT_CHECKOUT_FIELDS.country),
    orderNote: parseFieldMode(obj.orderNote, DEFAULT_CHECKOUT_FIELDS.orderNote),
  };
}

function parseCheckoutTheme(value: unknown): CheckoutThemeId {
  if (
    typeof value === "string" &&
    (CHECKOUT_THEME_IDS as readonly string[]).includes(value)
  ) {
    return value as CheckoutThemeId;
  }
  return "classic";
}

function parseCheckoutLayout(value: unknown): CheckoutLayoutId {
  if (
    typeof value === "string" &&
    (CHECKOUT_LAYOUT_IDS as readonly string[]).includes(value)
  ) {
    return value as CheckoutLayoutId;
  }
  return "steps";
}

function parseEticketSize(value: unknown): EticketSizeId {
  if (
    typeof value === "string" &&
    (ETICKET_SIZE_IDS as readonly string[]).includes(value)
  ) {
    return value as EticketSizeId;
  }
  return "80x100";
}

function parseEticketTemplate(value: unknown): EticketTemplateId {
  if (
    typeof value === "string" &&
    (ETICKET_TEMPLATE_IDS as readonly string[]).includes(value)
  ) {
    return value as EticketTemplateId;
  }
  return "classic";
}

function parseInvoiceTemplate(value: unknown): InvoiceTemplateId {
  if (
    typeof value === "string" &&
    (INVOICE_TEMPLATE_IDS as readonly string[]).includes(value)
  ) {
    return value as InvoiceTemplateId;
  }
  return "classic";
}

export function parseEticketPreferences(raw: unknown): EticketPreferences {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_ETICKET_PREFERENCES };
  }
  const obj = raw as Record<string, unknown>;
  return {
    template: parseEticketTemplate(obj.template),
    size: parseEticketSize(obj.size),
    onePerUnit: obj.onePerUnit !== false,
    showCustomer: obj.showCustomer !== false,
    showPrice: obj.showPrice !== false,
    showBarcode: obj.showBarcode !== false,
    showStoreQr: obj.showStoreQr !== false,
    footerNote: parseTrimmed(obj.footerNote, 80),
  };
}

export function parseInvoicePreferences(raw: unknown): InvoicePreferences {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_INVOICE_PREFERENCES };
  }
  const obj = raw as Record<string, unknown>;
  const title = parseTrimmed(obj.documentTitle, 40);
  const footer = parseTrimmed(obj.footerNote, 160);
  return {
    template: parseInvoiceTemplate(obj.template),
    documentTitle: title || DEFAULT_INVOICE_PREFERENCES.documentTitle,
    footerNote: footer || DEFAULT_INVOICE_PREFERENCES.footerNote,
    showLogo: obj.showLogo !== false,
    showPaymentStatus: obj.showPaymentStatus !== false,
    companyDetails: parseTrimmed(obj.companyDetails, 280),
  };
}

function parseTrimmed(value: unknown, max = 280): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function parseTaxPreferences(raw: unknown): TaxPreferences {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_TAX_PREFERENCES };
  }
  const obj = raw as Record<string, unknown>;
  const rate = Number(obj.ratePercent);
  const label =
    typeof obj.label === "string" && obj.label.trim()
      ? obj.label.trim().slice(0, 20)
      : DEFAULT_TAX_PREFERENCES.label;
  return {
    enabled: obj.enabled === true,
    ratePercent: Number.isFinite(rate)
      ? Math.max(0, Math.min(100, rate))
      : DEFAULT_TAX_PREFERENCES.ratePercent,
    pricesIncludeTax: obj.pricesIncludeTax === true,
    label,
    showOnCheckout: obj.showOnCheckout !== false,
    showOnInvoice: obj.showOnInvoice !== false,
  };
}

function parseNotificationAlerts(raw: unknown): NotificationAlerts {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_NOTIFICATION_ALERTS };
  }
  const obj = raw as Record<string, unknown>;
  return {
    orders: obj.orders !== false,
    orderStatus: obj.orderStatus !== false,
    messages: obj.messages !== false,
    stock: obj.stock !== false,
    abandoned: obj.abandoned !== false,
    merchantEmail: obj.merchantEmail !== false,
  };
}

export function parseShopPreferences(seoRaw: unknown): ShopPreferences {
  if (!seoRaw || typeof seoRaw !== "object") {
    return {
      ...DEFAULT_SHOP_PREFERENCES,
      checkoutFields: { ...DEFAULT_CHECKOUT_FIELDS },
      eticket: { ...DEFAULT_ETICKET_PREFERENCES },
      invoice: { ...DEFAULT_INVOICE_PREFERENCES },
      alerts: { ...DEFAULT_NOTIFICATION_ALERTS },
      tax: { ...DEFAULT_TAX_PREFERENCES },
    };
  }
  const shop = (seoRaw as Record<string, unknown>).shop;
  if (!shop || typeof shop !== "object") {
    return {
      ...DEFAULT_SHOP_PREFERENCES,
      checkoutFields: { ...DEFAULT_CHECKOUT_FIELDS },
      eticket: { ...DEFAULT_ETICKET_PREFERENCES },
      invoice: { ...DEFAULT_INVOICE_PREFERENCES },
      alerts: { ...DEFAULT_NOTIFICATION_ALERTS },
      tax: { ...DEFAULT_TAX_PREFERENCES },
    };
  }
  const obj = shop as Record<string, unknown>;

  return {
    whatsapp:
      typeof obj.whatsapp === "string" && obj.whatsapp.trim()
        ? obj.whatsapp.trim()
        : null,
    showContactOnStorefront: obj.showContactOnStorefront !== false,
    minOrderAmount: Math.max(0, Number(obj.minOrderAmount ?? 0) || 0),
    checkoutNote: parseTrimmed(obj.checkoutNote, 280),
    codMessage: parseTrimmed(obj.codMessage, 280),
    paypalMessage: parseTrimmed(obj.paypalMessage, 280),
    codTitle: parseTrimmed(obj.codTitle, 60),
    paypalTitle: parseTrimmed(obj.paypalTitle, 60),
    codFee: Math.max(0, Number(obj.codFee ?? 0) || 0),
    announceBarEnabled: obj.announceBarEnabled === true,
    announceBarText: parseTrimmed(obj.announceBarText, 120),
    checkoutTheme: parseCheckoutTheme(obj.checkoutTheme),
    checkoutLayout: parseCheckoutLayout(obj.checkoutLayout),
    showProgress: obj.showProgress !== false,
    showCoupon: obj.showCoupon !== false,
    summaryOpenByDefault: obj.summaryOpenByDefault === true,
    continueLabel: parseTrimmed(obj.continueLabel, 40),
    placeOrderLabel: parseTrimmed(obj.placeOrderLabel, 40),
    successMessage: parseTrimmed(obj.successMessage, 280),
    requireTerms: obj.requireTerms === true,
    phonePlaceholder: parseTrimmed(obj.phonePlaceholder, 60),
    phoneHint: parseTrimmed(obj.phoneHint, 120),
    checkoutFields: parseCheckoutFields(obj.checkoutFields),
    eticket: parseEticketPreferences(obj.eticket),
    invoice: parseInvoicePreferences(obj.invoice),
    alerts: parseNotificationAlerts(obj.alerts),
    tax: parseTaxPreferences(obj.tax),
  };
}

function asSeoObject(seoRaw: unknown): Record<string, unknown> {
  if (seoRaw && typeof seoRaw === "object" && !Array.isArray(seoRaw)) {
    return { ...(seoRaw as Record<string, unknown>) };
  }
  return {};
}

/** Merge SEO fields into existing seo JSON while preserving design / shop / other keys. */
export function mergeSeoSettings(
  seoRaw: unknown,
  seo: StoreSeoSettings,
): Record<string, unknown> {
  const base = asSeoObject(seoRaw);

  if (seo.title !== undefined) {
    if (seo.title?.trim()) base.title = seo.title.trim();
    else delete base.title;
  }
  if (seo.description !== undefined) {
    if (seo.description?.trim()) base.description = seo.description.trim();
    else delete base.description;
  }
  if (seo.keywords !== undefined) {
    if (seo.keywords.length > 0) base.keywords = seo.keywords;
    else delete base.keywords;
  }
  if (seo.noIndex !== undefined) {
    if (seo.noIndex) base.noIndex = true;
    else delete base.noIndex;
  }

  return base;
}

/** Merge shop preferences under seo.shop while preserving design / SEO keys. */
export function mergeShopPreferences(
  seoRaw: unknown,
  shop: Partial<ShopPreferences>,
): Record<string, unknown> {
  const base = asSeoObject(seoRaw);
  const current = parseShopPreferences(base);
  const next: ShopPreferences = {
    ...current,
    ...shop,
    whatsapp:
      shop.whatsapp === undefined
        ? current.whatsapp
        : shop.whatsapp?.trim()
          ? shop.whatsapp.trim()
          : null,
    checkoutNote:
      shop.checkoutNote === undefined
        ? current.checkoutNote
        : shop.checkoutNote.trim(),
    codMessage:
      shop.codMessage === undefined ? current.codMessage : shop.codMessage.trim(),
    paypalMessage:
      shop.paypalMessage === undefined
        ? current.paypalMessage
        : shop.paypalMessage.trim(),
    codTitle:
      shop.codTitle === undefined ? current.codTitle : shop.codTitle.trim(),
    paypalTitle:
      shop.paypalTitle === undefined
        ? current.paypalTitle
        : shop.paypalTitle.trim(),
    announceBarText:
      shop.announceBarText === undefined
        ? current.announceBarText
        : shop.announceBarText.trim(),
    minOrderAmount:
      shop.minOrderAmount === undefined
        ? current.minOrderAmount
        : Math.max(0, Number(shop.minOrderAmount) || 0),
    codFee:
      shop.codFee === undefined
        ? current.codFee
        : Math.max(0, Number(shop.codFee) || 0),
    continueLabel:
      shop.continueLabel === undefined
        ? current.continueLabel
        : shop.continueLabel.trim().slice(0, 40),
    placeOrderLabel:
      shop.placeOrderLabel === undefined
        ? current.placeOrderLabel
        : shop.placeOrderLabel.trim().slice(0, 40),
    successMessage:
      shop.successMessage === undefined
        ? current.successMessage
        : shop.successMessage.trim().slice(0, 280),
    phonePlaceholder:
      shop.phonePlaceholder === undefined
        ? current.phonePlaceholder
        : shop.phonePlaceholder.trim().slice(0, 60),
    phoneHint:
      shop.phoneHint === undefined
        ? current.phoneHint
        : shop.phoneHint.trim().slice(0, 120),
    checkoutTheme:
      shop.checkoutTheme === undefined
        ? current.checkoutTheme
        : parseCheckoutTheme(shop.checkoutTheme),
    checkoutLayout:
      shop.checkoutLayout === undefined
        ? current.checkoutLayout
        : parseCheckoutLayout(shop.checkoutLayout),
    checkoutFields:
      shop.checkoutFields === undefined
        ? current.checkoutFields
        : parseCheckoutFields(shop.checkoutFields),
    eticket:
      shop.eticket === undefined
        ? current.eticket
        : parseEticketPreferences({ ...current.eticket, ...shop.eticket }),
    invoice:
      shop.invoice === undefined
        ? current.invoice
        : parseInvoicePreferences({ ...current.invoice, ...shop.invoice }),
    alerts:
      shop.alerts === undefined
        ? current.alerts
        : parseNotificationAlerts({ ...current.alerts, ...shop.alerts }),
    tax:
      shop.tax === undefined
        ? current.tax
        : parseTaxPreferences({ ...current.tax, ...shop.tax }),
  };

  base.shop = next;
  return base;
}

export function getSeoAndShopFromRaw(seoRaw: unknown): {
  seo: StoreSeoSettings;
  shop: ShopPreferences;
} {
  return {
    seo: parseStoreSeo(seoRaw),
    shop: parseShopPreferences(seoRaw),
  };
}
