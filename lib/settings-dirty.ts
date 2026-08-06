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
        whatsapp: store.settings.shop.whatsapp,
        showContactOnStorefront: store.settings.shop.showContactOnStorefront,
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
      return JSON.stringify({
        gateways: store.settings.paymentGateways,
        codMessage: store.settings.shop.codMessage,
        paypalMessage: store.settings.shop.paypalMessage,
        codTitle: store.settings.shop.codTitle,
        paypalTitle: store.settings.shop.paypalTitle,
        codFee: store.settings.shop.codFee,
      });
    case "checkout":
      return JSON.stringify({
        minOrderAmount: store.settings.shop.minOrderAmount,
        checkoutNote: store.settings.shop.checkoutNote,
        announceBarEnabled: store.settings.shop.announceBarEnabled,
        announceBarText: store.settings.shop.announceBarText,
        checkoutTheme: store.settings.shop.checkoutTheme,
        checkoutLayout: store.settings.shop.checkoutLayout,
        showProgress: store.settings.shop.showProgress,
        showCoupon: store.settings.shop.showCoupon,
        summaryOpenByDefault: store.settings.shop.summaryOpenByDefault,
        continueLabel: store.settings.shop.continueLabel,
        placeOrderLabel: store.settings.shop.placeOrderLabel,
        successMessage: store.settings.shop.successMessage,
        requireTerms: store.settings.shop.requireTerms,
        phonePlaceholder: store.settings.shop.phonePlaceholder,
        phoneHint: store.settings.shop.phoneHint,
        checkoutFields: store.settings.shop.checkoutFields,
      });
    case "seo":
      return JSON.stringify(store.settings.seo);
    case "print":
      return JSON.stringify({
        eticket: store.settings.shop.eticket,
        invoice: store.settings.shop.invoice,
      });
    case "email":
      return "email";
    case "profile":
      return "profile";
    case "legal":
      return JSON.stringify({
        requireTerms: store.settings.shop.requireTerms,
      });
    case "notifications":
      return JSON.stringify({
        alerts: store.settings.shop.alerts,
      });
    case "taxes":
      return JSON.stringify({
        tax: store.settings.shop.tax,
      });
    case "plan":
      return tab;
    default:
      return "";
  }
}
