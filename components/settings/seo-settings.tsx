"use client";

import { useMemo } from "react";
import { Check, Search } from "lucide-react";
import Link from "next/link";
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
import { cn } from "@/lib/utils";

interface SeoSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  dirty?: boolean;
}

const FIELD =
  "h-9 rounded-md border-black/[0.06] bg-white text-[13px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10 dark:bg-transparent";
const AREA =
  "rounded-md border-black/[0.06] bg-white text-[13px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10 dark:bg-transparent";

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

  const checklist = useMemo(
    () => [
      { id: "title", label: "Title", done: Boolean(seo.title?.trim()) },
      {
        id: "description",
        label: "Description",
        done: Boolean(seo.description?.trim()),
      },
      {
        id: "keywords",
        label: "Keywords",
        done: (seo.keywords ?? []).length > 0,
      },
      { id: "index", label: "Indexable", done: seo.noIndex !== true },
    ],
    [seo]
  );
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <SettingsPanel
      title="SEO"
      description="How your shop appears in Google and when shared."
      onSave={onSave}
      saving={saving}
      dirty={dirty}
      saveLabel="Save SEO"
    >
      <div className="overflow-hidden rounded-[10px] border border-black/[0.06] bg-[#FAFAFA]/80 dark:border-white/10 dark:bg-white/[0.025]">
        <div className="flex items-center justify-between border-b border-black/[0.05] px-3.5 py-2 dark:border-white/10">
          <p className="text-[11px] font-medium text-neutral-400">
            Search preview
          </p>
          <p className="text-[10px] text-neutral-400">
            {doneCount}/{checklist.length} ready
          </p>
        </div>

        <div className="flex items-start gap-2.5 px-3.5 py-3.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#007AFF]/10 text-[#007AFF]">
            <Search className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="truncate text-[11px] text-neutral-400">{previewUrl}</p>
            <p className="truncate text-[15px] font-semibold leading-snug tracking-[-0.02em] text-[#1a0dab] dark:text-[#8ab4f8]">
              {previewTitle}
            </p>
            <p className="line-clamp-2 text-[12px] leading-relaxed text-neutral-500">
              {previewDescription}
            </p>
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

      <SettingsSection
        title="Search listing"
        description="What shoppers see in Google results."
      >
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
            className={FIELD}
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
            className={cn(AREA, "min-h-[80px]")}
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
            className={FIELD}
          />
        </SettingsField>
      </SettingsSection>

      <label className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-black/[0.05] bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[#007AFF] focus:ring-[#007AFF]"
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
          <span className="block text-[13px] font-medium text-neutral-900 dark:text-white">
            Hide store from search engines
          </span>
          <span className="mt-0.5 block text-[11px] text-neutral-500">
            Adds noindex — useful while you are still setting up.
          </span>
        </span>
      </label>

      <SettingsRelatedCard className="rounded-[10px] px-3.5 py-3 text-[12px]">
        Public URL under{" "}
        <SettingsRelatedLink tab="website">Domains</SettingsRelatedLink>
        . Themes and menus live in{" "}
        <Link
          href="/dashboard/themes"
          className="inline-flex items-center gap-1 font-medium text-[#007AFF] transition hover:text-[#0071EB]"
        >
          Online Store
        </Link>
        .
      </SettingsRelatedCard>
    </SettingsPanel>
  );
}
