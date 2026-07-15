"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES } from "@/types";
import { STORE_LANGUAGES } from "@/lib/morocco-cities";
import { DashboardCardSection } from "@/components/dashboard/dashboard-card-section";
import type { StoreWithSettings } from "@/lib/store-settings";

interface CurrencyLanguageSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

export function CurrencyLanguageSettings({
  store,
  onChange,
  onSave,
  saving,
}: CurrencyLanguageSettingsProps) {
  return (
    <DashboardCardSection
      title="Currency & language"
      description="How prices are displayed and your store's default language."
      footer={
        <Button onClick={onSave} loading={saving} className="bg-[#007AFF] hover:bg-[#0071EB]">
          Save currency & language
        </Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={store.currency} onValueChange={(v) => onChange({ currency: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Language</Label>
          <Select value={store.language} onValueChange={(v) => onChange({ language: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STORE_LANGUAGES.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground rounded-xl bg-muted/40 p-3">
        Full Arabic RTL storefront support is coming soon. Language selection is saved for future
        localization.
      </p>
    </DashboardCardSection>
  );
}
