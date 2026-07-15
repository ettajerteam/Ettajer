"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { AuthCopy, AuthStrengthLabel } from "@/lib/auth/auth-i18n";
export const PASSWORD_RESET_FLOW = [
  { id: "email", label: "Email" },
  { id: "inbox", label: "Inbox" },
  { id: "password", label: "Password" },
  { id: "done", label: "Done" },
] as const;

export const FOUNDER_ONBOARDING_FLOW = [
  { id: "account", label: "Account" },
  { id: "verify", label: "Verify" },
  { id: "welcome", label: "Welcome" },
] as const;

export type PasswordResetStepId = (typeof PASSWORD_RESET_FLOW)[number]["id"];
export type FounderOnboardingStepId = (typeof FOUNDER_ONBOARDING_FLOW)[number]["id"];

type FlowStep = { id: string; label: string };

export function AuthFlowSteps<T extends FlowStep>({
  steps,
  current,
  className,
  ariaLabel = "Progress",
}: {
  steps: readonly T[];
  current: T["id"];
  className?: string;
  ariaLabel?: string;
}) {
  const currentIndex = steps.findIndex((step) => step.id === current);

  return (
    <nav aria-label={ariaLabel} className={cn("w-full", className)}>
      <ol className="flex items-center justify-between gap-1">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li key={step.id} className="flex flex-1 items-center">
              <div className="flex w-full flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-300",
                    isComplete &&
                      "bg-neutral-900 text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]",
                    isCurrent &&
                      "bg-blue-50 text-blue-600 ring-2 ring-blue-500/20 ring-offset-2",
                    !isComplete &&
                      !isCurrent &&
                      "bg-neutral-100 text-neutral-400",
                  )}
                >
                  {isComplete ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium uppercase tracking-[0.08em]",
                    isCurrent ? "text-neutral-900" : "text-neutral-400",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <div
                  className={cn(
                    "mx-1 mb-5 h-px flex-1 transition-colors duration-300",
                    index < currentIndex ? "bg-neutral-900" : "bg-neutral-200/80",
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function getPasswordStrength(
  password: string,
  _labels?: AuthCopy["signup"]["strengthDisplay"],
): {
  score: number;
  label: AuthStrengthLabel;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
  if (score === 3) return { score: 3, label: "Good", color: "bg-blue-500" };
  return { score: 4, label: "Strong", color: "bg-emerald-500" };
}

export function SignupPasswordRequirements({
  password,
  copy,
}: {
  password: string;
  copy: AuthCopy["signup"];
}) {
  const rules = [
    { met: password.length >= 8, label: copy.reqMinLength },
    { met: /[a-zA-Z]/.test(password), label: copy.reqLetter },
    { met: /\d/.test(password), label: copy.reqNumber },
  ];

  const strength = password.length > 0 ? getPasswordStrength(password, copy.strengthDisplay) : null;
  const allMet = rules.every((rule) => rule.met);

  return (
    <div className="space-y-3 rounded-xl border border-neutral-100 bg-neutral-50/60 px-3.5 py-3">
      {strength ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-neutral-500">{copy.strengthLabel}</span>
            <span className="font-semibold text-neutral-700">
              {copy.strengthDisplay[strength.label]}
            </span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-300",
                  level <= strength.score ? strength.color : "bg-neutral-200",
                )}
              />
            ))}
          </div>
        </div>
      ) : null}

      <ul className="space-y-1.5">
        {rules.map((rule) => (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-2 text-[12px] transition-colors duration-200",
              rule.met ? "text-emerald-700" : "text-neutral-400",
            )}
          >
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full text-[10px]",
                rule.met ? "bg-emerald-100" : "bg-neutral-200/80",
              )}
            >
              {rule.met ? "✓" : "·"}
            </span>
            {rule.label}
          </li>
        ))}
      </ul>

      {password.length > 0 && allMet ? (
        <p className="text-[11px] font-medium text-emerald-700">{copy.passwordLooksGood}</p>
      ) : null}
    </div>
  );
}

export function PasswordRequirements({
  password,
  confirmPassword,
}: {
  password: string;
  confirmPassword: string;
}) {
  const rules = [
    { met: password.length >= 8, label: "At least 8 characters" },
    { met: /[a-zA-Z]/.test(password), label: "Contains a letter" },
    { met: /\d/.test(password), label: "Contains a number" },
    {
      met: password.length > 0 && password === confirmPassword,
      label: "Passwords match",
    },
  ];

  const strength =
    password.length > 0 ? getPasswordStrength(password) : null;

  return (
    <div className="space-y-3 rounded-xl border border-neutral-100 bg-neutral-50/60 px-3.5 py-3">
      {strength ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-neutral-500">Password strength</span>
            <span className="font-semibold text-neutral-700">{strength.label}</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-300",
                  level <= strength.score ? strength.color : "bg-neutral-200",
                )}
              />
            ))}
          </div>
        </div>
      ) : null}

      <ul className="space-y-1.5">
        {rules.map((rule) => (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-2 text-[12px] transition-colors duration-200",
              rule.met ? "text-emerald-700" : "text-neutral-400",
            )}
          >
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full text-[10px]",
                rule.met ? "bg-emerald-100" : "bg-neutral-200/80",
              )}
            >
              {rule.met ? "✓" : "·"}
            </span>
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export const authButtonPrimary =
  "group relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-neutral-900 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_14px_rgba(0,0,0,0.08)] transition-all duration-200 hover:bg-neutral-800 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_24px_rgba(0,0,0,0.1)] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60";

export const authButtonSecondary =
  "inline-flex h-11 w-full items-center justify-center rounded-xl border border-neutral-200/80 bg-white/60 text-sm font-medium text-neutral-600 transition-all duration-200 hover:border-neutral-300 hover:bg-white active:scale-[0.98]";

export const authInputClass =
  "h-11 rounded-xl border-neutral-200/80 bg-white/80 pl-10 text-[15px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-200 placeholder:text-neutral-400 hover:border-neutral-300 hover:bg-white focus-visible:border-blue-500/70 focus-visible:bg-white focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] focus-visible:ring-0";
