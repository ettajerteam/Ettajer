"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { AuthCard } from "@/components/auth/auth-card";
import { cn } from "@/lib/utils";
import {
  AuthFlowSteps,
  PASSWORD_RESET_FLOW,
  PasswordRequirements,
  authButtonPrimary,
  authButtonSecondary,
  authInputClass,
} from "@/components/auth/auth-flow";
import { useAuthLocale } from "@/components/auth/auth-locale-provider";

const BRAND_ICON = "/brand/App-Logo.png";
const EASE = [0.22, 1, 0.36, 1] as const;
const REDIRECT_SECONDS = 5;

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  show,
  onToggle,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-[13px] font-medium tracking-[-0.01em] text-neutral-700"
      >
        {label}
      </label>
      <div className="group/field relative">
        <Lock
          className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-neutral-400 transition-colors duration-200 group-focus-within/field:text-blue-500"
          strokeWidth={1.75}
        />
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required
          minLength={8}
          className={cn(authInputClass, "pr-10")}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const { locale } = useAuthLocale();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  const missingParams = !email || !token;
  const canSubmit =
    password.length >= 8 &&
    /[a-zA-Z]/.test(password) &&
    /\d/.test(password) &&
    password === confirmPassword;

  useEffect(() => {
    if (!done) return;

    const interval = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.clearInterval(interval);
          router.push(
            `/login?reset=success&email=${encodeURIComponent(email)}`,
          );
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [done, email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      toast.error("Complete all password requirements first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password, confirmPassword, locale }),
      });

      const data = (await res.json()) as { message?: string };

      if (!res.ok) {
        toast.error(data.message ?? "Unable to reset password.");
        return;
      }

      setDone(true);
      toast.success("Password updated successfully.");
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (missingParams) {
    return (
      <AuthCard className="overflow-hidden px-7 py-8 text-center sm:px-9 sm:py-9">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
          <AlertCircle className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-900">
          Invalid reset link
        </h1>
        <p className="mx-auto mt-3 max-w-[320px] text-[13px] leading-relaxed text-neutral-500">
          This link is missing information, expired, or was already used. Request
          a fresh reset email to continue.
        </p>
        <div className="mx-auto mt-6 flex max-w-[320px] flex-col gap-2.5">
          <Link href="/forgot-password" className={authButtonPrimary}>
            Request a new link
          </Link>
          <Link href="/login" className={authButtonSecondary}>
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard className="overflow-hidden">
        <div className="border-b border-neutral-100/80 px-7 pb-6 pt-7 sm:px-9 sm:pt-8">
          <AuthFlowSteps steps={PASSWORD_RESET_FLOW} current="done" />
        </div>

        <div className="px-7 py-7 text-center sm:px-9 sm:py-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-600 ring-1 ring-emerald-100/80"
          >
            <CheckCircle2 className="h-6 w-6" strokeWidth={1.5} />
          </motion.div>

          <h1 className="text-[1.65rem] font-semibold tracking-[-0.03em] text-neutral-900">
            You&apos;re all set
          </h1>
          <p className="mx-auto mt-2 max-w-[320px] text-[13px] leading-relaxed text-neutral-500">
            Your password for{" "}
            <span className="font-medium text-neutral-800">{email}</span> has
            been updated. We also sent a confirmation email for your records.
          </p>

          <div className="mx-auto mt-6 max-w-[340px] rounded-xl border border-emerald-100/80 bg-emerald-50/40 px-4 py-4 text-left">
            <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-emerald-800">
              <Sparkles className="h-4 w-4" />
              Ready to sign in
            </div>
            <p className="text-[13px] leading-relaxed text-emerald-900/80">
              Redirecting to sign in in{" "}
              <span className="font-semibold">{secondsLeft}s</span>…
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-100">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: REDIRECT_SECONDS, ease: "linear" }}
                className="h-full rounded-full bg-emerald-500"
              />
            </div>
          </div>

          <Link
            href={`/login?reset=success&email=${encodeURIComponent(email)}`}
            className={`${authButtonPrimary} mt-6`}
          >
            Sign in now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <div>
      <AuthCard>
        <div className="border-b border-neutral-100/80 px-7 pb-6 pt-7 sm:px-9 sm:pt-8">
          <AuthFlowSteps steps={PASSWORD_RESET_FLOW} current="password" />
        </div>

        <div className="relative border-b border-neutral-100/80 px-7 pb-6 pt-7 text-center sm:px-9 sm:pt-8">
          <div className="mx-auto mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-gradient-to-b from-neutral-50 to-white shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-neutral-200/70">
            <Image
              src={BRAND_ICON}
              alt=""
              width={30}
              height={30}
              className="h-[30px] w-[30px] object-contain"
            />
          </div>
          <h1 className="text-[1.7rem] font-semibold leading-tight tracking-[-0.035em] text-neutral-900">
            Create a new password
          </h1>
          <p className="mx-auto mt-2 max-w-[320px] text-[13px] leading-relaxed text-neutral-500">
            You&apos;re almost done. Choose a strong password for{" "}
            <span className="font-medium text-neutral-700">{email}</span>
          </p>
        </div>

        <div className="relative px-7 py-7 sm:px-9 sm:py-8">
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: EASE }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <PasswordField
              id="password"
              label="New password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              show={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
              placeholder="At least 8 characters"
            />
            <PasswordField
              id="confirmPassword"
              label="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              show={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
              placeholder="Repeat your password"
            />

            <PasswordRequirements
              password={password}
              confirmPassword={confirmPassword}
            />

            <button
              type="submit"
              disabled={loading || !canSubmit}
              className={authButtonPrimary}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Save new password
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </motion.form>
        </div>
      </AuthCard>

      <p className="mt-7 text-center text-[13px] text-neutral-500">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-semibold text-neutral-900 underline-offset-3 transition-colors hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
