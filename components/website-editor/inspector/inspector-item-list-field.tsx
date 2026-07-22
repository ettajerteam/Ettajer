"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InspectorMediaField } from "@/components/website-editor/inspector/inspector-fields";
import type { SettingFieldSchema } from "@/lib/builder/block-schema";
import { fieldMatchesShowWhen } from "@/lib/builder/block-schema";
import { cn } from "@/lib/utils";

type ItemRow = Record<string, string>;

function asItems(value: unknown): ItemRow[] {
  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((url, i) => ({ url, alt: `Image ${i + 1}` }));
  }
  if (!Array.isArray(value)) return [];
  return value.map((row, i) => {
    if (typeof row === "string") {
      return { url: row, alt: `Image ${i + 1}` };
    }
    if (!row || typeof row !== "object") return {};
    const out: ItemRow = {};
    for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
      out[k] = v == null ? "" : String(v);
    }
    return out;
  });
}

function itemFieldVisible(field: SettingFieldSchema, item: ItemRow): boolean {
  if (!field.showWhen) return true;
  return fieldMatchesShowWhen(field, item as Record<string, unknown>);
}

interface InspectorItemListFieldProps {
  label: string;
  description?: string;
  itemLabel?: string;
  maxItems?: number;
  itemFields: SettingFieldSchema[];
  value: unknown;
  onChange: (next: ItemRow[]) => void;
}

export function InspectorItemListField({
  label,
  description,
  itemLabel = "Item",
  maxItems = 12,
  itemFields,
  value,
  onChange,
}: InspectorItemListFieldProps) {
  const items = asItems(value);

  function updateItem(index: number, key: string, nextValue: string) {
    const next = items.map((row, i) => (i === index ? { ...row, [key]: nextValue } : row));
    onChange(next);
  }

  function addItem() {
    if (items.length >= maxItems) return;
    const blank: ItemRow = {};
    for (const field of itemFields) {
      if (field.defaultValue != null) {
        blank[field.key] = String(field.defaultValue);
      } else if (field.key === "cellType") {
        blank[field.key] = "text";
      } else {
        blank[field.key] = "";
      }
    }
    onChange([...items, blank]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-neutral-700">{label}</p>
          {description ? (
            <p className="mt-0.5 text-[11px] text-neutral-400">{description}</p>
          ) : null}
        </div>
        <span className="text-[10px] tabular-nums text-neutral-400">
          {items.length}/{maxItems}
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-neutral-200 bg-white p-2.5 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                {itemLabel} {index + 1}
              </p>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="rounded p-1 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove ${itemLabel} ${index + 1}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {itemFields.map((field) => {
                if (!itemFieldVisible(field, item)) return null;
                const fieldId = `${field.key}-${index}`;
                const fieldValue = item[field.key] ?? "";
                if (field.type === "media" || field.type === "image") {
                  const altKey = field.altKey ?? "imageAlt";
                  return (
                    <InspectorMediaField
                      key={field.key}
                      id={fieldId}
                      label={field.label}
                      value={fieldValue}
                      altValue={item[altKey] ?? item.alt ?? ""}
                      onChange={(url) => updateItem(index, field.key, url)}
                      onAltChange={(alt) => updateItem(index, altKey, alt)}
                    />
                  );
                }
                if (field.type === "select" || field.type === "variant") {
                  return (
                    <div key={field.key}>
                      <label htmlFor={fieldId} className="mb-1 block text-[10px] text-neutral-400">
                        {field.label}
                      </label>
                      <select
                        id={fieldId}
                        value={fieldValue || field.options?.[0]?.value || ""}
                        onChange={(e) => updateItem(index, field.key, e.target.value)}
                        className="w-full rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-900 outline-none focus:border-neutral-400"
                      >
                        {(field.options ?? []).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }
                if (field.type === "textarea" || field.type === "richtext") {
                  return (
                    <div key={field.key}>
                      <label htmlFor={fieldId} className="mb-1 block text-[10px] text-neutral-400">
                        {field.label}
                      </label>
                      <textarea
                        id={fieldId}
                        rows={3}
                        value={fieldValue}
                        placeholder={field.placeholder}
                        onChange={(e) => updateItem(index, field.key, e.target.value)}
                        className="w-full resize-y rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400"
                      />
                    </div>
                  );
                }
                return (
                  <div key={field.key}>
                    <label htmlFor={fieldId} className="mb-1 block text-[10px] text-neutral-400">
                      {field.label}
                    </label>
                    <input
                      id={fieldId}
                      type="text"
                      value={fieldValue}
                      placeholder={field.placeholder}
                      onChange={(e) => updateItem(index, field.key, e.target.value)}
                      className="w-full rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
        disabled={items.length >= maxItems}
        className={cn("h-8 w-full text-xs", items.length >= maxItems && "opacity-50")}
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Add {itemLabel.toLowerCase()}
      </Button>
    </div>
  );
}
