import type { PaymentGatewaysInput, ShippingZoneInput } from "@/lib/validations/store";
import {
  findCountryCodeForCity,
  resolveCountryCode,
} from "@/lib/shipping-destinations";
import {
  DEFAULT_TICKET_PRINTERS,
  parseTicketPrinters,
  type TicketPrinter,
} from "@/lib/ticket-printers";
import {
  DEFAULT_MARKETING_INTEGRATIONS,
  parseMarketingIntegrations,
  type MarketingIntegrations,
} from "@/lib/marketing-integrations";
import type { StoreSeoSettings } from "@/lib/seo/storefront-metadata";
import {
  DEFAULT_SHOP_PREFERENCES,
  getSeoAndShopFromRaw,
  type ShopPreferences,
} from "@/lib/shop-preferences";

export type { TicketPrinter, MarketingIntegrations, ShopPreferences };
export {
  DEFAULT_TICKET_PRINTERS,
  parseTicketPrinters,
  DEFAULT_MARKETING_INTEGRATIONS,
  parseMarketingIntegrations,
  DEFAULT_SHOP_PREFERENCES,
};

export interface ShippingZone extends ShippingZoneInput {}

export interface PaymentGateways extends PaymentGatewaysInput {}

export interface StoreSettingsData {
  shippingZones: ShippingZone[];
  paymentGateways: PaymentGateways;
  ticketPrinters: TicketPrinter[];
  marketingIntegrations: MarketingIntegrations;
  customDomain: string | null;
  /** Preferred public host for apex domains: "apex" | "www". */
  domainPrimary: "apex" | "www";
  seo: StoreSeoSettings;
  shop: ShopPreferences;
}

export interface StoreWithSettings {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  category: string | null;
  businessModel: string | null;
  websiteTemplateId: string | null;
  currency: string;
  language: string;
  contactEmail: string | null;
  phone: string | null;
  address: string | null;
  primaryColor: string;
  secondaryColor: string;
  font: string;
  theme: string;
  settings: StoreSettingsData;
}

export const DEFAULT_SHIPPING_ZONES: ShippingZone[] = [
  {
    id: "morocco-default",
    name: "Morocco",
    countries: ["MA"],
    cities: ["Casablanca", "Rabat", "Marrakech", "Fes", "Tangier", "Agadir"],
    freeShippingThreshold: 200,
    rate: 30,
  },
];

export const DEFAULT_PAYMENT_GATEWAYS: PaymentGateways = {
  stripe: false,
  paypal: false,
  cashOnDelivery: true,
  stripeAccountId: null,
  paypalClientId: null,
  paypalClientSecret: null,
  paypalEmail: null,
  paypalMode: "sandbox",
};

function normalizeCountries(raw: unknown, cities: string[]): string[] {
  const fromRaw = Array.isArray(raw)
    ? raw
        .map((c) => resolveCountryCode(String(c)))
        .filter((c): c is string => Boolean(c))
    : [];
  if (fromRaw.length > 0) return Array.from(new Set(fromRaw));

  const fromCities = cities
    .map((city) => findCountryCodeForCity(city))
    .filter((c): c is string => Boolean(c));
  if (fromCities.length > 0) return Array.from(new Set(fromCities));

  return ["MA"];
}

export function parseShippingZones(data: unknown): ShippingZone[] {
  if (!Array.isArray(data)) return DEFAULT_SHIPPING_ZONES;
  const parsed = data
    .filter(
      (z): z is Record<string, unknown> =>
        typeof z === "object" && z !== null && "name" in z
    )
    .map((z, index) => {
      const cities = Array.isArray(z.cities) ? z.cities.map(String) : [];
      const countries = normalizeCountries(z.countries, cities);
      return {
        id: String(z.id ?? `zone-${index}`),
        name: String(z.name),
        countries,
        cities,
        freeShippingThreshold: Number(z.freeShippingThreshold ?? 200),
        rate: Number(z.rate ?? 30),
      } satisfies ShippingZone;
    })
    .filter((z) => z.countries.length > 0 || z.cities.length > 0);

  return parsed.length ? parsed : DEFAULT_SHIPPING_ZONES;
}

export type ShippingDestination = {
  city?: string | null;
  country?: string | null;
};

/** Find the best matching zone: city override first, then country. */
export function findShippingZone(
  destination: ShippingDestination,
  zones: ShippingZone[]
): ShippingZone | null {
  const activeZones = zones.length ? zones : DEFAULT_SHIPPING_ZONES;
  const city = destination.city?.trim().toLowerCase() ?? "";
  const countryCode =
    resolveCountryCode(destination.country) ??
    (city ? findCountryCodeForCity(destination.city!) : null);

  if (city) {
    const byCity = activeZones.find((z) =>
      z.cities.some((c) => c.toLowerCase() === city)
    );
    if (byCity) return byCity;
  }

  if (countryCode) {
    const byCountry = activeZones.find((z) =>
      z.countries.some((c) => c.toUpperCase() === countryCode)
    );
    if (byCountry) return byCountry;
  }

  return null;
}

