"use client";

import { cn } from "@/lib/utils";
import { HELP_LOCALE_LABELS, type HelpLocale } from "@/lib/help/help-i18n";

type HelpLocaleToggleProps = {
  locale: HelpLocale;
  onChange: (locale: HelpLocale) => void;
  className?: string;
};

const LOCALES: HelpLocale[] = ["en", "fr", "ar"];

export function HelpLocaleToggle({
  locale,
  onChange,
  className,
}: HelpLocaleToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex w-full rounded-[0.75rem] bg-[#E5E5EA]/90 p-1 sm:w-auto md:rounded-full md:border md:border-neutral-200 md:bg-white md:p-0.5",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={cn(
            "flex-1 rounded-[0.625rem] px-3 py-2.5 text-[14px] font-semibold transition-all sm:flex-none md:rounded-full md:px-3 md:py-1 md:text-xs md:font-medium",
            locale === item
              ? "bg-white text-neutral-900 shadow-[0_1px_4px_rgba(0,0,0,0.08)] md:bg-neutral-900 md:text-white md:shadow-none"
              : "text-[#8E8E93] md:text-neutral-500 md:hover:text-neutral-900",
          )}
        >
          {HELP_LOCALE_LABELS[item]}
        </button>
      ))}
    </div>
  );
}
