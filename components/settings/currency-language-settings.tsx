"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES } from "@/types";
import { STORE_LANGUAGES } from "@/lib/morocco-cities";
import { SettingsPanel } from "@/components/settings/settings-panel";
import type { StoreWithSettings } from "@/lib/store-settings";

interface CurrencyLanguageSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  dirty?: boolean;
}

export function CurrencyLanguageSettings({
  store,
  onChange,
  onSave,
  saving,
  dirty,
}: CurrencyLanguageSettingsProps) {
  return (
    <SettingsPanel
      kicker="Locale"
      title="Currency & language"
      description="How prices are shown and which language your store defaults to."
      onSave={onSave}
      saving={saving}
      dirty={dirty}
      saveLabel="Save locale"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={store.currency} onValueChange={(v) => onChange({ currency: v })}>
            <SelectTrigger className="h-11 rounded-xl">
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
            <SelectTrigger className="h-11 rounded-xl">
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

      <p className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 px-4 py-3 text-[13px] leading-relaxed text-emerald-900">
        Storefront buttons, cart, and checkout follow this language. Arabic also enables RTL layout.
      </p>
    </SettingsPanel>
  );
}
