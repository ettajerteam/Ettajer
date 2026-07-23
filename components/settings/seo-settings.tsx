"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SettingsPanel } from "@/components/settings/settings-panel";
import {
  SettingsField,
  SettingsSection,
} from "@/components/settings/settings-section";
import {
  SettingsRelatedCard,
  SettingsRelatedLink,
} from "@/components/settings/settings-related-link";
import type { StoreWithSettings } from "@/lib/store-settings";
import { getAbsoluteStoreUrl } from "@/lib/storefront-urls";

interface SeoSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  dirty?: boolean;
}

export function SeoSettings({
  store,
  onChange,
  onSave,
  saving,
  dirty,
}: SeoSettingsProps) {
  const seo = store.settings.seo;
  const previewTitle = seo.title?.trim() || `${store.name} — online store`;
  const previewDescription =
    seo.description?.trim() ||
    store.description?.trim() ||
    "Shop online with cash on delivery.";
  const previewUrl = getAbsoluteStoreUrl(store.slug).replace(/^https?:\/\//, "");

  return (
    <SettingsPanel
      kicker="SEO"
      title="Search & sharing"
      description="Control how your shop appears in Google and when shared on social media."
      onSave={onSave}
      saving={saving}
      dirty={dirty}
      saveLabel="Save SEO"
    >
      <SettingsSection title="Search listing" description="What shoppers see in Google results.">
        <SettingsField
          label="Page title"
          htmlFor="seo-title"
          hint={`${(seo.title ?? "").length}/70 · Leave blank to use your store name.`}
        >
          <Input
            id="seo-title"
            value={seo.title ?? ""}
            onChange={(e) =>
              onChange({
                settings: {
                  ...store.settings,
                  seo: { ...seo, title: e.target.value },
                },
              })
            }
            placeholder={`${store.name} — online store`}
            className="h-11 rounded-xl bg-white dark:bg-transparent"
            maxLength={70}
          />
        </SettingsField>

        <SettingsField
          label="Meta description"
          htmlFor="seo-description"
          hint={`${(seo.description ?? "").length}/160`}
        >
          <Textarea
            id="seo-description"
            value={seo.description ?? ""}
            onChange={(e) =>
              onChange({
                settings: {
                  ...store.settings,
                  seo: { ...seo, description: e.target.value },
                },
              })
            }
            placeholder="Short pitch for search results — what you sell and why shoppers should visit."
            className="min-h-[96px] rounded-xl bg-white dark:bg-transparent"
            maxLength={160}
          />
        </SettingsField>

        <SettingsField
          label="Keywords"
          htmlFor="seo-keywords"
          hint={`Comma-separated · ${(seo.keywords ?? []).length}/20 keywords`}
        >
          <Input
            id="seo-keywords"
            value={(seo.keywords ?? []).join(", ")}
            onChange={(e) =>
              onChange({
                settings: {
                  ...store.settings,
                  seo: {
                    ...seo,
                    keywords: e.target.value
                      .split(",")
                      .map((k) => k.trim())
                      .filter(Boolean)
                      .slice(0, 20)
                      .map((k) => k.slice(0, 40)),
                  },
                },
              })
            }
            placeholder="fashion, casablanca, cash on delivery"
            className="h-11 rounded-xl bg-white dark:bg-transparent"
          />
        </SettingsField>
      </SettingsSection>

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
          Google preview
        </p>
        <div className="max-w-xl space-y-1">
          <p className="truncate text-[13px] text-[#202124] dark:text-neutral-300">
            {previewUrl}
          </p>
          <p className="truncate text-xl leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">
            {previewTitle}
          </p>
          <p className="line-clamp-2 text-[13px] leading-relaxed text-[#4d5156] dark:text-neutral-400">
            {previewDescription}
          </p>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-neutral-300 text-[#007AFF] focus:ring-[#007AFF]"
          checked={seo.noIndex === true}
          onChange={(e) =>
            onChange({
              settings: {
                ...store.settings,
                seo: { ...seo, noIndex: e.target.checked },
              },
            })
          }
        />
        <span>
          <span className="block text-sm font-medium text-neutral-900 dark:text-white">
            Hide store from search engines
          </span>
          <span className="mt-0.5 block text-[12px] text-neutral-500">
            Adds noindex — useful while you are still setting up.
          </span>
        </span>
      </label>

      <SettingsRelatedCard>
        Your public URL and custom domain are under{" "}
        <SettingsRelatedLink tab="website">Website</SettingsRelatedLink>.
      </SettingsRelatedCard>
    </SettingsPanel>
  );
}
