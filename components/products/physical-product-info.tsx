"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductInfoFieldToggle } from "@/components/products/product-info-field-toggle";
import {
  PHYSICAL_CONDITION_OPTIONS,
  PHYSICAL_SHIPPING_OPTIONS,
} from "@/lib/catalog-defaults";
import type { ProductDetail } from "@/types";
import { cn } from "@/lib/utils";

interface PhysicalProductInfoProps {
  details: ProductDetail[];
  onChange: (details: ProductDetail[]) => void;
}

const BASIC_LABELS = ["Brand", "Color", "Size", "Material"] as const;
const MORE_LABELS = [
  "Weight",
  "Dimensions",
  "Condition",
  "Shipping",
  "Origin",
  "Warranty",
  "Care",
  "Package contents",
] as const;

const ALL_LABELS = [...BASIC_LABELS, ...MORE_LABELS] as const;

function getDetailValue(details: ProductDetail[], label: string): string {
  return details.find((d) => d.label.toLowerCase() === label.toLowerCase())?.value ?? "";
}

function upsertDetail(
  details: ProductDetail[],
  label: string,
  value: string
): ProductDetail[] {
  const trimmed = value.trim();
  const idx = details.findIndex((d) => d.label.toLowerCase() === label.toLowerCase());
  if (!trimmed) {
    if (idx === -1) return details;
    return details.filter((_, i) => i !== idx);
  }
  if (idx >= 0) {
    return details.map((d, i) => (i === idx ? { ...d, value: trimmed } : d));
  }
  return [...details, { id: crypto.randomUUID(), label, value: trimmed }];
}

function removeDetail(details: ProductDetail[], label: string): ProductDetail[] {
  return details.filter((d) => d.label.toLowerCase() !== label.toLowerCase());
}

function initialEnabled(details: ProductDetail[]): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  for (const label of ALL_LABELS) {
    const hasValue = Boolean(getDetailValue(details, label).trim());
    map[label] = hasValue || BASIC_LABELS.includes(label as (typeof BASIC_LABELS)[number]);
  }
  return map;
}

type FieldDef = {
  label: (typeof ALL_LABELS)[number];
  control: "input" | "select";
  placeholder?: string;
  options?: readonly string[];
  wide?: boolean;
};

const FIELD_META: FieldDef[] = [
  { label: "Brand", control: "input", placeholder: "e.g. Nike, Local atelier" },
  { label: "Color", control: "input", placeholder: "e.g. Black, Beige" },
  { label: "Size", control: "input", placeholder: "e.g. M, 42, One size" },
  { label: "Material", control: "input", placeholder: "e.g. Cotton, leather" },
  { label: "Weight", control: "input", placeholder: "e.g. 350 g" },
  { label: "Dimensions", control: "input", placeholder: "e.g. 30 × 20 × 10 cm" },
  { label: "Condition", control: "select", options: PHYSICAL_CONDITION_OPTIONS },
  { label: "Shipping", control: "select", options: PHYSICAL_SHIPPING_OPTIONS },
  { label: "Origin", control: "input", placeholder: "e.g. Made in Morocco" },
  { label: "Warranty", control: "input", placeholder: "e.g. 1 year warranty" },
  { label: "Care", control: "input", placeholder: "e.g. Hand wash cold", wide: true },
  {
    label: "Package contents",
    control: "input",
    placeholder: "e.g. 1× bag, dust cover",
    wide: true,
  },
];

export function PhysicalProductInfo({ details, onChange }: PhysicalProductInfoProps) {
  const [enabled, setEnabled] = useState(() => initialEnabled(details));
  const [moreOpen, setMoreOpen] = useState(() =>
    MORE_LABELS.some((label) => Boolean(getDetailValue(details, label).trim()))
  );

  const setField = (label: string, value: string) => {
    onChange(upsertDetail(details, label, value));
  };

  const toggle = (label: string, on: boolean) => {
    setEnabled((prev) => ({ ...prev, [label]: on }));
    if (!on) onChange(removeDetail(details, label));
  };

  const renderField = (field: FieldDef) => (
    <ProductInfoFieldToggle
      key={field.label}
      id={`physical-${field.label.toLowerCase().replace(/\s+/g, "-")}`}
      label={field.label}
      enabled={enabled[field.label] ?? false}
      onEnabledChange={(on) => toggle(field.label, on)}
      className={cn(field.wide && "sm:col-span-2")}
    >
      {field.control === "select" && field.options ? (
        <Select
          value={getDetailValue(details, field.label) || "none"}
          onValueChange={(v) => setField(field.label, v === "none" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Not set</SelectItem>
            {field.options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          value={getDetailValue(details, field.label)}
          placeholder={field.placeholder}
          onChange={(e) => setField(field.label, e.target.value)}
        />
      )}
    </ProductInfoFieldToggle>
  );

  const basicFields = FIELD_META.filter((f) =>
    BASIC_LABELS.includes(f.label as (typeof BASIC_LABELS)[number])
  );
  const moreFields = FIELD_META.filter((f) =>
    MORE_LABELS.includes(f.label as (typeof MORE_LABELS)[number])
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-3 text-xs font-medium text-muted-foreground">Basic</p>
        <div className="grid gap-3 sm:grid-cols-2">{basicFields.map(renderField)}</div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/10">
        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <span className="text-[13px] font-medium">More specifications</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              moreOpen && "rotate-180"
            )}
          />
        </button>
        {moreOpen ? (
          <div className="grid gap-3 border-t border-black/[0.06] px-4 py-4 sm:grid-cols-2 dark:border-white/10">
            {moreFields.map(renderField)}
          </div>
        ) : null}
      </div>
    </div>
  );
}
