"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOROCCO_CITIES } from "@/lib/morocco-cities";
import { SettingsPanel } from "@/components/settings/settings-panel";
import type { StoreWithSettings, ShippingZone } from "@/lib/store-settings";
import { cn } from "@/lib/utils";

interface ShippingSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

export function ShippingSettings({ store, onChange, onSave, saving }: ShippingSettingsProps) {
  const zones = store.settings.shippingZones;

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

  return (
    <SettingsPanel
      kicker="Shipping"
      title="Delivery zones"
      description="Set rates and free-shipping thresholds for Moroccan cities."
      onSave={onSave}
      saving={saving}
      saveLabel="Save shipping"
      action={
        <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={addZone}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add zone
        </Button>
      }
    >
      <div className="space-y-4">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4 sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <Input
                value={zone.name}
                onChange={(e) => updateZone(zone.id, { name: e.target.value })}
                className="h-11 max-w-xs rounded-xl font-medium"
              />
              {zones.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => removeZone(zone.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Free shipping above ({store.currency})</Label>
                <Input
                  type="number"
                  min="0"
                  value={zone.freeShippingThreshold}
                  onChange={(e) =>
                    updateZone(zone.id, {
                      freeShippingThreshold: Number(e.target.value) || 0,
                    })
                  }
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Shipping rate ({store.currency})</Label>
                <Input
                  type="number"
                  min="0"
                  value={zone.rate}
                  onChange={(e) =>
                    updateZone(zone.id, { rate: Number(e.target.value) || 0 })
                  }
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <Label>Cities</Label>
                <span className="text-[11px] text-neutral-400">
                  {zone.cities.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {MOROCCO_CITIES.map((city) => {
                  const selected = zone.cities.includes(city);
                  return (
                    <button
                      key={city}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleCity(zone.id, city)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                        selected
                          ? "border-[#007AFF] bg-[#007AFF] text-white hover:border-[#0071EB] hover:bg-[#0071EB]"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50",
                      )}
                    >
                      {city}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SettingsPanel>
  );
}
