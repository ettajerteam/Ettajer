"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { GeneralSettings } from "@/components/settings/general-settings";
import { CurrencyLanguageSettings } from "@/components/settings/currency-language-settings";
import { ShippingSettings } from "@/components/settings/shipping-settings";
import { PaymentSettings } from "@/components/settings/payment-settings";
import { CheckoutSettings } from "@/components/settings/checkout-settings";
import { SeoSettings } from "@/components/settings/seo-settings";
import { StorefrontContactSettings } from "@/components/settings/storefront-contact-settings";
import { PrinterSettings } from "@/components/settings/printer-settings";
import { WebsiteSettings } from "@/components/settings/website-settings";
import { SettingsHealthBar } from "@/components/settings/settings-health-bar";
import {
  SETTINGS_NAV,
  SETTINGS_TABS,
  SettingsNav,
  type SettingsTab,
} from "@/components/settings/settings-nav";
import { FadeIn } from "@/components/ui/motion";
import { getSettingsTabSnapshot } from "@/lib/settings-dirty";
import { DEFAULT_SHOP_PREFERENCES } from "@/lib/shop-preferences";
import { getStoreUrl } from "@/lib/storefront-urls";
import type { StoreWithSettings } from "@/lib/store-settings";
import { cn } from "@/lib/utils";

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

  const savePrinters = useCallback(async () => {
    const printers = store.settings.ticketPrinters;
    if (printers.some((p) => !p.name.trim())) {
      toast.error("Each printer needs a name");
      return;
    }
    await saveStore({
      ticketPrinters: printers.map((p) => ({
        ...p,
        name: p.name.trim(),
        location: p.location?.trim() || undefined,
      })),
    });
  }, [saveStore, store.settings.ticketPrinters]);

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
      printers: savePrinters,
    }),
    [
      saveCheckout,
      saveContact,
      saveCurrencyLanguage,
      saveGeneral,
      savePayment,
      savePrinters,
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
  const storePath = getStoreUrl(store.slug);

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-[#161616]">
        <div className="relative px-5 py-5 sm:px-6 sm:py-6">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={{
              background:
                "radial-gradient(ellipse 80% 120% at 0% 0%, rgba(0,122,255,0.08), transparent 55%), radial-gradient(ellipse 60% 80% at 100% 0%, rgba(0,122,255,0.04), transparent 50%)",
            }}
            aria-hidden
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-50 dark:border-white/10 dark:bg-white/[0.04]">
                {store.logo ? (
                  <Image
                    src={store.logo}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-sm font-semibold tracking-tight text-neutral-500">
                    {store.name.slice(0, 2).toUpperCase() || "ST"}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                  Store settings
                </p>
                <h1 className="mt-0.5 truncate text-xl font-semibold tracking-[-0.03em] text-neutral-900 dark:text-white sm:text-2xl">
                  {store.name || "Your store"}
                </h1>
                <p className="mt-1 text-[13px] text-neutral-500">
                  Control how your shop looks, sells, and reaches customers.
                </p>
              </div>
            </div>

            <Link
              href={storePath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-neutral-200 bg-white px-3.5 text-[13px] font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.07] sm:self-center"
            >
              <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
              View live store
            </Link>
          </div>
        </div>
      </header>

      <SettingsHealthBar
        store={lastSaved}
        activeTab={activeTab}
        onSelectTab={handleTabChange}
      />

      <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-6">
        <aside className="lg:sticky lg:top-20">
          <div className="mb-3 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#007AFF] text-white shadow-[0_4px_12px_-4px_rgba(0,122,255,0.65)]">
              <ActiveIcon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                {activeMeta.label}
              </p>
              <p className="truncate text-[12px] text-neutral-500">{activeMeta.description}</p>
            </div>
          </div>

          <div
            className={cn(
              "rounded-2xl border border-neutral-200/80 bg-white p-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-[#161616]",
              "lg:p-2.5"
            )}
          >
            <SettingsNav activeTab={activeTab} onChange={handleTabChange} />
          </div>
        </aside>

        <div className="min-w-0">
          <FadeIn key={activeTab} direction="up" duration={0.28} className="space-y-3">
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

            {activeTab === "printers" ? (
              <PrinterSettings
                store={store}
                onChange={handleChange}
                onSave={savePrinters}
                saving={saving}
                dirty={dirty}
              />
            ) : null}
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
