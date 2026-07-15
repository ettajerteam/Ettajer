"use client";

import { useMemo, useState } from "react";
import { Search, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  label: string;
}

interface SearchableMultiSelectProps {
  label: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
}

export function SearchableMultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Search...",
  emptyMessage = "No items found",
}: SearchableMultiSelectProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="pl-10 h-10 rounded-xl"
        />
      </div>
      <div className="max-h-48 overflow-y-auto rounded-xl border divide-y">
        {filtered.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground text-center">{emptyMessage}</p>
        ) : (
          filtered.map((option) => {
            const selected = value.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggle(option.id)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-muted/50 transition-colors",
                  selected && "bg-[#007AFF]/5"
                )}
              >
                <span className="truncate">{option.label}</span>
                {selected && <Check className="h-4 w-4 text-[#007AFF] shrink-0" />}
              </button>
            );
          })
        )}
      </div>
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">{value.length} selected</p>
      )}
    </div>
  );
}
