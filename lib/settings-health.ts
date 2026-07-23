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
      id: "profile",
      label: "Profile",
      tab: "general",
      done: Boolean(store.name.trim() && (store.logo || store.description?.trim())),
    },
    {
      id: "website",
      label: "Website",
      tab: "website",
      done: Boolean(store.slug && store.slug.length >= 2),
    },
    {
      id: "shipping",
      label: "Shipping",
      tab: "shipping",
      done: zones.length > 0 && zones.every((z) => z.cities.length > 0),
    },
    {
      id: "payments",
      label: "Payments",
      tab: "payment",
      done: pay.cashOnDelivery || pay.stripe,
    },
    {
      id: "checkout",
      label: "Checkout",
      tab: "checkout",
      done: Boolean(shop.checkoutNote?.trim() || shop.codMessage?.trim() || shop.minOrderAmount > 0),
    },
    {
      id: "seo",
      label: "SEO",
      tab: "seo",
      done: Boolean(seo.title?.trim() || seo.description?.trim()),
    },
    {
      id: "contact",
      label: "Contact",
      tab: "contact",
      done: Boolean(
        shop.whatsapp ||
          (shop.showContactOnStorefront && (store.contactEmail || store.phone))
      ),
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