/** Unique ISO country codes covered by merchant zones. */
export function getShippableCountryCodes(zones: ShippingZone[]): string[] {
  const active = zones.length ? zones : DEFAULT_SHIPPING_ZONES;
  return Array.from(
    new Set(active.flatMap((z) => z.countries.map((c) => c.toUpperCase())))
  );
}

export function parsePaymentGateways(data: unknown): PaymentGateways {
  if (typeof data !== "object" || data === null) return DEFAULT_PAYMENT_GATEWAYS;
  const g = data as Record<string, unknown>;
  const mode = g.paypalMode === "live" ? "live" : "sandbox";
  return {
    stripe: Boolean(g.stripe),
    paypal: Boolean(g.paypal),
    cashOnDelivery: g.cashOnDelivery !== false,
    stripeAccountId: typeof g.stripeAccountId === "string" ? g.stripeAccountId : null,
    paypalClientId:
      typeof g.paypalClientId === "string" && g.paypalClientId.trim()
        ? g.paypalClientId.trim()
        : null,
    paypalClientSecret:
      typeof g.paypalClientSecret === "string" && g.paypalClientSecret.trim()
        ? g.paypalClientSecret.trim()
        : null,
    paypalEmail:
      typeof g.paypalEmail === "string" && g.paypalEmail.trim()
        ? g.paypalEmail.trim()
        : null,
    paypalMode: mode,
  };
}

/** Merchant has credentials to accept live PayPal Checkout. */
export function isPaypalConnected(gateways: PaymentGateways): boolean {
  return Boolean(
    gateways.paypalClientId?.trim() && gateways.paypalClientSecret?.trim()
  );
}

export function serializeStoreWithSettings(store: {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  category: string | null;
  businessModel?: string | null;
  websiteTemplateId?: string | null;
  currency: string;
  language?: string;
  contactEmail?: string | null;
  phone?: string | null;
  address?: string | null;
  primaryColor: string;
  secondaryColor: string;
  font: string;
  theme: string;
  settings?: {
    shippingZones: unknown;
    paymentGateways: unknown;
    ticketPrinters?: unknown;
    marketingIntegrations?: unknown;
    customDomain: string | null;
    domainPrimary?: string | null;
    seo?: unknown;
  } | null;
}): StoreWithSettings {
  const { seo, shop } = getSeoAndShopFromRaw(store.settings?.seo);
  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    logo: store.logo,
    description: store.description,
    category: store.category,
    businessModel: store.businessModel ?? null,
    websiteTemplateId: store.websiteTemplateId ?? null,
    currency: store.currency,
    language: store.language ?? "en",
    contactEmail: store.contactEmail ?? null,
    phone: store.phone ?? null,
    address: store.address ?? null,
    primaryColor: store.primaryColor,
    secondaryColor: store.secondaryColor,
    font: store.font,
    theme: store.theme,
    settings: {
      shippingZones: parseShippingZones(store.settings?.shippingZones),
      paymentGateways: parsePaymentGateways(store.settings?.paymentGateways),
      ticketPrinters: parseTicketPrinters(store.settings?.ticketPrinters),
      marketingIntegrations: parseMarketingIntegrations(store.settings?.marketingIntegrations),
      customDomain: store.settings?.customDomain ?? null,
      domainPrimary: store.settings?.domainPrimary === "www" ? "www" : "apex",
      seo,
      shop,
    },
  };
}

/**
 * Shipping cost for a destination.
 * - rate === 0 → always free (threshold ignored)
 * - rate > 0 → free when subtotal >= freeShippingThreshold
 * - no matching zone → null (checkout should refuse)
 *
 * Legacy overload: (subtotal, city, zones) still supported.
 */
export function calculateShippingCost(
  subtotal: number,
  destinationOrCity: ShippingDestination | string | undefined,
  zones: ShippingZone[]
): number | null {
  const destination: ShippingDestination =
    typeof destinationOrCity === "string" || destinationOrCity == null
      ? { city: destinationOrCity ?? undefined }
      : destinationOrCity;

  const zone = findShippingZone(destination, zones);
  if (!zone) return null;

  if (zone.rate === 0) return 0;
  if (
    zone.freeShippingThreshold > 0 &&
    subtotal >= zone.freeShippingThreshold
  ) {
    return 0;
  }
  return zone.rate;
}

export function getDefaultFreeShippingThreshold(zones: ShippingZone[]): number {
  const active = zones.length ? zones : DEFAULT_SHIPPING_ZONES;
  const paid = active.filter((z) => z.rate > 0 && z.freeShippingThreshold > 0);
  if (!paid.length) return 0;
  return Math.min(...paid.map((z) => z.freeShippingThreshold));
}
