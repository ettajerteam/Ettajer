"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MOROCCO_CITIES } from "@/lib/morocco-cities";
import { DashboardCardSection } from "@/components/dashboard/dashboard-card-section";
import type { StoreWithSettings, ShippingZone } from "@/lib/store-settings";

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
    <DashboardCardSection
      title="Shipping"
      description="Configure zones for Moroccan cities, rates, and free shipping thresholds."
      footer={
        <Button onClick={onSave} loading={saving} className="bg-[#007AFF] hover:bg-[#0071EB]">
          Save shipping settings
        </Button>
      }
    >
      <div className="space-y-4">
        {zones.map((zone) => (
          <div key={zone.id} className="rounded-xl border bg-muted/20 p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <Input
                value={zone.name}
                onChange={(e) => updateZone(zone.id, { name: e.target.value })}
                className="font-medium max-w-xs"
              />
              {zones.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => removeZone(zone.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cities</Label>
              <div className="flex flex-wrap gap-2">
                {MOROCCO_CITIES.map((city) => (
                  <Badge
                    key={city}
                    variant={zone.cities.includes(city) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCity(zone.id, city)}
                  >
                    {city}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addZone}>
        <Plus className="h-4 w-4 mr-1" />
        Add shipping zone
      </Button>
    </DashboardCardSection>
  );
}
