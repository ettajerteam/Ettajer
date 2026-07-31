"use client";

import { useMemo, useState } from "react";
import { Check, MapPin, Plus, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ALL_SHIPPING_CITIES,
  SHIPPING_COUNTRIES,
} from "@/lib/morocco-cities";
import { SettingsPanel } from "@/components/settings/settings-panel";
import {
  SettingsField,
  SettingsSection,
} from "@/components/settings/settings-section";
import {
  SettingsRelatedCard,
  SettingsRelatedLink,
} from "@/components/settings/settings-related-link";
import type { StoreWithSettings, ShippingZone } from "@/lib/store-settings";
import { cn } from "@/lib/utils";

interface ShippingSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  dirty?: boolean;
}

const FIELD =
  "h-9 rounded-md border-black/[0.06] bg-white text-[13px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10 dark:bg-transparent";

function formatMoney(amount: number, currency: string, language: string) {
  const locale =
    language === "ar" ? "ar-MA" : language === "fr" ? "fr-MA" : "en-US";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function ShippingSettings({
  store,
  onChange,
  onSave,
  saving,
  dirty,
}: ShippingSettingsProps) {
  const zones = store.settings.shippingZones;
  const currency = store.currency;
  const [cityFilter, setCityFilter] = useState("");

  const updateZones = (newZones: ShippingZone[]) => {
    onChange({
      settings: { ...store.settings, shippingZones: newZones },
    });
  };

  const updateZone = (id: string, patch: Partial<ShippingZone>) => {
    updateZones(zones.map((z) => (z.id === id ? { ...z, ...patch } : z)));
  };

  const addZone = () => {
    updateZones([
      ...zones,
      {
        id: crypto.randomUUID(),
        name: "New zone",
        cities: ["Casablanca"],
        freeShippingThreshold: 200,
        rate: 30,
      },
    ]);
  };

  const removeZone = (id: string) => {
    if (zones.length <= 1) return;
    updateZones(zones.filter((z) => z.id !== id));
  };

  const toggleCity = (zoneId: string, city: string) => {
    const zone = zones.find((z) => z.id === zoneId);
    if (!zone) return;
    const cities = zone.cities.includes(city)
      ? zone.cities.filter((c) => c !== city)
      : [...zone.cities, city];
    updateZone(zoneId, { cities: cities.length ? cities : [city] });
  };

  const toggleCountry = (zoneId: string, countryCities: readonly string[]) => {
    const zone = zones.find((z) => z.id === zoneId);
    if (!zone) return;
    const allOn = countryCities.every((c) => zone.cities.includes(c));
    if (allOn) {
      const next = zone.cities.filter((c) => !countryCities.includes(c));
      updateZone(zoneId, {
        cities: next.length ? next : [countryCities[0] ?? "Casablanca"],
      });
      return;
    }
    const merged = new Set([...zone.cities, ...countryCities]);
    updateZone(zoneId, { cities: Array.from(merged) });
  };

  const selectAllCities = (zoneId: string) => {
    updateZone(zoneId, { cities: [...ALL_SHIPPING_CITIES] });
  };

  const clearCities = (zoneId: string) => {
    updateZone(zoneId, { cities: ["Casablanca"] });
  };

  const coveredCities = useMemo(() => {
    const set = new Set<string>();
    for (const z of zones) for (const c of z.cities) set.add(c);
    return set.size;
  }, [zones]);

  const coveredCountries = useMemo(() => {
    return SHIPPING_COUNTRIES.filter((country) =>
      country.cities.some((city) =>
        zones.some((z) => z.cities.includes(city))
      )
    ).length;
  }, [zones]);

  const lowestRate = useMemo(() => {
    if (!zones.length) return 0;
    return Math.min(...zones.map((z) => z.rate));
  }, [zones]);

  const checklist = useMemo(
    () => [
      {
        id: "zones",
        label: "Zones",
        done: zones.length > 0 && zones.every((z) => z.name.trim()),
      },
      {
        id: "cities",
        label: "Cities",
        done: zones.every((z) => z.cities.length > 0),
      },
      {
        id: "rates",
        label: "Rates",
        done: zones.every((z) => z.rate >= 0),
      },
    ],
    [zones]
  );
  const doneCount = checklist.filter((c) => c.done).length;

  const previewZone = zones[0];
  const filterQ = cityFilter.trim().toLowerCase();

  return (
    <SettingsPanel
      title="Shipping"
      description="Delivery zones across Morocco, Algeria, Tunisia, and Egypt."
      onSave={onSave}
      saving={saving}
      dirty={dirty}
      saveLabel="Save shipping"
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] shadow-none dark:border-white/10"
          onClick={addZone}
        >
          <Plus className="mr-1 h-3 w-3" />
          Add zone
        </Button>
      }
    >
      <div className="overflow-hidden rounded-[10px] border border-black/[0.06] bg-[#FAFAFA]/80 dark:border-white/10 dark:bg-white/[0.025]">
        <div className="flex items-center justify-between border-b border-black/[0.05] px-3.5 py-2 dark:border-white/10">
          <p className="text-[11px] font-medium text-neutral-400">
            Checkout preview
          </p>
          <p className="text-[10px] text-neutral-400">
            {doneCount}/{checklist.length} ready
          </p>
        </div>

        <div className="grid gap-3 px-3.5 py-3.5 sm:grid-cols-2">
          <div className="flex items-start gap-2.5 rounded-[10px] border border-black/[0.05] bg-white p-3 dark:border-white/10 dark:bg-[#1C1C1E]">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#007AFF]/10 text-[#007AFF]">
              <Truck className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-neutral-400">
                From {zones.length} zone{zones.length === 1 ? "" : "s"}
              </p>
              <p className="mt-0.5 font-sans text-[15px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                {formatMoney(lowestRate, currency, store.language)}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-neutral-500">
                Lowest rate · free above threshold
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-[10px] border border-black/[0.05] bg-white p-3 dark:border-white/10 dark:bg-[#1C1C1E]">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#007AFF]/10 text-[#007AFF]">
              <MapPin className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-neutral-400">
                Coverage
              </p>
              <p className="mt-0.5 font-sans text-[15px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                {coveredCities}/{ALL_SHIPPING_CITIES.length} cities
              </p>
              <p className="mt-0.5 truncate text-[11px] text-neutral-500">
                {coveredCountries}/{SHIPPING_COUNTRIES.length} countries
                {previewZone
                  ? ` · ${previewZone.name.trim() || "Zone"}`
                  : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 border-t border-black/[0.05] px-3.5 py-2 dark:border-white/10">
          {checklist.map((item) => (
            <span
              key={item.id}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                item.done
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "bg-black/[0.03] text-neutral-400 dark:bg-white/[0.04]"
              )}
            >
              {item.done ? (
                <Check className="h-2.5 w-2.5" />
              ) : (
                <span className="h-2.5 w-2.5 rounded-full border border-current opacity-40" />
              )}
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {zones.map((zone, index) => {
          const allSelected = ALL_SHIPPING_CITIES.every((c) =>
            zone.cities.includes(c)
          );
          return (
            <SettingsSection
              key={zone.id}
              title={zone.name.trim() || `Zone ${index + 1}`}
              description={`${zone.cities.length} cities · ${formatMoney(zone.rate, currency, store.language)} shipping`}
              action={
                zones.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px] text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10"
                    onClick={() => removeZone(zone.id)}
                    aria-label={`Remove ${zone.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                ) : null
              }
            >
              <SettingsField label="Zone name" htmlFor={`zone-name-${zone.id}`}>
                <Input
                  id={`zone-name-${zone.id}`}
                  value={zone.name}
                  onChange={(e) =>
                    updateZone(zone.id, { name: e.target.value })
                  }
                  placeholder="Casablanca & Rabat"
                  className={cn(FIELD, "font-medium")}
                />
              </SettingsField>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SettingsField
                  label={`Shipping rate (${currency})`}
                  htmlFor={`zone-rate-${zone.id}`}
                  hint="Charged when the cart is below free shipping."
                >
                  <Input
                    id={`zone-rate-${zone.id}`}
                    type="number"
                    min={0}
                    value={zone.rate}
                    onChange={(e) =>
                      updateZone(zone.id, {
                        rate: Number(e.target.value) || 0,
                      })
                    }
                    className={FIELD}
                  />
                </SettingsField>
                <SettingsField
                  label={`Free shipping above (${currency})`}
                  htmlFor={`zone-free-${zone.id}`}
                  hint="Set 0 to never offer free shipping in this zone."
                >
                  <Input
                    id={`zone-free-${zone.id}`}
                    type="number"
                    min={0}
                    value={zone.freeShippingThreshold}
                    onChange={(e) =>
                      updateZone(zone.id, {
                        freeShippingThreshold: Number(e.target.value) || 0,
                      })
                    }
                    className={FIELD}
                  />
                </SettingsField>
              </div>

              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                    Cities by country
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-neutral-400">
                      {zone.cities.length} selected
                    </span>
                    <button
                      type="button"
                      className="rounded-md px-1.5 py-0.5 text-[10px] font-medium text-[#007AFF] hover:bg-[#007AFF]/10"
                      onClick={() =>
                        allSelected
                          ? clearCities(zone.id)
                          : selectAllCities(zone.id)
                      }
                    >
                      {allSelected ? "Reset" : "Select all"}
                    </button>
                  </div>
                </div>

                <Input
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  placeholder="Search cities…"
                  className={cn(FIELD, "h-8 text-[12px]")}
                />

                <div className="space-y-2.5">
                  {SHIPPING_COUNTRIES.map((country) => {
                    const cities = filterQ
                      ? country.cities.filter((c) =>
                          c.toLowerCase().includes(filterQ)
                        )
                      : [...country.cities];
                    if (cities.length === 0) return null;
                    const countryAllOn = country.cities.every((c) =>
                      zone.cities.includes(c)
                    );
                    const countrySome = country.cities.some((c) =>
                      zone.cities.includes(c)
                    );
                    return (
                      <div
                        key={country.code}
                        className="rounded-[10px] border border-black/[0.05] bg-white p-2.5 dark:border-white/10 dark:bg-white/[0.03]"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-[11px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-100">
                            {country.name}
                            <span className="ml-1.5 font-normal text-neutral-400">
                              {
                                country.cities.filter((c) =>
                                  zone.cities.includes(c)
                                ).length
                              }
                              /{country.cities.length}
                            </span>
                          </p>
                          <button
                            type="button"
                            className={cn(
                              "rounded-md px-1.5 py-0.5 text-[10px] font-medium transition",
                              countryAllOn
                                ? "text-neutral-500 hover:bg-black/[0.04]"
                                : "text-[#007AFF] hover:bg-[#007AFF]/10"
                            )}
                            onClick={() =>
                              toggleCountry(zone.id, country.cities)
                            }
                          >
                            {countryAllOn
                              ? "Clear"
                              : countrySome
                                ? "Select rest"
                                : "Select country"}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {cities.map((city) => {
                            const selected = zone.cities.includes(city);
                            return (
                              <button
                                key={city}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => toggleCity(zone.id, city)}
                                className={cn(
                                  "rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
                                  selected
                                    ? "border-[#007AFF]/30 bg-[#007AFF]/10 text-[#007AFF]"
                                    : "border-black/[0.06] bg-[#FAFAFA] text-neutral-600 hover:border-neutral-300 hover:bg-white dark:border-white/10 dark:bg-transparent dark:text-neutral-300 dark:hover:bg-white/[0.04]"
                                )}
                              >
                                {city}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[10px] border border-black/[0.05] bg-white px-3 py-2 text-[11px] text-neutral-500 dark:border-white/10 dark:bg-white/[0.03]">
                Cart under{" "}
                <span className="font-medium text-neutral-700 dark:text-neutral-200">
                  {formatMoney(
                    zone.freeShippingThreshold,
                    currency,
                    store.language
                  )}
                </span>
                {" → "}
                {formatMoney(zone.rate, currency, store.language)} shipping.
                At or above → free.
              </div>
            </SettingsSection>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-9 w-full rounded-md border-dashed border-black/[0.1] text-[12px] shadow-none dark:border-white/15"
        onClick={addZone}
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Add another zone
      </Button>

      <SettingsRelatedCard className="rounded-[10px] px-3.5 py-3 text-[12px]">
        Currency for these rates is set in{" "}
        <SettingsRelatedLink tab="currency">
          Currency & language
        </SettingsRelatedLink>
        . Promo messages live in{" "}
        <SettingsRelatedLink tab="checkout">Checkout</SettingsRelatedLink>
        ; COD is under{" "}
        <SettingsRelatedLink tab="payment">Payments</SettingsRelatedLink>.
      </SettingsRelatedCard>
    </SettingsPanel>
  );
}
