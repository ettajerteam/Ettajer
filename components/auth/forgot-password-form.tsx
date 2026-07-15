"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Inbox, Loader2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { AuthCard } from "@/components/auth/auth-card";
import {
  AuthFlowSteps,
  PASSWORD_RESET_FLOW,
  authButtonPrimary,
  authButtonSecondary,
  authInputClass,
} from "@/components/auth/auth-flow";
import { useAuthLocale } from "@/components/auth/auth-locale-provider";

const BRAND_ICON = "/brand/App-Logo.png";
const EASE = [0.22, 1, 0.36, 1] as const;

const INBOX_TIPS = [
  "Open the email titled “Reset your Ettajer password”",
  "Tap “Choose new password” in the email",
  "Create your new password and sign in",
] as const;

export function ForgotPasswordForm() {
  const { locale } = useAuthLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submitResetRequest = async () => {
    if (!email.trim()) {
      toast.error("Enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), locale }),
      });

      const data = (await res.json()) as { message?: string };

      if (!res.ok) {
        toast.error(data.message ?? "Unable to send reset email.");
        return;
      }

      setSent(true);
      toast.success("Reset email sent. Check your inbox.");
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitResetRequest();
  };

  if (sent) {
    return (
      <div>
        <AuthCard className="overflow-hidden">
          <div className="border-b border-neutral-100/80 px-7 pb-6 pt-7 sm:px-9 sm:pt-8">
            <AuthFlowSteps steps={PASSWORD_RESET_FLOW} current="inbox" />
          </div>

          <div className="px-7 py-7 text-center sm:px-9 sm:py-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 ring-1 ring-blue-100/80"
            >
              <Inbox className="h-6 w-6" strokeWidth={1.5} />
            </motion.div>

            <h1 className="text-[1.65rem] font-semibold tracking-[-0.03em] text-neutral-900">
              Check your inbox
            </h1>
            <p className="mx-auto mt-2 max-w-[320px] text-[13px] leading-relaxed text-neutral-500">
              We sent password reset instructions to{" "}
              <span className="font-medium text-neutral-800">{email}</span>. The
              secure link expires in 1 hour.
            </p>

            <div className="mx-auto mt-6 max-w-[340px] rounded-xl border border-neutral-100 bg-neutral-50/70 px-4 py-4 text-left">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                Next steps
              </p>
              <ol className="space-y-2.5">
                {INBOX_TIPS.map((tip, index) => (
                  <li
                    key={tip}
                    className="flex items-start gap-3 text-[13px] leading-relaxed text-neutral-600"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-neutral-700 ring-1 ring-neutral-200">
                      {index + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-blue-100/80 bg-blue-50/50 px-3.5 py-3 text-left text-[12px] leading-relaxed text-blue-900/80">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <p>
                Didn&apos;t get it? Check spam or promotions. You can resend the
                email below.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => void submitResetRequest()}
                disabled={loading}
                className={authButtonPrimary}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Sending…" : "Resend email"}
              </button>
              <Link href="/login" className={authButtonSecondary}>
                Back to sign in
              </Link>
            </div>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div>
      <AuthCard>
        <div className="border-b border-neutral-100/80 px-7 pb-6 pt-7 sm:px-9 sm:pt-8">
          <AuthFlowSteps steps={PASSWORD_RESET_FLOW} current="email" />
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
            Forgot password?
          </h1>
          <p className="mx-auto mt-2 max-w-[300px] text-[13px] leading-relaxed text-neutral-500">
            Enter your email and we&apos;ll send a secure link to reset your
            password.
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
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-[13px] font-medium tracking-[-0.01em] text-neutral-700"
              >
                Email
              </label>
              <div className="group/field relative">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-neutral-400 transition-colors duration-200 group-focus-within/field:text-blue-500"
                  strokeWidth={1.75}
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@yourstore.ma"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                  className={authInputClass}
                />
              </div>
            </div>

            <p className="rounded-xl border border-neutral-100 bg-neutral-50/60 px-3.5 py-3 text-[12px] leading-relaxed text-neutral-500">
              Signed up with Google? You can set a password here, or use{" "}
              <Link
                href="/login"
                className="font-medium text-neutral-700 hover:text-neutral-900"
              >
                Continue with Google
              </Link>{" "}
              on the sign-in page.
            </p>

            <button type="submit" disabled={loading} className={authButtonPrimary}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Send reset link
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
