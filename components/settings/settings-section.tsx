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
        "rounded-[10px] border border-black/[0.06] bg-[#FAFAFA]/80 p-3.5 dark:border-white/10 dark:bg-white/[0.025]",
        className
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[12px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
            {title}
          </h3>
          {description ? (
            <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-400">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="space-y-3">{children}</div>
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
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-[10px] text-neutral-400">{hint}</p> : null}
    </div>
  );
}
