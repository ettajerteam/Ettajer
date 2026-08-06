"use client";

import { LandingIosSegmentedControl } from "@/components/landing/landing-mobile-nav";
import { useLandingLocale } from "@/components/landing/landing-locale-context";
import { useAuthLocale } from "@/components/auth/auth-locale-provider";
import { useFounderFlowLocale } from "@/components/founder/founder-flow-root";
import { cn } from "@/lib/utils";

const LANGUAGE_OPTIONS = [
  { value: "EN", label: "EN" },
  { value: "FR", label: "FR" },
  { value: "AR", label: "AR" },
] as const;

type LanguageSwitcherProps = {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  variant?: "segmented" | "select" | "footer" | "menu";
  className?: string;
  label?: string;
};

export function LanguageSwitcher({
  value,
  onChange,
  ariaLabel,
  variant = "segmented",
  className,
  label,
}: LanguageSwitcherProps) {
  if (variant === "select") {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "rounded-lg border-none bg-transparent py-1.5 text-[13px] font-medium text-neutral-500 transition-colors hover:text-neutral-900",
          className,
        )}
        aria-label={ariaLabel}
      >
        <option value="EN">EN</option>
        <option value="FR">FR</option>
        <option value="AR">AR</option>
      </select>
    );
  }

  if (variant === "menu") {
    return (
      <div className={cn("px-4 py-3.5", className)}>
        {label ? (
          <p className="mb-2.5 text-[13px] font-medium uppercase tracking-wide text-[#8E8E93]">
            {label}
          </p>
        ) : null}
        <LandingIosSegmentedControl
          options={[...LANGUAGE_OPTIONS]}
          value={value}
          onChange={onChange}
          className="w-full"
        />
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div
        className={cn("inline-flex items-center gap-x-1.5", className)}
        role="group"
        aria-label={ariaLabel}
      >
        {LANGUAGE_OPTIONS.map((option, index) => {
          const active = value === option.value;
          return (
            <span key={option.value} className="inline-flex items-center gap-x-1.5">
              {index > 0 ? (
                <span className="text-neutral-300" aria-hidden>
                  ·
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => onChange(option.value)}
                aria-pressed={active}
                className={cn(
                  "font-medium transition-colors",
                  active
                    ? "text-neutral-800"
                    : "text-neutral-500 hover:text-neutral-800",
                )}
              >
                {option.label}
              </button>
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <LandingIosSegmentedControl
      options={[...LANGUAGE_OPTIONS]}
      value={value}
      onChange={onChange}
      className={cn("origin-end scale-[0.92]", className)}
      aria-label={ariaLabel}
    />
  );
}

export function LandingLanguageSwitcher({
  variant = "segmented",
  className,
  label,
}: Pick<LanguageSwitcherProps, "variant" | "className" | "label">) {
  const { selectorValue, setLocale, copy } = useLandingLocale();
  return (
    <LanguageSwitcher
      value={selectorValue}
      onChange={setLocale}
      ariaLabel={copy.nav.languageAria}
      variant={variant}
      className={className}
      label={label ?? copy.mobileNav.language}
    />
  );
}

export function AuthLanguageSwitcher({
  variant = "segmented",
  className,
  label,
}: Pick<LanguageSwitcherProps, "variant" | "className" | "label">) {
  const { selectorValue, setLocale, copy } = useAuthLocale();
  return (
    <LanguageSwitcher
      value={selectorValue}
      onChange={setLocale}
      ariaLabel={copy.layout.languageAria}
      variant={variant}
      className={className}
      label={label ?? copy.layout.language}
    />
  );
}

export function FounderLanguageSwitcher({
  variant = "segmented",
  className,
  label,
}: Pick<LanguageSwitcherProps, "variant" | "className" | "label">) {
  const { selectorValue, setLocale, copy } = useFounderFlowLocale();
  return (
    <LanguageSwitcher
      value={selectorValue}
      onChange={setLocale}
      ariaLabel={copy.shell.languageAria}
      variant={variant}
      className={className}
      label={label ?? copy.shell.language}
    />
  );
}
