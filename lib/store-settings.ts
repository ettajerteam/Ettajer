import type { PaymentGatewaysInput, ShippingZoneInput } from "@/lib/validations/store";
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

export type { TicketPrinter, MarketingIntegrations };
export { DEFAULT_TICKET_PRINTERS, parseTicketPrinters, DEFAULT_MARKETING_INTEGRATIONS, parseMarketingIntegrations };

export interface ShippingZone extends ShippingZoneInput {}

export interface PaymentGateways extends PaymentGatewaysInput {}

export interface StoreSettingsData {
  shippingZones: ShippingZone[];
  paymentGateways: PaymentGateways;
  ticketPrinters: TicketPrinter[];
  marketingIntegrations: MarketingIntegrations;
  customDomain: string | null;
}

export interface StoreWithSettings {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  category: string | null;
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
    cities: ["Casablanca", "Rabat", "Marrakech", "Fes", "Tangier", "Agadir"],
    freeShippingThreshold: 200,
    rate: 30,
  },
];

export const DEFAULT_PAYMENT_GATEWAYS: PaymentGateways = {
  stripe: false,
  cashOnDelivery: true,
  stripeAccountId: null,
};

export function parseShippingZones(data: unknown): ShippingZone[] {
  if (!Array.isArray(data)) return DEFAULT_SHIPPING_ZONES;
  return data
    .filter(
      (z): z is ShippingZone =>
        typeof z === "object" &&
        z !== null &&
        "name" in z &&
        "cities" in z &&
        Array.isArray((z as ShippingZone).cities)
    )
    .map((z, index) => ({
      id: String((z as ShippingZone).id ?? `zone-${index}`),
      name: String((z as ShippingZone).name),
      cities: (z as ShippingZone).cities.map(String),
      freeShippingThreshold: Number((z as ShippingZone).freeShippingThreshold ?? 200),
      rate: Number((z as ShippingZone).rate ?? 30),
    }));
}

export function parsePaymentGateways(data: unknown): PaymentGateways {
  if (typeof data !== "object" || data === null) return DEFAULT_PAYMENT_GATEWAYS;
  const g = data as Record<string, unknown>;
  return {
    stripe: Boolean(g.stripe),
    cashOnDelivery: g.cashOnDelivery !== false,
    stripeAccountId: typeof g.stripeAccountId === "string" ? g.stripeAccountId : null,
  };
}

export function serializeStoreWithSettings(store: {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  category: string | null;
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
  } | null;
}): StoreWithSettings {
  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    logo: store.logo,
    description: store.description,
    category: store.category,
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
    },
  };
}

/** Calculate shipping from store zones (uses first matching zone or default) */
export function calculateShippingCost(
  subtotal: number,
  city: string | undefined,
  zones: ShippingZone[]
): number {
  const activeZones = zones.length ? zones : DEFAULT_SHIPPING_ZONES;
  const zone =
    activeZones.find((z) =>
      city ? z.cities.some((c) => c.toLowerCase() === city.toLowerCase()) : true
    ) ?? activeZones[0];

  if (subtotal >= zone.freeShippingThreshold) return 0;
  return zone.rate;
}

export function getDefaultFreeShippingThreshold(zones: ShippingZone[]): number {
  const active = zones.length ? zones : DEFAULT_SHIPPING_ZONES;
  return Math.min(...active.map((z) => z.freeShippingThreshold));
}
