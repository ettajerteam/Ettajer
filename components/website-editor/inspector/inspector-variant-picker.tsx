"use client";

import { cn } from "@/lib/utils";

export interface VariantOption {
  value: string;
  label: string;
  description?: string;
}

interface InspectorVariantPickerProps {
  id?: string;
  label: string;
  value: string;
  options: VariantOption[];
  onChange: (value: string) => void;
  /** Visual hint for layout-style options */
  visual?: "layout" | "plain";
}

function LayoutThumb({ value }: { value: string }) {
  const v = value.toLowerCase();
  if (v.includes("split") || v === "editorial") {
    return (
      <div className="flex h-10 w-full gap-1 rounded bg-neutral-100 p-1">
        <div className="flex-1 rounded-sm bg-neutral-300" />
        <div className="flex flex-1 flex-col justify-center gap-1">
          <div className="h-1.5 w-3/4 rounded-sm bg-neutral-400" />
          <div className="h-1 w-full rounded-sm bg-neutral-300" />
          <div className="h-1 w-2/3 rounded-sm bg-neutral-300" />
        </div>
      </div>
    );
  }
  if (v.includes("masonry")) {
    return (
      <div className="grid h-10 w-full grid-cols-3 gap-0.5 rounded bg-neutral-100 p-1">
        <div className="row-span-2 rounded-sm bg-neutral-400" />
        <div className="rounded-sm bg-neutral-300" />
        <div className="rounded-sm bg-neutral-350 bg-neutral-300" />
        <div className="rounded-sm bg-neutral-300" />
        <div className="rounded-sm bg-neutral-400" />
      </div>
    );
  }
  if (v.includes("carousel")) {
    return (
      <div className="flex h-10 w-full items-center gap-1 rounded bg-neutral-100 p-1">
        <div className="h-full flex-[2] rounded-sm bg-neutral-400" />
        <div className="h-full flex-1 rounded-sm bg-neutral-300 opacity-70" />
        <div className="h-full flex-1 rounded-sm bg-neutral-300 opacity-40" />
      </div>
    );
  }
  if (v.includes("overlay") || v.includes("intro") || v.includes("stack")) {
    return (
      <div className="relative flex h-10 w-full flex-col justify-end rounded bg-neutral-200 p-1.5">
        <div className="h-1.5 w-2/3 rounded-sm bg-neutral-500" />
        <div className="mt-1 h-1 w-1/2 rounded-sm bg-neutral-400" />
      </div>
    );
  }
  if (v.includes("strip") || v.includes("newsletter")) {
    return (
      <div className="flex h-10 w-full items-center justify-between rounded bg-neutral-100 px-2">
        <div className="h-1.5 w-1/3 rounded-sm bg-neutral-400" />
        <div className="h-4 w-10 rounded-sm bg-neutral-300" />
      </div>
    );
  }
  // default / grid / stats
  return (
    <div className="grid h-10 w-full grid-cols-2 gap-0.5 rounded bg-neutral-100 p-1">
      <div className="rounded-sm bg-neutral-300" />
      <div className="rounded-sm bg-neutral-300" />
      <div className="rounded-sm bg-neutral-300" />
      <div className="rounded-sm bg-neutral-300" />
    </div>
  );
}

export function InspectorVariantPicker({
  label,
  value,
  options,
  onChange,
  visual = "layout",
}: InspectorVariantPickerProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-neutral-600">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const active = (value || "") === (opt.value || "");
          return (
            <button
              key={opt.value || "__default"}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "rounded-xl border p-2 text-left transition-all",
                active
                  ? "border-[#007AFF] bg-[#007AFF]/5 ring-2 ring-[#007AFF]/25 ring-offset-1"
                  : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
              )}
            >
              {visual === "layout" ? <LayoutThumb value={opt.value || opt.label} /> : null}
              <p className={cn("text-[11px] font-medium text-neutral-800", visual === "layout" && "mt-1.5")}>
                {opt.label}
              </p>
              {opt.description ? (
                <p className="mt-0.5 text-[10px] leading-snug text-neutral-400">{opt.description}</p>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
