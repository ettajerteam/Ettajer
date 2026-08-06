"use client";

import { STORE_FONTS, THEME_TEMPLATES, type ThemeId } from "@/lib/themes";
import {
  dashboardCard,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

interface ThemesBrandPanelProps {
  primaryColor: string;
  secondaryColor: string;
  font: string;
  selectedTemplate: ThemeId;
  liveTemplate: ThemeId;
  onPrimaryChange: (color: string) => void;
  onSecondaryChange: (color: string) => void;
  onFontChange: (font: string) => void;
  onSelectStyle: (theme: ThemeId) => void;
}

export function ThemesBrandPanel({
  primaryColor,
  secondaryColor,
  font,
  selectedTemplate,
  liveTemplate,
  onPrimaryChange,
  onSecondaryChange,
  onFontChange,
  onSelectStyle,
}: ThemesBrandPanelProps) {
  return (
    <section id="themes-brand" className={cn(dashboardCard, "scroll-mt-20 overflow-hidden")}>
      <div className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
        <h2 className={dashboardTitle}>Brand</h2>
        <p className={dashboardSubtitle}>Colors & style — publish when ready</p>
      </div>

      <div className="space-y-4 p-4">
        {/* Live preview chip */}
        <div
          className="relative overflow-hidden rounded-[12px] border border-black/[0.06] p-4 dark:border-white/10"
          style={{
            background: `linear-gradient(145deg, ${secondaryColor} 0%, ${secondaryColor} 55%, ${primaryColor}18 100%)`,
          }}
        >
          <p
            className="text-[15px] font-semibold tracking-[-0.02em] text-neutral-900"
            style={{ fontFamily: font }}
          >
            Your brand
          </p>
          <p className="mt-0.5 text-[11px] text-neutral-600" style={{ fontFamily: font }}>
            Storefront accents follow these colors.
          </p>
          <div className="mt-3 flex gap-1.5">
            <span
              className="inline-flex h-8 items-center rounded-md px-3 text-[11px] font-semibold text-white shadow-sm"
              style={{ backgroundColor: primaryColor }}
            >
              Shop now
            </span>
            <span
              className="inline-flex h-8 items-center rounded-md border bg-white/90 px-3 text-[11px] font-semibold backdrop-blur"
              style={{ borderColor: `${primaryColor}40`, color: primaryColor }}
            >
              Learn more
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <ColorField label="Accent" value={primaryColor} onChange={onPrimaryChange} />
          <ColorField label="Background" value={secondaryColor} onChange={onSecondaryChange} />
        </div>

        <label className="block space-y-1">
          <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400">
            Font
          </span>
          <select
            value={font}
            onChange={(e) => onFontChange(e.target.value)}
            className="h-8 w-full rounded-md border border-black/[0.06] bg-[#F5F5F7] px-2.5 text-[12px] outline-none focus:ring-1 focus:ring-[#007AFF]/30 dark:border-white/10 dark:bg-white/[0.05]"
          >
            {STORE_FONTS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>

        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400">
            Visual style
          </p>
          <div className="grid gap-2">
            {THEME_TEMPLATES.map((template) => {
              const selected = selectedTemplate === template.id;
              const live = liveTemplate === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => onSelectStyle(template.id)}
                  className={cn(
                    "group relative flex gap-3 overflow-hidden rounded-[12px] border p-2.5 text-left transition-all duration-200",
                    selected
                      ? "border-[#007AFF]/40 bg-[#007AFF]/[0.04] shadow-[0_0_0_1px_rgba(0,122,255,0.08)]"
                      : "border-black/[0.06] hover:border-black/[0.12] hover:bg-[#FAFAFA] dark:border-white/10 dark:hover:bg-white/[0.03]"
                  )}
                >
                  <div
                    className="relative h-14 w-[4.75rem] shrink-0 overflow-hidden rounded-lg shadow-sm ring-1 ring-black/5"
                    style={{ backgroundColor: template.preview.bg }}
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-5 opacity-90"
                      style={{
                        background: `linear-gradient(90deg, ${template.preview.accent}33, transparent)`,
                      }}
                    />
                    <div className="absolute inset-x-2 bottom-2 top-6 flex flex-col justify-end gap-1">
                      <div
                        className="h-1 w-8 rounded-full opacity-40"
                        style={{ backgroundColor: template.preview.text }}
                      />
                      <div
                        className="h-5 rounded-md shadow-sm"
                        style={{ backgroundColor: template.preview.accent }}
                      />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[12px] font-semibold text-neutral-900 dark:text-white">
                        {template.name}
                      </span>
                      {live ? (
                        <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          Live
                        </span>
                      ) : null}
                      {selected && !live ? (
                        <span className="rounded-md bg-[#F5F5F7] px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-white/10">
                          Draft
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-neutral-400">
                      {template.tagline} — {template.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-9 cursor-pointer rounded-md border border-black/[0.06] bg-white p-0.5 shadow-sm dark:border-white/10"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 flex-1 rounded-md border border-black/[0.06] bg-[#F5F5F7] px-2.5 font-mono text-[11px] uppercase outline-none focus:ring-1 focus:ring-[#007AFF]/30 dark:border-white/10 dark:bg-white/[0.05]"
        />
      </div>
    </label>
  );
}
