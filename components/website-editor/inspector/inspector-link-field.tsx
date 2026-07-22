"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type LinkPickerOption = {
  label: string;
  href: string;
  group: string;
};

interface InspectorLinkFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  description?: string;
  onChange: (value: string) => void;
}

const STATIC_OPTIONS: LinkPickerOption[] = [
  { group: "Store", label: "Home", href: "/" },
  { group: "Store", label: "All products", href: "/products" },
  { group: "Store", label: "Collections", href: "/collections" },
  { group: "Store", label: "Search", href: "/search" },
  { group: "Store", label: "Blog / Journal", href: "/blog" },
  { group: "Pages", label: "About", href: "/about" },
  { group: "Pages", label: "Contact", href: "/contact" },
  { group: "Pages", label: "Shipping", href: "/shipping" },
  { group: "Pages", label: "Privacy", href: "/privacy" },
  { group: "Pages", label: "Terms", href: "/terms" },
];

export function InspectorLinkField({
  id,
  label,
  value,
  placeholder,
  description,
  onChange,
}: InspectorLinkFieldProps) {
  const [pages, setPages] = useState<LinkPickerOption[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/pages");
        if (!res.ok) return;
        const data = (await res.json()) as {
          pages?: Array<{ title: string; slug: string; status?: string }>;
        };
        if (cancelled) return;
        setPages(
          (data.pages ?? [])
            .filter((p) => p.status !== "draft")
            .map((p) => ({
              group: "Your pages",
              label: p.title,
              href: `/pages/${p.slug}`,
            }))
        );
      } catch {
        // ignore — free-text still works
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const options = useMemo(() => [...STATIC_OPTIONS, ...pages], [pages]);
  const grouped = useMemo(() => {
    const map = new Map<string, LinkPickerOption[]>();
    for (const opt of options) {
      const list = map.get(opt.group) ?? [];
      list.push(opt);
      map.set(opt.group, list);
    }
    return Array.from(map.entries());
  }, [options]);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-neutral-700">
        {label}
      </label>
      {description ? (
        <p className="text-[11px] text-neutral-400">{description}</p>
      ) : null}
      <div className="relative">
        <div className="flex gap-1">
          <div className="relative min-w-0 flex-1">
            <Link2 className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <Input
              id={id}
              value={value}
              placeholder={placeholder ?? "/products"}
              onChange={(e) => onChange(e.target.value)}
              className="h-8 pl-8 font-mono text-xs"
            />
          </div>
          <button
            type="button"
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 text-[11px] font-medium text-neutral-600 hover:bg-neutral-50"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            Pick
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
        {open ? (
          <div className="absolute left-0 right-0 z-30 mt-1 max-h-56 overflow-y-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
            {grouped.map(([group, items]) => (
              <div key={group}>
                <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                  {group}
                </p>
                {items.map((item) => (
                  <button
                    key={`${item.group}-${item.href}-${item.label}`}
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-xs hover:bg-neutral-50",
                      value === item.href && "bg-[#007AFF]/5 text-[#007AFF]"
                    )}
                    onClick={() => {
                      onChange(item.href);
                      setOpen(false);
                    }}
                  >
                    <span className="truncate font-medium">{item.label}</span>
                    <span className="shrink-0 font-mono text-[10px] text-neutral-400">
                      {item.href}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
