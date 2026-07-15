"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/settings/general-settings";
import { CurrencyLanguageSettings } from "@/components/settings/currency-language-settings";
import { ShippingSettings } from "@/components/settings/shipping-settings";
import { PaymentSettings } from "@/components/settings/payment-settings";
import { PrinterSettings } from "@/components/settings/printer-settings";
import { OnlineStorePageShell } from "@/components/online-store/online-store-page-shell";
import type { StoreWithSettings } from "@/lib/store-settings";

const VALID_SETTINGS_TABS = ["general", "design", "currency", "shipping", "payment", "printers"] as const;
type SettingsTab = (typeof VALID_SETTINGS_TABS)[number];

interface SettingsPageClientProps {
  initialStore: StoreWithSettings;
}

export function SettingsPageClient({ initialStore }: SettingsPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const initialTab = VALID_SETTINGS_TABS.includes(tabParam as SettingsTab)
    ? (tabParam as SettingsTab)
    : "general";

  const [store, setStore] = useState(initialStore);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tabParam && (VALID_SETTINGS_TABS as readonly string[]).includes(tabParam)) {
      setActiveTab(tabParam as SettingsTab);
    }
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    if (value === "design") {
      router.push("/dashboard/themes/editor");
      return;
    }
    setActiveTab(value as SettingsTab);
    router.replace(`/dashboard/settings?tab=${value}`, { scroll: false });
  };

  useEffect(() => {
    if (tabParam === "design") {
      router.replace("/dashboard/themes/editor");
    }
  }, [tabParam, router]);

  const handleChange = useCallback((updates: Partial<StoreWithSettings>) => {
    setStore((prev) => ({
      ...prev,
      ...updates,
      settings: updates.settings
        ? { ...prev.settings, ...updates.settings }
        : prev.settings,
    }));
  }, []);

  const saveStore = useCallback(
    async (payload: Record<string, unknown>) => {
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
    },
    []
  );

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

  return (
    <div className="max-w-3xl">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="printers">Printers</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <OnlineStorePageShell>
            <GeneralSettings
              store={store}
              onChange={handleChange}
              onSave={saveGeneral}
              saving={saving}
            />
          </OnlineStorePageShell>
        </TabsContent>

        <TabsContent value="currency">
          <CurrencyLanguageSettings
            store={store}
            onChange={handleChange}
            onSave={saveCurrencyLanguage}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="shipping">
          <ShippingSettings
            store={store}
            onChange={handleChange}
            onSave={saveShipping}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentSettings
            store={store}
            onChange={handleChange}
            onSave={savePayment}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="printers">
          <PrinterSettings
            store={store}
            onChange={handleChange}
            onSave={savePrinters}
            saving={saving}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
