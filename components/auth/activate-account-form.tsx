"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AuthFlowSteps } from "@/components/auth/auth-flow";
import { useAuthLocale, AuthArrowForward } from "@/components/auth/auth-locale-provider";
import { getFounderOnboardingFlow } from "@/lib/auth/auth-i18n";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const SIGNUP_PASSWORD_KEY = "ettajer_signup_password";
const PENDING_WELCOME_KEY = "ettajer_pending_welcome";
const CODE_LENGTH = 6;

const cardShell =
  "relative overflow-hidden rounded-[1.25rem] border border-white/80 bg-white/75 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.02),0_12px_40px_-8px_rgba(0,0,0,0.08)] backdrop-blur-xl backdrop-saturate-150";

export function ActivateAccountForm() {
  const { copy: authCopy, locale } = useAuthLocale();
  const a = authCopy.activate;
  const err = authCopy.errors;
  const onboardingFlow = getFounderOnboardingFlow(authCopy);

  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";
  const justSent = searchParams.get("sent") === "1";
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const formatCooldown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
  };

  const fetchResendStatus = useCallback(async () => {
    if (!email) return;
    try {
      const res = await fetch(`/api/auth/resend-status?email=${encodeURIComponent(email)}`);
      if (!res.ok) return;
      const data = (await res.json()) as { secondsRemaining?: number };
      setResendCooldown(data.secondsRemaining ?? 0);
    } catch {
      /* ignore */
    }
  }, [email]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    void fetchResendStatus();
  }, [fetchResendStatus]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const code = digits.join("");

  const submitActivation = useCallback(
    async (activationCode: string) => {
      if (!email) {
        setError(a.missingEmail);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/auth/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: activationCode, locale }),
        });

        const data = (await res.json()) as {
          error?: string;
          success?: boolean;
          attemptsRemaining?: number;
        };

        if (!res.ok) {
          setError(data.error ?? a.invalidCode);
          setDigits(Array(CODE_LENGTH).fill(""));
          inputRefs.current[0]?.focus();
          return;
        }

        sessionStorage.setItem(PENDING_WELCOME_KEY, "1");

        const storedPassword = sessionStorage.getItem(SIGNUP_PASSWORD_KEY);
        sessionStorage.removeItem(SIGNUP_PASSWORD_KEY);

        if (storedPassword) {
          const signInResult = await signIn("credentials", {
            email,
            password: storedPassword,
            redirect: false,
            remember: "true",
          });

          if (signInResult?.ok) {
            toast.success(a.activatedToast);
            try {
              const targetRes = await fetch("/api/auth/redirect-target");
              const target = (await targetRes.json()) as { redirect?: string };
              window.location.replace(target.redirect || "/dashboard");
            } catch {
              window.location.replace("/dashboard");
            }
            return;
          }
        }

        toast.success(a.activatedSignIn);
        window.location.href = `/login?activated=true&email=${encodeURIComponent(email)}`;
      } catch {
        setError(err.default);
      } finally {
        setLoading(false);
      }
    },
    [email, a, err.default],
  );

  const handleChange = (index: number, value: string) => {
    if (loading) return;
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    setError(null);

    if (cleaned && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const joined = next.join("");
    if (joined.length === CODE_LENGTH && next.every((d) => d)) {
      void submitActivation(joined);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (loading) return;
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;

    const next = Array(CODE_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);

    if (pasted.length === CODE_LENGTH) {
      void submitActivation(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      const data = (await res.json()) as {
        error?: string;
        secondsRemaining?: number;
        nextCooldownSeconds?: number;
      };
      if (!res.ok) {
        if (res.status === 429 && data.secondsRemaining) {
          setResendCooldown(data.secondsRemaining);
        }
        toast.error(data.error ?? a.unableResend);
        return;
      }
      toast.success(a.newCodeSent);
      setError(null);
      setDigits(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      if (data.nextCooldownSeconds) {
        setResendCooldown(data.nextCooldownSeconds);
      } else {
        await fetchResendStatus();
      }
    } catch {
      toast.error(a.unableResend);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== CODE_LENGTH) {
      setError(a.enterFullCode);
      return;
    }
    void submitActivation(code);
  };

  if (!email) {
    return (
      <div className={cn(cardShell, "p-8 text-center")}>
        <p className="text-[15px] text-neutral-600">{a.noEmail}</p>
        <Link href="/signup" className="mt-4 inline-block text-sm font-semibold text-neutral-900 hover:underline">
          {a.backToSignup}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <AuthFlowSteps
        steps={onboardingFlow}
        current="verify"
        ariaLabel={a.flowAria}
        className="mb-6"
      />

      <div className={cardShell}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" aria-hidden />
        <div className="relative border-b border-neutral-100/80 px-7 pb-6 pt-8 text-center sm:px-9 sm:pt-9">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
            <ShieldCheck className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <h1 className="text-[1.7rem] font-semibold leading-tight tracking-[-0.035em] text-neutral-900">
            {a.title}
          </h1>
          <p className="mx-auto mt-2 max-w-[320px] text-[13px] leading-relaxed text-neutral-500">
            {a.subtitlePrefix}{" "}
            <span className="font-medium text-neutral-800">{email}</span>
          </p>
          {justSent ? (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50/90 px-3 py-1 text-[11px] font-medium text-emerald-700"
            >
              <Sparkles className="h-3 w-3" />
              {a.codeSentBadge}
            </motion.span>
          ) : null}
        </div>

        <div className="relative px-7 py-7 sm:px-9 sm:py-8">
          {loading ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-b-[1.25rem] bg-white/80 backdrop-blur-[2px]">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <p className="mt-3 text-[13px] font-medium text-neutral-600">{a.activatingOverlay}</p>
            </div>
          ) : null}

          {error ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-5 overflow-hidden"
              role="alert"
            >
              <div className="flex gap-2.5 rounded-xl border border-red-200/70 bg-red-50/90 px-3.5 py-3 text-start text-[13px] text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            </motion.div>
          ) : null}

          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="flex justify-center gap-1.5 sm:gap-2.5" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  disabled={loading}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="h-12 w-11 rounded-xl border border-neutral-200/80 bg-white text-center font-mono text-lg font-semibold text-neutral-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-all focus:border-blue-500/70 focus:outline-none focus:ring-[3px] focus:ring-blue-500/10 disabled:opacity-50 sm:h-14 sm:w-12 sm:text-xl"
                  aria-label={a.digitAria(index + 1)}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== CODE_LENGTH}
              className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 text-sm font-medium text-white transition-all hover:bg-neutral-800 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {a.activating}
                </>
              ) : (
                <>
                  {a.activateAccount}
                  <AuthArrowForward className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                </>
              )}
            </button>
          </motion.form>

          <div className="mt-5 flex flex-col items-center gap-2 text-center">
            <button
              type="button"
              onClick={() => void handleResend()}
              disabled={resending || resendCooldown > 0 || loading}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-500 transition-colors hover:text-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Mail className="h-3.5 w-3.5" />
              )}
              {resendCooldown > 0
                ? a.resendIn(formatCooldown(resendCooldown))
                : a.resendPrompt}
            </button>
            <p className="text-[11px] text-neutral-400">{a.codeHint}</p>
          </div>
        </div>
      </div>

      <p className="mt-7 text-center text-[13px] text-neutral-500">
        {a.wrongEmail}{" "}
        <Link href="/signup" className="font-semibold text-neutral-900 hover:underline">
          {a.signUpAgain}
        </Link>
        {" · "}
        <Link href="/login" className="font-semibold text-neutral-900 hover:underline">
          {a.signIn}
        </Link>
      </p>
    </div>
  );
}
