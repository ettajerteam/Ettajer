"use client";

import { useState } from "react";
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
  DIGITAL_ACCESS_OPTIONS,
  DIGITAL_FORMAT_OPTIONS,
  DIGITAL_LICENSE_OPTIONS,
} from "@/lib/catalog-defaults";
import type { ProductDetail } from "@/types";
import { cn } from "@/lib/utils";

interface DigitalProductInfoProps {
  details: ProductDetail[];
  onChange: (details: ProductDetail[]) => void;
}

const ALL_LABELS = [
  "Format",
  "Pages",
  "Language",
  "License",
  "Access",
  "Updates",
  "Includes",
  "Compatibility",
] as const;

const DEFAULT_ON: string[] = ["Format", "Language", "License", "Access"];

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
    map[label] = hasValue || DEFAULT_ON.includes(label);
  }
  return map;
}

export function DigitalProductInfo({ details, onChange }: DigitalProductInfoProps) {
  const [enabled, setEnabled] = useState(() => initialEnabled(details));

  const setField = (label: string, value: string) => {
    onChange(upsertDetail(details, label, value));
  };

  const toggle = (label: string, on: boolean) => {
    setEnabled((prev) => ({ ...prev, [label]: on }));
    if (!on) onChange(removeDetail(details, label));
  };

  const fields: {
    label: (typeof ALL_LABELS)[number];
    control: "input" | "select";
    placeholder?: string;
    options?: readonly string[];
    wide?: boolean;
  }[] = [
    { label: "Format", control: "select", options: DIGITAL_FORMAT_OPTIONS },
    { label: "Pages", control: "input", placeholder: "e.g. 120 pages or 8 lessons" },
    { label: "Language", control: "input", placeholder: "e.g. Arabic, French, English" },
    { label: "License", control: "select", options: DIGITAL_LICENSE_OPTIONS },
    { label: "Access", control: "select", options: DIGITAL_ACCESS_OPTIONS },
    { label: "Updates", control: "input", placeholder: "e.g. Free updates for 1 year" },
    {
      label: "Includes",
      control: "input",
      placeholder: "e.g. PDF + worksheets + bonus checklist",
      wide: true,
    },
    {
      label: "Compatibility",
      control: "input",
      placeholder: "e.g. Any PDF reader, Canva, Windows & Mac",
      wide: true,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map((field) => (
        <ProductInfoFieldToggle
          key={field.label}
          id={`digital-${field.label.toLowerCase()}`}
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
      ))}
    </div>
  );
}
