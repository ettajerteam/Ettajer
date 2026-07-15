"use client";

import { Image, Link2, MousePointer2, Square, Type } from "lucide-react";
import type { InspectorElementFocus } from "@/lib/builder/inspector-config";
import { cn } from "@/lib/utils";

const FOCUS_META: Record<
  InspectorElementFocus,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  text: { label: "Text", icon: Type },
  image: { label: "Image", icon: Image },
  button: { label: "Button", icon: MousePointer2 },
  link: { label: "Link", icon: Link2 },
  section: { label: "Section", icon: Square },
};

interface InspectorFocusPillsProps {
  focuses: InspectorElementFocus[];
  value: InspectorElementFocus;
  onChange: (focus: InspectorElementFocus) => void;
}

export function InspectorFocusPills({ focuses, value, onChange }: InspectorFocusPillsProps) {
  if (focuses.length <= 1) return null;

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">Edit focus</p>
      <div className="flex flex-wrap gap-1">
        {focuses.map((focus) => {
          const meta = FOCUS_META[focus];
          const Icon = meta.icon;
          const isActive = value === focus;
          return (
            <button
              key={focus}
              type="button"
              onClick={() => onChange(focus)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all",
                isActive
                  ? "border-[#007AFF]/30 bg-[#007AFF]/10 text-[#007AFF]"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
              )}
            >
              <Icon className="h-3 w-3" />
              {meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
