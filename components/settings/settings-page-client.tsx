"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { GeneralSettings } from "@/components/settings/general-settings";
import { CurrencyLanguageSettings } from "@/components/settings/currency-language-settings";
import { ShippingSettings } from "@/components/settings/shipping-settings";
import { PaymentSettings } from "@/components/settings/payment-settings";
import { PrinterSettings } from "@/components/settings/printer-settings";
import { WebsiteSettings } from "@/components/settings/website-settings";
import {
  SETTINGS_NAV,
  SETTINGS_TABS,
  SettingsNav,
  type SettingsTab,
} from "@/components/settings/settings-nav";
import { dashboardKicker, dashboardSubtitle, dashboardTitle } from "@/lib/dashboard-ui";
import type { StoreWithSettings } from "@/lib/store-settings";
import { cn } from "@/lib/utils";

interface SettingsPageClientProps {
  initialStore: StoreWithSettings;
}

export function SettingsPageClient({ initialStore }: SettingsPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");

  const initialTab: SettingsTab = SETTINGS_TABS.includes(tabParam as SettingsTab)
    ? (tabParam as SettingsTab)
    : "general";

  const [store, setStore] = useState(initialStore);
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tabParam === "design") {
      router.replace("/dashboard/themes/editor");
      return;
    }
    if (tabParam && SETTINGS_TABS.includes(tabParam as SettingsTab)) {
      setActiveTab(tabParam as SettingsTab);
    }
  }, [tabParam, router]);

  const activeMeta = useMemo(
    () => SETTINGS_NAV.find((item) => item.id === activeTab) ?? SETTINGS_NAV[0],
    [activeTab]
  );

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    router.replace(`/dashboard/settings?tab=${tab}`, { scroll: false });
  };

  const handleChange = useCallback((updates: Partial<StoreWithSettings>) => {
    setStore((prev) => ({
      ...prev,
      ...updates,
      settings: updates.settings
        ? { ...prev.settings, ...updates.settings }
        : prev.settings,
    }));
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
      if (!res.ok) throw new Error(data.message ?? "Failed to save");

      setStore(data.store);
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, []);

  const saveGeneral = () =>
    saveStore({
      name: store.name,
      description: store.description,
      logo: store.logo,
      contactEmail: store.contactEmail || null,
      phone: store.phone || null,
      address: store.address || null,
    });

  const saveCurrencyLanguage = () =>
    saveStore({
      currency: store.currency,
      language: store.language,
    });

  const saveShipping = () =>
    saveStore({
      shippingZones: store.settings.shippingZones,
    });

  const savePayment = () =>
    saveStore({
      paymentGateways: store.settings.paymentGateways,
    });

  const savePrinters = () =>
    saveStore({
      ticketPrinters: store.settings.ticketPrinters,
    });

  const saveWebsite = () =>
    saveStore({
      slug: store.slug,
    });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className={dashboardKicker}>Store</p>
        <h1 className={cn(dashboardTitle, "text-2xl sm:text-[1.75rem]")}>Settings</h1>
        <p className={cn(dashboardSubtitle, "max-w-xl text-sm")}>
          Configure your store profile, website, shipping, payments, and printers in one place.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-20">
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-[#161616]">
            <SettingsNav activeTab={activeTab} onChange={handleTabChange} />
          </div>
        </aside>

        <div className="min-w-0 space-y-3">
          <div className="hidden items-baseline justify-between gap-3 lg:flex">
            <div>
              <p className={dashboardKicker}>{activeMeta.label}</p>
              <p className="mt-1 text-sm text-neutral-500">{activeMeta.description}</p>
            </div>
          </div>

          {activeTab === "general" ? (
            <GeneralSettings
              store={store}
              onChange={handleChange}
              onSave={saveGeneral}
              saving={saving}
            />
          ) : null}

          {activeTab === "website" ? (
            <WebsiteSettings
              store={store}
              onChange={handleChange}
              onSave={saveWebsite}
              saving={saving}
            />
          ) : null}

          {activeTab === "currency" ? (
            <CurrencyLanguageSettings
              store={store}
              onChange={handleChange}
              onSave={saveCurrencyLanguage}
              saving={saving}
            />
          ) : null}

          {activeTab === "shipping" ? (
            <ShippingSettings
              store={store}
              onChange={handleChange}
              onSave={saveShipping}
              saving={saving}
            />
          ) : null}

          {activeTab === "payment" ? (
            <PaymentSettings
              store={store}
              onChange={handleChange}
              onSave={savePayment}
              saving={saving}
            />
          ) : null}

          {activeTab === "printers" ? (
            <PrinterSettings
              store={store}
              onChange={handleChange}
              onSave={savePrinters}
              saving={saving}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
