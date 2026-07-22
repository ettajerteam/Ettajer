"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ImageIcon, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MediaPicker } from "@/components/media/media-picker";
import type { MediaAsset, MediaKind } from "@/lib/media/types";
import { cn } from "@/lib/utils";

export function InspectorFieldGroup({
  title,
  description,
  children,
  className,
  emphasized,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  emphasized?: boolean;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "space-y-2 rounded-lg border border-neutral-100 bg-white p-2.5",
        emphasized && "border-[#007AFF]/20 bg-[#007AFF]/[0.02]",
        className
      )}
    >
      <div className={cn(collapsible && "cursor-pointer select-none")} onClick={collapsible ? () => setOpen((o) => !o) : undefined}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-neutral-700">{title}</p>
            {description && open ? (
              <p className="mt-0.5 text-[11px] text-neutral-400">{description}</p>
            ) : null}
          </div>
          {collapsible ? (
            <ChevronDown
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0 text-neutral-400 transition-transform",
                open && "rotate-180"
              )}
            />
          ) : null}
        </div>
      </div>
      {open ? children : null}
    </div>
  );
}

export function InspectorTextField({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-neutral-600">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-lg text-xs"
      />
    </div>
  );
}

export function InspectorTextareaField({
  id,
  label,
  value,
  placeholder,
  rows = 3,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-neutral-600">
        {label}
      </Label>
      <Textarea
        id={id}
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg text-xs"
      />
    </div>
  );
}

export function InspectorSelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-neutral-600">
        {label}
      </Label>
      <Select value={value || "__default__"} onValueChange={(v) => onChange(v === "__default__" ? "" : v)}>
        <SelectTrigger id={id} className="h-8 rounded-lg text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value || "__default__"} value={opt.value || "__default__"}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function InspectorColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-neutral-600">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 shrink-0 cursor-pointer rounded-lg border border-neutral-200 bg-white p-0.5"
        />
        <Input
          value={value}
          placeholder="#000000"
          onChange={(e) => onChange(e.target.value)}
          className="h-8 flex-1 rounded-lg font-mono text-xs"
        />
      </div>
    </div>
  );
}

export function InspectorSpacingField({
  label,
  value,
  placeholder = "e.g. 1rem 2rem",
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-neutral-600">{label}</Label>
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-lg font-mono text-xs"
      />
    </div>
  );
}

export function InspectorToggleField({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <Label htmlFor={id} className="text-xs text-neutral-700">
          {label}
        </Label>
        {description ? <p className="text-[11px] text-neutral-400">{description}</p> : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function InspectorAlignmentToggle({
  value,
  onChange,
}: {
  value: "left" | "center" | "right";
  onChange: (value: "left" | "center" | "right") => void;
}) {
  const options: { value: "left" | "center" | "right"; label: string }[] = [
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" },
  ];

  return (
    <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
            value === opt.value
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function InspectorMediaField({
  id,
  label,
  value,
  altValue,
  onChange,
  onAltChange,
  kind = "image",
  description,
}: {
  id: string;
  label: string;
  value: string;
  altValue?: string;
  onChange: (url: string, asset?: MediaAsset) => void;
  onAltChange?: (alt: string) => void;
  kind?: MediaKind | "all";
  description?: string;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [urlFallbackOpen, setUrlFallbackOpen] = useState(false);

  const handleSelect = (asset: MediaAsset) => {
    onChange(asset.url, asset);
    if (onAltChange && asset.alt) onAltChange(asset.alt);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-neutral-600">{label}</Label>
        {description ? <p className="text-[11px] text-neutral-400">{description}</p> : null}
      </div>

      {value ? (
        <div className="relative h-28 w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
          {kind === "video" ? (
            <video src={value} className="h-full w-full object-cover" muted playsInline />
          ) : (
            <Image src={value} alt={altValue ?? label} fill className="object-cover" sizes="280px" />
          )}
        </div>
      ) : (
        <div className="flex h-28 w-full flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50">
          <ImageIcon className="h-5 w-5 text-neutral-300" />
          <p className="mt-1.5 text-[11px] text-neutral-400">
            {kind === "video" ? "No video selected" : "No image selected"}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-lg text-xs"
          onClick={() => setPickerOpen(true)}
        >
          Choose from library
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg text-xs text-neutral-500"
            onClick={() => onChange("")}
          >
            Remove
          </Button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setUrlFallbackOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 text-[11px] text-neutral-400 hover:text-neutral-600"
      >
        <Link2 className="h-3 w-3" />
        Paste URL
        <ChevronDown className={cn("h-3 w-3 transition-transform", urlFallbackOpen && "rotate-180")} />
      </button>

      {urlFallbackOpen && (
        <Input
          id={id}
          name={id}
          autoComplete="off"
          value={value}
          placeholder="https://..."
          onChange={(e) => onChange(e.target.value)}
          className="h-8 rounded-lg text-xs"
          aria-label={`${label} URL`}
        />
      )}

      {onAltChange && (
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-alt`} className="text-xs text-neutral-600">
            Alt text
          </Label>
          <Input
            id={`${id}-alt`}
            value={altValue ?? ""}
            placeholder="Describe the image"
            onChange={(e) => onAltChange(e.target.value)}
            className="h-8 rounded-lg text-xs"
          />
        </div>
      )}

      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        value={value || null}
        onSelect={handleSelect}
        kind={kind}
        title={label}
      />
    </div>
  );
}
