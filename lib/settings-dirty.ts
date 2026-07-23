import type { SettingsTab } from "@/components/settings/settings-nav";
import type { StoreWithSettings } from "@/lib/store-settings";

/** Stable snapshot of fields owned by a settings tab — used for unsaved detection. */
export function getSettingsTabSnapshot(
  tab: SettingsTab,
  store: StoreWithSettings
): string {
  switch (tab) {
    case "general":
      return JSON.stringify({
        name: store.name,
        description: store.description,
        logo: store.logo,
        contactEmail: store.contactEmail,
        phone: store.phone,
        address: store.address,
      });
    case "website":
      return JSON.stringify({ slug: store.slug });
    case "currency":
      return JSON.stringify({
        currency: store.currency,
        language: store.language,
      });
    case "shipping":
      return JSON.stringify(store.settings.shippingZones);
    case "payment":
      return JSON.stringify(store.settings.paymentGateways);
    case "checkout":
      return JSON.stringify({
        minOrderAmount: store.settings.shop.minOrderAmount,
        checkoutNote: store.settings.shop.checkoutNote,
        codMessage: store.settings.shop.codMessage,
        announceBarEnabled: store.settings.shop.announceBarEnabled,
        announceBarText: store.settings.shop.announceBarText,
      });
    case "seo":
      return JSON.stringify(store.settings.seo);
    case "contact":
      return JSON.stringify({
        whatsapp: store.settings.shop.whatsapp,
        showContactOnStorefront: store.settings.shop.showContactOnStorefront,
      });
    case "printers":
      return JSON.stringify(store.settings.ticketPrinters);
    default:
      return "";
  }
}
