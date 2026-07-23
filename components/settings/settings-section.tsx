import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

/** Visual group inside a settings panel — one purpose per block. */
export function SettingsSection({
  title,
  description,
  children,
  className,
  action,
}: SettingsSectionProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4 sm:p-5 dark:border-white/10 dark:bg-white/[0.02]",
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-[12px] leading-relaxed text-neutral-500">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface SettingsFieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsField({
  label,
  htmlFor,
  hint,
  children,
  className,
}: SettingsFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-[13px] font-medium text-neutral-800 dark:text-neutral-200"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-[12px] text-neutral-500">{hint}</p> : null}
    </div>
  );
}
