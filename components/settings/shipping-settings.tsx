"use client";

import { useMemo, useState } from "react";
import { Check, MapPin, Plus, Trash2, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SHIPPING_REGIONS,
  countryCodeToName,
  getCitiesForCountry,
  getCountriesForRegion,
  type ShippingRegionId,
} from "@/lib/shipping-destinations";
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

const TRIGGER =
  "h-9 rounded-md border-black/[0.06] bg-white text-[13px] shadow-none focus:ring-[#007AFF]/20 dark:border-white/10 dark:bg-transparent";

const RATE_PRESETS = [15, 25, 30, 40, 50] as const;
const FREE_PRESETS = [0, 150, 200, 300, 500] as const;

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

  const [pickerRegion, setPickerRegion] = useState<Record<string, ShippingRegionId>>(
    {}
  );
  const [pickerCountry, setPickerCountry] = useState<Record<string, string>>({});
  const [manualCity, setManualCity] = useState<Record<string, string>>({});

  const updateZones = (newZones: ShippingZone[]) => {
    onChange({
      settings: { ...store.settings, shippingZones: newZones },
    });
  };

  const updateZone = (id: string, patch: Partial<ShippingZone>) => {
    updateZones(zones.map((z) => (z.id === id ? { ...z, ...patch } : z)));
  };

  const addZone = () => {
    const id = crypto.randomUUID();
    updateZones([
      ...zones,
      {
        id,
        name: "New zone",
        countries: ["MA"],
        cities: [],
        freeShippingThreshold: 200,
        rate: 30,
      },
    ]);
    setPickerRegion((prev) => ({ ...prev, [id]: "africa" }));
    setPickerCountry((prev) => ({ ...prev, [id]: "MA" }));
  };

  const removeZone = (id: string) => {
    if (zones.length <= 1) return;
    updateZones(zones.filter((z) => z.id !== id));
  };

  const addCountry = (zoneId: string, code: string) => {
    const zone = zones.find((z) => z.id === zoneId);
    if (!zone) return;
    const upper = code.toUpperCase();
    if (zone.countries.includes(upper)) return;
    updateZone(zoneId, { countries: [...zone.countries, upper] });
  };

  const removeCountry = (zoneId: string, code: string) => {
    const zone = zones.find((z) => z.id === zoneId);
    if (!zone) return;
    const nextCountries = zone.countries.filter((c) => c !== code);
    const nextCities = zone.cities.filter((city) => {
      const cities = getCitiesForCountry(code);
      return !cities.some((c) => c.toLowerCase() === city.toLowerCase());
    });
    if (nextCountries.length === 0 && nextCities.length === 0) return;
    updateZone(zoneId, { countries: nextCountries, cities: nextCities });
  };

  const addAllCountriesInRegion = (zoneId: string, regionId: ShippingRegionId) => {
    const zone = zones.find((z) => z.id === zoneId);
    if (!zone) return;
    const codes = getCountriesForRegion(regionId).map((c) => c.code);
    updateZone(zoneId, {
      countries: Array.from(new Set([...zone.countries, ...codes])),
    });
  };

  const addCity = (zoneId: string, city: string, ensureCountry?: string) => {
    const zone = zones.find((z) => z.id === zoneId);
    if (!zone) return;
    const name = city.trim();
    if (!name) return;
    if (zone.cities.some((c) => c.toLowerCase() === name.toLowerCase())) return;
    const countries =
      ensureCountry && !zone.countries.includes(ensureCountry)
        ? [...zone.countries, ensureCountry]
        : zone.countries;
    updateZone(zoneId, { cities: [...zone.cities, name], countries });
  };

  const removeCity = (zoneId: string, city: string) => {
    const zone = zones.find((z) => z.id === zoneId);
    if (!zone) return;
    updateZone(zoneId, { cities: zone.cities.filter((c) => c !== city) });
  };

  const coveredCountryCodes = useMemo(() => {
    const set = new Set<string>();
    for (const z of zones) for (const c of z.countries) set.add(c.toUpperCase());
    return set;
  }, [zones]);

  const freeZoneCount = useMemo(
    () => zones.filter((z) => z.rate === 0).length,
    [zones]
  );

  const lowestPaidRate = useMemo(() => {
    const paid = zones.filter((z) => z.rate > 0);
    if (!paid.length) return 0;
    return Math.min(...paid.map((z) => z.rate));
  }, [zones]);

  const checklist = useMemo(
    () => [
      {
        id: "zones",
        label: "Zones",
        done: zones.length > 0 && zones.every((z) => z.name.trim()),
      },
      {
        id: "coverage",
        label: "Coverage",
        done: zones.every(
          (z) => z.countries.length > 0 || z.cities.length > 0
        ),
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

  return (
    <SettingsPanel
      title="Shipping"
      description="Choose regions and countries you deliver to — free or paid per zone."
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
                {freeZoneCount === zones.length
                  ? "Free"
                  : formatMoney(lowestPaidRate, currency, store.language)}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-neutral-500">
                {freeZoneCount > 0
                  ? `${freeZoneCount} free zone${freeZoneCount === 1 ? "" : "s"}`
                  : "Lowest paid rate"}
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
                {coveredCountryCodes.size}{" "}
                {coveredCountryCodes.size === 1 ? "country" : "countries"}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-neutral-500">
                {previewZone ? previewZone.name.trim() || "Zone" : "No zones"}
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
          const isFree = zone.rate === 0;
          const regionId =
            pickerRegion[zone.id] ??
            (SHIPPING_REGIONS.find((r) =>
              r.countries.some((c) => zone.countries.includes(c.code))
            )?.id as ShippingRegionId | undefined) ??
            "africa";
          const regionCountries = getCountriesForRegion(regionId);
          const countryCode =
            pickerCountry[zone.id] ??
            zone.countries[0] ??
            regionCountries[0]?.code ??
            "MA";
          const countryCities = getCitiesForCountry(countryCode);
          const availableCities = countryCities.filter(
            (c) => !zone.cities.some((x) => x.toLowerCase() === c.toLowerCase())
          );
          const manualValue = manualCity[zone.id] ?? "";

          return (
            <SettingsSection
              key={zone.id}
              title={zone.name.trim() || `Zone ${index + 1}`}
              description={`${zone.countries.length} countr${zone.countries.length === 1 ? "y" : "ies"}${zone.cities.length ? ` · ${zone.cities.length} cities` : ""} · ${isFree ? "Free" : formatMoney(zone.rate, currency, store.language)}`}
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
                  placeholder="e.g. Europe, Maghreb, Worldwide"
                  className={cn(FIELD, "font-medium")}
                />
              </SettingsField>

              <div className="space-y-2 rounded-[10px] border border-black/[0.05] bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                  Countries
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <SettingsField label="Region">
                    <Select
                      value={regionId}
                      onValueChange={(v) => {
                        const next = v as ShippingRegionId;
                        setPickerRegion((prev) => ({
                          ...prev,
                          [zone.id]: next,
                        }));
                        const first = getCountriesForRegion(next)[0]?.code;
                        if (first) {
                          setPickerCountry((prev) => ({
                            ...prev,
                            [zone.id]: first,
                          }));
                        }
                      }}
                    >
                      <SelectTrigger className={TRIGGER}>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {SHIPPING_REGIONS.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </SettingsField>

                  <SettingsField label="Country">
                    <Select
                      value={countryCode}
                      onValueChange={(v) =>
                        setPickerCountry((prev) => ({
                          ...prev,
                          [zone.id]: v,
                        }))
                      }
                    >
                      <SelectTrigger className={TRIGGER}>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {regionCountries.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </SettingsField>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] shadow-none dark:border-white/10"
                    onClick={() => addCountry(zone.id, countryCode)}
                    disabled={zone.countries.includes(countryCode)}
                  >
                    Add {countryCodeToName(countryCode)}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] shadow-none dark:border-white/10"
                    onClick={() => addAllCountriesInRegion(zone.id, regionId)}
                  >
                    Add all in{" "}
                    {SHIPPING_REGIONS.find((r) => r.id === regionId)?.name}
                  </Button>
                </div>

                {zone.countries.length === 0 ? (
                  <p className="text-[11px] text-neutral-400">
                    No countries yet — pick a region, then add a country.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {zone.countries.map((code) => (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1 rounded-md border border-[#007AFF]/20 bg-[#007AFF]/10 px-2 py-1 text-[11px] font-medium text-[#007AFF]"
                      >
                        <span className="max-w-[140px] truncate">
                          {countryCodeToName(code)}
                        </span>
                        <span className="text-[9px] font-normal opacity-60">
                          {code}
                        </span>
                        <button
                          type="button"
                          className="rounded p-0.5 hover:bg-[#007AFF]/15"
                          aria-label={`Remove ${code}`}
                          onClick={() => removeCountry(zone.id, code)}
                          disabled={
                            zone.countries.length <= 1 && zone.cities.length === 0
                          }
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {countryCities.length > 0 ? (
                <div className="space-y-2 rounded-[10px] border border-black/[0.05] bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                    Optional cities
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Leave empty to ship the whole country. Add cities for finer
                    rates (city match wins over country).
                  </p>
                  <SettingsField label="City">
                    <Select
                      key={`${zone.id}-${countryCode}-${zone.cities.length}`}
                      onValueChange={(city) => {
                        if (city) addCity(zone.id, city, countryCode);
                      }}
                      disabled={availableCities.length === 0}
                    >
                      <SelectTrigger className={TRIGGER}>
                        <SelectValue
                          placeholder={
                            availableCities.length === 0
                              ? "All listed cities added"
                              : "Select city to add"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {availableCities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </SettingsField>

                  <div className="flex gap-1.5">
                    <Input
                      value={manualValue}
                      onChange={(e) =>
                        setManualCity((prev) => ({
                          ...prev,
                          [zone.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCity(zone.id, manualValue);
                          setManualCity((prev) => ({ ...prev, [zone.id]: "" }));
                        }
                      }}
                      placeholder="Or type a city name…"
                      className={cn(FIELD, "flex-1")}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 shrink-0 rounded-md border-black/[0.06] px-3 text-[12px] shadow-none dark:border-white/10"
                      disabled={!manualValue.trim()}
                      onClick={() => {
                        addCity(zone.id, manualValue);
                        setManualCity((prev) => ({ ...prev, [zone.id]: "" }));
                      }}
                    >
                      Add
                    </Button>
                  </div>

                  {zone.cities.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {zone.cities.map((city) => (
                        <span
                          key={city}
                          className="inline-flex items-center gap-1 rounded-md border border-black/[0.08] bg-neutral-50 px-2 py-1 text-[11px] font-medium text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200"
                        >
                          <span className="max-w-[140px] truncate">{city}</span>
                          <button
                            type="button"
                            className="rounded p-0.5 hover:bg-black/5 dark:hover:bg-white/10"
                            aria-label={`Remove ${city}`}
                            onClick={() => removeCity(zone.id, city)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="space-y-3 rounded-[10px] border border-black/[0.05] bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                      Delivery price
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-500">
                      Free shipping sets the rate to 0 for this zone.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isFree}
                    onClick={() =>
                      updateZone(zone.id, {
                        rate: isFree ? 30 : 0,
                        ...(isFree ? {} : { freeShippingThreshold: 0 }),
                      })
                    }
                    className={cn(
                      "relative h-7 w-12 shrink-0 rounded-full transition",
                      isFree ? "bg-emerald-500" : "bg-neutral-200 dark:bg-white/15"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition",
                        isFree ? "left-[22px]" : "left-0.5"
                      )}
                    />
                    <span className="sr-only">Free shipping</span>
                  </button>
                </div>

                {isFree ? (
                  <p className="rounded-md bg-emerald-50 px-2.5 py-2 text-[12px] font-medium text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                    Always free for countries in this zone.
                  </p>
                ) : (
                  <>
                    <SettingsField
                      label={`Shipping rate (${currency})`}
                      htmlFor={`zone-rate-${zone.id}`}
                      hint="Charged when the cart is below free shipping."
                    >
                      <div className="flex flex-wrap gap-1 pb-1.5">
                        {RATE_PRESETS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => updateZone(zone.id, { rate: preset })}
                            className={cn(
                              "rounded-md border px-2 py-1 text-[11px] font-medium transition",
                              zone.rate === preset
                                ? "border-[#007AFF]/30 bg-[#007AFF]/10 text-[#007AFF]"
                                : "border-black/[0.06] text-neutral-600 hover:bg-neutral-50 dark:border-white/10 dark:text-neutral-300"
                            )}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
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
                        placeholder="Custom amount"
                        className={FIELD}
                      />
                    </SettingsField>

                    <SettingsField
                      label={`Free shipping above (${currency})`}
                      htmlFor={`zone-free-${zone.id}`}
                      hint="Set 0 if this zone never offers free shipping."
                    >
                      <div className="flex flex-wrap gap-1 pb-1.5">
                        {FREE_PRESETS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() =>
                              updateZone(zone.id, {
                                freeShippingThreshold: preset,
                              })
                            }
                            className={cn(
                              "rounded-md border px-2 py-1 text-[11px] font-medium transition",
                              zone.freeShippingThreshold === preset
                                ? "border-[#007AFF]/30 bg-[#007AFF]/10 text-[#007AFF]"
                                : "border-black/[0.06] text-neutral-600 hover:bg-neutral-50 dark:border-white/10 dark:text-neutral-300"
                            )}
                          >
                            {preset === 0 ? "Never" : preset}
                          </button>
                        ))}
                      </div>
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
                        placeholder="Custom threshold"
                        className={FIELD}
                      />
                    </SettingsField>

                    <p className="text-[11px] text-neutral-500">
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
                    </p>
                  </>
                )}
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
          Languages
        </SettingsRelatedLink>
        . Promo messages live in{" "}
        <SettingsRelatedLink tab="checkout">Checkout</SettingsRelatedLink>
        ; COD is under{" "}
        <SettingsRelatedLink tab="payment">Payments</SettingsRelatedLink>.
      </SettingsRelatedCard>
    </SettingsPanel>
  );
}
