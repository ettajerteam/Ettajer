"use client";

import { STORE_FONTS, THEME_TEMPLATES, type ThemeId } from "@/lib/themes";
import {
  dashboardCard,
  dashboardCardPad,
  dashboardKicker,
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
    <section id="themes-brand" className={cn(dashboardCard, "scroll-mt-24 overflow-hidden")}>
      <div className={cn(dashboardCardPad, "border-b border-neutral-100")}>
        <p className={dashboardKicker}>Brand</p>
        <h2 className={cn(dashboardTitle, "mt-1 text-lg")}>Colors, font & style</h2>
        <p className={cn(dashboardSubtitle, "mt-1 max-w-xl")}>
          Draft changes stay local until you publish. Layout editing is in Customize.
        </p>
      </div>

      <div className="grid gap-6 p-4 sm:p-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <ColorField label="Accent" value={primaryColor} onChange={onPrimaryChange} />
            <ColorField label="Background" value={secondaryColor} onChange={onSecondaryChange} />
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-neutral-600">Font</span>
            <select
              value={font}
              onChange={(e) => onFontChange(e.target.value)}
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            >
              {STORE_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-4">
            <p className={dashboardKicker}>Sample</p>
            <p
              className="mt-2 text-xl font-semibold tracking-tight text-neutral-900"
              style={{ fontFamily: font }}
            >
              Your brand
            </p>
            <p className="mt-1 text-sm text-neutral-500" style={{ fontFamily: font }}>
              Buttons and accents use these colors on the storefront.
            </p>
            <div className="mt-3 flex gap-2">
              <span
                className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-semibold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Shop now
              </span>
              <span
                className="inline-flex h-8 items-center rounded-lg border bg-white px-3 text-xs font-semibold"
                style={{ borderColor: `${primaryColor}35`, color: primaryColor }}
              >
                Learn more
              </span>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-neutral-600">Visual style</p>
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
                    "flex gap-3 rounded-xl border p-3 text-left transition",
                    selected
                      ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900"
                      : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/80",
                  )}
                >
                  <div
                    className="h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-lg"
                    style={{ backgroundColor: template.preview.bg }}
                  >
                    <div className="flex h-full flex-col justify-between p-1.5">
                      <div
                        className="h-1 w-6 rounded-full"
                        style={{ backgroundColor: template.preview.text, opacity: 0.35 }}
                      />
                      <div
                        className="h-4 rounded-md"
                        style={{ backgroundColor: template.preview.accent }}
                      />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-semibold text-neutral-900">{template.name}</p>
                      {live ? (
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                          Live
                        </span>
                      ) : null}
                      {selected && !live ? (
                        <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                          Draft
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500">
                      {template.description}
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
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-neutral-600">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-11 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 flex-1 rounded-lg border border-neutral-200 bg-white px-3 font-mono text-xs uppercase transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
        />
      </div>
    </label>
  );
}
