import type { StoreWithSettings } from "@/lib/store-settings";
import type { SettingsTab } from "@/components/settings/settings-nav";

export type SettingsHealthItem = {
  id: string;
  label: string;
  tab: SettingsTab;
  done: boolean;
};

export function getSettingsHealth(store: StoreWithSettings): SettingsHealthItem[] {
  const shop = store.settings.shop;
  const seo = store.settings.seo;
  const pay = store.settings.paymentGateways;
  const zones = store.settings.shippingZones;

  return [
    {
      id: "general",
      label: "General",
      tab: "general",
      done: Boolean(
        store.name.trim() &&
          (store.logo || store.description?.trim()) &&
          (store.contactEmail || store.phone || shop.whatsapp)
      ),
    },
    {
      id: "website",
      label: "Domains",
      tab: "website",
      done: Boolean(store.slug && store.slug.length >= 2),
    },
    {
      id: "shipping",
      label: "Shipping",
      tab: "shipping",
      done:
        zones.length > 0 &&
        zones.every((z) => z.countries.length > 0 || z.cities.length > 0),
    },
    {
      id: "payments",
      label: "Payments",
      tab: "payment",
      done: pay.cashOnDelivery || pay.stripe || pay.paypal,
    },
    {
      id: "checkout",
      label: "Checkout",
      tab: "checkout",
      done: Boolean(
        shop.checkoutNote?.trim() ||
          shop.codMessage?.trim() ||
          shop.paypalMessage?.trim() ||
          shop.minOrderAmount > 0 ||
          shop.checkoutTheme !== "classic"
      ),
    },
    {
      id: "seo",
      label: "SEO",
      tab: "seo",
      done: Boolean(seo.title?.trim() || seo.description?.trim()),
    },
    {
      id: "print",
      label: "Print",
      tab: "print",
      done:
        Boolean(store.settings.shop.eticket?.size) &&
        Boolean(store.settings.shop.invoice?.documentTitle?.trim()),
    },
  ];
}

export function getSettingsHealthScore(items: SettingsHealthItem[]): {
  done: number;
  total: number;
  percent: number;
} {
  const done = items.filter((i) => i.done).length;
  const total = items.length;
  return {
    done,
    total,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}
