"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { GeneralSettings } from "@/components/settings/general-settings";
import { CurrencyLanguageSettings } from "@/components/settings/currency-language-settings";
import { ShippingSettings } from "@/components/settings/shipping-settings";
import { PaymentSettings } from "@/components/settings/payment-settings";
import { CheckoutSettings } from "@/components/settings/checkout-settings";
import { SeoSettings } from "@/components/settings/seo-settings";
import { StorefrontContactSettings } from "@/components/settings/storefront-contact-settings";
import { WebsiteSettings } from "@/components/settings/website-settings";
import { MailHubSettingsClient } from "@/components/settings/mailhub-settings-client";
import {
  SETTINGS_NAV,
  SETTINGS_TABS,
  SettingsNav,
  type SettingsTab,
} from "@/components/settings/settings-nav";
import { FadeIn } from "@/components/ui/motion";
import { getSettingsTabSnapshot } from "@/lib/settings-dirty";
import { DEFAULT_SHOP_PREFERENCES } from "@/lib/shop-preferences";
import type { StoreWithSettings } from "@/lib/store-settings";
import { cn } from "@/lib/utils";
import { dashboardCard, dashboardStack } from "@/lib/dashboard-ui";

interface SettingsPageClientProps {
  initialStore: StoreWithSettings;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function formatApiError(data: {
  message?: string;
  errors?: { fieldErrors?: Record<string, string[] | undefined> };
}): string {
  if (data.message && data.message !== "Validation failed") return data.message;
  const fieldErrors = data.errors?.fieldErrors;
  if (fieldErrors) {
    const first = Object.values(fieldErrors).flat().find(Boolean);
    if (first) return first;
  }
  return data.message ?? "Save failed";
}

function normalizeStore(store: StoreWithSettings): StoreWithSettings {
  return {
    ...store,
    settings: {
      ...store.settings,
      seo: store.settings.seo ?? {},
      shop: store.settings.shop ?? { ...DEFAULT_SHOP_PREFERENCES },
    },
  };
}

export function SettingsPageClient({ initialStore }: SettingsPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");

  const initialTab: SettingsTab = SETTINGS_TABS.includes(tabParam as SettingsTab)
    ? (tabParam as SettingsTab)
    : "general";

  const [store, setStore] = useState(() => normalizeStore(initialStore));
  const [lastSaved, setLastSaved] = useState(() => normalizeStore(initialStore));
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [saving, setSaving] = useState(false);
  const saveHandlerRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    if (tabParam === "design") {
      router.replace("/dashboard/themes/editor");
      return;
    }
    if (tabParam && SETTINGS_TABS.includes(tabParam as SettingsTab)) {
      setActiveTab(tabParam as SettingsTab);
      return;
    }
    if (!tabParam) {
      setActiveTab("general");
      return;
    }
    setActiveTab("general");
    router.replace("/dashboard/settings?tab=general", { scroll: false });
  }, [tabParam, router]);

  const activeMeta = useMemo(
    () => SETTINGS_NAV.find((item) => item.id === activeTab) ?? SETTINGS_NAV[0],
    [activeTab]
  );

  const dirty = useMemo(
    () =>
      getSettingsTabSnapshot(activeTab, store) !==
      getSettingsTabSnapshot(activeTab, lastSaved),
    [activeTab, store, lastSaved]
  );

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    router.replace(`/dashboard/settings?tab=${tab}`, { scroll: false });
  };

  const handleChange = useCallback((updates: Partial<StoreWithSettings>) => {
    setStore((prev) =>
      normalizeStore({
        ...prev,
        ...updates,
        settings: updates.settings
          ? { ...prev.settings, ...updates.settings }
          : prev.settings,
      })
    );
  }, []);

  const saveStore = useCallback(async (payload: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(formatApiError(data));

      const next = normalizeStore({
        ...data.store,
        settings: {
          ...store.settings,
          ...data.store.settings,
          seo: data.store.settings?.seo ?? store.settings.seo,
          shop: data.store.settings?.shop ?? store.settings.shop,
        },
      });
      setStore(next);
      setLastSaved(next);
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [store.settings]);

  const saveGeneral = useCallback(async () => {
    if (!store.name.trim()) {
      toast.error("Store name is required");
      return;
    }
    const email = store.contactEmail?.trim() || null;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid contact email");
      return;
    }
    await saveStore({
      name: store.name.trim(),
      description: store.description?.trim() || null,
      logo: store.logo,
      contactEmail: email,
      phone: store.phone?.trim() || null,
      address: store.address?.trim() || null,
    });
  }, [saveStore, store]);

  const saveCurrencyLanguage = useCallback(
    () =>
      saveStore({
        currency: store.currency,
        language: store.language,
      }),
    [saveStore, store.currency, store.language]
  );

  const saveShipping = useCallback(async () => {
    const zones = store.settings.shippingZones;
    if (zones.some((z) => !z.name.trim())) {
      toast.error("Each shipping zone needs a name");
      return;
    }
    if (zones.some((z) => z.cities.length === 0)) {
      toast.error("Each shipping zone needs at least one city");
      return;
    }
    await saveStore({
      shippingZones: zones.map((z) => ({
        ...z,
        name: z.name.trim(),
      })),
    });
  }, [saveStore, store.settings.shippingZones]);

  const savePayment = useCallback(async () => {
    const gateways = store.settings.paymentGateways;
    if (!gateways.cashOnDelivery && !gateways.stripe) {
      toast.error("Enable at least one payment method");
      return;
    }
    await saveStore({ paymentGateways: gateways });
  }, [saveStore, store.settings.paymentGateways]);

  const saveCheckout = useCallback(
    () =>
      saveStore({
        shop: {
          minOrderAmount: store.settings.shop.minOrderAmount,
          checkoutNote: store.settings.shop.checkoutNote,
          codMessage: store.settings.shop.codMessage,
          announceBarEnabled: store.settings.shop.announceBarEnabled,
          announceBarText: store.settings.shop.announceBarText,
        },
      }),
    [saveStore, store.settings.shop]
  );

  const saveSeo = useCallback(
    () =>
      saveStore({
        seo: {
          title: store.settings.seo.title ?? null,
          description: store.settings.seo.description ?? null,
          keywords: (store.settings.seo.keywords ?? [])
            .slice(0, 20)
            .map((k) => k.slice(0, 40)),
          noIndex: store.settings.seo.noIndex === true,
        },
      }),
    [saveStore, store.settings.seo]
  );

  const saveContact = useCallback(
    () =>
      saveStore({
        shop: {
          whatsapp: store.settings.shop.whatsapp,
          showContactOnStorefront: store.settings.shop.showContactOnStorefront,
        },
      }),
    [saveStore, store.settings.shop]
  );

  const saveWebsite = useCallback(async () => {
    const slug = store.slug.trim().replace(/^-+|-+$/g, "").replace(/-+/g, "-");
    if (!SLUG_RE.test(slug) || slug.length < 2) {
      toast.error("Use a valid store URL (lowercase letters, numbers, hyphens)");
      return;
    }
    if (slug !== store.slug) {
      handleChange({ slug });
    }
    await saveStore({ slug });
  }, [handleChange, saveStore, store.slug]);

  const saveByTab = useMemo(
    (): Record<SettingsTab, () => Promise<void>> => ({
      general: saveGeneral,
      website: saveWebsite,
      currency: saveCurrencyLanguage,
      shipping: saveShipping,
      payment: savePayment,
      checkout: saveCheckout,
      seo: saveSeo,
      contact: saveContact,
      /** MailHub saves per action inside its own UI */
      email: async () => {},
    }),
    [
      saveCheckout,
      saveContact,
      saveCurrencyLanguage,
      saveGeneral,
      savePayment,
      saveSeo,
      saveShipping,
      saveWebsite,
    ]
  );

  useEffect(() => {
    saveHandlerRef.current = saveByTab[activeTab];
  }, [activeTab, saveByTab]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveHandlerRef.current?.();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const ActiveIcon = activeMeta.icon;

  return (
    <div className={dashboardStack}>
      <div className="grid gap-3 lg:grid-cols-[200px_minmax(0,1fr)] lg:items-start xl:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-16">
          <div className="mb-2 flex items-center gap-2 lg:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#007AFF] text-white">
              <ActiveIcon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                {activeMeta.label}
              </p>
              <p className="truncate text-[11px] text-neutral-400">
                {activeMeta.description}
              </p>
            </div>
          </div>

          <div className={cn(dashboardCard, "p-1.5")}>
            <SettingsNav activeTab={activeTab} onChange={handleTabChange} />
          </div>
        </aside>

        <div className="min-w-0">
          {activeTab === "email" ? (
            <MailHubSettingsClient />
          ) : (
            <FadeIn key={activeTab} direction="up" duration={0.22} className="space-y-3">
              {activeTab === "general" ? (
                <GeneralSettings
                  store={store}
                  onChange={handleChange}
                  onSave={saveGeneral}
                  saving={saving}
                  dirty={dirty}
                />
              ) : null}

              {activeTab === "website" ? (
                <WebsiteSettings
                  store={store}
                  onChange={handleChange}
                  onSave={saveWebsite}
                  saving={saving}
                  dirty={dirty}
                />
              ) : null}

              {activeTab === "currency" ? (
                <CurrencyLanguageSettings
                  store={store}
                  onChange={handleChange}
                  onSave={saveCurrencyLanguage}
                  saving={saving}
                  dirty={dirty}
                />
              ) : null}

              {activeTab === "shipping" ? (
                <ShippingSettings
                  store={store}
                  onChange={handleChange}
                  onSave={saveShipping}
                  saving={saving}
                  dirty={dirty}
                />
              ) : null}

              {activeTab === "payment" ? (
                <PaymentSettings
                  store={store}
                  onChange={handleChange}
                  onSave={savePayment}
                  saving={saving}
                  dirty={dirty}
                />
              ) : null}

              {activeTab === "checkout" ? (
                <CheckoutSettings
                  store={store}
                  onChange={handleChange}
                  onSave={saveCheckout}
                  saving={saving}
                  dirty={dirty}
                />
              ) : null}

              {activeTab === "seo" ? (
                <SeoSettings
                  store={store}
                  onChange={handleChange}
                  onSave={saveSeo}
                  saving={saving}
                  dirty={dirty}
                />
              ) : null}

              {activeTab === "contact" ? (
                <StorefrontContactSettings
                  store={store}
                  onChange={handleChange}
                  onSave={saveContact}
                  saving={saving}
                  dirty={dirty}
                />
              ) : null}
            </FadeIn>
          )}
        </div>
      </div>
    </div>
  );
}
